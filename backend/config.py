import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///rag_documents.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # RAG Configuration
    EMBEDDING_MODEL = 'text-embedding-ada-002'
    CHAT_MODEL = 'gpt-3.5-turbo'
    MAX_CONTEXT_DOCUMENTS = 5
    SIMILARITY_THRESHOLD = 0.7
