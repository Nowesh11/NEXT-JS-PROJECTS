import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_KEY = 'tls_admin_token';

// Client-side auth utilities
export const authUtils = {
  // Store token in localStorage
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token from localStorage
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remove token from localStorage
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authUtils.getToken();
    if (!token) return false;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        authUtils.removeToken();
        return false;
      }
      return true;
    } catch (error) {
      authUtils.removeToken();
      return false;
    }
  },

  // Get user info from token
  getUserInfo: () => {
    const token = authUtils.getToken();
    if (!token) return null;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        authUtils.removeToken();
        return null;
      }
      return {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        exp: decoded.exp
      };
    } catch (error) {
      authUtils.removeToken();
      return null;
    }
  },

  // Get authorization header for API requests
  getAuthHeader: () => {
    const token = authUtils.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

// Server-side auth utilities
export const serverAuthUtils = {
  // Generate JWT token
  generateToken: (user) => {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '24h' 
    });
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Extract token from request headers
  extractTokenFromRequest: (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  },

  // Middleware to verify admin authentication
  verifyAdminAuth: (req) => {
    const token = serverAuthUtils.extractTokenFromRequest(req);
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = serverAuthUtils.verifyToken(token);
    if (decoded.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    return decoded;
  }
};

// React hook for authentication
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const authenticated = authUtils.isAuthenticated();
      const userInfo = authUtils.getUserInfo();
      
      setIsAuthenticated(authenticated);
      setUser(userInfo);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      authUtils.setToken(data.token);
      setIsAuthenticated(true);
      setUser(authUtils.getUserInfo());

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authUtils.removeToken();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/admin/login');
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };
};

// Higher-order component for protecting admin routes
export const withAdminAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
        router.push('/admin/login');
      }
    }, [isAuthenticated, user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// API request helper with authentication
export const authenticatedFetch = async (url, options = {}) => {
  const authHeaders = authUtils.getAuthHeader();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    }
  };

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    // Token expired or invalid
    authUtils.removeToken();
    window.location.href = '/admin/login';
    throw new Error('Authentication required');
  }

  return response;
};