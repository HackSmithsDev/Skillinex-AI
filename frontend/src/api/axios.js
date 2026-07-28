import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: The "Bouncer" Logic
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server says "Unauthorized" (Token expired or fake)
    if (error.response && error.response.status === 401) {
      
      // 1. Wipe the local evidence
      localStorage.removeItem('token');
      
      /** * 2. Redirect to Root ('/') 
       * Because we set up Home.jsx to show <Landing /> when !user,
       * this effectively "kicks" them back to your cinematic landing page.
       */
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;