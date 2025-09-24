import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ContentContext } from '../contexts/ContentContext';
import PosterDisplay from './PosterDisplay';

const PosterSection = () => {
  const languageContext = useContext(LanguageContext);
  const themeContext = useContext(ThemeContext);
  const contentContext = useContext(ContentContext);
  
  // Provide fallback values if contexts are not available (SSR)
  const language = languageContext?.language || 'en';
  const theme = themeContext?.theme || 'light';
  const content = contentContext?.content || {};
  
  const [posters, setPosters] = useState([]);
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Get content text
  const getText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  // Fetch posters from API
  useEffect(() => {
    const fetchPosters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/posters/active?language=${language}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setPosters(data.data);
          setCurrentPosterIndex(0);
        } else {
          setError(data.message || 'Failed to load posters');
        }
      } catch (err) {
        console.error('Error fetching posters:', err);
        setError('Failed to load posters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosters();
  }, [language]);

  // Auto-rotate posters
  useEffect(() => {
    if (posters.length > 1 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentPosterIndex((prevIndex) => 
          prevIndex === posters.length - 1 ? 0 : prevIndex + 1
        );
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [posters.length, isPlaying]);

  const nextPoster = () => {
    setCurrentPosterIndex((prevIndex) => 
      prevIndex === posters.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevPoster = () => {
    setCurrentPosterIndex((prevIndex) => 
      prevIndex === 0 ? posters.length - 1 : prevIndex - 1
    );
  };

  const goToPoster = (index) => {
    setCurrentPosterIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentPoster = posters[currentPosterIndex];

  if (isLoading) {
    return (
      <section className="poster-section loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{getText('loading', 'Loading posters...')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="poster-section error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>{getText('error_title', 'Something went wrong')}</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (posters.length === 0) {
    return (
      <section className="poster-section empty">
        <div className="container">
          <div className="empty-content">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>{getText('no_posters_title', 'No Posters Available')}</h3>
            <p>{getText('no_posters_description', 'Check back later for new posters')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="poster-section">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            {getText('posters_section_title', 'Featured Posters')}
          </h2>
          <p className="section-description">
            {getText('posters_section_description', 'Discover beautiful Tamil cultural artwork and educational content')}
          </p>
        </motion.div>

        {/* Poster Display */}
        <div className="poster-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPosterIndex}
              className="poster-card"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6
              }}
            >
              {/* Poster Content */}
              <div className="poster-content">
                <PosterDisplay 
                  poster={{
                    ...currentPoster,
                    title: currentPoster.title?.[language] || currentPoster.title?.en || currentPoster.title,
                    description: currentPoster.description?.[language] || currentPoster.description?.en || currentPoster.description
                  }} 
                />
              </div>

              {/* Navigation Controls */}
              {posters.length > 1 && (
                <>
                  <button
                    className="nav-btn prev-btn"
                    onClick={prevPoster}
                    aria-label="Previous poster"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button
                    className="nav-btn next-btn"
                    onClick={nextPoster}
                    aria-label="Next poster"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Play/Pause Button */}
              {posters.length > 1 && (
                <button
                  className="play-pause-btn"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                      <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              )}

              {/* Decorative Elements */}
              <div className="decorative-elements">
                <div className="decoration decoration-1"></div>
                <div className="decoration decoration-2"></div>
                <div className="decoration decoration-3"></div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Poster Indicators */}
          {posters.length > 1 && (
            <div className="poster-indicators">
              {posters.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentPosterIndex ? 'active' : ''}`}
                  onClick={() => goToPoster(index)}
                  aria-label={`Go to poster ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Poster Info */}
          {currentPoster && (
            <motion.div 
              className="poster-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="poster-title">
                {currentPoster.title?.[language] || currentPoster.title?.en || currentPoster.title}
              </h3>
              <p className="poster-description">
                {currentPoster.description?.[language] || currentPoster.description?.en || currentPoster.description}
              </p>
              {currentPoster.category && (
                <span className="poster-category">
                  {currentPoster.category?.[language] || currentPoster.category?.en || currentPoster.category}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Background Elements */}
        <div className="background-elements">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="bg-element bg-element-3"></div>
        </div>
      </div>

      <style jsx>{`
        .poster-section {
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
          background: var(--bg-surface);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-description {
          font-size: clamp(1.125rem, 2vw, 1.5rem);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .poster-container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        .poster-card {
          position: relative;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          border: 1px solid var(--border-primary);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }

        .poster-content {
          padding: 2rem;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: var(--bg-glass-strong);
          backdrop-filter: blur(20px);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .nav-btn:hover {
          background: var(--bg-surface-elevated);
          transform: translateY(-50%) scale(1.1);
        }

        .prev-btn {
          left: 1rem;
        }

        .next-btn {
          right: 1rem;
        }

        .play-pause-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: var(--bg-glass-strong);
          backdrop-filter: blur(20px);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .play-pause-btn:hover {
          background: var(--bg-surface-elevated);
          transform: scale(1.1);
        }

        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 8s ease-in-out infinite;
        }

        .decoration-1 {
          top: 10%;
          right: 10%;
          width: 100px;
          height: 100px;
          background: var(--gradient-primary);
          animation-delay: 0s;
        }

        .decoration-2 {
          bottom: 20%;
          left: 15%;
          width: 80px;
          height: 80px;
          background: var(--gradient-secondary);
          animation-delay: 2s;
        }

        .decoration-3 {
          top: 30%;
          left: 10%;
          width: 60px;
          height: 60px;
          background: var(--gradient-accent);
          animation-delay: 4s;
        }

        .poster-indicators {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 50%;
          background: var(--text-muted);
          opacity: 0.5;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: var(--primary-500);
          opacity: 1;
          transform: scale(1.2);
        }

        .indicator:hover {
          opacity: 0.8;
          transform: scale(1.1);
        }

        .poster-info {
          text-align: center;
          margin-top: 3rem;
          padding: 2rem;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid var(--border-primary);
        }

        .poster-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .poster-description {
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .poster-category {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--gradient-button);
          color: white;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .background-elements {
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
          opacity: 0.05;
          animation: float 12s ease-in-out infinite;
        }

        .bg-element-1 {
          top: 10%;
          left: 10%;
          width: 200px;
          height: 200px;
          background: var(--gradient-primary);
          animation-delay: 0s;
        }

        .bg-element-2 {
          bottom: 20%;
          right: 15%;
          width: 150px;
          height: 150px;
          background: var(--gradient-secondary);
          animation-delay: 4s;
        }

        .bg-element-3 {
          top: 50%;
          right: 10%;
          width: 100px;
          height: 100px;
          background: var(--gradient-accent);
          animation-delay: 8s;
        }

        .loading, .error, .empty {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content, .error-content, .empty-content {
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border-primary);
          border-top: 4px solid var(--primary-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .error-icon, .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .error-content h3, .empty-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .error-content p, .empty-content p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .poster-section {
            padding: 3rem 0;
          }

          .container {
            padding: 0 1rem;
          }

          .poster-content {
            padding: 1.5rem;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
          }

          .prev-btn {
            left: 0.5rem;
          }

          .next-btn {
            right: 0.5rem;
          }

          .poster-info {
            margin-top: 2rem;
            padding: 1.5rem;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default PosterSection;