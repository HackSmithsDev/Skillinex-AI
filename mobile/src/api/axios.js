import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const TOKEN_KEY = 'token';

// Override per environment with EXPO_PUBLIC_API_URL (e.g. http://<LAN-IP>:5050)
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://skillinex-api.hacksmiths.dev').replace(/\/+$/, '');

export const getApiBaseUrl = () => API_BASE_URL;

// Backend returns relative paths such as /uploads/profile_pics/x.png
export const resolveMediaUrl = (path) => {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // AI generation (tests, roadmaps) can be slow
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      Alert.alert('Connection Error', 'Terminal unreachable. Check your network or server status.');
      return Promise.reject(error);
    }

    const isAuthCall = error.config?.url?.startsWith('/auth/');
    if (error.response.status === 401 && !isAuthCall) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      if (onUnauthorized) onUnauthorized();
      Alert.alert('Session Expired', 'Please re-authenticate.');
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong') => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail[0]?.msg || fallback;
  return detail || fallback;
};

export default api;
