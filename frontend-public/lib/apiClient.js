/**
 * API Client for Next.js Frontend
 * Handles all backend communication with authentication, retries, and error handling
 */

class ApiClient {
    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'; // Use local Next.js API routes
        this.timeout = 30000; // 30 seconds
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        // Cache for storing data
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Language support
        this.currentLanguage = 'english';
    }

    /**
     * Get authentication token from localStorage
     */
    getAuthToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
    }

    /**
     * Remove authentication token
     */
    removeAuthToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
        }
    }

    /**
     * Add language parameter to URL
     */
    addLanguageParam(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}lang=${this.currentLanguage}`;
    }

    /**
     * Set current language
     */
    setLanguage(language) {
        this.currentLanguage = language;
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedLanguage', language);
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedLanguage') || 'english';
        }
        return 'english';
    }

    /**
     * Create request headers
     */
    createHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        const token = this.getAuthToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    }

    /**
     * Make API call with retry logic
     */
    async apiCall(endpoint, options = {}, retryCount = 0) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            cache = false,
            skipAuth = false
        } = options;

        // Check cache first for GET requests
        if (method === 'GET' && cache) {
            const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
            const cachedData = this.cache.get(cacheKey);
            if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
                return cachedData.data;
            }
        }

        const url = this.addLanguageParam(`${this.baseURL}${endpoint}`);
        const requestHeaders = skipAuth ? { 'Content-Type': 'application/json', ...headers } : this.createHeaders(headers);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : null,
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await this.handleResponse(response);

            // Cache successful GET requests
            if (method === 'GET' && cache) {
                const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            // Handle authentication errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                this.removeAuthToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new Error('Authentication required. Please log in.');
            }

            // Retry logic for network errors
            if (retryCount < this.maxRetries && this.shouldRetry(error)) {
                console.log(`Retrying API call to ${endpoint} (attempt ${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.apiCall(endpoint, options, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Determine if request should be retried
     */
    shouldRetry(error) {
        return (
            error.name === 'AbortError' ||
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('timeout')
        );
    }

    /**
     * Delay utility for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    // HTTP Methods

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return await this.apiCall(endpoint, {
            method: 'GET',
            ...options
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data = null, options = {}) {
        return await this.apiCall(endpoint, {
            method: 'POST',
            body: data,
            ...options
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = null, options = {}) {
        return await this.apiCall(endpoint, {
            method: 'PUT',
            body: data,
            ...options
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return await this.apiCall(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = null, options = {}) {
        return await this.apiCall(endpoint, {
            method: 'PATCH',
            body: data,
            ...options
        });
    }

    // API Methods

    /**
     * Authentication APIs
     */
    async login(credentials) {
        const data = await this.apiCall('/api/auth/login', {
            method: 'POST',
            body: credentials,
            skipAuth: true
        });
        
        if (data.token) {
            this.setAuthToken(data.token);
        }
        
        return data;
    }

    async register(userData) {
        return await this.apiCall('/api/auth/register', {
            method: 'POST',
            body: userData,
            skipAuth: true
        });
    }

    async logout() {
        try {
            await this.apiCall('/api/auth/logout', { method: 'POST' });
        } finally {
            this.removeAuthToken();
            this.clearCache();
        }
    }

    /**
     * Content APIs
     */
    async getWebsiteContent(page = 'home') {
        return await this.apiCall(`/api/website-content/sections/${page}`, {
            cache: true
        });
    }

    async getGlobalContent() {
        return await this.apiCall('/api/website-content/global', {
            cache: true
        });
    }

    /**
     * Slideshow APIs
     */
    async getSlideshow() {
        return await this.apiCall('/api/slideshow', {
            cache: true
        });
    }

    /**
     * Projects APIs
     */
    async getProjects(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/projects?${queryParams}` : '/api/projects';
        return await this.apiCall(endpoint, {
            cache: true
        });
    }

    async getProject(id) {
        return await this.apiCall(`/api/projects/${id}`, {
            cache: true
        });
    }

    /**
     * Books APIs
     */
    async getBooks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/books?${queryParams}` : '/api/books';
        return await this.apiCall(endpoint, {
            cache: true
        });
    }

    async getBook(id) {
        return await this.apiCall(`/api/books/${id}`, {
            cache: true
        });
    }

    /**
     * Ebooks APIs
     */
    async getEbooks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/ebooks?${queryParams}` : '/api/ebooks';
        return await this.apiCall(endpoint, {
            cache: true
        });
    }

    /**
     * Announcements/Posters APIs
     */
    async getAnnouncements() {
        return await this.apiCall('/api/announcements', {
            cache: true
        });
    }

    async getActivePoster() {
        return await this.apiCall('/api/posters/active', {
            cache: true
        });
    }
    
    async getPosters(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/posters?${queryParams}` : '/api/posters';
        return await this.apiCall(endpoint, {
            cache: true
        });
    }
    
    async getPoster(id) {
        return await this.apiCall(`/api/posters/${id}`, {
            cache: true
        });
    }

    /**
     * Statistics APIs
     */
    async getStatistics() {
        return await this.apiCall('/api/statistics', {
            cache: true
        });
    }

    /**
     * Notifications APIs
     */
    async getNotifications() {
        return await this.apiCall('/api/notifications');
    }

    async markNotificationAsRead(id) {
        return await this.apiCall(`/api/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead() {
        return await this.apiCall('/api/notifications/mark-all-read', {
            method: 'PUT'
        });
    }

    /**
     * Newsletter APIs
     */
    async subscribeNewsletter(email) {
        return await this.apiCall('/api/newsletter/subscribe', {
            method: 'POST',
            body: { email },
            skipAuth: true
        });
    }

    /**
     * Contact APIs
     */
    async submitContactForm(formData) {
        return await this.apiCall('/api/contact', {
            method: 'POST',
            body: formData,
            skipAuth: true
        });
    }

    /**
     * Team APIs
     */
    async getTeamMembers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/team?${queryParams}` : '/api/team';
        return await this.apiCall(endpoint, {
            cache: true
        });
    }

    async getTeamMember(id) {
        return await this.apiCall(`/api/team/${id}`, {
            cache: true
        });
    }
}

// Create singleton instance
const apiClient = new ApiClient();

// Initialize language on client side
if (typeof window !== 'undefined') {
    apiClient.setLanguage(apiClient.getCurrentLanguage());
}

export default apiClient;