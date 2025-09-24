import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useContent } from '../contexts/ContentContext';

const HeroSection = ({ page = 'home', section = 'hero' }) => {
  // Use custom hooks with proper error handling
  const { language, t: getText } = useLanguage();
  const { theme } = useTheme();
  const { content } = useContent();
  
  const [slideshow, setSlideshow] = useState(null);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch slideshow data (for background images only)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch slideshow for background images
        const slideshowResponse = await fetch(`/api/slideshow?page=${page}&section=${section}&language=${language}`);
        const slideshowData = await slideshowResponse.json();
        
        // Fetch website content for text overlay
        const contentResponse = await fetch(`/api/website-content/sections/${page}`);
        const contentData = await contentResponse.json();
        
        if (slideshowData.success) {
          setSlideshow(slideshowData.data.slideshow);
          setCurrentSlide(0);
        }
        
        if (contentData.success) {
          setWebsiteContent(contentData.data);
        }
        
        if (!slideshowData.success && !contentData.success) {
          setError('Failed to load content');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, section, language]);

  // Auto-play functionality
  useEffect(() => {
    if (slideshow && slideshow.autoPlay && isPlaying && slideshow.slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideshow.slides.length);
      }, slideshow.interval || 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slideshow, isPlaying]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshow.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshow.slides.length) % slideshow.slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Get content text from website content API
  const getWebsiteText = (key, defaultValue = '') => {
    if (websiteContent && websiteContent.hero && websiteContent.hero[key]) {
      return websiteContent.hero[key][language] || websiteContent.hero[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  // Get content text from context (fallback)
  const getContentText = (key, defaultValue = '') => {
    if (content && content[key]) {
      return content[key][language] || content[key]['en'] || defaultValue;
    }
    return defaultValue;
  };

  // Get slide text in current language
  const getSlideText = (slideData, field, defaultValue = '') => {
    if (slideData && slideData[field]) {
      if (typeof slideData[field] === 'object') {
        return slideData[field][language] || slideData[field]['en'] || defaultValue;
      }
      return slideData[field] || defaultValue;
    }
    return defaultValue;
  };

  // Fallback slides for when API fails
  // Removed hardcoded fallback slides - all content now comes from database

  if (loading) {
    return (
      <div className="hero-section loading-hero">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{getContentText('loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Use slideshow data from database
  const slidesToUse = slideshow && slideshow.slides.length > 0 ? slideshow.slides : [];
  
  if (slidesToUse.length === 0) {
    return (
      <div className="hero-section error-hero">
        <div className="container">
          <div className="error-content">
            <p>{error || 'No slides available'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const currentSlideData = slidesToUse[currentSlide];

  return (
    <div className="hero-section slideshow-hero" ref={heroRef}>
      {/* Background Slideshow */}
      <div className="slideshow-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="slide-background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            style={{
              backgroundImage: currentSlideData.backgroundImage 
                ? `url(${currentSlideData.backgroundImage})` 
                : 'none',
              background: currentSlideData.backgroundColor || 'var(--gradient-hero)'
            }}
          />
        </AnimatePresence>
        
        {/* Gradient Overlay */}
        <div className="gradient-overlay"></div>
        
        {/* Parallax Layers */}
        <div className="parallax-layers">
          <div 
            className="parallax-layer layer-1"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
            }}
          />
          <div 
            className="parallax-layer layer-2"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
            }}
          />
          <div 
            className="parallax-layer layer-3"
            style={{
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="floating-particles">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 4 + 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="hero-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="slide-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
            >
              {/* Display website content text overlay instead of slide text */}
              {getWebsiteText('title') && (
                <motion.h1
                  className="hero-title"
                  style={{ color: currentSlideData.textColor || 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {getWebsiteText('title')}
                </motion.h1>
              )}
              
              {getWebsiteText('subtitle') && (
                <motion.p
                  className="hero-subtitle"
                  style={{ color: currentSlideData.textColor || 'var(--text-secondary)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {getWebsiteText('subtitle')}
                </motion.p>
              )}
              
              {getWebsiteText('description') && (
                <motion.p
                  className="hero-description"
                  style={{ color: currentSlideData.textColor || 'var(--text-muted)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {getWebsiteText('description')}
                </motion.p>
              )}
              
              {getWebsiteText('ctaText') && getWebsiteText('ctaLink') && (
                <motion.div
                  className="hero-actions"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <a
                    href={getWebsiteText('ctaLink')}
                    className="hero-cta-button"
                    style={{
                      backgroundColor: currentSlideData.buttonColor || 'var(--primary-color)',
                      color: currentSlideData.buttonTextColor || 'white'
                    }}
                  >
                    {getWebsiteText('ctaText')}
                  </a>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      {slidesToUse.length > 1 && (
        <div className="slideshow-controls">
          <button 
            className="control-btn prev-btn"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            className="control-btn play-pause-btn"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <button 
            className="control-btn next-btn"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Indicators */}
      {slidesToUse.length > 1 && (
        <div className="slideshow-indicators">
          {slidesToUse.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .slideshow-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .slide-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gradient-hero);
          z-index: 2;
        }

        .parallax-layers {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
        }

        .parallax-layer {
          position: absolute;
          width: 120%;
          height: 120%;
          top: -10%;
          left: -10%;
          border-radius: 50%;
          opacity: 0.1;
        }

        .layer-1 {
          background: radial-gradient(circle, var(--primary-400) 0%, transparent 70%);
        }

        .layer-2 {
          background: radial-gradient(circle, var(--secondary-400) 0%, transparent 70%);
          animation-delay: 2s;
        }

        .layer-3 {
          background: radial-gradient(circle, var(--accent-400) 0%, transparent 70%);
          animation-delay: 4s;
        }

        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 4;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--gradient-button);
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

        .hero-content {
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
          z-index: 10;
          position: relative;
          padding: 2rem;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          border: 1px solid var(--border-primary);
        }

        .hero-title {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1.25rem, 2.5vw, 1.875rem);
          margin-bottom: 1rem;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-description {
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .slideshow-controls {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          z-index: 10;
        }

        .control-btn {
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
        }

        .control-btn:hover {
          background: var(--bg-surface-elevated);
          transform: scale(1.1);
        }

        .slideshow-indicators {
          position: absolute;
          bottom: 6rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: var(--primary-500);
          transform: scale(1.2);
        }

        .indicator:hover {
          background: var(--primary-400);
        }

        .loading-hero {
          background: var(--gradient-hero);
        }

        .loading-content {
          text-align: center;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 1.5rem;
            margin: 1rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .slideshow-controls {
            bottom: 1rem;
          }

          .slideshow-indicators {
            bottom: 4rem;
          }

          .control-btn {
            width: 40px;
            height: 40px;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;