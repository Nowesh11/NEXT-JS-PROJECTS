import React from 'react';
import Link from 'next/link';
import { useContent } from '../contexts/ContentContext';
import styles from '../styles/Features.module.css';

const Features = () => {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div className={styles.loading}>Loading features...</div>
        </div>
      </section>
    );
  }

  const featuresData = [
    {
      icon: 'fas fa-book-open',
      titleKey: 'homepage.features.ebooks.title',
      descriptionKey: 'homepage.features.ebooks.description',
      linkKey: 'homepage.features.ebooks.linkText',
      href: '/ebooks',
      delay: 100
    },
    {
      icon: 'fas fa-graduation-cap',
      titleKey: 'homepage.features.projects.title',
      descriptionKey: 'homepage.features.projects.description',
      linkKey: 'homepage.features.projects.linkText',
      href: '/projects',
      delay: 200
    },
    {
      icon: 'fas fa-shopping-cart',
      titleKey: 'homepage.features.bookstore.title',
      descriptionKey: 'homepage.features.bookstore.description',
      linkKey: 'homepage.features.bookstore.linkText',
      href: '/books',
      delay: 300
    },
    {
      icon: 'fas fa-hands-helping',
      titleKey: 'homepage.features.contact.title',
      descriptionKey: 'homepage.features.contact.description',
      linkKey: 'homepage.features.contact.linkText',
      href: '/contact',
      delay: 400
    }
  ];

  const getContentValue = (key, fallback = '') => {
    if (!content) return fallback;
    const keys = key.split('.');
    let value = content;
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    return value || fallback;
  };

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          <span>{getContentValue('features.title', 'Our Services')}</span>
        </h2>
        
        <div className={styles.featuresGrid}>
          {featuresData.map((feature, index) => (
            <div 
              key={index}
              className={`${styles.featureCard} ${styles.cardMorphism} ${styles.animateSlideInUp} ${styles.hoverLift} ${styles.hoverGlow}`}
              data-aos="fade-up" 
              data-aos-delay={feature.delay}
            >
              <div className={`${styles.featureIcon} ${styles.animateBounceIn} ${styles.hoverRotate}`}>
                <i className={feature.icon}></i>
              </div>
              <h3 className={`${styles.featureTitle} ${styles.animateTextGlow}`}>
                {getContentValue(feature.titleKey, feature.titleKey.split('.').pop())}
              </h3>
              <p className={`${styles.featureDescription} ${styles.animateFadeIn} ${styles.animateStagger1}`}>
                {getContentValue(feature.descriptionKey, 'Feature description')}
              </p>
              <Link href={feature.href} className={`${styles.featureLink} ${styles.btnNeon} ${styles.hoverPulse}`}>
                <span>{getContentValue(feature.linkKey, 'Learn More')}</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;