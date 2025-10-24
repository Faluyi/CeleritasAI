from app import db
from datetime import datetime
import hashlib

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    hash = db.Column(db.String(64), nullable=False, unique=True)  # SHA-256 hash
    document_metadata = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Vector embedding for semantic search (using pgvector)
    embedding = db.Column(db.Text)  # Will store JSON string of embedding vector
    
    def __init__(self, org_id, title, content, document_metadata=None):
        self.org_id = org_id
        self.title = title
        self.content = content
        self.hash = self._generate_hash(content)
        self.document_metadata = document_metadata or {}
    
    def _generate_hash(self, content):
        return hashlib.sha256(content.encode()).hexdigest()
    
    def set_embedding(self, embedding_vector):
        """Set the embedding vector (list of floats)"""
        import json
        self.embedding = json.dumps(embedding_vector)
    
    def get_embedding(self):
        """Get the embedding vector as a list of floats"""
        if self.embedding:
            import json
            return json.loads(self.embedding)
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'org_id': self.org_id,
            'title': self.title,
            'content': self.content,
            'hash': self.hash,
            'document_metadata': self.document_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
