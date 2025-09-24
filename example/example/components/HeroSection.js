import React, { useState, useEffect } from 'react';
import styles from '../styles/HeroSection.module.css';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Slideshow data - can be moved to props or API later
  const slides = [
    {
      id: 1,
      title: 'Tamil Language Society',
      subtitle: 'Preserving Heritage, Embracing Future',
      description: 'Join us in celebrating and preserving the rich Tamil language and culture for future generations.',
      backgroundImage: '/images/hero-bg-1.jpg',
      ctaText: 'Explore Our Mission',
      ctaLink: '/about'
    },
    {
      id: 2,
      title: 'Cultural Programs',
      subtitle: 'Events & Celebrations',
      description: 'Participate in our vibrant cultural programs, festivals, and educational workshops.',
      backgroundImage: '/images/hero-bg-2.jpg',
      ctaText: 'View Events',
      ctaLink: '/events'
    },
    {
      id: 3,
      title: 'Educational Resources',
      subtitle: 'Learn & Grow',
      description: 'Access our comprehensive library of Tamil literature, language courses, and educational materials.',
      backgroundImage: '/images/hero-bg-3.jpg',
      ctaText: 'Start Learning',
      ctaLink: '/resources'
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  // Simulate loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <section className={styles.heroSection}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.slideshow}>
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${
              index === currentSlide ? styles.active : ''
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.backgroundImage})`
            }}
          >
            <div className={styles.slideContent}>
              <div className={styles.container}>
                <div className={styles.contentWrapper}>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <h2 className={styles.subtitle}>{slide.subtitle}</h2>
                  <p className={styles.description}>{slide.description}</p>
                  <div className={styles.ctaContainer}>
                    <a href={slide.ctaLink} className={styles.ctaButton}>
                      {slide.ctaText}
                      <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn} ${styles.prevBtn}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className={`${styles.controlBtn} ${styles.nextBtn}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.active : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel}></div>
        </div>
        <span className={styles.scrollText}>Scroll Down</span>
      </div>
    </section>
  );
};

export default HeroSection;