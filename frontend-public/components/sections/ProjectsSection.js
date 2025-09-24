'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  RocketLaunchIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  SparklesIcon,
  CodeBracketIcon,
  BookOpenIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ProjectsSection = ({ getText, language }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredProject, setHoveredProject] = useState(null);

  const filters = [
    { id: 'all', label: getText('projects.filter.all', 'All Projects'), icon: SparklesIcon },
    { id: 'digital', label: getText('projects.filter.digital', 'Digital Innovation'), icon: CodeBracketIcon },
    { id: 'education', label: getText('projects.filter.education', 'Education'), icon: BookOpenIcon },
    { id: 'community', label: getText('projects.filter.community', 'Community'), icon: UserGroupIcon },
    { id: 'research', label: getText('projects.filter.research', 'Research'), icon: GlobeAltIcon }
  ];

  const projects = [
    {
      id: 1,
      title: getText('projects.tamilai.title', 'Tamil AI Language Model'),
      description: getText('projects.tamilai.desc', 'Advanced AI model specifically trained for Tamil language processing, translation, and content generation'),
      category: 'digital',
      status: 'active',
      participants: 25,
      startDate: '2024-01-15',
      image: '/assets/projects/tamil-ai.jpg',
      tags: ['AI', 'NLP', 'Tamil', 'Machine Learning'],
      gradient: 'gradient-digital',
      progress: 75
    },
    {
      id: 2,
      title: getText('projects.library.title', 'Digital Tamil Library'),
      description: getText('projects.library.desc', 'Comprehensive digital archive of Tamil literature, manuscripts, and cultural documents'),
      category: 'education',
      status: 'active',
      participants: 40,
      startDate: '2023-08-20',
      image: '/assets/projects/digital-library.jpg',
      tags: ['Library', 'Archive', 'Literature', 'Heritage'],
      gradient: 'gradient-cultural',
      progress: 90
    },
    {
      id: 3,
      title: getText('projects.youth.title', 'Tamil Youth Connect'),
      description: getText('projects.youth.desc', 'Engaging young Tamil speakers through interactive cultural programs and language learning initiatives'),
      category: 'community',
      status: 'active',
      participants: 150,
      startDate: '2024-03-10',
      image: '/assets/projects/youth-connect.jpg',
      tags: ['Youth', 'Culture', 'Education', 'Community'],
      gradient: 'gradient-tamil',
      progress: 60
    },
    {
      id: 4,
      title: getText('projects.linguistics.title', 'Tamil Linguistics Research'),
      description: getText('projects.linguistics.desc', 'Advanced research on Tamil phonetics, grammar evolution, and dialectical variations'),
      category: 'research',
      status: 'planning',
      participants: 12,
      startDate: '2024-06-01',
      image: '/assets/projects/linguistics.jpg',
      tags: ['Research', 'Linguistics', 'Academia', 'Analysis'],
      gradient: 'gradient-emerald',
      progress: 25
    },
    {
      id: 5,
      title: getText('projects.mobile.title', 'Tamil Learning Mobile App'),
      description: getText('projects.mobile.desc', 'Interactive mobile application for learning Tamil language with gamification and AR features'),
      category: 'digital',
      status: 'active',
      participants: 18,
      startDate: '2024-02-14',
      image: '/assets/projects/mobile-app.jpg',
      tags: ['Mobile', 'App', 'Learning', 'Gamification'],
      gradient: 'gradient-primary',
      progress: 80
    },
    {
      id: 6,
      title: getText('projects.heritage.title', 'Cultural Heritage Documentation'),
      description: getText('projects.heritage.desc', 'Systematic documentation and preservation of Tamil cultural practices, festivals, and traditions'),
      category: 'community',
      status: 'active',
      participants: 35,
      startDate: '2023-11-05',
      image: '/assets/projects/heritage.jpg',
      tags: ['Heritage', 'Documentation', 'Culture', 'Preservation'],
      gradient: 'gradient-cultural',
      progress: 70
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'planning': return 'bg-tamil-500';
      case 'completed': return 'bg-digital-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return getText('projects.status.active', 'Active');
      case 'planning': return getText('projects.status.planning', 'Planning');
      case 'completed': return getText('projects.status.completed', 'Completed');
      default: return status;
    }
  };

  return (
    <section 
      id="projects" 
      className="relative py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden"
      aria-labelledby="projects-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-3" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cultural-500 via-digital-500 to-tamil-500" />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-32 right-20 w-24 h-24 bg-digital-500/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-32 left-20 w-32 h-32 bg-cultural-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <RocketLaunchIcon className="w-5 h-5 text-digital-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getText('projects.badge', 'Our Projects & Initiatives')}
            </span>
          </motion.div>
          
          <h2 
            id="projects-heading"
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            <span className="gradient-digital bg-clip-text text-transparent">
              {getText('projects.title', 'Innovative Projects')}
            </span>
            <br />
            <span className="text-gray-800 dark:text-white">
              {getText('projects.subtitle', 'Shaping Tamil Future')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {getText(
              'projects.description', 
              'Explore our cutting-edge initiatives that blend traditional Tamil wisdom with modern technology, creating impactful solutions for language preservation and community growth.'
            )}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'glass-morphism text-cultural-600 dark:text-cultural-400 shadow-cultural'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-5 h-5" />
                {filter.label}
                {activeFilter === filter.id && (
                  <motion.div
                    className="w-2 h-2 bg-cultural-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="group"
                onHoverStart={() => setHoveredProject(project.id)}
                onHoverEnd={() => setHoveredProject(null)}
              >
                <motion.div 
                  className="glass-morphism rounded-3xl overflow-hidden h-full card-hover relative"
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className={`absolute inset-0 ${project.gradient} opacity-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {getStatusText(project.status)}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="flex items-center justify-between text-white text-xs mb-2">
                        <span>{getText('projects.progress', 'Progress')}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div 
                          className="bg-white rounded-full h-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                    
                    {/* Placeholder for project image */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <RocketLaunchIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-cultural-600 dark:group-hover:text-cultural-400 transition-colors">
                        {project.title}
                      </h3>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 45 }}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-cultural-100 dark:group-hover:bg-cultural-900 transition-colors cursor-pointer"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-cultural-600 dark:group-hover:text-cultural-400" />
                      </motion.div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>
                    
                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{project.participants} {getText('projects.participants', 'participants')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <motion.button
                      className="w-full glass-button py-3 rounded-xl font-medium text-sm text-gray-800 dark:text-white group-hover:text-cultural-600 dark:group-hover:text-cultural-400 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {getText('projects.join', 'Join Project')}
                    </motion.button>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cultural-500 to-digital-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
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
              <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {getText('projects.cta', 'View All Projects')}
              <motion.div
                className="w-2 h-2 bg-digital-500 rounded-full"
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

export default ProjectsSection;