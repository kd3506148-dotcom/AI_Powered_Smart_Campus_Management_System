/**
 * Authentication Context
 * Manages user state, token persistence, login/register methods, and 1-click demo login
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartcampus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartcampus_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing token on app load
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('smartcampus_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('smartcampus_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err?.response?.data?.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('smartcampus_token', token);
        localStorage.setItem('smartcampus_user', JSON.stringify(user));
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 1-Click Demo Login (Pre-configured credentials for quick evaluation)
  const demoLogin = async (role) => {
    const credentials = {
      Student: { email: 'student@campus.edu', password: 'Student123!' },
      Faculty: { email: 'faculty@campus.edu', password: 'Faculty123!' },
      Admin: { email: 'admin@campus.edu', password: 'Admin123!' },
      Staff: { email: 'staff@campus.edu', password: 'Staff123!' },
    };

    const target = credentials[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  // Register handler
  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token, user } = res.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('smartcampus_token', token);
        localStorage.setItem('smartcampus_user', JSON.stringify(user));
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartcampus_token');
    localStorage.removeItem('smartcampus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        demoLogin,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

