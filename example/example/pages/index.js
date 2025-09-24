import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Navigation from '../components/Navigation';
import AnnouncementsSection from '../components/AnnouncementsSection';
import Features from '../components/Features';
import Statistics from '../components/Statistics';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { useContent } from '../contexts/ContentContext';
import { useSlideshow, useStatistics, useActivePoster } from '../hooks/useApi';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  
  // Content and API hooks
  const { getContent, changeLanguage } = useContent();
  const { data: slideshowData } = useSlideshow();
  const { data: statisticsData } = useStatistics();
  const { data: posterData } = useActivePoster();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Set loading to false after initialization
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Trigger content refresh for new language
    if (typeof window !== 'undefined' && window.contentManager) {
      window.contentManager.refreshContentForLanguage();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Tamil Language Society...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tamil Language Society - Preserving Tamil Heritage</title>
        <meta name="description" content="Tamil Language Society - Dedicated to preserving and promoting Tamil language, literature, and culture through education, research, and community engagement." />
        <meta name="keywords" content="Tamil, Language, Society, Culture, Literature, Education, Heritage, Community" />
        <meta name="author" content="Tamil Language Society" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1e3a8a" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Tamil Language Society - Preserving Tamil Heritage" />
        <meta property="og:description" content="Dedicated to preserving and promoting Tamil language, literature, and culture through education, research, and community engagement." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tamillanguagesociety.org" />
        <meta property="og:image" content="/images/og-image.jpg" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tamil Language Society" />
        <meta name="twitter:description" content="Preserving Tamil Heritage through Education and Community" />
        <meta name="twitter:image" content="/images/twitter-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      {/* Theme Toggle Button */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Navigation */}
      <Navigation 
        theme={theme} 
        language={language} 
        onThemeToggle={toggleTheme}
        onLanguageToggle={toggleLanguage}
      />

      {/* Main Content */}
      <main>
          {/* Announcements Section */}
          <AnnouncementsSection />
          
          {/* Features Section */}
          <Features />
          
          {/* Statistics Section */}
          <Statistics />
        </main>

      {/* Footer */}
      <Footer />

      {/* Scripts */}
      <Script 
        src="/js/api-integration.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('API Integration loaded');
        }}
      />
      
      <Script 
        src="/js/content-manager.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Content Manager loaded');
          // Initialize content manager
          if (typeof window !== 'undefined' && window.ContentManager) {
            window.contentManager = new window.ContentManager();
            window.contentManager.initialize();
          }
        }}
      />
      
      <Script 
        src="/js/language-manager.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Language Manager loaded');
        }}
      />
      
      <Script 
        src="/js/cache-buster.js" 
        strategy="afterInteractive"
      />
      
      <Script 
        src="/js/auth.js" 
        strategy="afterInteractive"
      />
      
      <Script 
        src="/js/chat-widget.js" 
        strategy="afterInteractive"
      />

      <style jsx global>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--color-bg, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border-light, #e5e7eb);
          border-top: 4px solid var(--color-primary, #1e3a8a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-screen p {
          color: var(--text-primary, #1e3a8a);
          font-size: 1.125rem;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}