import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const verifyAPI = {
  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/verify/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getJobs: async () => {
    const response = await api.get('/api/verify/jobs');
    return response.data;
  },
  
  getJobDetails: async (jobId: string) => {
    const response = await api.get(`/api/verify/jobs/${jobId}`);
    return response.data;
  },
  
  downloadResults: async (jobId: string) => {
    const response = await api.get(`/api/verify/jobs/${jobId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  deleteJob: async (jobId: string) => {
    const response = await api.delete(`/api/verify/jobs/${jobId}`);
    return response.data;
  },
};

export default api;