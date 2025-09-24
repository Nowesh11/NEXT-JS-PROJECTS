import { useState, useEffect, useCallback } from 'react';

class ContentManager {
    constructor() {
        this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
        this.contentCache = new Map();
        this.currentLanguage = 'english';
        this.isInitialized = false;
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
     * Get all content from database
     */
    async getAllContent() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/website-content/sections/home`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load all content');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error loading all content:', error);
            return [];
        }
    }

    /**
     * Find content by key (page.section format or sectionKey)
     */
    findContentByKey(allContent, key) {
        if (!key) return null;
        
        // First try to find by sectionKey directly
        let content = allContent.find(item => item.sectionKey === key);
        if (content) return content;
        
        // Then try page.section format
        const [page, section] = key.split('.');
        content = allContent.find(item => 
            item.page === page && item.section === section
        );
        if (content) return content;
        
        // Try mapping HTML data-content attributes to database keys
        const mappedKey = this.mapHtmlAttributeToDbKey(key);
        if (mappedKey && mappedKey !== key) {
            return this.findContentByKey(allContent, mappedKey);
        }
        
        return null;
    }

    /**
     * Map HTML data-content attribute names to database sectionKey format
     */
    mapHtmlAttributeToDbKey(htmlKey) {
        const keyMappings = {
            // Navigation mappings
            'nav-home': 'navigation.homeLink',
            'nav-about': 'navigation.aboutLink', 
            'nav-projects': 'navigation.projectsLink',
            'nav-ebooks': 'navigation.ebooksLink',
            'nav-books': 'navigation.booksLink',
            'nav-contact': 'navigation.contactLink',
            'nav-login': 'navigation.loginLink',
            'nav-signup': 'navigation.signupLink',
            'logo-text': 'navigation.logoText',
            'logo-image': 'navigation.logoImage',
            
            // Home page mappings
            'home-hero-title': 'home.heroTitle',
            'home-hero-subtitle': 'home.heroSubtitle',
            'home-hero-quote': 'home.heroQuote',
            'home-features-title': 'home.featuresTitle',
            
            // Footer mappings
            'footer-description': 'footer.description',
            'footer-copyright': 'footer.copyright',
            'footer-logo-text': 'footer.logoText',
            'footer-newsletter-title': 'footer.newsletterTitle',
            'footer-newsletter-description': 'footer.newsletterDescription'
        };
        
        return keyMappings[htmlKey] || htmlKey;
    }

    /**
     * Load page content from API
     */
    async loadPageContent(page, retryCount = 0) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/website-content/sections/${page}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load content for page: ${page}`);
            }
            
            const data = await response.json();
            const content = data.data || [];
            
            // Cache the content
            this.contentCache.set(page, content);
            
            return content;
        } catch (error) {
            console.error(`Error loading page content for ${page}:`, error);
            
            // Retry logic
            if (retryCount < 2) {
                console.log(`Retrying content load for ${page} (attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.loadPageContent(page, retryCount + 1);
            }
            
            return this.loadFallbackContent(page);
        }
    }

    /**
     * Load global content (navigation, footer, etc.)
     */
    async loadGlobalContent() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/website-content/global`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error('Failed to load global content');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error loading global content:', error);
            return [];
        }
    }

    /**
     * Get localized text based on current language
     */
    getLocalizedText(english, tamil) {
        if (this.currentLanguage === 'tamil' && tamil) {
            return tamil;
        }
        return english || '';
    }

    /**
     * Get localized text from object
     */
    getLocalizedTextFromObject(textObj) {
        if (!textObj) return '';
        
        if (typeof textObj === 'string') {
            return textObj;
        }
        
        if (this.currentLanguage === 'tamil' && textObj.tamil) {
            return textObj.tamil;
        }
        
        return textObj.english || textObj.en || '';
    }

    /**
     * Load fallback content when API fails
     */
    async loadFallbackContent(page) {
        const fallbackContent = {
            home: [
                {
                    sectionKey: 'home.heroTitle',
                    content: { english: 'Welcome to TLS', tamil: 'TLS இல் வரவேற்கிறோம்' }
                },
                {
                    sectionKey: 'home.heroSubtitle',
                    content: { english: 'Tamil Language Society', tamil: 'தமிழ் மொழி சங்கம்' }
                }
            ],
            navigation: [
                {
                    sectionKey: 'navigation.homeLink',
                    content: { english: 'Home', tamil: 'முகப்பு' }
                },
                {
                    sectionKey: 'navigation.aboutLink',
                    content: { english: 'About', tamil: 'பற்றி' }
                }
            ]
        };
        
        return fallbackContent[page] || [];
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
     * Initialize content manager
     */
    async initialize() {
        if (typeof window !== 'undefined') {
            this.currentLanguage = this.getCurrentLanguage();
        }
        this.isInitialized = true;
    }
}

// Create singleton instance
const contentManager = new ContentManager();

/**
 * React hook for content management
 */
export function useContentManager() {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('english');

    // Initialize content manager
    useEffect(() => {
        const initializeManager = async () => {
            try {
                await contentManager.initialize();
                setLanguage(contentManager.getCurrentLanguage());
            } catch (err) {
                console.error('Failed to initialize content manager:', err);
                setError(err.message);
            }
        };
        
        initializeManager();
    }, []);

    // Load content for specific page
    const loadContent = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        
        try {
            const pageContent = await contentManager.loadPageContent(page);
            const globalContent = await contentManager.loadGlobalContent();
            
            setContent({
                page: pageContent,
                global: globalContent
            });
        } catch (err) {
            console.error('Failed to load content:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get content by key
    const getContent = useCallback((key, fallback = '') => {
        if (!content.page && !content.global) return fallback;
        
        const allContent = [...(content.page || []), ...(content.global || [])];
        const contentItem = contentManager.findContentByKey(allContent, key);
        
        if (contentItem && contentItem.content) {
            return contentManager.getLocalizedTextFromObject(contentItem.content);
        }
        
        return fallback;
    }, [content]);

    // Change language
    const changeLanguage = useCallback((newLanguage) => {
        contentManager.setLanguage(newLanguage);
        setLanguage(newLanguage);
    }, []);

    return {
        content,
        loading,
        error,
        language,
        loadContent,
        getContent,
        changeLanguage,
        contentManager
    };
}

export default contentManager;