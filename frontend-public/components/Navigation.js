import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaInfoCircle, FaCalendarAlt, FaNewspaper, FaImages, FaEnvelope } from 'react-icons/fa';
import { ContentContext } from '../contexts/ContentContext';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import styles from '../styles/Navigation.module.css';

const Navigation = ({ theme, toggleTheme, language, toggleLanguage }) => {
  const { data: session } = useSession();
  const contentContext = useContext(ContentContext);
  const router = useRouter();
  
  // Provide fallback values if context is not available (SSR)
  const getContentValue = contentContext?.getContentValue || ((key, fallback) => fallback || key);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: getContentValue('nav.home', 'Home'), href: '/', icon: FaHome },
    { name: getContentValue('nav.about', 'About'), href: '/about', icon: FaInfoCircle },
    { name: getContentValue('nav.events', 'Events'), href: '/events', icon: FaCalendarAlt },
    { name: getContentValue('nav.news', 'News'), href: '/news', icon: FaNewspaper },
    { name: getContentValue('nav.gallery', 'Gallery'), href: '/gallery', icon: FaImages },
    { name: getContentValue('nav.contact', 'Contact'), href: '/contact', icon: FaEnvelope },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <motion.nav
      className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <motion.div
            className={styles.logoContent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className={styles.logoText}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {getContentValue('nav.logo', 'TLS')}
            </motion.span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navLinks.map((link, index) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''}`}
                >
                  <motion.div
                    className={styles.linkContent}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <link.icon className={styles.linkIcon} />
                    <span>{link.name}</span>
                  </motion.div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Notifications */}
          <motion.button
            className={styles.notificationBtn}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaBell />
            {notificationCount > 0 && (
              <motion.span
                className={styles.notificationBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>

          {/* Theme Toggle */}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Language Toggle */}
          <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

          {/* Authentication */}
          {session ? (
            <div className={styles.userMenu}>
              <motion.button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUser />
                <span className={styles.userName}>{session.user?.name || 'User'}</span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className={styles.userDropdown}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/profile" className={styles.dropdownItem}>
                      <FaUser />
                      <span>{getContentValue('nav.profile', 'Profile')}</span>
                    </Link>
                    <button onClick={handleSignOut} className={styles.dropdownItem}>
                      <FaSignOutAlt />
                      <span>{getContentValue('nav.signOut', 'Sign Out')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/auth/signin" className={styles.signInBtn}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getContentValue('nav.signIn', 'Sign In')}
                </motion.span>
              </Link>
              <Link href="/auth/signup" className={styles.signUpBtn}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getContentValue('nav.signUp', 'Sign Up')}
                </motion.span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.mobileMenuContent}>
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`${styles.mobileNavLink} ${router.pathname === link.href ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className={styles.mobileNavIcon} />
                    <span>{link.name}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth Buttons */}
              <div className={styles.mobileAuthSection}>
                {session ? (
                  <motion.button
                    onClick={handleSignOut}
                    className={styles.mobileSignOutBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaSignOutAlt />
                    <span>{getContentValue('nav.signOut', 'Sign Out')}</span>
                  </motion.button>
                ) : (
                  <div className={styles.mobileAuthButtons}>
                    <Link href="/auth/signin" className={styles.mobileSignInBtn}>
                      {getContentValue('nav.signIn', 'Sign In')}
                    </Link>
                    <Link href="/auth/signup" className={styles.mobileSignUpBtn}>
                      {getContentValue('nav.signUp', 'Sign Up')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;