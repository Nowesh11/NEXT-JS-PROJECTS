import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';
import PosterSection from '../components/PosterSection';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ContentContext } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import ClientOnly from '../components/ClientOnly';

// Features Component
const Features = () => {
  const { language } = useLanguage();
  const { content, globalContent } = useContent();

  const getText = (key, fallback = '') => {
    const currentContent = language === 'ta' ? content : globalContent;
    return currentContent?.[key] || fallback;
  };

  const features = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: getText('feature_education_title', 'Tamil Education'),
      description: getText('feature_education_desc', 'Comprehensive Tamil language learning programs for all ages and skill levels.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: getText('feature_culture_title', 'Cultural Heritage'),
      description: getText('feature_culture_desc', 'Preserving and promoting Tamil culture through festivals, arts, and traditions.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5866 20.2 15.3954" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8003 3.32127 17.5037 3.78167 18.0098 4.43524C18.5159 5.08882 18.8004 5.89925 18.8004 6.735C18.8004 7.57075 18.5159 8.38118 18.0098 9.03476C17.5037 9.68833 16.8003 10.1487 16 10.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: getText('feature_community_title', 'Community Building'),
      description: getText('feature_community_desc', 'Connecting Tamil speakers worldwide through events and digital platforms.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: getText('feature_resources_title', 'Digital Resources'),
      description: getText('feature_resources_desc', 'Access to e-books, learning materials, and digital archives of Tamil literature.')
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('features_title', 'Our Mission & Services')}
          </h2>
          <p className="section-description">
            {getText('features_description', 'Discover how we preserve and promote Tamil language and culture through innovative programs and community initiatives.')}
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="feature-card"
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features-section {
          padding: 6rem 0;
          position: relative;
          background: var(--bg-primary);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          border-color: var(--primary-300);
          box-shadow: var(--shadow-xl);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--gradient-primary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .features-section {
            padding: 4rem 0;
          }

          .container {
            padding: 0 1rem;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .section-description {
            font-size: 1.125rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

// Statistics Component
const Statistics = () => {
  const { language } = useLanguage();
  const { content, globalContent } = useContent();

  const getText = (key, fallback = '') => {
    const currentContent = language === 'ta' ? content : globalContent;
    return currentContent?.[key] || fallback;
  };

  const stats = [
    {
      number: '10,000+',
      label: getText('stat_students', 'Students Taught'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5866 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.13C16.8003 3.32127 17.5037 3.78167 18.0098 4.43524C18.5159 5.08882 18.8004 5.89925 18.8004 6.735C18.8004 7.57075 18.5159 8.38118 18.0098 9.03476C17.5037 9.68833 16.8003 10.1487 16 10.34" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '25+',
      label: getText('stat_years', 'Years of Service'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '50+',
      label: getText('stat_programs', 'Programs Offered'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '100+',
      label: getText('stat_events', 'Cultural Events'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <section className="statistics-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="stat-card"
            >
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .statistics-section {
          padding: 4rem 0;
          background: var(--bg-secondary);
          position: relative;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: var(--gradient-secondary);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .statistics-section {
            padding: 3rem 0;
          }

          .container {
            padding: 0 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

// Announcements Section
const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const { content, globalContent } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/announcements?language=${language}&limit=3`);
        const data = await response.json();
        
        if (data.success) {
          setAnnouncements(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch announcements');
        }
      } catch (err) {
        setError('Error fetching announcements');
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [language]);

  if (loading) {
    return (
      <section className="announcements-section">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{getText('loading', 'Loading announcements...')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || announcements.length === 0) {
    return null; // Hide section if no announcements or error
  }

  return (
    <section className="announcements-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('announcements_title', 'Latest Announcements')}
          </h2>
        </motion.div>

        <div className="announcements-grid">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="announcement-card"
            >
              <div className="announcement-date">
                {new Date(announcement.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}
              </div>
              <h3 className="announcement-title">
                {announcement.title?.[language] || announcement.title?.en || announcement.title}
              </h3>
              <p className="announcement-content">
                {announcement.content?.[language] || announcement.content?.en || announcement.content}
              </p>
              {announcement.link && (
                <a href={announcement.link} className="announcement-link">
                  {getText('read_more', 'Read More')} →
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .announcements-section {
          padding: 5rem 0;
          background: var(--bg-primary);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--primary-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .announcement-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .announcement-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-accent);
        }

        .announcement-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .announcement-date {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .announcement-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .announcement-content {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .announcement-link {
          color: var(--primary-500);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .announcement-link:hover {
          color: var(--primary-600);
          transform: translateX(5px);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .announcements-section {
            padding: 4rem 0;
          }

          .container {
            padding: 0 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .announcements-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .announcement-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

// Helper function to safely use context with SSR
function useSSRSafeContext(context, defaultValue) {
  try {
    const contextValue = useContext(context);
    return contextValue || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

// Main Index Page Component
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{
          color: '#333333',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Loading...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{
          color: '#333333',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Loading...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <HomeContent />
    </ClientOnly>
  );
}

// Separate component for the actual home content
function HomeContent() {
  const languageContext = useSSRSafeContext(LanguageContext, { 
    language: 'en', 
    toggleLanguage: () => {}, 
    t: () => '',
    changeLanguage: () => {},
    getText: () => '',
    translations: {}
  });
  const themeContext = useSSRSafeContext(ThemeContext, { 
    theme: 'light', 
    toggleTheme: () => {},
    themes: {}
  });
  const contentContext = useSSRSafeContext(ContentContext, { 
    content: {}, 
    globalContent: {},
    loading: false,
    error: null,
    language: 'en',
    isInitialized: false
  });
  
  // Provide fallback values if contexts are not available
  const language = languageContext?.language || 'en';
  const theme = themeContext?.theme || 'light';
  const content = contentContext?.content || {};
  const globalContent = contentContext?.globalContent || {};

  // Helper function to get text with fallback
  const getText = (key, fallback = '') => {
    try {
      if (languageContext?.getText) {
        return languageContext.getText(key, fallback);
      }
      
      const currentContent = language === 'ta' ? content : globalContent;
      return currentContent?.[key] || fallback;
    } catch (error) {
      console.warn('Error getting text:', error);
      return fallback;
    }
  };

  return (
    <Layout
      title={getText('home_title', 'Tamil Learning Society - Preserving Heritage, Embracing Future')}
      description={getText('home_description', 'Join Tamil Learning Society in preserving and promoting Tamil language, culture, and heritage through education, community engagement, and digital innovation.')}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <Features />

        {/* Statistics Section */}
        <Statistics />

        {/* Announcements Section */}
        <AnnouncementsSection />

        {/* Poster Section */}
        <PosterSection />
      </motion.div>
    </Layout>
  );
}
