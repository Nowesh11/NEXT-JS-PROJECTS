import React, { useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContent } from '../contexts/ContentContext';
import { ContentContext } from '../contexts/ContentContext';
import { AnimatedCard, StaggeredList } from './AnimatedSection';

const Features = () => {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 dark:border-red-200 dark:border-t-red-600 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-lg font-medium text-slate-700 dark:text-slate-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading features...
            </motion.p>
          </motion.div>
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

  const contentContext = useContext(ContentContext);
  
  // Provide fallback values if context is not available (SSR)
  const getContentValue = contentContext?.getContentValue || ((key, fallback) => fallback || key);

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 dark:from-slate-900/50 dark:via-red-950/30 dark:to-pink-950/50" id="features">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-red-400 dark:to-pink-400 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-indigo-400 to-blue-400 dark:from-rose-400 dark:to-red-400 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-800 dark:from-red-600 dark:via-pink-500 dark:to-red-800 bg-clip-text text-transparent">
              {getContentValue('features.title', 'Our Services')}
            </span>
          </motion.h2>
          
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-red-500 dark:to-pink-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
        </motion.div>
        
        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <AnimatedCard
              key={index}
              delay={index * 0.1}
              className="group"
            >
              <motion.div 
                className="relative p-8 h-full bg-white/10 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 hover:bg-white/20 dark:hover:bg-slate-900/30 transition-all duration-300 overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-600/5 dark:from-red-500/5 dark:via-pink-500/5 dark:to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <motion.div 
                  className="relative z-10 w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-red-500 dark:to-pink-500 text-white shadow-lg"
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <i className={`${feature.icon} text-2xl`}></i>
                </motion.div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  <motion.h3 
                    className="text-xl font-bold mb-4 text-slate-800 dark:text-white"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {getContentValue(feature.titleKey, feature.titleKey.split('.').pop())}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {getContentValue(feature.descriptionKey, 'Feature description')}
                  </motion.p>
                  
                  <Link href={feature.href}>
                    <motion.span
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-red-500 dark:to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getContentValue(feature.linkKey, 'Learn More')}
                      <motion.i 
                        className="fas fa-arrow-right"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.span>
                  </Link>
                </div>
                
                {/* Hover Effect Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 dark:from-red-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  initial={false}
                />
              </motion.div>
            </AnimatedCard>
          ))}
        </StaggeredList>
      </div>
    </section>
  );
};

export default Features;