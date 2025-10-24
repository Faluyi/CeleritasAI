#!/usr/bin/env python3
"""
Database initialization script for RAG Document Management System
"""

from app import create_app, db
from app.models.organization import Organization
from app.models.document import Document

def init_database():
    """Initialize the database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✓ Database tables created successfully")
        
        # Create sample organizations
        sample_orgs = [
            {"name": "Tech Corp"},
            {"name": "Marketing Agency"},
            {"name": "Research Institute"}
        ]
        
        for org_data in sample_orgs:
            existing_org = Organization.query.filter_by(name=org_data["name"]).first()
            if not existing_org:
                org = Organization(name=org_data["name"])
                db.session.add(org)
                print(f"✓ Created organization: {org_data['name']}")
        
        db.session.commit()
        print("✓ Sample organizations created")
        
        # Create sample documents
        sample_docs = [
            {
                "org_name": "Tech Corp",
                "title": "Company Overview",
                "content": "Tech Corp is a leading technology company specializing in AI and machine learning solutions. We provide cutting-edge software products and consulting services to enterprises worldwide."
            },
            {
                "org_name": "Tech Corp", 
                "title": "Product Catalog",
                "content": "Our main products include: AI Assistant Platform, Data Analytics Suite, Machine Learning APIs, and Cloud Infrastructure Services. Each product is designed to help businesses leverage AI technology."
            },
            {
                "org_name": "Marketing Agency",
                "title": "Services Offered",
                "content": "We offer comprehensive digital marketing services including social media management, content creation, SEO optimization, paid advertising campaigns, and brand strategy development."
            },
            {
                "org_name": "Research Institute",
                "title": "Research Areas",
                "content": "Our research focuses on artificial intelligence, natural language processing, computer vision, robotics, and human-computer interaction. We publish papers in top-tier conferences and journals."
            }
        ]
        
        for doc_data in sample_docs:
            org = Organization.query.filter_by(name=doc_data["org_name"]).first()
            if org:
                existing_doc = Document.query.filter_by(
                    org_id=org.id, 
                    title=doc_data["title"]
                ).first()
                
                if not existing_doc:
                    doc = Document(
                        org_id=org.id,
                        title=doc_data["title"],
                        content=doc_data["content"]
                    )
                    db.session.add(doc)
                    print(f"✓ Created document: {doc_data['title']} for {doc_data['org_name']}")
        
        db.session.commit()
        print("✓ Sample documents created")
        print("\n🎉 Database initialization completed successfully!")
        print("\nNext steps:")
        print("1. Set your OpenAI API key in the .env file")
        print("2. Run: python app.py")
        print("3. Navigate to http://localhost:3000")

if __name__ == "__main__":
    init_database()
