import React, { useState, useEffect } from 'react';
import styles from '../styles/AnnouncementsSection.module.css';
import { useContent } from '../contexts/ContentContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useActivePoster } from '../hooks/useApi';

const AnnouncementsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayType, setDisplayType] = useState('announcement'); // 'announcement' or 'poster'
  const { content, loading: contentLoading } = useContent();
  const { announcements, loading: announcementsLoading, error: announcementsError } = useAnnouncements();
  const { data: posterData, loading: posterLoading, error: posterError } = useActivePoster();

  // Get the latest announcement
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  // Default announcement data
  const defaultAnnouncement = {
    title: content?.homepage?.announcements?.title || 'Latest Announcement',
    description: content?.homepage?.announcements?.description || 'Stay updated with our latest news and events.',
    image: content?.homepage?.announcements?.image || '/assets/announcement-default.jpg',
    url: content?.homepage?.announcements?.url || '#',
    buttonText: content?.homepage?.announcements?.buttonText || 'Learn More'
  };

  // Default poster data
  const defaultPoster = {
    title: content?.homepage?.posters?.title || 'Featured Poster',
    description: content?.homepage?.posters?.description || 'Check out our latest poster.',
    image: content?.homepage?.posters?.image || '/assets/poster-default.jpg',
    url: content?.homepage?.posters?.url || '#',
    buttonText: content?.homepage?.posters?.buttonText || 'View Poster'
  };

  // Use API data if available, otherwise use default
  const announcement = latestAnnouncement || defaultAnnouncement;
  const poster = posterData?.data || defaultPoster;
  
  // Determine what to display based on availability
  useEffect(() => {
    // If we have a poster, show it; otherwise show announcement
    if (posterData?.data && !posterError) {
      setDisplayType('poster');
    } else {
      setDisplayType('announcement');
    }
  }, [posterData, posterError]);
  
  // Determine what to display
  const displayItem = displayType === 'poster' ? poster : announcement;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('announcements-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const isLoading = contentLoading || announcementsLoading || posterLoading;
  const error = announcementsError || posterError;
  
  if (error) {
    return (
      <section className={styles.announcementsSection} id="announcements-section">
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>Unable to load content. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={styles.announcementsSection} id="announcements-section">
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSkeleton}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonButton}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get the image URL based on display type
  const imageUrl = displayType === 'poster' ? 
    (displayItem.file?.url || displayItem.image?.url || displayItem.image || '/assets/poster-default.jpg') : 
    displayItem.image;
    
  return (
    <section className={`${styles.announcementsSection} ${displayType === 'poster' ? styles.posterDisplay : ''}`} id="announcements-section">
      <div className={styles.container}>
        <div className={`${styles.announcementCard} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.announcementImage}>
            <img 
              src={imageUrl} 
              alt={displayItem.title}
              className={styles.image}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23f0f0f0"/%3E%3Ctext x="200" y="100" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="%23666"%3E' + (displayType === 'poster' ? 'Poster' : 'Announcement') + ' Image%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <div className={styles.announcementContent}>
            <h2 className={styles.title}>{displayItem.title}</h2>
            <p className={styles.description}>{displayItem.description}</p>
            <a 
              href={displayItem.url} 
              className={styles.button}
              target={displayItem.url?.startsWith('http') ? '_blank' : '_self'}
              rel={displayItem.url?.startsWith('http') ? 'noopener noreferrer' : ''}
            >
              <span>{displayItem.buttonText}</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;