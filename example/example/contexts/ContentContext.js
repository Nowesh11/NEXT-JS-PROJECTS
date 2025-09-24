import React, { createContext, useContext, useEffect, useState } from 'react';
import { useContentManager } from '../lib/contentManager';

const ContentContext = createContext();

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

    // Initialize content on mount
    useEffect(() => {
        const initialize = async () => {
            try {
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
    }, [loadContent, isInitialized]);

    const contextValue = {
        content,
        loading,
        error,
        language,
        isInitialized,
        loadContent,
        getContent,
        changeLanguage,
        contentManager
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
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
}

export default ContentContext;