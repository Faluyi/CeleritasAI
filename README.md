# RAG Document Management System

A multi-tenant document management system with Retrieval-Augmented Generation (RAG) capabilities, built with Flask backend and React frontend.

## Features

- **Document Management**: Upload, list, update, delete, and search documents
- **Semantic Search**: Vector-based document search using OpenAI embeddings
- **Chat Interface**: Ask questions about your documents with AI-powered responses
- **Multi-tenant**: Support for multiple organizations with data isolation
- **Modern UI**: Clean interface built with React and Material UI

## Architecture

- **Backend**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL with pgvector extension for vector operations
- **Frontend**: React with Material UI
- **AI**: OpenAI GPT-3.5-turbo and text-embedding-ada-002
- **Vector Search**: Cosine similarity for document retrieval

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

## Setup Instructions

### 1. Database Setup

For development, we use SQLite (no installation required). For production, you can use PostgreSQL with pgvector extension.

**Development (SQLite - Recommended for testing):**
- No additional setup required
- Database file will be created automatically

**Production (PostgreSQL with pgvector):**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Install pgvector extension
# Follow instructions at: https://github.com/pgvector/pgvector
```

Create the database:

```sql
CREATE DATABASE rag_documents;
CREATE USER rag_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rag_documents TO rag_user;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your database URL and OpenAI API key

# Initialize database
python -c "
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print('Database tables created successfully')
"

# Run the backend
python app.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///rag_documents.db
OPENAI_API_KEY=your-openai-api-key-here
```

**For production with PostgreSQL:**
```env
DATABASE_URL=postgresql://rag_user:your_password@localhost/rag_documents
```

## API Endpoints

### Organizations
- `GET /api/organizations/` - List organizations
- `POST /api/organizations/` - Create organization
- `GET /api/organizations/{id}` - Get organization
- `DELETE /api/organizations/{id}` - Delete organization

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - List documents (with org_id filter)
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document
- `POST /api/documents/search` - Semantic search

### Chat
- `POST /api/chat/query` - Process chat query with RAG

## Usage

1. **Create Organizations**: Use the "New Organization" button to create organizations
2. **Upload Documents**: Select an organization and upload documents with title and content
3. **Search Documents**: Use the search bar to find relevant documents using semantic search
4. **Chat**: Switch to the Chat Interface tab to ask questions about your documents

## Technical Details

### Vector Embeddings
- Documents are automatically embedded using OpenAI's text-embedding-ada-002 model
- Embeddings are stored as JSON strings in the database
- Cosine similarity is used for document retrieval

### RAG Process
1. User query is embedded using OpenAI
2. Relevant documents are found using vector similarity
3. Context is built from top-k most relevant documents
4. Query and context are sent to GPT-3.5-turbo
5. Response includes source attribution

### Database Schema
- `organizations`: id, name, created_at
- `documents`: id, org_id, title, content, hash, metadata, embedding, created_at

## Development

### Backend Development
```bash
cd backend
python app.py  # Runs on http://localhost:5000
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

## Troubleshooting

1. **Database Connection Issues**: Ensure PostgreSQL is running and credentials are correct
2. **OpenAI API Errors**: Verify your API key is valid and has sufficient credits
3. **Vector Search Issues**: Ensure pgvector extension is properly installed
4. **CORS Issues**: The frontend is configured to proxy to the backend in development

## License

This project is for educational/demonstration purposes.
