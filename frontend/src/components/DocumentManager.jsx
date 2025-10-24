import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useOrganizations } from '../contexts/OrganizationContext';
import { documentService } from '../services/api';

const DocumentManager = () => {
  const { organizations, selectedOrg, setSelectedOrg, createOrganization } = useOrganizations();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [newOrgDialog, setNewOrgDialog] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    content: '',
    metadata: {}
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    if (selectedOrg) {
      loadDocuments();
    }
  }, [selectedOrg]);

  const loadDocuments = async () => {
    if (!selectedOrg) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.getAll(selectedOrg.id);
      setDocuments(response.data.documents);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      setError(null);
      const response = await documentService.upload({
        ...uploadForm,
        org_id: selectedOrg.id
      });
      
      setDocuments(prev => [response.data.document, ...prev]);
      setUploadDialog(false);
      setUploadForm({ title: '', content: '', metadata: {} });
    } catch (err) {
      setError('Failed to upload document');
      console.error('Error uploading document:', err);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentService.delete(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      setError('Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedOrg) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.search(searchQuery, selectedOrg.id);
      setSearchResults(response.data.results);
      setSearchDialog(false);
    } catch (err) {
      setError('Search failed');
      console.error('Error searching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    try {
      setError(null);
      const newOrg = await createOrganization(newOrgName);
      setSelectedOrg(newOrg);
      setNewOrgDialog(false);
      setNewOrgName('');
    } catch (err) {
      setError('Failed to create organization');
      console.error('Error creating organization:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Document Management</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setNewOrgDialog(true)}
            sx={{ mr: 2 }}
          >
            New Organization
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialog(true)}
            disabled={!selectedOrg}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Organization Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Organization</InputLabel>
          <Select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value);
              setSelectedOrg(org);
            }}
            label="Select Organization"
          >
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={!selectedOrg || !searchQuery.trim()}
        >
          Search
        </Button>
      </Box>

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Content Preview</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>
                    {doc.content.length > 100 
                      ? `${doc.content.substring(0, 100)}...` 
                      : doc.content
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Content Preview</TableCell>
                  <TableCell>Relevance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>
                      {doc.content.length > 100 
                        ? `${doc.content.substring(0, 100)}...` 
                        : doc.content
                      }
                    </TableCell>
                    <TableCell>
                      <Chip label={`Result ${index + 1}`} color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={6}
            value={uploadForm.content}
            onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Organization Dialog */}
      <Dialog open={newOrgDialog} onClose={() => setNewOrgDialog(false)}>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Organization Name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewOrgDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateOrganization} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;
