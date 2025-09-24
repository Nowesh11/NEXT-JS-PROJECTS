import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../contexts/ContentContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useActivePoster } from '../hooks/useApi';
import { AnimatedCard, AnimatedGradientText } from './AnimatedSection';

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
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-red-50/50 via-rose-50/30 to-pink-50/50 dark:from-red-950/50 dark:via-rose-950/30 dark:to-pink-950/50" id="announcements-section">
        <div className="container mx-auto px-6">
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[300px] text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
            </motion.div>
            <motion.p 
              className="text-lg text-slate-600 dark:text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Unable to load content. Please try again later.
            </motion.p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 dark:from-slate-900/50 dark:via-blue-950/30 dark:to-cyan-950/50" id="announcements-section">
        <div className="container mx-auto px-6">
          <motion.div 
            className="flex justify-center items-center min-h-[400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-4xl">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-white/10 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Skeleton Image */}
                <motion.div 
                  className="aspect-video rounded-xl overflow-hidden"
                  animate={{ 
                    background: [
                      'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                      'linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 75%)',
                      'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)'
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Skeleton Content */}
                <div className="flex flex-col justify-center space-y-6">
                  <motion.div 
                    className="h-8 rounded-lg"
                    animate={{ 
                      background: [
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)'
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                    style={{ width: '80%' }}
                  />
                  
                  <motion.div 
                    className="h-6 rounded-lg"
                    animate={{ 
                      background: [
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)'
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4
                    }}
                  />
                  
                  <motion.div 
                    className="h-12 rounded-full"
                    animate={{ 
                      background: [
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 75%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)'
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                    style={{ width: '150px' }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Get the image URL based on display type
  const imageUrl = displayType === 'poster' ? 
    (displayItem.file?.url || displayItem.image?.url || displayItem.image || '/assets/poster-default.jpg') : 
    displayItem.image;
    
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-blue-50/50 dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-blue-950/50" id="announcements-section">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-purple-400 to-indigo-400 dark:from-purple-400 dark:to-indigo-400 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-indigo-400 to-blue-400 dark:from-indigo-400 dark:to-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedCard delay={0.2} className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-white/10 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 hover:bg-white/15 dark:hover:bg-slate-900/25 transition-all duration-300 overflow-hidden group"
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 dark:from-purple-500/5 dark:via-indigo-500/5 dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Image Section */}
            <motion.div 
              className="relative overflow-hidden rounded-xl aspect-video lg:aspect-square"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.img 
                src={imageUrl} 
                alt={displayItem.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23f0f0f0"/%3E%3Ctext x="200" y="100" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            
            {/* Content Section */}
            <motion.div 
              className="flex flex-col justify-center relative z-10"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-block px-3 py-1 text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white rounded-full">
                  {displayType === 'poster' ? 'Featured Poster' : 'Latest Announcement'}
                </span>
              </motion.div>
              
              <AnimatedGradientText
                text={displayItem.title}
                className="text-3xl lg:text-4xl font-bold mb-6 text-slate-800 dark:text-white leading-tight"
                gradientFrom="from-purple-600"
                gradientVia="via-indigo-500"
                gradientTo="to-blue-600"
                darkGradientFrom="dark:from-purple-400"
                darkGradientVia="dark:via-indigo-400"
                darkGradientTo="dark:to-blue-400"
              />
              
              <motion.p 
                className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                {displayItem.description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <motion.a 
                  href={displayItem.url} 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer group/btn"
                  target={displayItem.url?.startsWith('http') ? '_blank' : '_self'}
                  rel={displayItem.url?.startsWith('http') ? 'noopener noreferrer' : ''}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{displayItem.buttonText}</span>
                  <motion.i 
                    className="fas fa-arrow-right"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              </motion.div>
            </motion.div>
            
            {/* Decorative Elements */}
            <motion.div 
              className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </AnimatedCard>
      </div>
    </section>
  );
};

export default AnnouncementsSection;