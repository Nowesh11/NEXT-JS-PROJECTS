import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';

const Custom404 = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showFloatingElements, setShowFloatingElements] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShowFloatingElements(true), 500);
    
    // Generate floating particles
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.7 + 0.3
    }));
    setParticles(newParticles);

    // Add mouse movement parallax effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to search results or home with query
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    setIsSearching(false);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Bilingual content
  const getText = (key) => {
    const translations = {
      en: {
        'page-title': '404 - Page Not Found | Tamil Language Society',
        'error-code': '404',
        'error-title': 'Page Not Found',
        'error-subtitle': 'Oops! The page you are looking for does not exist.',
        'error-description': 'The page you requested could not be found. It might have been moved, deleted, or you entered the wrong URL.',
        'go-home': 'Go to Homepage',
        'go-back': 'Go Back',
        'search-placeholder': 'Search our website...',
        'search-button': 'Search',
        'helpful-links': 'Helpful Links',
        'home-link': 'Home',
        'about-link': 'About Us',
        'books-link': 'Books',
        'ebooks-link': 'E-Books',
        'projects-link': 'Projects',
        'contact-link': 'Contact Us',
        'login-link': 'Login',
        'signup-link': 'Sign Up',
        'posters-link': 'Posters',
        'troubleshooting': 'Troubleshooting Tips',
        'tip1': 'Check the URL for typos',
        'tip2': 'Try using the search function',
        'tip3': 'Navigate using the menu',
        'tip4': 'Contact us if the problem persists'
      },
      ta: {
        'page-title': '404 - பக்கம் கிடைக்கவில்லை | தமிழ் மொழி சங்கம்',
        'error-code': '404',
        'error-title': 'பக்கம் கிடைக்கவில்லை',
        'error-subtitle': 'ஓஹோ! நீங்கள் தேடும் பக்கம் இல்லை.',
        'error-description': 'நீங்கள் கோரிய பக்கம் கிடைக்கவில்லை. அது நகர்த்தப்பட்டிருக்கலாம், நீக்கப்பட்டிருக்கலாம், அல்லது நீங்கள் தவறான URL ஐ உள்ளிட்டிருக்கலாம்.',
        'go-home': 'முகப்புப் பக்கத்திற்கு செல்லுங்கள்',
        'go-back': 'திரும்பிச் செல்லுங்கள்',
        'search-placeholder': 'எங்கள் வலைத்தளத்தில் தேடுங்கள்...',
        'search-button': 'தேடுங்கள்',
        'helpful-links': 'உதவிகரமான இணைப்புகள்',
        'home-link': 'முகப்பு',
        'about-link': 'எங்களைப் பற்றி',
        'books-link': 'புத்தகங்கள்',
        'ebooks-link': 'மின்னூல்கள்',
        'projects-link': 'திட்டங்கள்',
        'contact-link': 'தொடர்பு கொள்ளுங்கள்',
        'login-link': 'உள்நுழைவு',
        'signup-link': 'பதிவு செய்யுங்கள்',
        'posters-link': 'சுவரொட்டிகள்',
        'troubleshooting': 'சிக்கல் தீர்க்கும் குறிப்புகள்',
        'tip1': 'URL இல் எழுத்துப் பிழைகள் உள்ளதா சரிபார்க்கவும்',
        'tip2': 'தேடல் செயல்பாட்டைப் பயன்படுத்த முயற்சிக்கவும்',
        'tip3': 'மெனுவைப் பயன்படுத்தி வழிசெலுத்தவும்',
        'tip4': 'சிக்கல் தொடர்ந்தால் எங்களைத் தொடர்பு கொள்ளவும்'
      }
    };
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const popularPages = [
    { name: getText('home-link'), href: '/', icon: '🏠', description: 'Return to our homepage' },
    { name: getText('about-link'), href: '/about', icon: '👥', description: 'Learn about our mission' },
    { name: getText('books-link'), href: '/books', icon: '📚', description: 'Browse our book collection' },
    { name: getText('ebooks-link'), href: '/ebooks', icon: '📱', description: 'Digital book library' },
    { name: getText('projects-link'), href: '/projects', icon: '🚀', description: 'View our projects' },
    { name: getText('posters-link'), href: '/posters', icon: '🎨', description: 'Browse our poster collection' },
    { name: getText('contact-link'), href: '/contact', icon: '📞', description: 'Get in touch with us' },
    { name: getText('login-link'), href: '/login', icon: '🔐', description: 'Access your account' }
  ];

  const troubleshootingTips = [
    { icon: '🔍', text: getText('tip1') },
    { icon: '🔎', text: getText('tip2') },
    { icon: '🧭', text: getText('tip3') },
    { icon: '📞', text: getText('tip4') }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{getText('page-title')}</title>
        <meta name="description" content={getText('error-description')} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout>
        {/* Floating Particles Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <AnimatePresence>
            {/* Enhanced Floating Particles */}
            {showFloatingElements && particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-gradient-to-br from-orange-400/30 via-red-400/20 to-pink-400/30 dark:from-orange-300/20 dark:via-red-300/15 dark:to-pink-300/20 blur-sm"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.sin(particle.id) * 20, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <main className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
          {/* Dynamic Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent dark:via-white/5"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              {/* Enhanced Error Code with Gradient */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="text-9xl md:text-[12rem] lg:text-[15rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-none"
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    {getText('error-code')}
                  </motion.div>
                  
                  {/* Glowing Effect */}
                  <div className="absolute inset-0 text-9xl md:text-[12rem] lg:text-[15rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent opacity-20 blur-sm">
                    {getText('error-code')}
                  </div>
                </div>
                
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-8xl mb-8"
                >
                  🌟
                </motion.div>
              </motion.div>

              {/* Enhanced Error Message with Better Typography */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-16"
              >
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                    {getText('error-title')}
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto font-medium leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  {getText('error-subtitle')}
                </motion.p>
                
                <motion.p 
                  className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {getText('error-description')}
                </motion.p>
              </motion.div>

              {/* Enhanced Action Buttons with Gradient Effects */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
              >
                <Link href="/">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl transition-all duration-300 text-lg md:text-xl flex items-center justify-center gap-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-2xl"
                    >
                      🏠
                    </motion.span>
                    <span className="relative z-10">{getText('go-home')}</span>
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "rgb(147, 51, 234)",
                    backgroundColor: "rgba(147, 51, 234, 0.1)",
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBack}
                  className="group border-3 border-purple-500 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold py-5 px-10 rounded-2xl transition-all duration-300 text-lg md:text-xl flex items-center justify-center gap-3 backdrop-blur-sm bg-white/10 dark:bg-gray-800/20"
                >
                  <motion.span
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl"
                  >
                    ←
                  </motion.span>
                  <span>{getText('go-back')}</span>
                </motion.button>
              </motion.div>

              {/* Enhanced Search Section with Glass Morphism */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 dark:border-gray-700/20 mb-20 overflow-hidden"
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
                </div>
                
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  <span className="inline-flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-4xl"
                    >
                      🔍
                    </motion.span>
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {getText('search-button')}
                    </span>
                  </span>
                </motion.h2>
                
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
                  <motion.input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={getText('search-placeholder')}
                    className="flex-1 px-6 py-4 text-lg rounded-2xl border-2 border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                    disabled={isSearching}
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 15px 30px rgba(147, 51, 234, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSearching}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-xl"
                  >
                    {isSearching ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          🔍
                        </motion.span>
                        {getText('search-button')}
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>

            {/* Enhanced Popular Pages Grid with Modern Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
              className="mb-20"
            >
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center mb-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 2.2 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {getText('helpful-links')}
                </span>
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {popularPages.map((page, index) => (
                  <motion.div
                    key={page.href}
                    initial={{ opacity: 0, y: 30, rotateY: -15 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 2.4 + index * 0.1 }}
                  >
                    <Link href={page.href}>
                      <motion.div
                        whileHover={{ 
                          scale: 1.08, 
                          y: -8,
                          rotateY: 5,
                          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 cursor-pointer overflow-hidden"
                      >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Animated Icon */}
                        <motion.div 
                          className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-500 relative z-10"
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        >
                          {page.icon}
                        </motion.div>
                        
                        {/* Enhanced Typography */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 relative z-10 leading-tight">
                          {page.name}
                        </h3>
                        
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 relative z-10 leading-relaxed">
                          {page.description}
                        </p>
                        
                        {/* Hover Arrow */}
                        <motion.div
                          className="absolute bottom-6 right-6 text-2xl text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Troubleshooting Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.8 }}
              className="bg-gradient-to-br from-white/10 via-blue-50/10 to-purple-50/10 dark:from-gray-800/20 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 dark:border-gray-700/20"
            >
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-center mb-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 3 }}
              >
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  💡 {getText('troubleshooting')}
                </span>
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {troubleshootingTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30, rotateX: -15 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 3.2 + index * 0.15 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      rotateX: 5,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                    }}
                    className="group bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/40 dark:border-gray-700/40 relative overflow-hidden text-center"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Enhanced Icon */}
                    <motion.div 
                      className="text-4xl mb-4 text-emerald-600 dark:text-emerald-400 relative z-10"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                    >
                      {tip.icon}
                    </motion.div>
                    
                    {/* Enhanced Typography */}
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300 relative z-10 leading-relaxed">
                      {tip.text}
                    </p>
                    
                    {/* Decorative Element */}
                    <motion.div
                      className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.4
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </Layout>

      <style jsx global>{`
        .container {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media (min-width: 640px) {
          .container {
            max-width: 640px;
          }
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 768px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 1024px;
          }
        }
        
        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }
        
        @media (min-width: 1536px) {
          .container {
            max-width: 1536px;
          }
        }
      `}</style>
    </>
  );
};

export default Custom404;
