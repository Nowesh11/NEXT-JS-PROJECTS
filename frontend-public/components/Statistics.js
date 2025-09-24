import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../contexts/ContentContext';
import { ContentContext } from '../contexts/ContentContext';
import { useStatistics } from '../hooks/useApi';
import { AnimatedCard, StaggeredList, AnimatedGradientText } from './AnimatedSection';

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

  const contentContext = useContext(ContentContext);
  
  // Provide fallback values if context is not available (SSR)
  const getContentValue = contentContext?.getContentValue || ((key, fallback) => fallback || key);

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
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-cyan-950/50" ref={sectionRef}>
        <div className="container mx-auto px-6">
          <motion.div 
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.p 
              className="mt-6 text-lg text-gray-600 dark:text-gray-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading statistics...
            </motion.p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-cyan-950/50" ref={sectionRef}>
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <AnimatedGradientText
            text="Our Impact"
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
          />
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover the numbers that showcase our commitment to Tamil literature and culture
          </motion.p>
        </motion.div>

        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {defaultStats.map((stat, index) => {
            const targetValue = getStatValue(stat.key, stat.defaultValue);
            const currentValue = animatedValues[stat.key] || 0;
            const label = getContentValue(stat.labelKey, stat.defaultLabel);
            
            return (
              <AnimatedCard
                key={stat.key}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/30 overflow-hidden p-8 text-center"
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  rotateY: 5
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                delay={index * 0.1}
              >
                {/* Icon */}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 10,
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <i className={`${stat.icon} text-white text-2xl`}></i>
                </motion.div>

                {/* Number */}
                <motion.div 
                  className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    delay: index * 0.1 + 0.3
                  }}
                  viewport={{ once: true }}
                >
                  {currentValue.toLocaleString()}
                  {stat.key === 'yearsCount' && currentValue > 0 && '+'}
                </motion.div>

                {/* Label */}
                <motion.div 
                  className="text-gray-600 dark:text-gray-300 font-medium text-lg uppercase tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.5 
                  }}
                  viewport={{ once: true }}
                >
                  {label}
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                />

                {/* Progress Bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-b-2xl"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ 
                    duration: 1.5, 
                    delay: index * 0.1 + 0.8,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                />

                {/* Error Indicator */}
                {error && (
                  <motion.div 
                    className="absolute top-4 right-4 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    title="Using cached data"
                  >
                    <i className="fas fa-exclamation-triangle text-white text-xs"></i>
                  </motion.div>
                )}
              </AnimatedCard>
            );
          })}
        </StaggeredList>
        
        {/* Loading Indicator */}
        {statsLoading && (
          <motion.div 
            className="flex items-center justify-center gap-3 mt-12 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 w-fit mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.i 
              className="fas fa-spinner text-emerald-600 text-xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Updating statistics...
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-cyan-600/10 rounded-full blur-2xl"
        animate={{ 
          y: [0, 15, 0],
          x: [0, -15, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 9, repeat: Infinity, delay: 3 }}
      />
    </section>
  );
};

export default Statistics;