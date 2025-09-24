import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const LazySection = ({ 
  children, 
  className = '', 
  threshold = 0.1, 
  rootMargin = '100px',
  fallback = null,
  animationDelay = 0,
  ...props 
}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  const defaultFallback = (
    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading content...</p>
      </div>
    </div>
  );

  return (
    <div ref={sectionRef} className={className} {...props}>
      {isInView ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: animationDelay,
            ease: "easeOut" 
          }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazySection;