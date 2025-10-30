import axios from 'axios';

// Use relative path to leverage Vite's proxy in development
// In production, this would be the actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// CIK services
export const cikService = {
  async validate(cik) {
    const response = await api.get(`/cik/validate/${cik}`);
    return response.data;
  },

  async getInfo(cik) {
    const response = await api.get(`/cik/info/${cik}`);
    return response.data;
  },

  async verify(cik, ccc) {
    const response = await api.post('/cik/verify', { cik, ccc });
    return response.data;
  },
};

// Issuer services
export const issuerService = {
  async search(query) {
    const response = await api.get('/issuers/search', { params: { query } });
    return response.data;
  },

  async getInfo(cik) {
    const response = await api.get(`/issuers/${cik}`);
    return response.data;
  },
};

// Filing draft services
export const filingService = {
  async getDrafts() {
    const response = await api.get('/filings/drafts');
    return response.data;
  },

  async getDraft(id) {
    const response = await api.get(`/filings/drafts/${id}`);
    return response.data;
  },

  async createDraft(data) {
    const response = await api.post('/filings/drafts', data);
    return response.data;
  },

  async updateDraft(id, data) {
    const response = await api.put(`/filings/drafts/${id}`, data);
    return response.data;
  },

  async deleteDraft(id) {
    const response = await api.delete(`/filings/drafts/${id}`);
    return response.data;
  },

  async getXmlPreview(id) {
    const response = await api.get(`/filings/drafts/${id}/xml`);
    return response.data;
  },
};

// Validation services
export const validationService = {
  async validateSchema(xmlContent, formType) {
    const response = await api.post('/validate/schema', { xmlContent, formType });
    return response.data;
  },

  async validateBusiness(xmlContent, formType) {
    const response = await api.post('/validate/business', { xmlContent, formType });
    return response.data;
  },

  async validateFull(xmlContent, formType) {
    const response = await api.post('/validate/full', { xmlContent, formType });
    return response.data;
  },
};

// Exhibit services
export const exhibitService = {
  async upload(filingId, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/exhibits/${filingId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  async getExhibits(filingId) {
    const response = await api.get(`/exhibits/${filingId}`);
    return response.data;
  },

  async deleteExhibit(id) {
    const response = await api.delete(`/exhibits/${id}`);
    return response.data;
  },
};

// Submission services
export const submissionService = {
  async submit(filingId, ccc, isLive = false) {
    const response = await api.post(`/submit/${filingId}`, { ccc, isLive });
    return response.data;
  },

  async getStatus(filingId) {
    const response = await api.get(`/submit/${filingId}/status`);
    return response.data;
  },

  async getHistory() {
    const response = await api.get('/submissions/history');
    return response.data;
  },
};

// Utility services
export const utilityService = {
  async getTransactionCodes() {
    const response = await api.get('/utils/transaction-codes');
    return response.data;
  },

  async getStateCodes() {
    const response = await api.get('/utils/state-codes');
    return response.data;
  },

  async getFormTemplate(formType) {
    const response = await api.get(`/utils/form-templates/${formType}`);
    return response.data;
  },
};

export default api;


