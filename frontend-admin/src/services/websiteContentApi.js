/**
 * Website Content API Service
 * Handles all API calls for website content management
 */

class WebsiteContentAPI {
    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
        this.timeout = 10000;
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            timeout: this.timeout,
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401) {
                // Token expired or invalid
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/auth/login';
                }
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Get all website content sections for a specific page
     */
    async getPageContent(page, language = 'english') {
        return await this.apiRequest(`/api/website-content/sections/${page}?lang=${language}`);
    }

    /**
     * Get global content (navigation, footer, etc.)
     */
    async getGlobalContent(language = 'english') {
        return await this.apiRequest(`/api/website-content/global?lang=${language}`);
    }

    /**
     * Save page content
     */
    async savePageContent(page, content, language = 'english') {
        return await this.apiRequest(`/api/website-content/sections/${page}`, {
            method: 'PUT',
            body: {
                content,
                language,
                lastModified: new Date().toISOString()
            }
        });
    }

    /**
     * Create new content section
     */
    async createSection(page, sectionData, language = 'english') {
        return await this.apiRequest(`/api/website-content/sections/${page}/create`, {
            method: 'POST',
            body: {
                ...sectionData,
                language,
                createdAt: new Date().toISOString()
            }
        });
    }

    /**
     * Update existing content section
     */
    async updateSection(page, sectionId, sectionData, language = 'english') {
        return await this.apiRequest(`/api/website-content/sections/${page}/${sectionId}`, {
            method: 'PUT',
            body: {
                ...sectionData,
                language,
                lastModified: new Date().toISOString()
            }
        });
    }

    /**
     * Delete content section
     */
    async deleteSection(page, sectionId) {
        return await this.apiRequest(`/api/website-content/sections/${page}/${sectionId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get content overview (all pages summary)
     */
    async getContentOverview(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/api/website-content/overview?${queryParams}` : '/api/website-content/overview';
        return await this.apiRequest(endpoint);
    }

    /**
     * Get recent content activity
     */
    async getRecentActivity(limit = 20, filters = {}) {
        const queryParams = new URLSearchParams({ limit, ...filters }).toString();
        return await this.apiRequest(`/api/website-content/activity?${queryParams}`);
    }

    /**
     * Preview page content
     */
    async previewPage(page, language = 'english') {
        return await this.apiRequest(`/api/website-content/preview/${page}?lang=${language}`);
    }

    /**
     * Export page content
     */
    async exportPageContent(page, format = 'json', language = 'english') {
        return await this.apiRequest(`/api/website-content/export/${page}?format=${format}&lang=${language}`);
    }

    /**
     * Import page content
     */
    async importPageContent(page, contentData, language = 'english') {
        return await this.apiRequest(`/api/website-content/import/${page}`, {
            method: 'POST',
            body: {
                content: contentData,
                language,
                importedAt: new Date().toISOString()
            }
        });
    }

    /**
     * Get available section types
     */
    async getSectionTypes() {
        return await this.apiRequest('/api/website-content/section-types');
    }

    /**
     * Upload image for content
     */
    async uploadImage(file, page, sectionId = null) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('page', page);
        if (sectionId) formData.append('sectionId', sectionId);

        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        
        const response = await fetch(`${this.baseURL}/api/website-content/upload-image`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        return await response.json();
    }

    /**
     * Search content across all pages
     */
    async searchContent(query, filters = {}) {
        const queryParams = new URLSearchParams({ q: query, ...filters }).toString();
        return await this.apiRequest(`/api/website-content/search?${queryParams}`);
    }

    /**
     * Get content statistics
     */
    async getContentStats() {
        return await this.apiRequest('/api/website-content/stats');
    }

    /**
     * Backup all content
     */
    async backupContent() {
        return await this.apiRequest('/api/website-content/backup', {
            method: 'POST'
        });
    }

    /**
     * Restore content from backup
     */
    async restoreContent(backupId) {
        return await this.apiRequest(`/api/website-content/restore/${backupId}`, {
            method: 'POST'
        });
    }

    /**
     * Validate content structure
     */
    async validateContent(page, content) {
        return await this.apiRequest('/api/website-content/validate', {
            method: 'POST',
            body: { page, content }
        });
    }

    /**
     * Get content revision history
     */
    async getRevisionHistory(page, sectionId = null) {
        const endpoint = sectionId 
            ? `/api/website-content/revisions/${page}/${sectionId}`
            : `/api/website-content/revisions/${page}`;
        return await this.apiRequest(endpoint);
    }

    /**
     * Revert to specific revision
     */
    async revertToRevision(page, revisionId, sectionId = null) {
        const endpoint = sectionId
            ? `/api/website-content/revert/${page}/${sectionId}/${revisionId}`
            : `/api/website-content/revert/${page}/${revisionId}`;
        return await this.apiRequest(endpoint, {
            method: 'POST'
        });
    }
}

// Create singleton instance
const websiteContentAPI = new WebsiteContentAPI();

export default websiteContentAPI;

// Named exports for specific functions
export const {
    getPageContent,
    getGlobalContent,
    savePageContent,
    createSection,
    updateSection,
    deleteSection,
    getContentOverview,
    getRecentActivity,
    previewPage,
    exportPageContent,
    importPageContent,
    getSectionTypes,
    uploadImage,
    searchContent,
    getContentStats,
    backupContent,
    restoreContent,
    validateContent,
    getRevisionHistory,
    revertToRevision
} = websiteContentAPI;