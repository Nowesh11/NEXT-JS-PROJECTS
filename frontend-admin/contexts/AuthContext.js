import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Default auth value to prevent undefined context errors
const defaultAuthValue = {
  user: null,
  loading: false,
  login: async () => ({ success: false, error: 'Auth context not available' }),
  logout: () => {},
  isAuthenticated: false
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth called outside of AuthProvider, returning default values');
    return defaultAuthValue;
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd validate the token with your backend
      setUser({ id: '1', name: 'Admin User', email: 'admin@example.com' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, you'd make an API call to authenticate
      if (email === 'admin@example.com' && password === 'admin') {
        const token = 'mock-jwt-token';
        localStorage.setItem('authToken', token);
        setUser({ id: '1', name: 'Admin User', email });
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};