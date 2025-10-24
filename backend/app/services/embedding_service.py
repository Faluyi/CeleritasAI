import openai
from config import Config
import json

class EmbeddingService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
    
    def generate_embedding(self, text):
        """Generate embedding for a single text"""
        try:
            response = openai.embeddings.create(
                model=Config.EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def generate_embeddings_batch(self, texts):
        """Generate embeddings for multiple texts"""
        try:
            response = openai.embeddings.create(
                model=Config.EMBEDDING_MODEL,
                input=texts
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            print(f"Error generating batch embeddings: {e}")
            return None
