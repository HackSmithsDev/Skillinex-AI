import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// PRO-TIP: Replace with your specific Mac IP 
// Check this via 'ifconfig' on Mac or 'ipconfig' on Windows
const API_BASE_URL = 'https://skillinex-api.hacksmiths.dev/'; 
// const API_BASE_URL = 'http://10.163.110.99:5050/'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s timeout for AI generation tasks
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Check for Network / Server Connectivity
    if (!error.response) {
      Alert.alert("Connection Error", "Terminal unreachable. Check your network or Durg server status.");
      return Promise.reject(error);
    }

    // 2. The 401 "Unauthorized" Reset
    if (error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      // Note: Actual UI redirection happens in AppNavigator.jsx 
      // when it detects userToken is null via AuthContext.
      Alert.alert("Session Expired", "Neural sync lost. Please re-authenticate.");
    }
    
    return Promise.reject(error);
  }
);

export default api;