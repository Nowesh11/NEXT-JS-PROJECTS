import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../contexts/ContentContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/About.module.css';

const AboutPage = () => {
  const { language, getContent } = useContent();
  const { theme } = useTheme();
  const { changeLanguage } = useLanguage();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      // Import apiClient dynamically to avoid SSR issues
      const apiClient = (await import('../lib/apiClient')).default;
      const response = await apiClient.getTeamMembers({ is_active: true });
      
      if (response && response.data) {
        setTeamMembers(response.data);
      } else {
        console.error('Invalid team data format received');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setLoading(false);
    }
  };



  const getText = (key, fallback) => {
    return getContent(key, fallback || key);
  };

  const timeline = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'Tamil Language Society was founded with a vision to create a comprehensive digital platform for Tamil language learning and cultural preservation.'
    },
    {
      year: '2021',
      title: 'Digital Library Launch',
      description: 'Launched our comprehensive digital library with thousands of Tamil books, literature, and educational resources.'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded our reach to Tamil communities worldwide, establishing partnerships with cultural organizations globally.'
    },
    {
      year: '2023',
      title: 'Cultural Programs',
      description: 'Initiated comprehensive cultural programs, workshops, and events to promote Tamil arts, music, and traditions.'
    },
    {
      year: '2024',
      title: 'Innovation & Technology',
      description: 'Embraced cutting-edge technology to enhance Tamil language learning through AI-powered tools and interactive platforms.'
    }
  ];

  const values = [
    {
      icon: 'fas fa-book-open',
      title: getText('about.values.education.title'),
      description: getText('about.values.education.description')
    },
    {
      icon: 'fas fa-users',
      title: getText('about.values.community.title'),
      description: getText('about.values.community.description')
    },
    {
      icon: 'fas fa-leaf',
      title: getText('about.values.preservation.title'),
      description: getText('about.values.preservation.description')
    },
    {
      icon: 'fas fa-globe',
      title: getText('about.values.global.title'),
      description: getText('about.values.global.description')
    }
  ];

  const teamConfig = {
    president: {
      title: 'President',
      icon: 'fas fa-crown',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
      titleColor: '#FFD700'
    },
    'vice-president': {
      title: 'Vice President',
      icon: 'fas fa-user-tie',
      gradient: 'linear-gradient(135deg, #87CEEB, #4682B4)',
      titleColor: '#87CEEB'
    },
    treasurer: {
      title: 'Treasurer',
      icon: 'fas fa-coins',
      gradient: 'linear-gradient(135deg, #90EE90, #32CD32)',
      titleColor: '#90EE90'
    },
    secretary: {
      title: 'Secretary',
      icon: 'fas fa-pen-fancy',
      gradient: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
      titleColor: '#FFB6C1'
    }
  };

  return (
    <>
      <Head>
        <title>About Us - Tamil Language Society</title>
        <meta name="description" content="Learn about Tamil Language Society's mission, vision, and commitment to preserving Tamil heritage through innovative digital initiatives and educational programs." />
        <meta name="keywords" content="Tamil Language Society, about us, Tamil heritage, Tamil mission, Tamil vision, Tamil culture preservation, Tamil education, Tamil community" />
      </Head>
      
      <div className={`${styles.aboutPage} transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`} data-theme={theme}>
        <Navigation />
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {getText('about.hero.title', 'About Tamil Literary Society')}
            </h1>
            <p className={styles.heroSubtitle}>
              {getText('about.hero.subtitle', 'Preserving, promoting, and celebrating the rich heritage of Tamil language and culture for future generations')}
            </p>
          </div>
        </section>

        {/* History Section */}
        <section className={`${styles.section} ${styles.historySection}`}>
          <div className="container mx-auto px-4">
            <h2 className={styles.sectionTitle}>
              {getText('about.history.title', 'Our History')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {getText('about.history.subtitle', 'A Journey Through Time')}
            </p>
            
            <div className={styles.historyCard}>
              <div className={styles.historyIcon}>
                <i className="fas fa-book-open"></i>
              </div>
              <div className={styles.historyContent}>
                {getText('about.history.content', 'The Tamil Literary Society was founded with a vision to preserve and promote the rich literary heritage of Tamil culture. Over the years, we have grown from a small group of enthusiasts to a thriving community dedicated to celebrating Tamil literature, language, and traditions.')}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={`${styles.section} ${styles.valuesSection}`}>
          <div className="container mx-auto px-4">
            <h2 className={styles.sectionTitle}>
              {getText('about.values.title', 'Our Values')}
            </h2>
            
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <i className={value.icon}></i>
                  </div>
                  <h3 className={styles.valueTitle}>
                    {getText(value.title)}
                  </h3>
                  <p className={styles.valueDescription}>
                    {getText(value.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className={`${styles.section} ${styles.journeySection}`}>
          <div className="container mx-auto px-4">
            <h2 className={styles.sectionTitle}>
              {getText('about.journey.title', 'Our Journey')}
            </h2>
            
            <div className={styles.timelineContainer}>
              {timeline.map((item, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineYear}>
                    {item.year}
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineTitle}>
                      {getText(item.title)}
                    </h3>
                    <p className={styles.timelineDescription}>
                      {getText(item.description)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={`${styles.section} ${styles.teamSection}`}>
          <div className="container mx-auto px-4">
            <h2 className={styles.sectionTitle}>
              {getText('about.team.title', 'Our Team')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {getText('about.team.description', 'Meet our dedicated team members')}
            </p>

            {loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <p className={styles.loadingText}>
                  {getText('about.team.loading', 'Loading team members...')}
                </p>
              </div>
            ) : (
              <div className={styles.teamGrid}>
                {teamMembers.map((member, index) => (
                  <div key={member._id || member.id} className={styles.teamCard}>
                    <div className={styles.teamPhoto}>
                      {member.image || (member.profilePicture && member.profilePicture.url) ? (
                        <img
                          src={member.image || (member.profilePicture ? member.profilePicture.url : '')}
                          alt={member.name}
                          className={styles.teamImage}
                        />
                      ) : (
                        <div className={styles.teamPlaceholder}>
                          <i className={teamConfig[member.position]?.icon || 'fas fa-user'}></i>
                        </div>
                      )}
                    </div>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamPosition}>
                      {teamConfig[member.position]?.title || member.position}
                    </p>
                    {member.bio && (
                      <p className={styles.teamBio}>{member.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl p-12 shadow-lg">
              <h2 className="text-4xl font-bold mb-6 text-blue-600">
                {getText('about.cta.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {getText('about.cta.description')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/signup"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-user-plus"></i>
                  {getText('about.cta.join')}
                </Link>
                <Link 
                  href="/contact"
                  className="bg-transparent border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-envelope"></i>
                  {getText('about.cta.contact')}
                </Link>
              </div>
            </div>
          </div>
        </section>


        
        <Footer />
      </div>
    </>
  );
};

export default AboutPage;