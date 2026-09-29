import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'https://skillinex-api.hacksmiths.dev';
const API_BASE_URL = rawUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    // Handle both common token storage keys
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expirations cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's an actual 401 and not already on the auth/landing page
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');

      // Avoid infinite redirect loops if already on landing/login
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;