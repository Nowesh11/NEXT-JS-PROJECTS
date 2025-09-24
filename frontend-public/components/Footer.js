import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ContentContext } from '../contexts/ContentContext';

const Footer = () => {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);
  const contentContext = useContext(ContentContext);
  
  // Provide fallback values if contexts are not available (SSR)
  const language = languageContext?.language || 'en';
  const theme = themeContext?.theme || 'light';
  const content = contentContext?.content || {};
  
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [footerContent, setFooterContent] = useState(null);

  // Get content text
  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  // Fetch footer content from API
  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        const response = await fetch(`/api/website-content/global?language=${language}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setFooterContent(data.data);
        }
      } catch (err) {
        console.error('Error fetching footer content:', err);
      }
    };

    fetchFooterContent();
  }, [language]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubscribing(true);
    setSubscriptionStatus(null);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          language 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubscriptionStatus('success');
        setEmail('');
      } else {
        setSubscriptionStatus('error');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscriptionStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: footerContent?.social_links?.facebook || '#'
    },
    {
      name: 'Twitter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: footerContent?.social_links?.twitter || '#'
    },
    {
      name: 'Instagram',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: footerContent?.social_links?.instagram || '#'
    },
    {
      name: 'YouTube',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      url: footerContent?.social_links?.youtube || '#'
    }
  ];

  const quickLinks = [
    { 
      name: getText('nav_home', 'Home'), 
      href: '/' 
    },
    { 
      name: getText('nav_about', 'About'), 
      href: '/about' 
    },
    { 
      name: getText('nav_projects', 'Projects'), 
      href: '/projects' 
    },
    { 
      name: getText('nav_contact', 'Contact'), 
      href: '/contact' 
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <motion.div 
            className="footer-brand"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="brand-logo">
              <h3 className="brand-name">
                {getText('site_name', 'Tamil Learning Society')}
              </h3>
            </div>
            <p className="brand-description">
              {getText('footer_description', 'Preserving and promoting Tamil language, culture, and heritage through education and community engagement.')}
            </p>
            
            {/* Social Links */}
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="section-title">
              {getText('footer_quick_links', 'Quick Links')}
            </h4>
            <ul className="link-list">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="section-title">
              {getText('footer_contact', 'Contact Info')}
            </h4>
            <div className="contact-info">
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{footerContent?.contact?.address?.[language] || footerContent?.contact?.address?.en || getText('footer_address', 'Tamil Nadu, India')}</span>
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{footerContent?.contact?.email || getText('footer_email', 'info@tamillearningsociety.org')}</span>
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 2.08 5.44 4.04 6 5.92C6.12 6.32 6 6.76 5.72 7.04L4.24 8.52C5.68 11.36 8.64 14.32 11.48 15.76L12.96 14.28C13.24 14 13.68 13.88 14.08 14C15.96 14.56 17.92 14.84 19.92 14.84C20.52 14.84 21 15.32 21 15.92V18.92H22Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{footerContent?.contact?.phone || getText('footer_phone', '+91 98765 43210')}</span>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            className="footer-section newsletter-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="section-title">
              {getText('footer_newsletter', 'Newsletter')}
            </h4>
            <p className="newsletter-description">
              {getText('footer_newsletter_description', 'Stay updated with our latest news and events')}
            </p>
            
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getText('footer_email_placeholder', 'Enter your email')}
                  className="email-input"
                  required
                />
                <motion.button
                  type="submit"
                  disabled={isSubscribing}
                  className="subscribe-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubscribing ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor"/>
                    </svg>
                  )}
                </motion.button>
              </div>
              
              {subscriptionStatus && (
                <motion.div 
                  className={`status-message ${subscriptionStatus}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {subscriptionStatus === 'success' 
                    ? getText('subscription_success', 'Successfully subscribed!')
                    : getText('subscription_error', 'Something went wrong. Please try again.')
                  }
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} {getText('site_name', 'Tamil Learning Society')}. {getText('footer_rights', 'All rights reserved.')}
            </p>
            <div className="footer-bottom-links">
              <a href="/privacy" className="footer-link">
                {getText('footer_privacy', 'Privacy Policy')}
              </a>
              <a href="/terms" className="footer-link">
                {getText('footer_terms', 'Terms of Service')}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="footer-background">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="bg-element bg-element-3"></div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--bg-surface-elevated);
          border-top: 1px solid var(--border-primary);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
          position: relative;
          z-index: 2;
        }

        .footer-main {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          max-width: 350px;
        }

        .brand-logo {
          margin-bottom: 1.5rem;
        }

        .brand-name {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 800;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0;
        }

        .brand-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
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
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-link:hover {
          background: var(--gradient-button);
          color: white;
          border-color: transparent;
        }

        .footer-section {
          min-width: 200px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .link-list li {
          margin-bottom: 0.75rem;
        }

        .footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .footer-link:hover {
          color: var(--primary-500);
          transform: translateX(4px);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .contact-item svg {
          color: var(--primary-500);
          flex-shrink: 0;
        }

        .newsletter-section {
          max-width: 350px;
        }

        .newsletter-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
        }

        .email-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .email-input:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        .email-input::placeholder {
          color: var(--text-muted);
        }

        .subscribe-btn {
          padding: 0.875rem 1rem;
          background: var(--gradient-button);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 50px;
        }

        .subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .subscribe-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .status-message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-message.success {
          background: var(--success-100);
          color: var(--success-700);
          border: 1px solid var(--success-200);
        }

        .status-message.error {
          background: var(--error-100);
          color: var(--error-700);
          border: 1px solid var(--error-200);
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .copyright {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .footer-bottom-links {
          display: flex;
          gap: 2rem;
        }

        .footer-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .bg-element {
          position: absolute;
          border-radius: 50%;
          opacity: 0.03;
          animation: float 15s ease-in-out infinite;
        }

        .bg-element-1 {
          top: 20%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: var(--gradient-primary);
          animation-delay: 0s;
        }

        .bg-element-2 {
          bottom: 10%;
          right: 20%;
          width: 200px;
          height: 200px;
          background: var(--gradient-secondary);
          animation-delay: 5s;
        }

        .bg-element-3 {
          top: 60%;
          right: 10%;
          width: 150px;
          height: 150px;
          background: var(--gradient-accent);
          animation-delay: 10s;
        }

        @media (max-width: 768px) {
          .container {
            padding: 3rem 1rem 2rem;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-brand,
          .newsletter-section {
            max-width: none;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-bottom-links {
            justify-content: center;
          }

          .social-links {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .input-group {
            flex-direction: column;
          }

          .subscribe-btn {
            width: 100%;
          }

          .footer-bottom-links {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) rotate(180deg); 
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;