from flask import Blueprint, request, jsonify
from app import db
from app.models.organization import Organization

organizations_bp = Blueprint('organizations', __name__)

@organizations_bp.route('/', methods=['GET'])
def list_organizations():
    """List all organizations"""
    try:
        orgs = Organization.query.all()
        return jsonify({
            'organizations': [org.to_dict() for org in orgs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@organizations_bp.route('/', methods=['POST'])
def create_organization():
    """Create a new organization"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Organization name is required'}), 400
        
        # Check if organization already exists
        existing_org = Organization.query.filter_by(name=data['name']).first()
        if existing_org:
            return jsonify({'error': 'Organization with this name already exists'}), 400
        
        # Create new organization
        org = Organization(name=data['name'])
        db.session.add(org)
        db.session.commit()
        
        return jsonify({
            'message': 'Organization created successfully',
            'organization': org.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@organizations_bp.route('/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    """Get a specific organization"""
    try:
        org = Organization.query.get_or_404(org_id)
        return jsonify({'organization': org.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@organizations_bp.route('/<int:org_id>', methods=['DELETE'])
def delete_organization(org_id):
    """Delete an organization and all its documents"""
    try:
        org = Organization.query.get_or_404(org_id)
        
        # Delete organization (documents will be deleted due to cascade)
        db.session.delete(org)
        db.session.commit()
        
        return jsonify({'message': 'Organization deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
