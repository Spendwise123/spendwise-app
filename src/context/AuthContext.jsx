// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const API_BASE_URL = '/api/auth';

const extractErrorMessage = (data, defaultMessage) => {
  if (!data) return defaultMessage;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  
  if (typeof data === 'object') {
    const errorStrings = Object.entries(data).map(([key, val]) => {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
      const valStr = Array.isArray(val) ? val.join(' ') : String(val);
      return `${fieldName}: ${valStr}`;
    });
    if (errorStrings.length > 0) return errorStrings.join('; ');
  }
  return defaultMessage;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Login failed'));
    }

    // Django response matches Express format: { id, name, email, role, token }
    const { token, ...user } = data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const signup = async (email, password, first_name, last_name = '') => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name, last_name })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Signup failed'));
    }

    const { token, ...user } = data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const getToken = () => localStorage.getItem('token');

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}