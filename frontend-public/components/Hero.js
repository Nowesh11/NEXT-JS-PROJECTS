'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { AccessibilityProvider } from './AccessibilityProvider';
// Import micro-interaction components from MicroInteractions.js
import { 
  FloatingActionButton,
  ParallaxElement as ParallaxSection,
  MagneticButton as MicroInteractionButton,
  InteractiveCard as GlowingCard,
  ScrollReveal, 
  TypewriterText, 
  ParallaxElement, 
  MagneticButton,
  InteractiveCard,
  AnimatedCounter
} from './MicroInteractions';
import { ChevronDownIcon, SparklesIcon, GlobeAltIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAccessibility, AccessibleButton, AccessibleLink, AccessibleHeading } from './AccessibilityProvider';

const Hero = ({ language, theme, onLanguageChange, onThemeChange, getText }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const { reducedMotion, announce } = useAccessibility();
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '30%']), springConfig);

  const heroSlides = [
    {
      title: getText('hero.title1', 'Preserving Tamil Heritage Through Digital Innovation'),
      subtitle: getText('hero.subtitle1', 'Connecting communities, preserving culture, and fostering digital literacy'),
      gradient: 'gradient-cultural',
      icon: GlobeAltIcon
    },
    {
      title: getText('hero.title2', 'Empowering Communities Through Technology'),
      subtitle: getText('hero.subtitle2', 'Building bridges between tradition and innovation'),
      gradient: 'gradient-tamil',
      icon: UsersIcon
    },
    {
      title: getText('hero.title3', 'Digital Library & Cultural Resources'),
      subtitle: getText('hero.subtitle3', 'Access thousands of Tamil books, ebooks, and cultural materials'),
      gradient: 'gradient-digital',
      icon: BookOpenIcon
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoading(false);
    
    // Announce page load to screen readers
    announce('Tamil Language Society homepage loaded');
    
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    const handleMouseMove = (e) => {
      if (!reducedMotion) {
        const rect = heroRef.current?.getBoundingClientRect();
        if (rect) {
          setMousePosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }
      }
    };

    const heroElement = heroRef.current;
    if (!reducedMotion && heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      clearInterval(slideTimer);
      if (!reducedMotion && heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [reducedMotion, heroSlides.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-secondary-800 to-primary-800"
      aria-label="Hero section - Tamil Language Society homepage"
      role="banner"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      {/* Animated Background Elements */}
      <div className="absolute inset-0" aria-hidden={true}>
        {/* Glassmorphism Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-secondary-400/25 to-accent-400/25 rounded-full blur-2xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Abstract Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-32 h-32 border border-white/10 rotate-45"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(10px)',
          }}
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/5 w-24 h-24 rounded-full border-2 border-white/20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
            backdropFilter: 'blur(5px)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Interactive Mouse Gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        style={{ y, opacity, scale }}
        className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!isLoading ? "visible" : "hidden"}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Dynamic Hero Slides */}
          <motion.div 
            key={currentSlide}
            variants={itemVariants}
            className="mb-12"
          >
            {/* Icon */}
            <motion.div 
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="glass-morphism p-4 rounded-2xl">
                {React.createElement(heroSlides[currentSlide].icon, {
                  className: "w-12 h-12 text-white"
                })}
              </div>
            </motion.div>

            {/* Main Heading */}
            <AccessibleHeading
              level={1}
              className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
            >
              <span className={`bg-clip-text text-transparent ${heroSlides[currentSlide].gradient}`}>
                {heroSlides[currentSlide].title}
              </span>
            </AccessibleHeading>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed font-body">
              {heroSlides[currentSlide].subtitle}
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="#explore" className="glass-button px-10 py-5 rounded-2xl font-semibold text-lg text-white flex items-center gap-3 group">
                <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>{getText('hero.cta.explore', 'Explore Our Work')}</span>
                <ChevronDownIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="#library" className="glass-button px-10 py-5 rounded-2xl font-semibold text-lg text-white flex items-center gap-3 group">
                <BookOpenIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>{getText('hero.cta.library', 'Digital Library')}</span>
                <ChevronDownIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats Section */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="glass-morphism p-6 rounded-2xl text-center card-hover"
                whileHover={{ y: -5 }}
              >
                <AnimatedCounter end={1000} duration={2000} className="text-3xl font-bold gradient-cultural bg-clip-text text-transparent" />
                <p className="text-gray-300 text-sm mt-2 font-medium">{getText('hero.stats.books', 'Tamil Books')}</p>
              </motion.div>
              <motion.div 
                className="glass-morphism p-6 rounded-2xl text-center card-hover"
                whileHover={{ y: -5 }}
              >
                <AnimatedCounter end={500} duration={2000} className="text-3xl font-bold gradient-digital bg-clip-text text-transparent" />
                <p className="text-gray-300 text-sm mt-2 font-medium">{getText('hero.stats.ebooks', 'Digital E-Books')}</p>
              </motion.div>
              <motion.div 
                className="glass-morphism p-6 rounded-2xl text-center card-hover"
                whileHover={{ y: -5 }}
              >
                <AnimatedCounter end={50} duration={2000} className="text-3xl font-bold gradient-primary bg-clip-text text-transparent" />
                <p className="text-gray-300 text-sm mt-2 font-medium">{getText('hero.stats.projects', 'Active Projects')}</p>
              </motion.div>
              <motion.div 
                className="glass-morphism p-6 rounded-2xl text-center card-hover"
                whileHover={{ y: -5 }}
              >
                <AnimatedCounter end={10000} duration={2000} className="text-3xl font-bold gradient-emerald bg-clip-text text-transparent" />
                <p className="text-gray-300 text-sm mt-2 font-medium">{getText('hero.stats.members', 'Community Members')}</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center gap-3 mt-12"
          >
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        role="button"
        tabIndex={0}
        aria-label={getText('Scroll down to explore more content', 'மேலும் உள்ளடக்கத்தை ஆராய்வதற்கு கீழே ஸ்க்ரோல் செய்யவும்')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center cursor-pointer"
          animate={!reducedMotion ? { y: [0, 5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
            animate={!reducedMotion ? { scaleY: [1, 0.5, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <p className="text-white/50 text-xs mt-2 text-center">
          {getText('Scroll to explore', 'ஆராய்வதற்கு ஸ்க்ரோல் செய்யவும்')}
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;