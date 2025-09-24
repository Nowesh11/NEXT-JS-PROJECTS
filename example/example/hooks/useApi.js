import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient';

/**
 * Custom hook for API calls with loading states and error handling
 */
export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (apiFunction, ...args) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiFunction(...args);
            return result;
        } catch (err) {
            console.error('API call failed:', err);
            setError(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        apiCall,
        clearError: () => setError(null)
    };
}

/**
 * Hook for fetching data with automatic loading states
 */
export function useFetch(apiFunction, dependencies = [], options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { immediate = true, cache = true } = options;

    const fetchData = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            console.error('Fetch failed:', err);
            setError(err.message || 'Failed to fetch data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, dependencies);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        clearError: () => setError(null)
    };
}

/**
 * Hook for authentication
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const { apiCall } = useApi();

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = apiClient.getAuthToken();
                if (token) {
                    // Verify token with backend
                    const userData = await apiClient.apiCall('/api/auth/verify');
                    setUser(userData.user);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                // Token is invalid, remove it
                apiClient.removeAuthToken();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (credentials) => {
        const result = await apiCall(apiClient.login.bind(apiClient), credentials);
        if (result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
        }
        return result;
    }, [apiCall]);

    const register = useCallback(async (userData) => {
        const result = await apiCall(apiClient.register.bind(apiClient), userData);
        return result;
    }, [apiCall]);

    const logout = useCallback(async () => {
        await apiCall(apiClient.logout.bind(apiClient));
        setUser(null);
        setIsAuthenticated(false);
    }, [apiCall]);

    return {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    };
}

/**
 * Hook for website content
 */
export function useWebsiteContent(page = 'home') {
    return useFetch(
        () => apiClient.getWebsiteContent(page),
        [page],
        { cache: true }
    );
}

/**
 * Hook for global content (navigation, footer, etc.)
 */
export function useGlobalContent() {
    return useFetch(
        () => apiClient.getGlobalContent(),
        [],
        { cache: true }
    );
}

/**
 * Hook for slideshow data
 */
export function useSlideshow() {
    return useFetch(
        () => apiClient.getSlideshow(),
        [],
        { cache: true }
    );
}

/**
 * Hook for projects
 */
export function useProjects(filters = {}) {
    return useFetch(
        () => apiClient.getProjects(filters),
        [JSON.stringify(filters)],
        { cache: true }
    );
}

/**
 * Hook for single project
 */
export function useProject(id) {
    return useFetch(
        () => apiClient.getProject(id),
        [id],
        { cache: true, immediate: !!id }
    );
}

/**
 * Hook for books
 */
export function useBooks(filters = {}) {
    return useFetch(
        () => apiClient.getBooks(filters),
        [JSON.stringify(filters)],
        { cache: true }
    );
}

/**
 * Hook for single book
 */
export function useBook(id) {
    return useFetch(
        () => apiClient.getBook(id),
        [id],
        { cache: true, immediate: !!id }
    );
}

/**
 * Hook for ebooks
 */
export function useEbooks(filters = {}) {
    return useFetch(
        () => apiClient.getEbooks(filters),
        [JSON.stringify(filters)],
        { cache: true }
    );
}

/**
 * Hook for announcements
 */
export function useAnnouncements() {
    return useFetch(
        () => apiClient.getAnnouncements(),
        [],
        { cache: true }
    );
}

/**
 * Hook for active poster
 */
export function useActivePoster() {
    return useFetch(
        () => apiClient.getActivePoster(),
        [],
        { cache: true }
    );
}

/**
 * Hook for statistics
 */
export function useStatistics() {
    return useFetch(
        () => apiClient.getStatistics(),
        [],
        { cache: true }
    );
}

/**
 * Hook for notifications
 */
export function useNotifications() {
    const { data, loading, error, refetch } = useFetch(
        () => apiClient.getNotifications(),
        [],
        { cache: false }
    );

    const { apiCall } = useApi();

    const markAsRead = useCallback(async (id) => {
        await apiCall(apiClient.markNotificationAsRead.bind(apiClient), id);
        refetch(); // Refresh notifications
    }, [apiCall, refetch]);

    const markAllAsRead = useCallback(async () => {
        await apiCall(apiClient.markAllNotificationsAsRead.bind(apiClient));
        refetch(); // Refresh notifications
    }, [apiCall, refetch]);

    return {
        notifications: data,
        loading,
        error,
        refetch,
        markAsRead,
        markAllAsRead
    };
}

/**
 * Hook for newsletter subscription
 */
export function useNewsletter() {
    const { apiCall, loading, error } = useApi();

    const subscribe = useCallback(async (email) => {
        return await apiCall(apiClient.subscribeNewsletter.bind(apiClient), email);
    }, [apiCall]);

    return {
        subscribe,
        loading,
        error
    };
}

/**
 * Hook for contact form
 */
export function useContactForm() {
    const { apiCall, loading, error } = useApi();

    const submitForm = useCallback(async (formData) => {
        return await apiCall(apiClient.submitContactForm.bind(apiClient), formData);
    }, [apiCall]);

    return {
        submitForm,
        loading,
        error
    };
}

export default apiClient;