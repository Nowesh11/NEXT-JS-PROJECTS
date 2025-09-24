import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function ErrorPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [retryCount, setRetryCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const [showFloatingElements, setShowFloatingElements] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setShowFloatingElements(true), 500);
    setTimeout(() => setErrorAnimation(true), 1000);
    
    // Generate floating particles with enhanced properties
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 3,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.8 + 0.2,
      color: ['orange', 'red', 'pink', 'purple', 'blue'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);

    // Enhanced mouse movement parallax effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      
      document.documentElement.style.setProperty('--mouse-x', `${x * 20}px`);
      document.documentElement.style.setProperty('--mouse-y', `${y * 20}px`);
    };

    // Add scroll-based animations
    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', `${scrollY * 0.5}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Initialize theme and language
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { statusCode = 500, hasGetInitialPropsRun, err } = router.query;

  const errorConfig = {
    400: {
      title: { en: 'Bad Request', ta: 'தவறான கோரிக்கை' },
      description: { en: 'The request could not be understood by the server.', ta: 'சர்வரால் கோரிக்கையை புரிந்து கொள்ள முடியவில்லை.' },
      icon: '⚠️',
      color: 'from-yellow-500 to-orange-500'
    },
    401: {
      title: { en: 'Unauthorized', ta: 'அங்கீகரிக்கப்படாதது' },
      description: { en: 'You need to authenticate to access this resource.', ta: 'இந்த வளத்தை அணுக நீங்கள் அங்கீகரிக்கப்பட வேண்டும்.' },
      icon: '🔒',
      color: 'from-red-500 to-pink-500'
    },
    403: {
      title: { en: 'Forbidden', ta: 'தடைசெய்யப்பட்டது' },
      description: { en: 'You don\'t have permission to access this resource.', ta: 'இந்த வளத்தை அணுக உங்களுக்கு அனுமதி இல்லை.' },
      icon: '🚫',
      color: 'from-red-600 to-red-800'
    },
    404: {
      title: { en: 'Page Not Found', ta: 'பக்கம் கிடைக்கவில்லை' },
      description: { en: 'The page you\'re looking for doesn\'t exist.', ta: 'நீங்கள் தேடும் பக்கம் இல்லை.' },
      icon: '🔍',
      color: 'from-blue-500 to-purple-500'
    },
    500: {
      title: { en: 'Internal Server Error', ta: 'உள் சர்வர் பிழை' },
      description: { en: 'Something went wrong on our end. Please try again later.', ta: 'எங்கள் பக்கத்தில் ஏதோ தவறு நடந்துள்ளது. பின்னர் மீண்டும் முயற்சிக்கவும்.' },
      icon: '⚡',
      color: 'from-red-500 to-red-700'
    },
    503: {
      title: { en: 'Service Unavailable', ta: 'சேவை கிடைக்கவில்லை' },
      description: { en: 'The service is temporarily unavailable. Please try again later.', ta: 'சேவை தற்காலிகமாக கிடைக்கவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.' },
      icon: '🔧',
      color: 'from-orange-500 to-red-500'
    }
  };

  const currentError = errorConfig[statusCode] || errorConfig[500];

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    router.reload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>{currentError.title[language]} - Tamil Literary Society</title>
        <meta name="description" content={currentError.description[language]} />
      </Head>

      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
          >
            {/* Dynamic Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-red-400/10 to-pink-400/10 dark:from-orange-300/5 dark:via-red-300/5 dark:to-pink-300/5 animate-pulse"></div>
            </div>

            {/* Enhanced Floating Particles Background */}
            {showFloatingElements && (
              <div className="fixed inset-0 pointer-events-none">
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className={`absolute rounded-full blur-sm ${
                      particle.color === 'orange' ? 'bg-gradient-to-br from-orange-400/40 via-orange-300/30 to-orange-200/20' :
                      particle.color === 'red' ? 'bg-gradient-to-br from-red-400/40 via-red-300/30 to-red-200/20' :
                      particle.color === 'pink' ? 'bg-gradient-to-br from-pink-400/40 via-pink-300/30 to-pink-200/20' :
                      particle.color === 'purple' ? 'bg-gradient-to-br from-purple-400/40 via-purple-300/30 to-purple-200/20' :
                      'bg-gradient-to-br from-blue-400/40 via-blue-300/30 to-blue-200/20'
                    } dark:opacity-60`}
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      opacity: particle.opacity
                    }}
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.sin(particle.id) * 25, Math.cos(particle.id) * 15, 0],
                      scale: [1, 1.3, 0.8, 1],
                      rotate: [0, 180, 360],
                      opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity * 0.5, particle.opacity]
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Main Error Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto text-center"
              >
                {/* Error Code Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: errorAnimation ? 1 : 0, scale: errorAnimation ? 1 : 0.5 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="text-8xl md:text-9xl font-black mb-4">
                    <span className={`bg-gradient-to-r ${currentError.color} bg-clip-text text-transparent drop-shadow-2xl`}>
                      {statusCode}
                    </span>
                  </div>
                  <div className="text-6xl mb-6 animate-bounce">
                    {currentError.icon}
                  </div>
                </motion.div>

                {/* Error Message */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="mb-12"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                    {currentError.title[language]}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                    {currentError.description[language]}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetry}
                      className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-red-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center gap-3 text-lg">
                        <span>{language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Try Again'}</span>
                        <span>🔄</span>
                      </div>
                    </motion.button>

                    <Link href="/">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl text-gray-900 dark:text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 overflow-hidden cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/20 to-gray-200/20 dark:from-gray-700/20 dark:to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3 text-lg">
                          <span>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
                          <span>🏠</span>
                        </div>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Retry Counter */}
                  {retryCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-yellow-200/50 dark:border-yellow-700/30"
                    >
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        {language === 'ta' ? `முயற்சிகள்: ${retryCount}` : `Attempts: ${retryCount}`}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Help Section */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="bg-gradient-to-br from-white/10 via-blue-50/10 to-purple-50/10 dark:from-gray-800/20 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {language === 'ta' ? 'உதவி தேவையா?' : 'Need Help?'}
                    </span>
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <Link href="/contact">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 text-center">
                          <div className="text-4xl mb-4 group-hover:animate-bounce">📞</div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            {language === 'ta' ? 'எங்களை தொடர்பு கொள்ளுங்கள்' : 'Contact Us'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {language === 'ta' ? 'உதவிக்கு தொடர்பு கொள்ளுங்கள்' : 'Get in touch for help'}
                          </p>
                        </div>
                      </motion.div>
                    </Link>

                    <Link href="/faq">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 text-center">
                          <div className="text-4xl mb-4 group-hover:animate-bounce">❓</div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'FAQ'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {language === 'ta' ? 'பொதுவான கேள்விகளின் பதில்கள்' : 'Common questions answered'}
                          </p>
                        </div>
                      </motion.div>
                    </Link>

                    <Link href="/docs">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 text-center">
                          <div className="text-4xl mb-4 group-hover:animate-bounce">📚</div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            {language === 'ta' ? 'ஆவணங்கள்' : 'Documentation'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {language === 'ta' ? 'விரிவான வழிகாட்டுதல்கள்' : 'Detailed guides'}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 2 }}
                  className="bg-gradient-to-br from-white/10 via-blue-50/10 to-purple-50/10 dark:from-gray-800/20 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 dark:border-gray-700/20"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                      {language === 'ta' ? 'தமிழ் இலக்கிய பயணத்தில் சேருங்கள்' : 'Join Our Tamil Literary Journey'}
                    </span>
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                    {language === 'ta' ? 'தமிழ் இலக்கியத்தின் செழுமையான பாரம்பரியத்தை கண்டறியுங்கள்' : 'Discover the rich heritage of Tamil literature'}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-6">
                    <Link href="/books">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-red-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3 text-lg">
                          <span>{language === 'ta' ? 'புத்தகங்களை ஆராயுங்கள்' : 'Explore Books'}</span>
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            →
                          </motion.span>
                        </div>
                      </motion.div>
                    </Link>

                    <Link href="/ebooks">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl text-gray-900 dark:text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 overflow-hidden cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/20 to-gray-200/20 dark:from-gray-700/20 dark:to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3 text-lg">
                          <span>{language === 'ta' ? 'மின்னூல்கள்' : 'E-Books'}</span>
                          <span>📱</span>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
