import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { LanguageContext, useLanguage } from '../contexts/LanguageContext';
import { ThemeContext, useTheme } from '../contexts/ThemeContext';
import { ContentContext, useContent } from '../contexts/ContentContext';

// Hero Section Component
const AboutHero = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  return (
    <section className="about-hero">
      <div className="hero-background">
        <div className="gradient-overlay"></div>
        <div className="floating-elements">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-element element-${i + 1}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero-content"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            {getText('about_title', 'About Tamil Learning Society')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            {getText('about_subtitle', 'Preserving Tamil heritage through modern innovation and community engagement')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-stats"
          >
            <div className="stat-item">
              <span className="stat-number">25+</span>
              <span className="stat-label">{getText('years_service', 'Years of Service')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">{getText('members', 'Members')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">{getText('programs', 'Programs')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .about-hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gradient-hero);
          opacity: 0.9;
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-element {
          position: absolute;
          color: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .element-1 { top: 10%; left: 10%; animation-delay: 0s; }
        .element-2 { top: 20%; right: 15%; animation-delay: 1s; }
        .element-3 { top: 60%; left: 5%; animation-delay: 2s; }
        .element-4 { bottom: 20%; right: 10%; animation-delay: 3s; }
        .element-5 { top: 40%; left: 80%; animation-delay: 4s; }
        .element-6 { bottom: 40%; left: 20%; animation-delay: 5s; }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          text-align: center;
          color: white;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.8;
          font-weight: 500;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @media (max-width: 768px) {
          .about-hero {
            min-height: 60vh;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.25rem;
          }

          .hero-stats {
            gap: 2rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

// Mission Section Component
const MissionSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  return (
    <section className="mission-vision-section">
      <div className="container">
        <div className="cards-grid">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mission-card"
          >
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className="card-title">
              {getText('mission_title', 'Our Mission')}
            </h2>
            <p className="card-description">
              {getText('mission_text', 'To preserve, promote, and celebrate Tamil language, literature, and culture through education, research, and community engagement, ensuring its rich heritage continues to thrive for future generations.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="vision-card"
          >
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h2 className="card-title">
              {getText('vision_title', 'Our Vision')}
            </h2>
            <p className="card-description">
              {getText('vision_text', 'To be the leading global platform for Tamil language learning and cultural preservation, connecting Tamil communities worldwide and fostering innovation in language education and cultural exchange.')}
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .mission-vision-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
          position: relative;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 3rem;
        }

        .mission-card,
        .vision-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .mission-card::before,
        .vision-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
        }

        .mission-card:hover,
        .vision-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-300);
        }

        .card-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: var(--gradient-secondary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .card-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .mission-vision-section {
            padding: 4rem 0;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .mission-card,
          .vision-card {
            padding: 2rem;
          }

          .card-title {
            font-size: 1.75rem;
          }

          .card-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

// History Timeline Component
const HistoryTimeline = () => {
  const languageContext = useContext(LanguageContext);
  const contentContext = useContext(ContentContext);
  const language = languageContext?.language || 'en';
  const content = contentContext?.content;

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  const timeline = [
    {
      year: '1995',
      title: getText('timeline_1995_title', 'Foundation'),
      description: getText('timeline_1995_desc', 'Tamil Learning Society was established with a vision to preserve and promote Tamil heritage through education and community engagement.')
    },
    {
      year: '2000',
      title: getText('timeline_2000_title', 'Digital Initiative'),
      description: getText('timeline_2000_desc', 'Launched our first digital platform for Tamil literature, making ancient texts accessible to modern learners worldwide.')
    },
    {
      year: '2005',
      title: getText('timeline_2005_title', 'Educational Programs'),
      description: getText('timeline_2005_desc', 'Introduced comprehensive Tamil language courses and cultural workshops for all age groups and skill levels.')
    },
    {
      year: '2010',
      title: getText('timeline_2010_title', 'Global Expansion'),
      description: getText('timeline_2010_desc', 'Expanded our reach to Tamil communities worldwide, establishing chapters in major cities across the globe.')
    },
    {
      year: '2015',
      title: getText('timeline_2015_title', 'Technology Integration'),
      description: getText('timeline_2015_desc', 'Integrated modern technology with traditional learning methods, creating innovative digital learning experiences.')
    },
    {
      year: '2020',
      title: getText('timeline_2020_title', 'Virtual Learning'),
      description: getText('timeline_2020_desc', 'Adapted to the digital age with comprehensive online learning platforms and virtual cultural events.')
    }
  ];

  return (
    <section className="history-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('history_title', 'Our Journey Through Time')}
          </h2>
          <p className="section-description">
            {getText('history_description', 'Discover the milestones that have shaped our organization and our commitment to Tamil heritage preservation.')}
          </p>
        </motion.div>

        <div className="timeline">
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="timeline-item"
            >
              <div className="timeline-marker">
                <div className="timeline-year">{item.year}</div>
              </div>
              <div className="timeline-content">
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-description">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .history-section {
          padding: 6rem 0;
          background: var(--bg-primary);
          position: relative;
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
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--gradient-primary);
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
        }

        .timeline-item:nth-child(odd) {
          flex-direction: row;
        }

        .timeline-item:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-marker {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .timeline-year {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: var(--shadow-lg);
        }

        .timeline-content {
          flex: 1;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 2rem;
          margin: 0 2rem;
          transition: all 0.3s ease;
        }

        .timeline-content:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .timeline-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .timeline-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .history-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .timeline::before {
            left: 40px;
          }

          .timeline-item {
            flex-direction: row !important;
            margin-left: 80px;
          }

          .timeline-marker {
            position: absolute;
            left: -80px;
          }

          .timeline-year {
            width: 60px;
            height: 60px;
            font-size: 0.875rem;
          }

          .timeline-content {
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
};

// Team Section Component  
const TeamSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team?language=${language}`);
        const data = await response.json();
        
        if (data.success) {
          setTeamMembers(data.data || []);
        } else {
          // Fallback team data
          const fallbackTeam = [
            {
              _id: '1',
              name: { en: 'Dr. Rajesh Kumar', ta: 'டாக்டர் ராஜேஷ் குமார்' },
              position: { en: 'President & Founder', ta: 'தலைவர் மற்றும் நிறுவனர்' },
              bio: { 
                en: 'Leading Tamil scholar with 25+ years of experience in language preservation and cultural research.',
                ta: 'மொழி பாதுகாப்பு மற்றும் கலாச்சார ஆராய்ச்சியில் 25+ ஆண்டுகள் அனுபவம் கொண்ட முன்னணி தமிழ் அறிஞர்.'
              },
              image: '/images/team/president.jpg',
              social: {
                linkedin: '#',
                twitter: '#',
                email: 'rajesh@tamilsociety.org'
              }
            },
            {
              _id: '2',
              name: { en: 'Prof. Meera Devi', ta: 'பேராசிரியர் மீரா தேவி' },
              position: { en: 'Vice President', ta: 'துணைத் தலைவர்' },
              bio: { 
                en: 'Expert in Tamil literature and cultural studies with extensive research in ancient Tamil texts.',
                ta: 'பண்டைய தமிழ் நூல்களில் விரிவான ஆராய்ச்சியுடன் தமிழ் இலக்கியம் மற்றும் கலாச்சார ஆய்வுகளில் நிபுணர்.'
              },
              image: '/images/team/vice-president.jpg',
              social: {
                linkedin: '#',
                twitter: '#',
                email: 'meera@tamilsociety.org'
              }
            },
            {
              _id: '3',
              name: { en: 'Mr. Arjun Selvam', ta: 'திரு. அர்ஜுன் செல்வம்' },
              position: { en: 'Education Director', ta: 'கல்வி இயக்குனர்' },
              bio: { 
                en: 'Innovative educator specializing in modern Tamil language teaching methodologies and curriculum development.',
                ta: 'நவீன தமிழ் மொழி கற்பித்தல் முறைகள் மற்றும் பாடத்திட்ட மேம்பாட்டில் நிபுணத்துவம் பெற்ற புதுமையான கல்வியாளர்.'
              },
              image: '/images/team/education-director.jpg',
              social: {
                linkedin: '#',
                twitter: '#',
                email: 'arjun@tamilsociety.org'
              }
            }
          ];
          setTeamMembers(fallbackTeam);
        }
      } catch (err) {
        setError('Error fetching team members');
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [language]);

  if (loading) {
    return (
      <section className="team-section">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{getText('loading', 'Loading team members...')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="team-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('team_title', 'Meet Our Team')}
          </h2>
          <p className="section-description">
            {getText('team_description', 'Dedicated professionals committed to preserving and promoting Tamil heritage through innovation and excellence.')}
          </p>
        </motion.div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="team-card"
            >
              <div className="team-image">
                <img 
                  src={member.image || '/images/team/default-avatar.jpg'} 
                  alt={member.name?.[language] || member.name?.en || member.name}
                  onError={(e) => {
                    e.target.src = '/images/team/default-avatar.jpg';
                  }}
                />
                <div className="image-overlay">
                  <div className="social-links">
                    {member.social?.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                        </svg>
                      </a>
                    )}
                    {member.social?.twitter && (
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57C23.085 4.953 22.148 5.223 21.172 5.348C22.189 4.724 22.97 3.758 23.337 2.608C22.395 3.184 21.351 3.582 20.248 3.773C19.364 2.817 18.114 2.248 16.731 2.248C14.093 2.248 11.955 4.388 11.955 7.029C11.955 7.407 11.996 7.774 12.076 8.126C7.933 7.95 4.273 6.049 1.742 3.126C1.329 3.875 1.093 4.724 1.093 5.636C1.093 7.34 1.958 8.841 3.287 9.723C2.488 9.697 1.736 9.486 1.08 9.134V9.197C1.08 11.507 2.735 13.432 4.915 13.881C4.513 13.988 4.089 14.044 3.651 14.044C3.342 14.044 3.041 14.014 2.75 13.958C3.359 15.851 5.124 17.227 7.233 17.267C5.589 18.521 3.518 19.277 1.267 19.277C0.879 19.277 0.498 19.254 0.125 19.209C2.26 20.543 4.926 21.297 7.785 21.297C16.721 21.297 21.556 14.124 21.556 7.588L21.538 7.588C21.538 7.588 21.538 7.588 21.538 7.588C21.538 7.374 21.535 7.161 21.529 6.949C22.484 6.237 23.34 5.358 24 4.359C23.107 4.759 22.148 5.023 21.147 5.129C22.183 4.491 22.969 3.482 23.337 2.608L23.953 4.57Z"/>
                        </svg>
                      </a>
                    )}
                    {member.social?.email && (
                      <a href={`mailto:${member.social.email}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">
                  {member.name?.[language] || member.name?.en || member.name}
                </h3>
                <p className="team-position">
                  {member.position?.[language] || member.position?.en || member.position}
                </p>
                <p className="team-bio">
                  {member.bio?.[language] || member.bio?.en || member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .team-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
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
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        .team-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-accent);
        }

        .team-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-300);
        }

        .team-image {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto 2rem;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid var(--border-primary);
        }

        .team-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .team-card:hover .team-image img {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .team-card:hover .image-overlay {
          opacity: 1;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .social-links a:hover {
          transform: scale(1.1);
        }

        .team-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .team-position {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary-500);
          margin-bottom: 1rem;
        }

        .team-bio {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .team-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .team-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .team-card {
            padding: 1.5rem;
          }

          .team-image {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>
    </section>
  );
};

// Values Section Component
const ValuesSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  const values = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: getText('value_excellence_title', 'Excellence'),
      description: getText('value_excellence_desc', 'We strive for the highest standards in education, research, and cultural preservation.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7006C21.7033 16.047 20.9999 15.5866 20.2 15.3954" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.13C16.8003 3.32127 17.5037 3.78167 18.0098 4.43524C18.5159 5.08882 18.8004 5.89925 18.8004 6.735C18.8004 7.57075 18.5159 8.38118 18.0098 9.03476C17.5037 9.68833 16.8003 10.1487 16 10.34" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: getText('value_community_title', 'Community'),
      description: getText('value_community_desc', 'Building strong connections among Tamil speakers worldwide through shared learning and cultural exchange.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: getText('value_integrity_title', 'Integrity'),
      description: getText('value_integrity_desc', 'Maintaining authenticity and respect for Tamil traditions while embracing modern innovations.')
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: getText('value_innovation_title', 'Innovation'),
      description: getText('value_innovation_desc', 'Leveraging technology and creative approaches to make Tamil learning accessible and engaging.')
    }
  ];

  return (
    <section className="values-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('values_title', 'Our Core Values')}
          </h2>
          <p className="section-description">
            {getText('values_description', 'The principles that guide our mission and shape our approach to Tamil heritage preservation.')}
          </p>
        </motion.div>

        <div className="values-grid">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="value-card"
            >
              <div className="value-icon">
                {value.icon}
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .values-section {
          padding: 6rem 0;
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
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .value-card {
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

        .value-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-secondary);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .value-card:hover::before {
          opacity: 1;
        }

        .value-card:hover {
          border-color: var(--primary-300);
          box-shadow: var(--shadow-xl);
        }

        .value-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--gradient-accent);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
        }

        .value-card:hover .value-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .value-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .value-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .values-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .value-card {
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

// History Section Component
const HistorySection = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  const timeline = [
    {
      year: '1995',
      title: getText('timeline_1995_title', 'Foundation'),
      description: getText('timeline_1995_desc', 'Tamil Learning Society was established with a vision to preserve and promote Tamil heritage through education and community engagement.')
    },
    {
      year: '2000',
      title: getText('timeline_2000_title', 'Digital Initiative'),
      description: getText('timeline_2000_desc', 'Launched our first digital platform for Tamil literature, making ancient texts accessible to modern learners worldwide.')
    },
    {
      year: '2005',
      title: getText('timeline_2005_title', 'Educational Programs'),
      description: getText('timeline_2005_desc', 'Introduced comprehensive Tamil language courses and cultural workshops for all age groups and skill levels.')
    },
    {
      year: '2010',
      title: getText('timeline_2010_title', 'Global Expansion'),
      description: getText('timeline_2010_desc', 'Expanded our reach to Tamil communities worldwide, establishing chapters in major cities across the globe.')
    },
    {
      year: '2015',
      title: getText('timeline_2015_title', 'Technology Integration'),
      description: getText('timeline_2015_desc', 'Integrated modern technology with traditional learning methods, creating innovative digital learning experiences.')
    },
    {
      year: '2020',
      title: getText('timeline_2020_title', 'Virtual Learning'),
      description: getText('timeline_2020_desc', 'Adapted to the digital age with comprehensive online learning platforms and virtual cultural events.')
    }
  ];

  return (
    <section className="history-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="section-title">
            {getText('history_title', 'Our Journey Through Time')}
          </h2>
          <p className="section-description">
            {getText('history_description', 'Discover the milestones that have shaped our organization and our commitment to Tamil heritage preservation.')}
          </p>
        </motion.div>

        <div className="timeline">
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="timeline-item"
            >
              <div className="timeline-marker">
                <div className="timeline-year">{item.year}</div>
              </div>
              <div className="timeline-content">
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-description">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .history-section {
          padding: 6rem 0;
          background: var(--bg-primary);
          position: relative;
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
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--gradient-primary);
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
        }

        .timeline-item:nth-child(odd) {
          flex-direction: row;
        }

        .timeline-item:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-marker {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .timeline-year {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: var(--shadow-lg);
        }

        .timeline-content {
          flex: 1;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 2rem;
          margin: 0 2rem;
          transition: all 0.3s ease;
        }

        .timeline-content:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .timeline-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .timeline-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .history-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .timeline::before {
            left: 40px;
          }

          .timeline-item {
            flex-direction: row !important;
            margin-left: 80px;
          }

          .timeline-marker {
            position: absolute;
            left: -80px;
          }

          .timeline-year {
            width: 60px;
            height: 60px;
            font-size: 0.875rem;
          }

          .timeline-content {
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
};

// Main About Page Component
function AboutContent() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { content } = useContent();

  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  useEffect(() => {
    // Simulate loading time for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="loading-text">
            {getText('loading_about', 'Loading About Us...')}
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>

        <style jsx>{`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .loading-content {
            text-align: center;
            max-width: 300px;
          }

          .loading-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: var(--gradient-primary);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            animation: pulse 2s ease-in-out infinite;
          }

          .loading-text {
            color: var(--text-primary);
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 2rem;
          }

          .loading-bar {
            width: 100%;
            height: 4px;
            background: var(--border-primary);
            border-radius: 2px;
            overflow: hidden;
          }

          .loading-progress {
            width: 100%;
            height: 100%;
            background: var(--gradient-primary);
            border-radius: 2px;
            animation: loading 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Layout
      title={getText('about_page_title', 'About Us - Tamil Learning Society')}
      description={getText('about_page_description', 'Learn about Tamil Learning Society\'s mission, vision, history, and dedicated team working to preserve and promote Tamil heritage worldwide.')}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <AboutHero />

        {/* Mission & Vision */}
        <MissionVision />

        {/* History Timeline */}
        <HistoryTimeline />

        {/* Core Values */}
        <ValuesSection />

        {/* Team Section */}
        <TeamSection />
      </motion.div>
    </Layout>
  );
}

export default function About() {
  return <AboutContent />;
}
