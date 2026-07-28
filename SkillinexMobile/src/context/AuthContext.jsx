import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // UPDATED: Now accepts an optional manualToken to bypass AsyncStorage lag
  const fetchUser = async (manualToken = null) => {
    try {
      const token = manualToken || await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/user/me', {
        headers: manualToken ? { Authorization: `Bearer ${manualToken}` } : {}
      });
      setUser(res.data);
    } catch (err) {
      console.log("Terminal_Auth_Sync_Failed:", err);
      // Only logout if we weren't just handed a fresh token that failed for other reasons
      if (!manualToken) await logout(); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) await fetchUser();
      else setLoading(false);
    };
    hydrate();
  }, []);

  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem('token', token);
      setUser(userData);
    } catch (e) {
      console.error("Storage_Error:", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (e) {
      console.error("Logout_Error:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};