import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navigation.module.css';

const Navigation = ({ theme, toggleTheme, language, toggleLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for notifications
  useEffect(() => {
    // This would typically check with your API
    // For now, we'll simulate checking for notifications
    const checkNotifications = async () => {
      try {
        // Simulate API call
        // const response = await fetch('/api/notifications/unread');
        // const data = await response.json();
        // setHasNotifications(data.hasUnread);
        
        // For demo purposes, randomly show notifications
        setHasNotifications(Math.random() > 0.7);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActivePage = (path) => {
    return router.pathname === path;
  };

  const navigationItems = [
    { href: '/', label: language === 'en' ? 'Home' : 'முகப்பு', key: 'global.menu.home' },
    { href: '/about', label: language === 'en' ? 'About Us' : 'எங்களைப் பற்றி', key: 'global.menu.about' },
    { href: '/projects', label: language === 'en' ? 'Projects' : 'திட்டங்கள்', key: 'global.menu.projects' },
    { href: '/ebooks', label: language === 'en' ? 'Ebooks' : 'மின்னூல்கள்', key: 'global.menu.ebooks' },
    { href: '/books', label: language === 'en' ? 'Book Store' : 'புத்தக கடை', key: 'global.menu.bookstore' },
    { href: '/contact', label: language === 'en' ? 'Contact Us' : 'தொடர்பு', key: 'global.menu.contact' }
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.navLogo} onClick={closeMenu}>
          <img 
            src="/assets/logo.png" 
            alt={language === 'en' ? 'Tamil Language Society' : 'தமிழ் மொழி சங்கம்'} 
            className={styles.logoImg}
          />
          <span className={styles.logoText}>
            {language === 'en' ? 'Tamil Language Society' : 'தமிழ் மொழி சங்கம்'}
          </span>
        </Link>

        {/* Navigation Menu */}
        <div className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`} id="nav-menu">
          {/* Main Navigation Links */}
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActivePage(item.href) ? styles.active : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* Notification Bell */}
          <Link
            href="/notifications"
            className={`${styles.navLink} ${styles.notificationIcon}`}
            onClick={closeMenu}
            data-testid="notification-bell"
          >
            <i className="fas fa-bell"></i>
            {hasNotifications && (
              <span className={styles.notificationDot} id="notification-dot"></span>
            )}
          </Link>

          {/* Auth Links */}
          <Link
            href="/login"
            className={`${styles.navLink} ${styles.btnGlass}`}
            onClick={closeMenu}
          >
            {language === 'en' ? 'Login' : 'உள்நுழைய'}
          </Link>
          
          <Link
            href="/signup"
            className={`${styles.navLink} ${styles.signupBtn} ${styles.btnNeon}`}
            onClick={closeMenu}
          >
            {language === 'en' ? 'Sign Up' : 'பதிவு செய்க'}
          </Link>

          {/* Language Toggle */}
          <div className={styles.languageToggle} id="language-toggle">
            <button
              className={`${styles.langBtn} ${language === 'en' ? styles.active : ''} ${styles.btnNeon}`}
              onClick={() => toggleLanguage('en')}
              title="English"
            >
              EN
            </button>
            <button
              className={`${styles.langBtn} ${language === 'ta' ? styles.active : ''} ${styles.btnGlass}`}
              onClick={() => toggleLanguage('ta')}
              title="Tamil"
            >
              TA
            </button>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <div className={styles.themeToggle}>
          <button
            onClick={toggleTheme}
            title={language === 'en' ? 'Toggle Theme' : 'தீம் மாற்று'}
            aria-label={language === 'en' ? 'Toggle between light and dark theme' : 'வெளிச்சம் மற்றும் இருள் தீம் இடையே மாற்று'}
            className={`${styles.btnNeon} ${styles.themeBtn}`}
          >
            <i id="theme-icon" className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div
          className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
          id="hamburger"
          onClick={toggleMenu}
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;