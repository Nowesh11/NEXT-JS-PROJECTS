import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';

const DynamicDetailPage = () => {
  const router = useRouter();
  const { type, id } = router.query;
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (type && id) {
      fetchItemDetails();
    }
  }, [type, id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for Tamil Language Society
      const mockItems = {
        projects: {
          title: { en: 'Tamil Digital Library Project', ta: 'தமிழ் டிஜிட்டல் நூலக திட்டம்' },
          description: { en: 'A comprehensive digital library preserving Tamil literature and manuscripts for future generations', ta: 'எதிர்கால சந்ததியினருக்காக தமிழ் இலக்கியம் மற்றும் கையெழுத்துப் பிரதிகளை பாதுகாக்கும் ஒரு விரிவான டிஜிட்டல் நூலகம்' },
          category: 'Digital Preservation',
          status: 'Active',
          startDate: '2023-01-15',
          endDate: '2024-12-31',
          participants: 45,
          achievements: { en: 'Digitized over 5,000 manuscripts and books', ta: '5,000க்கும் மேற்பட்ட கையெழுத்துப் பிரதிகள் மற்றும் புத்தகங்கள் டிஜிட்டல் மயமாக்கப்பட்டன' }
        },
        activities: {
          title: { en: 'Tamil Poetry Workshop', ta: 'தமிழ் கவிதை பட்டறை' },
          description: { en: 'Interactive workshop for learning traditional and modern Tamil poetry forms', ta: 'பாரம்பரிய மற்றும் நவீன தமிழ் கவிதை வடிவங்களைக் கற்றுக்கொள்வதற்கான ஊடாடும் பட்டறை' },
          category: 'Education',
          date: '2024-02-15',
          duration: '3 hours',
          participants: 25,
          location: 'Tamil Cultural Center'
        },
        initiatives: {
          title: { en: 'Tamil Language Promotion Initiative', ta: 'தமிழ் மொழி மேம்பாட்டு முன்முயற்சி' },
          description: { en: 'Community-driven initiative to promote Tamil language usage in digital platforms', ta: 'டிஜிட்டல் தளங்களில் தமிழ் மொழி பயன்பாட்டை ஊக்குவிக்கும் சமூக சார்ந்த முன்முயற்சி' },
          category: 'Community Outreach',
          status: 'Ongoing',
          impact: { en: 'Reached over 10,000 people across 15 cities', ta: '15 நகரங்களில் 10,000க்கும் மேற்பட்ட மக்களை அடைந்தது' }
        }
      };
      
      const mockItem = mockItems[type] || mockItems.projects;
      setItem(mockItem);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeDisplayName = () => {
    const typeNames = {
      projects: { en: 'Project', ta: 'திட்டம்' },
      activities: { en: 'Activity', ta: 'செயல்பாடு' },
      initiatives: { en: 'Initiative', ta: 'முன்முயற்சி' }
    };
    return typeNames[type]?.[language] || typeNames[type]?.en || type;
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${getTypeDisplayName()}: ${item?.title?.[language] || ''}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-medium">
            {language === 'ta' ? 'ஏற்றப்படுகிறது...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <>
        <Head>
          <title>{language === 'ta' ? 'கிடைக்கவில்லை - தமிழ் மொழி சங்கம்' : 'Not Found - Tamil Language Society'}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-8xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              📄
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ta' ? `${getTypeDisplayName()} கிடைக்கவில்லை` : `${getTypeDisplayName()} Not Found`}
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {language === 'ta' 
                ? 'நீங்கள் தேடும் உள்ளடக்கம் கிடைக்கவில்லை. இது நீக்கப்பட்டிருக்கலாம் அல்லது URL தவறாக இருக்கலாம்.'
                : 'The content you\'re looking for doesn\'t exist. It may have been removed or the URL might be incorrect.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${type || 'projects'}`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                {language === 'ta' ? 'பட்டியலுக்குத் திரும்பு' : 'Back to List'}
              </Link>
              <Link
                href="/"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                {language === 'ta' ? 'முகப்புக்கு செல்லுங்கள்' : 'Go Home'}
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{item.title[language]} - {language === 'ta' ? 'தமிழ் மொழி சங்கம்' : 'Tamil Language Society'}</title>
        <meta name="description" content={item.description[language]} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">த</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {language === 'ta' ? 'தமிழ் மொழி சங்கம்' : 'Tamil Language Society'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {getTypeDisplayName()}
                  </p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  {language === 'ta' ? 'முகப்பு' : 'Home'}
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  {language === 'ta' ? 'எங்களைப் பற்றி' : 'About'}
                </Link>
                <Link href="/projects" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  {language === 'ta' ? 'திட்டங்கள்' : 'Projects'}
                </Link>
                <Link href="/books" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  {language === 'ta' ? 'புத்தகங்கள்' : 'Books'}
                </Link>
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Breadcrumb */}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors duration-200">
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </Link>
            <span>/</span>
            <Link href={`/${type}`} className="hover:text-indigo-600 transition-colors duration-200">
              {getTypeDisplayName()}s
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{item.title[language]}</span>
          </nav>
        </motion.div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Hero Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <motion.div
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {item.status || (language === 'ta' ? 'செயலில்' : 'Active')}
                </motion.div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {item.title[language]}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {item.description[language]}
                </p>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {item.category && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'ta' ? 'வகை' : 'Category'}</p>
                        <p className="font-semibold text-gray-900">{item.category}</p>
                      </div>
                    </div>
                  )}

                  {item.participants && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'ta' ? 'பங்கேற்பாளர்கள்' : 'Participants'}</p>
                        <p className="font-semibold text-gray-900">{item.participants}</p>
                      </div>
                    </div>
                  )}

                  {item.startDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'ta' ? 'தொடக்க தேதி' : 'Start Date'}</p>
                        <p className="font-semibold text-gray-900">{new Date(item.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {item.date && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{language === 'ta' ? 'தேதி' : 'Date'}</p>
                        <p className="font-semibold text-gray-900">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements/Impact */}
              {(item.achievements || item.impact) && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ta' ? 'சாதனைகள் & தாக்கம்' : 'Achievements & Impact'}
                  </h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {(item.achievements || item.impact)?.[language]}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Share Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ta' ? 'பகிர்ந்து கொள்ளுங்கள்' : 'Share This'}
                </h3>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={shareOnFacebook}
                    className="flex items-center gap-3 w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">f</span>
                    </div>
                    <span className="font-medium text-gray-700">Facebook</span>
                  </button>
                  
                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center gap-3 w-full p-3 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">𝕏</span>
                    </div>
                    <span className="font-medium text-gray-700">Twitter</span>
                  </button>
                  
                  <button
                    onClick={shareOnLinkedIn}
                    className="flex items-center gap-3 w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">in</span>
                    </div>
                    <span className="font-medium text-gray-700">LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ta' ? 'விரைவு செயல்கள்' : 'Quick Actions'}
                </h3>
                
                <div className="space-y-3">
                  <Link
                    href={`/${type}`}
                    className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {language === 'ta' ? 'பட்டியலுக்குத் திரும்பு' : 'Back to List'}
                    </span>
                  </Link>
                  
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {language === 'ta' ? 'தொடர்பு கொள்ளுங்கள்' : 'Contact Us'}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        </div>
      </Layout>
    </>
  );
};

export default DynamicDetailPage;