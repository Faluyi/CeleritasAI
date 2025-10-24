import openai
import numpy as np
from config import Config
from app.models.document import Document
from app import db

class RAGService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
    
    def find_relevant_documents(self, query, org_id, limit=Config.MAX_CONTEXT_DOCUMENTS):
        """Find relevant documents using vector similarity"""
        try:
            # Generate query embedding
            from .embedding_service import EmbeddingService
            embedding_service = EmbeddingService()
            query_embedding = embedding_service.generate_embedding(query)
            
            if not query_embedding:
                return []
            
            # Get all documents for the organization
            documents = Document.query.filter_by(org_id=org_id).all()
            
            # Calculate similarities
            similarities = []
            for doc in documents:
                doc_embedding = doc.get_embedding()
                if doc_embedding:
                    similarity = self._cosine_similarity(query_embedding, doc_embedding)
                    if similarity >= Config.SIMILARITY_THRESHOLD:
                        similarities.append((doc, similarity))
            
            # Sort by similarity and return top documents
            similarities.sort(key=lambda x: x[1], reverse=True)
            return [doc for doc, _ in similarities[:limit]]
            
        except Exception as e:
            print(f"Error finding relevant documents: {e}")
            return []
    
    def _cosine_similarity(self, vec1, vec2):
        """Calculate cosine similarity between two vectors"""
        try:
            vec1 = np.array(vec1)
            vec2 = np.array(vec2)
            
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0
            
            return dot_product / (norm1 * norm2)
        except Exception as e:
            print(f"Error calculating cosine similarity: {e}")
            return 0
    
    def generate_response(self, query, relevant_documents):
        """Generate response using OpenAI with context from relevant documents"""
        try:
            # Build context from relevant documents
            context = ""
            for i, doc in enumerate(relevant_documents, 1):
                context += f"Document {i}: {doc.title}\n{doc.content}\n\n"
            
            # Create the prompt
            prompt = f"""Based on the following documents, please answer the user's question. If the answer cannot be found in the documents, please say so.

Documents:
{context}

User Question: {query}

Answer:"""
            
            response = openai.chat.completions.create(
                model=Config.CHAT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on provided documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "Sorry, I encountered an error while processing your request."
