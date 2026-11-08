/**
 * Axios API Client Configuration
 * Base URL and automatic JWT token attachment in Authorization header
 */

import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const apiBaseUrl = configuredApiUrl.endsWith('/api')
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartcampus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically handle 401 unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('smartcampus_token');
      localStorage.removeItem('smartcampus_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

