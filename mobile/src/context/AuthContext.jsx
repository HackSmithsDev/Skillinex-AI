import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_KEY, setUnauthorizedHandler } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const res = await api.get('/user/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.log("Terminal_Auth_Sync_Failed:", err);
      await logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    const hydrate = async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) await fetchUser();
      else setLoading(false);
    };
    hydrate();
  }, []);

  // Backend returns only the token; the profile is loaded from /user/me.
  const login = async (token) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return fetchUser();
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
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