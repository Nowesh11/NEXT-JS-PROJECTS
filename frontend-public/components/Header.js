import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [navigationContent, setNavigationContent] = useState({});
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { data: session } = useSession();
  const { language, toggleLanguage, theme, toggleTheme } = useLanguage();

  // Fetch navigation content from database
  useEffect(() => {
    const fetchNavigationContent = async () => {
      try {
        const response = await fetch(`/api/website-content/global?language=${language}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform the data into a more usable format
          const navContent = {};
          data.data.forEach(item => {
            if (item.section === 'navigation') {
              navContent[item.sectionKey] = item.content;
            }
          });
          setNavigationContent(navContent);
        }
      } catch (error) {
        console.error('Error fetching navigation content:', error);
        // Fallback to hardcoded content if API fails
        setNavigationContent({
          'nav.home': { en: 'Home', ta: 'முகப்பு' },
          'nav.about': { en: 'About Us', ta: 'எங்களைப் பற்றி' },
          'nav.projects': { en: 'Projects', ta: 'திட்டங்கள்' },
          'nav.ebooks': { en: 'E-books', ta: 'மின்னூல்கள்' },
          'nav.books': { en: 'Book Store', ta: 'புத்தக கடை' },
          'nav.contact': { en: 'Contact Us', ta: 'தொடர்பு' },
          'nav.login': { en: 'Login', ta: 'உள்நுழைவு' },
          'nav.signup': { en: 'Sign Up', ta: 'பதிவு செய்க' },
          'nav.admin': { en: 'Admin', ta: 'நிர்வாகம்' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationContent();
  }, [language]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setShowUserMenu(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Get text from navigation content
  const getText = (key) => {
    if (loading) return key;
    const content = navigationContent[key];
    if (!content) return key;
    return content[language] || content.en || key;
  };

  const navigationItems = [
    { href: '/', label: getText('nav.home') },
    { href: '/about', label: getText('nav.about') },
    { href: '/projects', label: getText('nav.projects') },
    { href: '/ebooks', label: getText('nav.ebooks') },
    { href: '/books', label: getText('nav.books') },
    { href: '/contact', label: getText('nav.contact') }
  ];

  const authItems = [
    { href: '/login', label: getText('nav.login') },
    { href: '/signup', label: getText('nav.signup'), isButton: true },
    { href: 'http://localhost:3002/admin', label: getText('nav.admin'), isAdmin: true, external: true }
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Glassmorphic Header */}
      <header className={`header-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5' 
          : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/10 dark:border-slate-700/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo with Gradient */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 p-0.5 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-full h-full rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-red-500 dark:to-pink-500 bg-clip-text text-transparent">
                      T
                    </span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-red-500 dark:to-pink-500 bg-clip-text text-transparent">
                Trae AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    router.pathname === item.href
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-red-500/20 dark:to-pink-500/20 text-blue-600 dark:text-red-400 shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-red-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Auth Links */}
              <div className="flex items-center space-x-2">
                {authItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        item.isButton
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 dark:hover:shadow-red-500/25'
                          : item.isAdmin
                          ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        item.isButton
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 dark:hover:shadow-red-500/25'
                          : item.isAdmin
                          ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>

              {/* Language Toggle */}
              {toggleLanguage && (
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:scale-105 transition-all duration-300"
                  aria-label="Toggle Language"
                >
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'தமிழ்' : 'EN'}
                  </span>
                </button>
              )}

              {/* Animated Theme Toggle */}
              <button
                onClick={toggleTheme}
                disabled={isTransitioning}
                className={`relative p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:scale-105 transition-all duration-300 ${
                  isTransitioning ? 'animate-pulse' : ''
                }`}
                aria-label="Toggle Theme"
              >
                <div className="relative w-5 h-5">
                  {/* Sun Icon */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                      currentTheme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  
                  {/* Moon Icon */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                      currentTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300"
              aria-label="Toggle Menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleMenu} />
          
          {/* Mobile Menu Panel */}
          <div className={`absolute top-16 right-0 w-80 max-w-[90vw] h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-white/20 dark:border-slate-700/30 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-6 space-y-6">
              
              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                      router.pathname === item.href
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-red-500/20 dark:to-pink-500/20 text-blue-600 dark:text-red-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Links */}
              <div className="border-t border-white/20 dark:border-slate-700/30 pt-6 space-y-2">
                {authItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                        item.isButton
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 text-white text-center'
                          : item.isAdmin
                          ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                        item.isButton
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-red-500 dark:to-pink-500 text-white text-center'
                          : item.isAdmin
                          ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>

              {/* Mobile Controls */}
              <div className="border-t border-white/20 dark:border-slate-700/30 pt-6 space-y-3">
                {/* Language Toggle */}
                {toggleLanguage && (
                  <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300"
                  >
                    <span className="font-medium">Language</span>
                    <span className="text-sm font-bold">
                      {language === 'en' ? 'தமிழ்' : 'English'}
                    </span>
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  disabled={isTransitioning}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 ${
                    isTransitioning ? 'animate-pulse' : ''
                  }`}
                >
                  <span className="font-medium">Theme</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{currentTheme === 'light' ? 'Light' : 'Dark'}</span>
                    <div className="relative w-5 h-5">
                      <svg
                        className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                          currentTheme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                      
                      <svg
                        className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                          currentTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;