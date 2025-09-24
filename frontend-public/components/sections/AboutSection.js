'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  BookOpenIcon, 
  UsersIcon, 
  SparklesIcon,
  HeartIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AboutSection = ({ getText, language }) => {
  const features = [
    {
      icon: GlobeAltIcon,
      title: getText('about.digital.title', 'Digital Innovation'),
      description: getText('about.digital.desc', 'Leveraging modern technology to preserve and promote Tamil heritage in the digital age'),
      gradient: 'gradient-digital',
      delay: 0.1
    },
    {
      icon: HeartIcon,
      title: getText('about.cultural.title', 'Cultural Preservation'),
      description: getText('about.cultural.desc', 'Safeguarding Tamil language, literature, and traditions for future generations'),
      gradient: 'gradient-cultural',
      delay: 0.2
    },
    {
      icon: UsersIcon,
      title: getText('about.community.title', 'Community Building'),
      description: getText('about.community.desc', 'Connecting Tamil speakers worldwide through shared knowledge and experiences'),
      gradient: 'gradient-tamil',
      delay: 0.3
    },
    {
      icon: BookOpenIcon,
      title: getText('about.education.title', 'Educational Resources'),
      description: getText('about.education.desc', 'Providing comprehensive learning materials and digital libraries'),
      gradient: 'gradient-emerald',
      delay: 0.4
    },
    {
      icon: AcademicCapIcon,
      title: getText('about.research.title', 'Research & Development'),
      description: getText('about.research.desc', 'Advancing Tamil language studies through innovative research initiatives'),
      gradient: 'gradient-primary',
      delay: 0.5
    },
    {
      icon: SparklesIcon,
      title: getText('about.innovation.title', 'Future Innovation'),
      description: getText('about.innovation.desc', 'Pioneering new approaches to language preservation and cultural exchange'),
      gradient: 'gradient-mesh',
      delay: 0.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section 
      id="about" 
      className="relative py-24 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent" />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cultural-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-digital-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-tamil-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <SparklesIcon className="w-5 h-5 text-cultural-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getText('about.badge', 'About Our Mission')}
            </span>
          </motion.div>
          
          <h2 
            id="about-heading"
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            <span className="gradient-cultural bg-clip-text text-transparent">
              {getText('about.title', 'Preserving Tamil Heritage')}
            </span>
            <br />
            <span className="text-gray-800 dark:text-white">
              {getText('about.subtitle', 'Through Digital Innovation')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {getText(
              'about.description', 
              'The Tamil Language Society bridges ancient wisdom with modern technology, creating a vibrant ecosystem for Tamil language preservation, cultural exchange, and community building across the globe.'
            )}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <motion.div 
                  className="glass-morphism p-8 rounded-3xl h-full card-hover relative overflow-hidden"
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className="relative z-10 mb-6"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    <div className={`inline-flex p-4 rounded-2xl ${feature.gradient} bg-opacity-20`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-cultural-600 dark:group-hover:text-cultural-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cultural-500 to-digital-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            className="glass-button px-8 py-4 rounded-2xl font-semibold text-lg text-gray-800 dark:text-white group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-3">
              <BookOpenIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {getText('about.cta', 'Learn More About Our Mission')}
              <motion.div
                className="w-2 h-2 bg-cultural-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;