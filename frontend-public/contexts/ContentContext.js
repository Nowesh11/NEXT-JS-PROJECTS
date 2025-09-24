import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useContentManager } from '../lib/contentManager';

const ContentContext = createContext({
  content: {},
  globalContent: {},
  loading: false,
  error: null,
  language: 'en',
  isInitialized: false,
  loadContent: () => {},
  getContent: () => '',
  getText: () => '',
  getImage: () => '',
  getContentValue: () => '',
  changeLanguage: () => {},
  contentManager: null,
  fetchGlobalContent: () => {}
});

// Create a default context value to prevent undefined errors
const defaultContextValue = {
  content: {},
  globalContent: {},
  loading: false,
  error: null,
  language: 'en',
  isInitialized: false,
  loadContent: () => {},
  getContent: () => '',
  getText: () => '',
  getImage: () => '',
  getContentValue: () => '',
  changeLanguage: () => {},
  contentManager: null,
  fetchGlobalContent: () => {}
};

export { ContentContext };

export function ContentProvider({ children }) {
    const {
        content,
        loading,
        error,
        language,
        loadContent,
        getContent,
        changeLanguage,
        contentManager
    } = useContentManager();

    const [isInitialized, setIsInitialized] = useState(false);
    const [globalContent, setGlobalContent] = useState({});

    // Fetch global content (navigation, footer, etc.)
    const fetchGlobalContent = useCallback(async () => {
        try {
            // Try global endpoint first
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/website-content/global?language=${language}`);
            
            if (!response.ok) {
                console.warn('Global endpoint failed, trying sections endpoint');
                // Fallback to sections endpoint
                response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/website-content/sections/home`);
            }
            
            if (response.ok) {
                const data = await response.json();
                setGlobalContent(data.data || {});
            } else {
                console.error('Both global and sections endpoints failed');
                setGlobalContent({});
            }
        } catch (err) {
            console.error('Error fetching global content:', err);
            setGlobalContent({});
        }
    }, [language]);

    // Get text with multilingual support
    const getText = useCallback((key, fallback = '') => {
        const contentItem = getContent(key, fallback);
        
        if (!contentItem || contentItem === fallback) {
            // Check global content
            if (globalContent[key]) {
                const globalItem = globalContent[key];
                if (typeof globalItem === 'object' && globalItem[language]) {
                    return globalItem[language];
                }
                if (typeof globalItem === 'string') {
                    return globalItem;
                }
            }
            return fallback;
        }
        
        // Handle multilingual content
        if (typeof contentItem === 'object') {
            if (contentItem[language]) {
                return contentItem[language];
            }
            if (contentItem.en) {
                return contentItem.en;
            }
            if (contentItem.title && typeof contentItem.title === 'object') {
                return contentItem.title[language] || contentItem.title.en || fallback;
            }
            if (contentItem.content && typeof contentItem.content === 'object') {
                return contentItem.content[language] || contentItem.content.en || fallback;
            }
        }
        
        return contentItem || fallback;
    }, [getContent, globalContent, language]);

    // Get image URL
    const getImage = useCallback((key, fallback = '') => {
        const contentItem = getContent(key);
        
        if (contentItem && typeof contentItem === 'object') {
            if (contentItem.image) return contentItem.image;
            if (contentItem.images && contentItem.images.length > 0) {
                return contentItem.images[0].url || contentItem.images[0];
            }
        }
        
        // Check global content
        if (globalContent[key]) {
            const globalItem = globalContent[key];
            if (typeof globalItem === 'object' && globalItem.image) {
                return globalItem.image;
            }
            if (typeof globalItem === 'string' && (globalItem.startsWith('/') || globalItem.startsWith('http'))) {
                return globalItem;
            }
        }
        
        return fallback;
    }, [getContent, globalContent]);

    // Initialize content on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                // Load global content first
                await fetchGlobalContent();
                // Load home page content by default
                await loadContent('home');
                setIsInitialized(true);
            } catch (err) {
                console.error('Failed to initialize content:', err);
            }
        };

        if (!isInitialized) {
            initialize();
        }
    }, [loadContent, isInitialized, fetchGlobalContent]);

    // Refetch content when language changes
    useEffect(() => {
        if (isInitialized) {
            fetchGlobalContent();
        }
    }, [language, isInitialized, fetchGlobalContent]);

    const contextValue = {
        content,
        globalContent,
        loading,
        error,
        language,
        isInitialized,
        loadContent,
        getContent,
        getText,
        getImage,
        getContentValue: getText, // Add alias for getContentValue
        changeLanguage,
        contentManager,
        fetchGlobalContent
    };

    return (
        <ContentContext.Provider value={contextValue}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (!context) {
        console.warn('useContent must be used within a ContentProvider, returning default values');
        return defaultContextValue;
    }
    return context;
}

export default ContentContext;