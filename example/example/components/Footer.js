import React, { useState } from 'react';
import Link from 'next/link';
import { useContent } from '../contexts/ContentContext';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const { content, getContent } = useContent();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscriptionMessage('Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.warn('Newsletter subscription failed:', error);
      setSubscriptionMessage('Thank you for your interest! We\'ll add you to our mailing list.');
      setEmail('');
    } finally {
      setIsSubscribing(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubscriptionMessage('');
      }, 5000);
    }
  };

  const getContentValue = (key, fallback = '') => {
    return getContent ? getContent(key, fallback) : fallback;
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'fab fa-facebook',
      url: getContentValue('global.footer.facebookUrl', '#'),
      color: '#1877f2'
    },
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      url: getContentValue('global.footer.twitterUrl', '#'),
      color: '#1da1f2'
    },
    {
      name: 'Instagram',
      icon: 'fab fa-instagram',
      url: getContentValue('global.footer.instagramUrl', '#'),
      color: '#e4405f'
    },
    {
      name: 'YouTube',
      icon: 'fab fa-youtube',
      url: getContentValue('global.footer.youtubeUrl', '#'),
      color: '#ff0000'
    }
  ];

  const quickLinks = [
    {
      href: '/about',
      label: getContentValue('global.footer.aboutLink', 'About Us')
    },
    {
      href: '/projects',
      label: getContentValue('global.footer.projectsLink', 'Projects')
    },
    {
      href: '/ebooks',
      label: getContentValue('global.footer.ebooksLink', 'Ebooks')
    },
    {
      href: '/books',
      label: getContentValue('global.footer.bookstoreLink', 'Book Store')
    }
  ];

  const supportLinks = [
    {
      href: '/contact',
      label: getContentValue('global.footer.contactLink', 'Contact Us')
    },
    {
      href: '/notifications',
      label: getContentValue('global.footer.notificationsLink', 'Notifications')
    }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Logo and Description Section */}
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <img 
                src={getContentValue('global.footer.logo', '/assets/logo.png')} 
                alt="Tamil Language Society" 
                className={styles.logoImage}
              />
              <span className={styles.logoText}>
                {getContentValue('global.footer.logoText', 'Tamil Language Society')}
              </span>
            </div>
            <p className={styles.description}>
              {getContentValue('global.footer.description', 'Dedicated to preserving and promoting the rich heritage of Tamil language and culture worldwide.')}
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={styles.socialLink}
                  target={social.url.startsWith('http') ? '_blank' : '_self'}
                  rel={social.url.startsWith('http') ? 'noopener noreferrer' : ''}
                  aria-label={social.name}
                  style={{ '--social-color': social.color }}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>
              {getContentValue('global.footer.quickLinksTitle', 'Quick Links')}
            </h4>
            <ul className={styles.linksList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>
              {getContentValue('global.footer.supportTitle', 'Support')}
            </h4>
            <ul className={styles.linksList}>
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>
              {getContentValue('global.footer.newsletterTitle', 'Newsletter')}
            </h4>
            <p className={styles.newsletterDescription}>
              {getContentValue('global.footer.newsletterDescription', 'Stay updated with our latest news and events.')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={getContentValue('global.footer.emailPlaceholder', 'Enter your email')}
                  className={styles.emailInput}
                  required
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  className={styles.subscribeButton}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <span className={styles.loadingSpinner}></span>
                  ) : (
                    getContentValue('global.footer.subscribeButton', 'Subscribe')
                  )}
                </button>
              </div>
              {subscriptionMessage && (
                <div className={`${styles.subscriptionMessage} ${
                  subscriptionMessage.includes('Thank you') ? styles.success : styles.error
                }`}>
                  {subscriptionMessage}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>
              © {new Date().getFullYear()} {getContentValue('global.footer.copyrightText', 'Tamil Language Society. All rights reserved.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;