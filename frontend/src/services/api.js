import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Organization API
export const organizationService = {
  getAll: () => api.get('/organizations/'),
  create: (name) => api.post('/organizations/', { name }),
  get: (id) => api.get(`/organizations/${id}`),
  delete: (id) => api.delete(`/organizations/${id}`)
};

// Document API
export const documentService = {
  upload: (data) => api.post('/documents/upload', data),
  getAll: (orgId) => api.get(`/documents/?org_id=${orgId}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  search: (query, orgId) => api.post('/documents/search', { query, org_id: orgId })
};

// Chat API
export const chatService = {
  query: (query, orgId) => api.post('/chat/query', { query, org_id: orgId })
};

export default api;
