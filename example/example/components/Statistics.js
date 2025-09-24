import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../contexts/ContentContext';
import { useStatistics } from '../hooks/useApi';
import styles from '../styles/Statistics.module.css';

const Statistics = () => {
  const { content, loading: contentLoading } = useContent();
  const { data: statisticsData, loading: statsLoading, error } = useStatistics();
  const [animatedValues, setAnimatedValues] = useState({});
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Default statistics data
  const defaultStats = [
    {
      key: 'booksCount',
      labelKey: 'homepage.statistics.booksLabel',
      defaultValue: 50,
      defaultLabel: 'Digital Books',
      icon: 'fas fa-book'
    },
    {
      key: 'membersCount',
      labelKey: 'homepage.statistics.membersLabel',
      defaultValue: 150,
      defaultLabel: 'Community Members',
      icon: 'fas fa-users'
    },
    {
      key: 'yearsCount',
      labelKey: 'homepage.statistics.yearsLabel',
      defaultValue: 3,
      defaultLabel: 'Years of Service',
      icon: 'fas fa-calendar-alt'
    },
    {
      key: 'projectsCount',
      labelKey: 'homepage.statistics.projectsLabel',
      defaultValue: 15,
      defaultLabel: 'Active Projects',
      icon: 'fas fa-project-diagram'
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

  const getStatValue = (key, defaultValue) => {
    if (statisticsData && statisticsData[key] !== undefined) {
      return parseInt(statisticsData[key]) || defaultValue;
    }
    return defaultValue;
  };

  // Animate counter function
  const animateCounter = (targetValue, key, duration = 2000) => {
    const startTime = Date.now();
    const startValue = 0;
    
    const updateCounter = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
      
      setAnimatedValues(prev => ({
        ...prev,
        [key]: currentValue
      }));
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            // Start animations for all counters
            defaultStats.forEach((stat) => {
              const targetValue = getStatValue(stat.key, stat.defaultValue);
              animateCounter(targetValue, stat.key);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated, statisticsData]);

  // Initialize animated values
  useEffect(() => {
    const initialValues = {};
    defaultStats.forEach((stat) => {
      initialValues[stat.key] = 0;
    });
    setAnimatedValues(initialValues);
  }, []);

  if (contentLoading) {
    return (
      <section className={styles.stats} ref={sectionRef}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading statistics...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.stats} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.statsGrid}>
          {defaultStats.map((stat, index) => {
            const targetValue = getStatValue(stat.key, stat.defaultValue);
            const currentValue = animatedValues[stat.key] || 0;
            const label = getContentValue(stat.labelKey, stat.defaultLabel);
            
            return (
              <div 
                key={stat.key}
                className={`${styles.statItem} ${styles.cardMorphism} ${styles.animateSlideInUp} ${styles.hoverLift} ${styles.hoverGlow}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.statIcon}>
                  <i className={stat.icon}></i>
                </div>
                <div className={`${styles.statNumber} ${styles.animateCounter} ${styles.animateTextGlow}`}>
                  {currentValue.toLocaleString()}
                  {stat.key === 'yearsCount' && currentValue > 0 && '+'}
                </div>
                <div className={`${styles.statLabel} ${styles.animateFadeIn} ${styles.animateStagger1}`}>
                  {label}
                </div>
                {error && (
                  <div className={styles.errorIndicator} title="Using cached data">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {statsLoading && (
          <div className={styles.loadingIndicator}>
            <i className="fas fa-spinner fa-spin"></i>
            <span>Updating statistics...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Statistics;