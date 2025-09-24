import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AnnouncementPopup from '../components/AnnouncementPopup';

export default function Notifications() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [preferences, setPreferences] = useState({
    'email-announcements': true,
    'email-new-content': true,
    'email-weekly': false,
    'push-breaking': true,
    'push-new-content': true,
    'push-updates': false,
    language: 'bilingual'
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Translation object
  const translations = {
    en: {
      title: 'Notifications - Tamil Language Society',
      description: 'Stay updated with Tamil Language Society notifications and manage your preferences',
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      books: 'Books',
      contact: 'Contact',
      notifications: 'Notifications',
      heroTitle: 'Notifications',
      heroSubtitle: 'Stay updated with the latest news and announcements',
      total: 'Total',
      unread: 'Unread',
      markAllRead: 'Mark All Read',
      refresh: 'Refresh',
      all: 'All',
      info: 'Info',
      announcement: 'Announcements',
      noNotifications: 'No notifications found',
      allCaughtUp: "You're all caught up! Check back later for updates.",
      refreshNotifications: 'Refresh Notifications',
      notificationPreferences: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      emailDesc: 'Receive updates via email',
      pushNotifications: 'Push Notifications',
      pushDesc: 'Instant browser notifications',
      languagePreferences: 'Language Preferences',
      languageDesc: 'Choose notification language',
      importantAnnouncements: 'Important announcements',
      newContentNotifications: 'New content notifications',
      weeklyDigest: 'Weekly digest',
      breakingNews: 'Breaking news',
      newContentAlerts: 'New content alerts',
      generalUpdates: 'General updates',
      tamilEnglish: 'Tamil & English',
      tamilOnly: 'Tamil only',
      englishOnly: 'English only',
      savePreferences: 'Save Preferences',
      markAsRead: 'Mark as read',
      delete: 'Delete',
      justNow: 'Just now',
      minutesAgo: 'm ago',
      hoursAgo: 'h ago',
      daysAgo: 'd ago'
    },
    ta: {
      title: 'அறிவிப்புகள் - தமிழ் மொழி சங்கம்',
      description: 'தமிழ் மொழி சங்கத்தின் அறிவிப்புகள் மற்றும் புதுப்பிப்புகளுடன் புதுப்பித்த நிலையில் இருங்கள்',
      home: 'முகப்பு',
      about: 'எங்களைப் பற்றி',
      projects: 'திட்டங்கள்',
      books: 'புத்தகங்கள்',
      contact: 'தொடர்பு',
      notifications: 'அறிவிப்புகள்',
      heroTitle: 'அறிவிப்புகள்',
      heroSubtitle: 'சமீபத்திய செய்திகள் மற்றும் அறிவிப்புகளுடன் புதுப்பித்த நிலையில் இருங்கள்',
      total: 'மொத்தம்',
      unread: 'படிக்காதவை',
      markAllRead: 'அனைத்தையும் படித்ததாக குறிக்கவும்',
      refresh: 'புதுப்பிக்கவும்',
      all: 'அனைத்தும்',
      info: 'தகவல்',
      announcement: 'அறிவிப்புகள்',
      noNotifications: 'அறிவிப்புகள் எதுவும் இல்லை',
      allCaughtUp: 'நீங்கள் அனைத்தையும் பார்த்துவிட்டீர்கள்! புதுப்பிப்புகளுக்கு பின்னர் சரிபார்க்கவும்.',
      refreshNotifications: 'அறிவிப்புகளை புதுப்பிக்கவும்',
      notificationPreferences: 'அறிவிப்பு விருப்பத்தேர்வுகள்',
      emailNotifications: 'மின்னஞ்சல் அறிவிப்புகள்',
      emailDesc: 'மின்னஞ்சல் வழியாக புதுப்பிப்புகளைப் பெறுங்கள்',
      pushNotifications: 'உடனடி அறிவிப்புகள்',
      pushDesc: 'உடனடி உலாவி அறிவிப்புகள்',
      languagePreferences: 'மொழி விருப்பத்தேர்வுகள்',
      languageDesc: 'அறிவிப்பு மொழியைத் தேர்ந்தெடுக்கவும்',
      importantAnnouncements: 'முக்கியமான அறிவிப்புகள்',
      newContentNotifications: 'புதிய உள்ளடக்க அறிவிப்புகள்',
      weeklyDigest: 'வாராந்திர சுருக்கம்',
      breakingNews: 'அவசர செய்திகள்',
      newContentAlerts: 'புதிய உள்ளடக்க எச்சரிக்கைகள்',
      generalUpdates: 'பொதுவான புதுப்பிப்புகள்',
      tamilEnglish: 'தமிழ் மற்றும் ஆங்கிலம்',
      tamilOnly: 'தமிழ் மட்டும்',
      englishOnly: 'ஆங்கிலம் மட்டும்',
      savePreferences: 'விருப்பத்தேர்வுகளை சேமிக்கவும்',
      markAsRead: 'படித்ததாக குறிக்கவும்',
      delete: 'நீக்கவும்',
      justNow: 'இப்போதே',
      minutesAgo: 'நிமிடங்களுக்கு முன்',
      hoursAgo: 'மணிநேரங்களுக்கு முன்',
      daysAgo: 'நாட்களுக்கு முன்'
    }
  };

  useEffect(() => {
    // Initialize theme and language
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load notifications
    loadNotifications();
    
    // Load preferences
    const savedPreferences = JSON.parse(localStorage.getItem('notification_preferences') || '{}');
    setPreferences(prev => ({ ...prev, ...savedPreferences }));
  }, []);

  const loadNotifications = async () => {
    try {
      // Fetch announcements from API
      const announcementsResponse = await fetch('/api/announcements/public');
      let allNotifications = [];
      
      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        if (announcementsData.success && announcementsData.announcements) {
          // Convert announcements to notification format
          const announcementNotifications = announcementsData.announcements.map(announcement => ({
            id: `announcement_${announcement._id}`,
            type: 'announcement',
            title: announcement.title,
            message: announcement.description,
            timestamp: announcement.createdAt,
            read: false,
            priority: announcement.priority,
            cost: announcement.cost,
            tags: announcement.tags,
            content: announcement.content,
            scheduledFor: announcement.scheduledFor,
            isPinned: announcement.isPinned
          }));
          allNotifications = [...allNotifications, ...announcementNotifications];
        }
      }
      
      // Try to fetch other notifications from API
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        allNotifications = [...allNotifications, ...(data.notifications || [])];
      } else {
        // Fallback to localStorage or mock data for other notifications
        const savedNotifications = JSON.parse(localStorage.getItem('tamil_society_notifications') || '[]');
        if (savedNotifications.length === 0) {
          // Use mock data if no saved notifications
          const mockNotifications = [
            {
              id: 1,
              type: 'info',
              title: language === 'ta' ? 'TLS இல் வரவேற்கிறோம்' : 'Welcome to TLS',
              message: language === 'ta' ? 'தமிழ் மொழி சங்கத்தில் சேர்ந்ததற்கு நன்றி' : 'Thank you for joining Tamil Language Society',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: false
            },
            {
              id: 2,
              type: 'info',
              title: language === 'ta' ? 'கணினி பராமரிப்பு' : 'System Maintenance',
              message: language === 'ta' ? 'ஞாயிற்றுக்கிழமை காலை 2 - 4 மணி வரை திட்டமிட்ட பராமரிப்பு' : 'Scheduled maintenance on Sunday 2 AM - 4 AM',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              read: false
            }
          ];
          allNotifications = [...allNotifications, ...mockNotifications];
        } else {
          allNotifications = [...allNotifications, ...savedNotifications];
        }
      }
      
      // Sort notifications by timestamp (newest first)
      allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(allNotifications);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Use localStorage as fallback
      const savedNotifications = JSON.parse(localStorage.getItem('tamil_society_notifications') || '[]');
      setNotifications(savedNotifications);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const t = translations[language];

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('tamil_society_notifications', JSON.stringify(updatedNotifications));
    showNotification('Notification marked as read');
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('tamil_society_notifications', JSON.stringify(updatedNotifications));
    showNotification('All notifications marked as read');
  };

  const deleteNotification = (notificationId) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      localStorage.setItem('tamil_society_notifications', JSON.stringify(updatedNotifications));
      showNotification('Notification deleted');
    }
  };

  const refreshNotifications = () => {
    showNotification('Refreshing notifications...');
    setTimeout(() => {
      loadNotifications();
      showNotification('Notifications refreshed');
    }, 1000);
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
    showNotification('Notification preferences saved');
  };

  const getNotificationTypeConfig = (type) => {
    const configs = {
      info: { color: '#2563eb', icon: 'fas fa-info-circle' },
      announcement: { color: '#f59e0b', icon: 'fas fa-bullhorn' },
      success: { color: '#10b981', icon: 'fas fa-check-circle' },
      warning: { color: '#f97316', icon: 'fas fa-exclamation-triangle' },
      error: { color: '#ef4444', icon: 'fas fa-times-circle' }
    };
    return configs[type] || configs.info;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(n => {
    if (currentFilter === 'unread') return !n.read;
    if (currentFilter === 'all') return true;
    return n.type === currentFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="notifications-page">
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="nav-logo">
              <img src="/assets/logo.png" alt="Tamil Language Society" width="40" height="40" />
              <span>Tamil Language Society</span>
            </a>
            
            <div className="nav-menu">
              <a href="/" className="nav-link">{t.home}</a>
              <a href="/about" className="nav-link">{t.about}</a>
              <a href="/projects" className="nav-link">{t.projects}</a>
              <a href="/ebooks" className="nav-link">E-books</a>
              <a href="/books" className="nav-link">{t.books}</a>
              <a href="/contact" className="nav-link">{t.contact}</a>
            </div>

            <div className="nav-actions">
              <button className="theme-toggle" onClick={toggleLanguage} aria-label="Toggle language">
                <i className="fas fa-language"></i>
                <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
              </button>
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>
          </div>
        </section>

        {/* Notification Center */}
        <section className="features">
          <div className="container">
            {/* Notification Header */}
            <div className="notification-header">
              <div className="notification-stats">
                <div className="stat-item">
                  <div className="stat-number">{notifications.length}</div>
                  <div className="stat-label">{t.total}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number unread">{unreadCount}</div>
                  <div className="stat-label">{t.unread}</div>
                </div>
              </div>
              
              <div className="notification-actions">
                <button className="btn btn-secondary" onClick={markAllAsRead}>
                  <i className="fas fa-check-double"></i>
                  <span>{t.markAllRead}</span>
                </button>
                <button className="btn btn-primary" onClick={refreshNotifications}>
                  <i className="fas fa-sync-alt"></i>
                  <span>{t.refresh}</span>
                </button>
              </div>
            </div>

            {/* Notification Filters */}
            <div className="notification-filters">
              {['all', 'unread', 'info', 'announcement'].map(filter => (
                <button
                  key={filter}
                  className={`filter-btn ${currentFilter === filter ? 'active' : ''}`}
                  onClick={() => setCurrentFilter(filter)}
                >
                  {filter === 'info' && <i className="fas fa-info-circle"></i>}
                  {filter === 'announcement' && <i className="fas fa-bullhorn"></i>}
                  <span>{t[filter]}</span>
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
              {filteredNotifications.length > 0 ? (
                <div className="notifications-list">
                  {filteredNotifications.map((notification, index) => {
                    const typeConfig = getNotificationTypeConfig(notification.type);
                    const timeAgo = getTimeAgo(new Date(notification.timestamp));
                    
                    return (
                      <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                        <div className="notification-content">
                          <div className="notification-header-item">
                            <div className="notification-icon" style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}>
                              <i className={typeConfig.icon}></i>
                            </div>
                            <div className="notification-meta">
                              <h4 className="notification-title">{notification.title}</h4>
                              <p className="notification-time">{timeAgo}</p>
                            </div>
                            <div className="notification-actions-item">
                              {!notification.read && (
                                <button className="btn-icon btn-mark-read" onClick={() => markAsRead(notification.id)} title={t.markAsRead}>
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                              <button className="btn-icon btn-delete" onClick={() => deleteNotification(notification.id)} title={t.delete}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <p className="notification-message">{notification.message}</p>
                          {notification.action && (
                            <button className="action-btn" onClick={() => router.push(notification.actionUrl || '/')}>
                              {notification.action}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-bell-slash"></i>
                  </div>
                  <h3>{t.noNotifications}</h3>
                  <p>{t.allCaughtUp}</p>
                  <button className="btn btn-primary" onClick={refreshNotifications}>
                    <i className="fas fa-sync-alt"></i>
                    <span>{t.refreshNotifications}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="features settings-section">
          <div className="container">
            <h2 className="section-title">{t.notificationPreferences}</h2>
            
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon email">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4>{t.emailNotifications}</h4>
                    <p>{t.emailDesc}</p>
                  </div>
                </div>
                <div className="setting-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['email-announcements']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'email-announcements': e.target.checked }))}
                    />
                    <span>{t.importantAnnouncements}</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['email-new-content']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'email-new-content': e.target.checked }))}
                    />
                    <span>{t.newContentNotifications}</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['email-weekly']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'email-weekly': e.target.checked }))}
                    />
                    <span>{t.weeklyDigest}</span>
                  </label>
                </div>
              </div>
              
              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon push">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <h4>{t.pushNotifications}</h4>
                    <p>{t.pushDesc}</p>
                  </div>
                </div>
                <div className="setting-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['push-breaking']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'push-breaking': e.target.checked }))}
                    />
                    <span>{t.breakingNews}</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['push-new-content']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'push-new-content': e.target.checked }))}
                    />
                    <span>{t.newContentAlerts}</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={preferences['push-updates']}
                      onChange={(e) => setPreferences(prev => ({ ...prev, 'push-updates': e.target.checked }))}
                    />
                    <span>{t.generalUpdates}</span>
                  </label>
                </div>
              </div>
              
              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon language">
                    <i className="fas fa-language"></i>
                  </div>
                  <div>
                    <h4>{t.languagePreferences}</h4>
                    <p>{t.languageDesc}</p>
                  </div>
                </div>
                <div className="setting-options">
                  <label>
                    <input
                      type="radio"
                      name="language"
                      value="bilingual"
                      checked={preferences.language === 'bilingual'}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    />
                    <span>{t.tamilEnglish}</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="language"
                      value="tamil"
                      checked={preferences.language === 'tamil'}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    />
                    <span>{t.tamilOnly}</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="language"
                      value="english"
                      checked={preferences.language === 'english'}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    />
                    <span>{t.englishOnly}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="save-preferences">
              <button className="btn btn-primary" onClick={saveNotificationSettings}>
                <i className="fas fa-save"></i>
                {t.savePreferences}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <div className="footer-logo">
                  <img src="/assets/logo.png" alt="Tamil Language Society" width="40" height="40" />
                  <span>Tamil Language Society</span>
                </div>
                <p>Dedicated to preserving and promoting the rich heritage of Tamil language and culture worldwide.</p>
                <div className="social-links">
                  <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
                </div>
              </div>
              
              <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                  <li><a href="/about">{t.about}</a></li>
                  <li><a href="/projects">{t.projects}</a></li>
                  <li><a href="/ebooks">E-books</a></li>
                  <li><a href="/books">{t.books}</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>Support</h3>
                <ul>
                  <li><a href="/contact">{t.contact}</a></li>
                  <li><a href="/donate">Donate</a></li>
                  <li><a href="/notifications">{t.notifications}</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>Newsletter</h3>
                <p>Stay updated with our latest news and events</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email" className="newsletter-input" />
                  <button className="newsletter-btn" aria-label="Subscribe to newsletter">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2025 Tamil Language Society. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Notification Toast */}
        {showToast && (
          <div className="notification-toast show">
            <div className="toast-content">
              <i className="fas fa-check-circle"></i>
              <span className="toast-message">{toastMessage}</span>
            </div>
            <button className="toast-close" onClick={() => setShowToast(false)} aria-label="Close notification">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Modern Design System - Notifications Page */
        :root {
          --primary-blue: #2563eb;
          --secondary-blue: #1d4ed8;
          --accent-green: #10b981;
          --accent-purple: #8b5cf6;
          --accent-gold: #f59e0b;
          --accent-orange: #f97316;
          --accent-red: #ef4444;
          --text-dark: #1f2937;
          --text-muted: #6b7280;
          --text-inverse: #ffffff;
          --bg-light: #f8fafc;
          --bg-white: #ffffff;
          --border-light: #e5e7eb;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          --gradient-primary: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
          --border-radius: 0.75rem;
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
          --text-dark: #f9fafb;
          --text-muted: #d1d5db;
          --bg-light: #111827;
          --bg-white: #1f2937;
          --border-light: #374151;
        }

        .notifications-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          background: var(--bg-light);
          margin: 0;
          padding: 0;
          transition: var(--transition);
        }

        /* Navigation */
        .navbar {
          background: var(--bg-white);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: var(--transition);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-dark);
          font-weight: 600;
          font-size: 1.25rem;
        }

        .nav-menu {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
          padding: 0.5rem 0;
          position: relative;
        }

        .nav-link:hover {
          color: var(--primary-blue);
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .theme-toggle {
          background: none;
          border: 2px solid var(--border-light);
          color: var(--text-muted);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .theme-toggle:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
        }

        /* Hero Section */
        .hero {
          background: var(--gradient-primary);
          color: var(--text-inverse);
          padding: 4rem 0;
          text-align: center;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 0;
        }

        /* Features Section */
        .features {
          padding: 4rem 0;
        }

        .settings-section {
          background: var(--bg-light);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: var(--text-dark);
        }

        /* Notification Header */
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .notification-stats {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-blue);
        }

        .stat-number.unread {
          color: var(--accent-red);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .notification-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Notification Filters */
        .notification-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1.5rem;
          border: 2px solid var(--primary-blue);
          background: var(--bg-white);
          color: var(--primary-blue);
          border-radius: 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-btn.active {
          background: var(--primary-blue);
          color: var(--text-inverse);
        }

        .filter-btn:hover {
          background: var(--primary-blue);
          color: var(--text-inverse);
        }

        /* Notifications List */
        .notifications-container {
          min-height: 400px;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          background: var(--bg-white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-light);
          transition: var(--transition);
          overflow: hidden;
        }

        .notification-item:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .notification-item.unread {
          border-left: 4px solid var(--primary-blue);
          background: linear-gradient(to right, rgba(37, 99, 235, 0.05), var(--bg-white));
        }

        .notification-content {
          padding: 1.5rem;
        }

        .notification-header-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .notification-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .notification-meta {
          flex: 1;
        }

        .notification-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: var(--text-dark);
        }

        .notification-time {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
        }

        .notification-actions-item {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;
        }

        .btn-mark-read {
          background: var(--accent-green);
          color: var(--text-inverse);
        }

        .btn-mark-read:hover {
          background: #047857;
        }

        .btn-delete {
          background: var(--accent-red);
          color: var(--text-inverse);
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .notification-message {
          color: var(--text-muted);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .action-btn {
          background: transparent;
          color: var(--primary-blue);
          border: 2px solid var(--primary-blue);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .action-btn:hover {
          background: var(--primary-blue);
          color: var(--text-inverse);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          width: 120px;
          height: 120px;
          background: var(--bg-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: var(--text-muted);
          font-size: 3rem;
        }

        .empty-state h3 {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        /* Settings */
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .setting-card {
          background: var(--bg-white);
          padding: 2rem;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-light);
          transition: var(--transition);
        }

        .setting-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .setting-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .setting-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          font-size: 1.25rem;
        }

        .setting-icon.email {
          background: var(--primary-blue);
        }

        .setting-icon.push {
          background: var(--accent-green);
        }

        .setting-icon.language {
          background: var(--accent-gold);
        }

        .setting-header h4 {
          color: var(--text-dark);
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .setting-header p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.9rem;
        }

        .setting-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .setting-options label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: var(--transition);
        }

        .setting-options label:hover {
          background: var(--bg-light);
        }

        .save-preferences {
          text-align: center;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--border-radius);
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;
          justify-content: center;
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: var(--text-inverse);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background: transparent;
          color: var(--primary-blue);
          border: 2px solid var(--primary-blue);
        }

        .btn-secondary:hover {
          background: var(--primary-blue);
          color: var(--text-inverse);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        /* Footer */
        .footer {
          background: var(--text-dark);
          color: var(--text-inverse);
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
          color: #d1d5db;
          text-decoration: none;
          transition: var(--transition);
        }

        .footer-section ul li a:hover {
          color: var(--accent-green);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-logo span {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          text-decoration: none;
          transition: var(--transition);
        }

        .social-link:hover {
          background: var(--accent-green);
          transform: translateY(-2px);
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #374151;
          border-radius: var(--border-radius);
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-inverse);
        }

        .newsletter-input::placeholder {
          color: #9ca3af;
        }

        .newsletter-btn {
          background: var(--accent-green);
          color: var(--text-inverse);
          border: none;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition);
        }

        .newsletter-btn:hover {
          background: #047857;
          transform: translateY(-2px);
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 1rem;
          text-align: center;
          color: #9ca3af;
        }

        /* Notification Toast */
        .notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--bg-white);
          border: 1px solid var(--border-light);
          border-radius: var(--border-radius);
          padding: 1rem 1.5rem;
          box-shadow: var(--shadow-xl);
          z-index: 10000;
          transform: translateX(400px);
          transition: var(--transition);
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-toast.show {
          transform: translateX(0);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .toast-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          transition: var(--transition);
        }

        .toast-close:hover {
          background: var(--bg-light);
          color: var(--text-dark);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .notification-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .notification-stats {
            justify-content: center;
          }

          .notification-actions {
            justify-content: center;
          }

          .notification-filters {
            justify-content: center;
          }

          .filter-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }}
      `}</style>
      
      {/* Announcement Popup Component */}
      <AnnouncementPopup />
    </>
  );
}