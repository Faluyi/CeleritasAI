from flask import Blueprint, request, jsonify
from app.services.rag_service import RAGService

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/query', methods=['POST'])
def process_query():
    """Process user query with RAG-based response"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query']
        org_id = data.get('org_id')
        
        if not org_id:
            return jsonify({'error': 'Organization ID is required'}), 400
        
        # Initialize RAG service
        rag_service = RAGService()
        
        # Find relevant documents
        relevant_docs = rag_service.find_relevant_documents(query, org_id)
        
        if not relevant_docs:
            return jsonify({
                'response': "I couldn't find any relevant documents to answer your question. Please make sure you have uploaded documents to this organization.",
                'sources': []
            }), 200
        
        # Generate response using RAG
        response = rag_service.generate_response(query, relevant_docs)
        
        # Prepare source information
        sources = [{
            'id': doc.id,
            'title': doc.title,
            'content_preview': doc.content[:200] + '...' if len(doc.content) > 200 else doc.content
        } for doc in relevant_docs]
        
        return jsonify({
            'response': response,
            'sources': sources,
            'query': query
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
