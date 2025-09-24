import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children, title = 'Tamil Language Society', description = 'Preserving and promoting Tamil language and culture through modern digital initiatives' }) => {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef(null);

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
    { href: '/', key: 'global.menu.home', label: 'Home' },
    { href: '/about', key: 'global.menu.about', label: 'About Us' },
    { href: '/projects', key: 'global.menu.projects', label: 'Projects' },
    { href: '/ebooks', key: 'global.menu.ebooks', label: 'Ebooks' },
    { href: '/books', key: 'global.menu.bookstore', label: 'Book Store' },
    { href: '/contact', key: 'global.menu.contact', label: 'Contact Us' }
  ];

  return (
    <>
      <Head>
        <title>{`${title}`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#d32f2f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tamil Language Society" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className={`min-h-screen flex flex-col ${theme}`} data-theme={theme}>
        {/* Theme Toggle Button */}
        <div className="fixed top-6 right-6 z-50">
          <button 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="btn btn-secondary rounded-full w-12 h-12 p-0 shadow-lg hover:scale-110 transition-transform"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`} aria-hidden="true"></i>
          </button>
        </div>

        {/* Navigation Bar */}
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-surface-primary/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`} role="navigation" aria-label="Main navigation">
          <div className="container">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-3 text-decoration-none group">
                <img 
                  src="/assets/logo.png" 
                  alt="Tamil Language Society Logo" 
                  className="w-10 h-10 rounded-lg object-cover transition-transform group-hover:scale-110" 
                />
                <span className="font-bold text-xl text-primary font-tamil">
                  {t('global.logo.text', 'Tamil Language Society')}
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="nav flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`nav-link px-4 py-2 rounded-lg transition-all ${
                        router.pathname === link.href 
                          ? 'active bg-surface-secondary text-primary' 
                          : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      {t(link.key, link.label)}
                    </Link>
                  ))}
                </div>
                
                {/* Notification Bell */}
                <Link 
                  href="/notifications" 
                  className="relative p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                  aria-label={`Notifications ${notifications.length > 0 ? `(${notifications.length} new)` : ''}`}
                >
                  <i className="fas fa-bell text-lg" aria-hidden="true"></i>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {notifications.length}
                    </span>
                  )}
                </Link>
                
                {/* Auth Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <Link href="/login" className="btn btn-ghost btn-sm">
                    {t('global.menu.login', 'Login')}
                  </Link>
                  
                  <Link href="/signup" className="btn btn-primary btn-sm">
                    {t('global.menu.signup', 'Sign Up')}
                  </Link>
                </div>
                
                {/* Language Toggle */}
                <div className="flex bg-surface-secondary rounded-full p-1 ml-4">
                  <button 
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === 'en' 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-secondary hover:text-primary'
                    }`}
                    onClick={() => language !== 'en' && toggleLanguage()}
                    aria-label="Switch to English"
                    disabled={language === 'en'}
                  >
                    EN
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === 'ta' 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-secondary hover:text-primary'
                    }`}
                    onClick={() => language !== 'ta' && toggleLanguage()}
                    aria-label="Switch to Tamil"
                    disabled={language === 'ta'}
                  >
                    TA
                  </button>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className={`lg:hidden absolute top-full left-0 right-0 bg-surface-primary/95 backdrop-blur-md border-t border-border-light transition-all duration-300 ${
              isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="container py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`nav-link px-4 py-3 rounded-lg transition-all ${
                      router.pathname === link.href 
                        ? 'active bg-surface-secondary text-primary' 
                        : 'text-secondary hover:text-primary hover:bg-surface-secondary'
                    }`}
                  >
                    {t(link.key, link.label)}
                  </Link>
                ))}
                
                <div className="flex items-center gap-4 px-4 py-2">
                  <Link href="/login" className="btn btn-ghost btn-sm flex-1">
                    {t('global.menu.login', 'Login')}
                  </Link>
                  
                  <Link href="/signup" className="btn btn-primary btn-sm flex-1">
                    {t('global.menu.signup', 'Sign Up')}
                  </Link>
                </div>
                
                <div className="flex justify-center">
                  <div className="flex bg-surface-secondary rounded-full p-1">
                    <button 
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        language === 'en' 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-secondary hover:text-primary'
                      }`}
                      onClick={() => language !== 'en' && toggleLanguage()}
                      aria-label="Switch to English"
                      disabled={language === 'en'}
                    >
                      English
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        language === 'ta' 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-secondary hover:text-primary'
                      }`}
                      onClick={() => language !== 'ta' && toggleLanguage()}
                      aria-label="Switch to Tamil"
                      disabled={language === 'ta'}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main id="main-content" className="flex-1 pt-20" role="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-surface-secondary mt-auto" role="contentinfo">
          <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  {t('footer.about.title', 'About TLS')}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {t('footer.about.description', 'Tamil Language Society is dedicated to preserving and promoting Tamil language and culture through modern digital initiatives.')}
                </p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110"
                    aria-label="Follow us on Facebook"
                  >
                    <i className="fab fa-facebook" aria-hidden="true"></i>
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110"
                    aria-label="Follow us on Twitter"
                  >
                    <i className="fab fa-twitter" aria-hidden="true"></i>
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                    <i className="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110"
                    aria-label="Subscribe to our YouTube channel"
                  >
                    <i className="fab fa-youtube" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  {t('footer.links.title', 'Quick Links')}
                </h3>
                <nav className="flex flex-col gap-2" aria-label="Footer navigation">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      className="text-secondary hover:text-primary transition-colors py-1"
                    >
                      {t(link.key, link.label)}
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  {t('footer.contact.title', 'Contact Info')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-secondary">
                    <i className="fas fa-envelope w-5" aria-hidden="true"></i>
                    <a 
                      href="mailto:info@tamilsociety.org" 
                      className="hover:text-primary transition-colors"
                    >
                      info@tamilsociety.org
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-secondary">
                    <i className="fas fa-phone w-5" aria-hidden="true"></i>
                    <a 
                      href="tel:+15551234567" 
                      className="hover:text-primary transition-colors"
                    >
                      +1 (555) 123-4567
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-secondary">
                    <i className="fas fa-map-marker-alt w-5" aria-hidden="true"></i>
                    <span>Tamil Cultural Center, Toronto, ON</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Bottom */}
            <div className="border-t border-border-light mt-8 pt-8 text-center">
              <p className="text-secondary text-sm">
                &copy; 2024 Tamil Language Society. {t('footer.rights', 'All rights reserved.')} | 
                <Link href="/privacy" className="hover:text-primary transition-colors ml-1">
                  {t('footer.privacy', 'Privacy Policy')}
                </Link> | 
                <Link href="/terms" className="hover:text-primary transition-colors ml-1">
                  {t('footer.terms', 'Terms of Service')}
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>


    </>
  );
};

export default Layout;