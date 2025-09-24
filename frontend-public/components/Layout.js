import React, { useState, useEffect, useRef, useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ContentContext } from '../contexts/ContentContext';
import Footer from './Footer';

const Layout = ({ 
  children, 
  title = 'Tamil Learning Society', 
  description = 'Preserving and promoting Tamil language, culture, and heritage through education and community engagement' 
}) => {
  const router = useRouter();
  
  // Safe context usage with proper error handling
  let languageContext, themeContext, contentContext;
  
  try {
    languageContext = useContext(LanguageContext);
    themeContext = useContext(ThemeContext);
    contentContext = useContext(ContentContext);
  } catch (error) {
    console.warn('Context not available during SSR:', error);
  }
  
  // Provide fallback values if contexts are not available (SSR)
  const language = languageContext?.language || 'en';
  const toggleLanguage = languageContext?.toggleLanguage || (() => {});
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const content = contentContext?.content || {};
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navContent, setNavContent] = useState(null);
  const mobileMenuRef = useRef(null);

  // Get content text
  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  // Fetch navigation content from API
  useEffect(() => {
    const fetchNavContent = async () => {
      try {
        const response = await fetch(`/api/website-content/global?language=${language}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setNavContent(data.data);
        }
      } catch (err) {
        console.error('Error fetching navigation content:', err);
      }
    };

    fetchNavContent();
  }, [language]);

  useEffect(() => {
    // Close mobile menu on route change
    const handleRouteChange = () => setIsMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    
    // Handle scroll for navbar styling
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Handle click outside mobile menu
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    // Handle escape key for mobile menu
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [router]);

  const navLinks = [
    { 
      href: '/', 
      label: getText('nav_home', 'Home'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      href: '/about', 
      label: getText('nav_about', 'About'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <h d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      href: '/projects', 
      label: getText('nav_projects', 'Projects'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      href: '/contact', 
      label: getText('nav_contact', 'Contact'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tamil Learning Society" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="layout" data-theme={theme}>
        {/* Theme Toggle Button */}
        <motion.div 
          className="theme-toggle"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <motion.button 
            onClick={toggleTheme}
            className="theme-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Navigation Bar */}
        <motion.nav 
          className={`navbar ${isScrolled ? 'scrolled' : ''}`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="nav-container">
            <div className="nav-content">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Link href="/" className="nav-logo">
                  <div className="logo-container">
                    <div className="logo-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="logo-text">
                      <span className="brand-name">
                        {getText('site_name', 'Tamil Learning Society')}
                      </span>
                      <span className="brand-tagline">
                        {getText('site_tagline', 'Preserving Heritage')}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="desktop-nav">
                <div className="nav-links">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      <Link 
                        href={link.href} 
                        className={`nav-link ${router.pathname === link.href ? 'active' : ''}`}
                      >
                        <span className="nav-icon">{link.icon}</span>
                        <span className="nav-text">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                {/* Notification Bell */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Link href="/notifications" className="notification-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {notifications.length > 0 && (
                      <span className="notification-badge">
                        {notifications.length}
                      </span>
                    )}
                  </Link>
                </motion.div>
                
                {/* Language Toggle */}
                <motion.div 
                  className="language-toggle"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <div className="language-switcher">
                    <button 
                      className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                      onClick={() => language !== 'en' && toggleLanguage()}
                      disabled={language === 'en'}
                    >
                      EN
                    </button>
                    <button 
                      className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
                      onClick={() => language !== 'ta' && toggleLanguage()}
                      disabled={language === 'ta'}
                    >
                      தமிழ்
                    </button>
                  </div>
                </motion.div>
              </div>
              
              {/* Mobile Menu Button */}
              <motion.button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="hamburger">
                  <span className={`line ${isMenuOpen ? 'rotate-45' : ''}`}></span>
                  <span className={`line ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`line ${isMenuOpen ? '-rotate-45' : ''}`}></span>
                </div>
              </motion.button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                ref={mobileMenuRef}
                className="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mobile-menu-content">
                  <div className="mobile-nav-links">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link 
                          href={link.href} 
                          className={`mobile-nav-link ${router.pathname === link.href ? 'active' : ''}`}
                        >
                          <span className="nav-icon">{link.icon}</span>
                          <span className="nav-text">{link.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="mobile-language-toggle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="language-switcher">
                      <button 
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => language !== 'en' && toggleLanguage()}
                        disabled={language === 'en'}
                      >
                        English
                      </button>
                      <button 
                        className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
                        onClick={() => language !== 'ta' && toggleLanguage()}
                        disabled={language === 'ta'}
                      >
                        தமிழ்
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Background Elements */}
        <div className="layout-background">
          <div className="bg-gradient bg-gradient-1"></div>
          <div className="bg-gradient bg-gradient-2"></div>
          <div className="bg-gradient bg-gradient-3"></div>
        </div>
      </div>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .theme-toggle {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1000;
        }

        .theme-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
        }

        .theme-btn:hover {
          background: var(--gradient-button);
          color: white;
          border-color: transparent;
          box-shadow: var(--shadow-lg);
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.3s ease;
          background: transparent;
        }

        .navbar.scrolled {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          box-shadow: var(--shadow-sm);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .nav-logo {
          text-decoration: none;
          color: inherit;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--primary-500);
          background: var(--bg-glass);
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: var(--primary-500);
          background: var(--primary-100);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          white-space: nowrap;
        }

        .notification-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .notification-btn:hover {
          background: var(--primary-100);
          color: var(--primary-500);
          transform: translateY(-2px);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--error-500);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .language-toggle {
          display: flex;
          align-items: center;
        }

        .language-switcher {
          display: flex;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .lang-btn {
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-btn:hover:not(:disabled) {
          color: var(--primary-500);
        }

        .lang-btn.active {
          background: var(--gradient-button);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .lang-btn:disabled {
          cursor: not-allowed;
        }

        .mobile-menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          border: none;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .line {
          width: 20px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .line.rotate-45 {
          transform: rotate(45deg) translateY(6px);
        }

        .line.-rotate-45 {
          transform: rotate(-45deg) translateY(-6px);
        }

        .line.opacity-0 {
          opacity: 0;
        }

        .mobile-menu {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-primary);
          overflow: hidden;
        }

        .mobile-menu-content {
          padding: 2rem;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .mobile-nav-link:hover {
          color: var(--primary-500);
          background: var(--bg-glass);
        }

        .mobile-nav-link.active {
          color: var(--primary-500);
          background: var(--primary-100);
        }

        .mobile-language-toggle {
          display: flex;
          justify-content: center;
        }

        .mobile-language-toggle .language-switcher {
          width: 100%;
          max-width: 300px;
        }

        .mobile-language-toggle .lang-btn {
          flex: 1;
          padding: 0.75rem;
        }

        .main-content {
          flex: 1;
          padding-top: 80px;
          position: relative;
          z-index: 2;
        }

        .layout-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .bg-gradient {
          position: absolute;
          border-radius: 50%;
          opacity: 0.02;
          animation: float 20s ease-in-out infinite;
        }

        .bg-gradient-1 {
          top: 10%;
          left: 5%;
          width: 400px;
          height: 400px;
          background: var(--gradient-primary);
          animation-delay: 0s;
        }

        .bg-gradient-2 {
          bottom: 20%;
          right: 10%;
          width: 300px;
          height: 300px;
          background: var(--gradient-secondary);
          animation-delay: 7s;
        }

        .bg-gradient-3 {
          top: 50%;
          right: 5%;
          width: 250px;
          height: 250px;
          background: var(--gradient-accent);
          animation-delay: 14s;
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }

          .theme-toggle {
            top: 1rem;
            right: 1rem;
          }

          .theme-btn {
            width: 44px;
            height: 44px;
          }

          .brand-name {
            font-size: 1.125rem;
          }

          .brand-tagline {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            display: none;
          }

          .mobile-menu-content {
            padding: 1.5rem 1rem;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-30px) rotate(120deg); 
          }
          66% { 
            transform: translateY(15px) rotate(240deg); 
          }
        }
      `}</style>
    </>
  );
};

export default Layout;