import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Auth context for admin authentication
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Validate token with API (mock implementation)
      const isValid = await validateToken(token);
      
      if (isValid) {
        setIsAuthenticated(true);
        setUser({
          id: '1',
          name: 'Admin User',
          email: 'admin@tls.com',
          role: 'admin'
        });
      } else {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Call actual login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call result
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/auth/login');
    }
  };

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth
  };
};

// Mock functions - replace with actual API calls
const validateToken = async (token) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return token === 'mock-jwt-token';
};

const mockLogin = async (credentials) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (credentials.email === 'admin@tls.com' && credentials.password === 'admin123') {
    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@tls.com',
        role: 'admin'
      }
    };
  } else {
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
};

// HOC for protecting admin routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/auth/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-digital-50 dark:from-gray-900 dark:via-gray-800 dark:to-cultural-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cultural-200 border-t-cultural-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// Route guard component
export const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-digital-50 dark:from-gray-900 dark:via-gray-800 dark:to-cultural-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cultural-200 border-t-cultural-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

// Permission checker
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Add more role-based permission logic here
  const permissions = {
    'moderator': ['read', 'write'],
    'editor': ['read', 'write', 'publish'],
    'viewer': ['read']
  };
  
  return permissions[user.role]?.includes(permission) || false;
};

// API request helper with auth
export const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/auth/login';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};