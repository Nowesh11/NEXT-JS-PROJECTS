import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const ModernLayout = ({ children, title, description, showHero = false, heroContent = null }) => {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'About', href: '/about', icon: '📖' },
    { label: 'Books', href: '/books', icon: '📚' },
    { label: 'E-Books', href: '/ebooks', icon: '💻' },
    { label: 'Projects', href: '/projects', icon: '🚀' },
    { label: 'Contact', href: '/contact', icon: '📞' }
  ];

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <div className="modern-layout">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className={`modern-nav ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="nav-container">
          {/* Logo */}
          <motion.div 
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-text">TLS</span>
            <span className="logo-subtitle">Tamil Language Society</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop-menu">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="nav-actions">
            <motion.button
              className="theme-toggle"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>

            <motion.button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-item ${router.pathname === item.href ? 'active' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      {showHero && (
        <motion.section 
          className="modern-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-content">
            {heroContent || (
              <>
                <motion.h1 
                  className="hero-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {title || 'Tamil Language Society'}
                </motion.h1>
                <motion.p 
                  className="hero-description"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {description || 'Preserving and promoting Tamil language and culture'}
                </motion.p>
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <motion.main 
        className="modern-main"
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <motion.footer 
        className="modern-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="footer-content">
          <div className="footer-section">
            <h3>Tamil Language Society</h3>
            <p>Dedicated to preserving and promoting Tamil language and culture for future generations.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              {navItems.slice(0, 4).map(item => (
                <a key={item.href} href={item.href} className="footer-link">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-info">
              <p>📧 info@tamillanguagesociety.org</p>
              <p>📞 +91 44 1234 5678</p>
              <p>📍 Chennai, Tamil Nadu, India</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Tamil Language Society. All rights reserved.</p>
        </div>
      </motion.footer>

      <style jsx>{`
        .modern-layout {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background */
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.7;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: var(--color-primary-from, #667eea);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          background: var(--color-secondary-from, #764ba2);
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: var(--color-primary-to, #f093fb);
          bottom: 20%;
          left: 50%;
          animation-delay: 4s;
        }

        .mesh-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        /* Navigation */
        .modern-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .modern-nav.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          color: var(--text-secondary, #666);
          font-weight: 500;
        }

        .desktop-menu {
          display: flex;
          gap: 2rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          text-decoration: none;
          color: var(--text-primary, #333);
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .nav-item.active {
          background: var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
          color: white;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          width: 20px;
          height: 15px;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          height: 2px;
          width: 100%;
          background: var(--text-primary, #333);
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .mobile-menu {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          text-decoration: none;
          color: var(--text-primary, #333);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          background: rgba(102, 126, 234, 0.1);
          color: var(--color-primary-solid, #667eea);
        }

        /* Hero Section */
        .modern-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 2rem;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          z-index: 1;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary, #666);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Main Content */
        .modern-main {
          min-height: 100vh;
          padding: 2rem 0;
          position: relative;
          z-index: 1;
        }

        /* Footer */
        .modern-footer {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          color: white;
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 1rem;
          color: var(--color-primary-solid, #667eea);
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: var(--color-primary-solid, #667eea);
        }

        .contact-info p {
          margin: 0.5rem 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 2rem auto 0;
          padding: 1rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .nav-container {
            padding: 1rem;
          }

          .hero-content {
            padding: 0 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        /* Dark theme adjustments */
        [data-theme="dark"] .modern-nav {
          background: rgba(0, 0, 0, 0.1);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        [data-theme="dark"] .modern-nav.scrolled {
          background: rgba(0, 0, 0, 0.95);
        }

        [data-theme="dark"] .nav-item {
          color: var(--text-primary, #fff);
        }

        [data-theme="dark"] .mobile-menu {
          background: rgba(0, 0, 0, 0.95);
        }

        [data-theme="dark"] .hamburger span {
          background: var(--text-primary, #fff);
        }
      `}</style>
    </div>
  );
};

export default ModernLayout;