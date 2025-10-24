from flask import Blueprint, request, jsonify
from app import db
from app.models.document import Document
from app.models.organization import Organization
from app.services.embedding_service import EmbeddingService

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/upload', methods=['POST'])
def upload_document():
    """Upload a new document"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['org_id', 'title', 'content']):
            return jsonify({'error': 'Missing required fields: org_id, title, content'}), 400
        
        # Check if organization exists
        org = Organization.query.get(data['org_id'])
        if not org:
            return jsonify({'error': 'Organization not found'}), 404
        
        # Create document
        doc = Document(
            org_id=data['org_id'],
            title=data['title'],
            content=data['content'],
            document_metadata=data.get('document_metadata', {})
        )
        
        # Generate embedding
        embedding_service = EmbeddingService()
        embedding = embedding_service.generate_embedding(doc.content)
        if embedding:
            doc.set_embedding(embedding)
        
        # Save to database
        db.session.add(doc)
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': doc.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/', methods=['GET'])
def list_documents():
    """List documents with optional organization filtering"""
    try:
        org_id = request.args.get('org_id', type=int)
        
        query = Document.query
        if org_id:
            query = query.filter_by(org_id=org_id)
        
        documents = query.all()
        
        return jsonify({
            'documents': [doc.to_dict() for doc in documents]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete a document"""
    try:
        doc = Document.query.get_or_404(doc_id)
        
        db.session.delete(doc)
        db.session.commit()
        
        return jsonify({'message': 'Document deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:doc_id>', methods=['PUT'])
def update_document(doc_id):
    """Update a document"""
    try:
        doc = Document.query.get_or_404(doc_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields
        if 'title' in data:
            doc.title = data['title']
        if 'content' in data:
            doc.content = data['content']
            # Regenerate hash and embedding for content changes
            doc.hash = doc._generate_hash(doc.content)
            embedding_service = EmbeddingService()
            embedding = embedding_service.generate_embedding(doc.content)
            if embedding:
                doc.set_embedding(embedding)
        if 'document_metadata' in data:
            doc.document_metadata = data['document_metadata']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Document updated successfully',
            'document': doc.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/search', methods=['POST'])
def search_documents():
    """Semantic search for documents"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query_text = data['query']
        org_id = data.get('org_id')
        
        # Use RAG service to find relevant documents
        from app.services.rag_service import RAGService
        rag_service = RAGService()
        
        if org_id:
            relevant_docs = rag_service.find_relevant_documents(query_text, org_id)
        else:
            # Search across all organizations if no org_id specified
            relevant_docs = []
            orgs = Organization.query.all()
            for org in orgs:
                docs = rag_service.find_relevant_documents(query_text, org.id)
                relevant_docs.extend(docs)
        
        return jsonify({
            'query': query_text,
            'results': [doc.to_dict() for doc in relevant_docs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
