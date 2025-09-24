import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const text = {
    en: {
      title: 'My Purchases',
      subtitle: 'Track your Tamil literature collection and downloads',
      loading: 'Loading your purchases...',
      empty: {
        title: 'No purchases yet',
        subtitle: 'Start building your Tamil literature collection',
        action: 'Browse Books'
      },
      filters: {
        all: 'All Items',
        books: 'Books',
        ebooks: 'E-books',
        posters: 'Posters'
      },
      sort: {
        date: 'Date',
        title: 'Title',
        price: 'Price'
      },
      status: {
        completed: 'Completed',
        pending: 'Pending',
        processing: 'Processing',
        cancelled: 'Cancelled'
      },
      actions: {
        download: 'Download',
        redownload: 'Re-download',
        view: 'View Details',
        support: 'Contact Support'
      },
      stats: {
        total: 'Total Purchases',
        thisMonth: 'This Month',
        downloads: 'Downloads'
      }
    },
    ta: {
      title: 'எனது வாங்கல்கள்',
      subtitle: 'உங்கள் தமிழ் இலக்கிய தொகுப்பு மற்றும் பதிவிறக்கங்களை கண்காணிக்கவும்',
      loading: 'உங்கள் வாங்கல்களை ஏற்றுகிறது...',
      empty: {
        title: 'இன்னும் வாங்கல்கள் இல்லை',
        subtitle: 'உங்கள் தமிழ் இலக்கிய தொகுப்பை உருவாக்க தொடங்குங்கள்',
        action: 'புத்தகங்களை உலாவவும்'
      },
      filters: {
        all: 'அனைத்து பொருட்கள்',
        books: 'புத்தகங்கள்',
        ebooks: 'மின்னூல்கள்',
        posters: 'சுவரொட்டிகள்'
      },
      sort: {
        date: 'தேதி',
        title: 'தலைப்பு',
        price: 'விலை'
      },
      status: {
        completed: 'முடிந்தது',
        pending: 'நிலுவையில்',
        processing: 'செயலாக்கம்',
        cancelled: 'ரத்து செய்யப்பட்டது'
      },
      actions: {
        download: 'பதிவிறக்கம்',
        redownload: 'மீண்டும் பதிவிறக்கம்',
        view: 'விவரங்களை பார்க்கவும்',
        support: 'ஆதரவை தொடர்பு கொள்ளவும்'
      },
      stats: {
        total: 'மொத்த வாங்கல்கள்',
        thisMonth: 'இந்த மாதம்',
        downloads: 'பதிவிறக்கங்கள்'
      }
    }
  };

  // Mock data for demonstration
  const mockPurchases = [
    {
      id: '1',
      title: 'திருக்குறள் - முழு தொகுப்பு',
      titleEn: 'Thirukkural - Complete Collection',
      type: 'ebook',
      price: 299,
      status: 'completed',
      date: '2024-01-15',
      downloadCount: 3,
      image: '/api/placeholder/80/100'
    },
    {
      id: '2',
      title: 'கம்பராமாயணம்',
      titleEn: 'Kambaramayanam',
      type: 'book',
      price: 599,
      status: 'completed',
      date: '2024-01-10',
      downloadCount: 1,
      image: '/api/placeholder/80/100'
    },
    {
      id: '3',
      title: 'தமிழ் இலக்கிய வரலாறு',
      titleEn: 'History of Tamil Literature',
      type: 'ebook',
      price: 399,
      status: 'processing',
      date: '2024-01-20',
      downloadCount: 0,
      image: '/api/placeholder/80/100'
    }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/account/purchases');
      return;
    }

    // Simulate loading purchases
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 1000);
  }, [session, status, router]);

  const currentText = text[language];

  const filteredPurchases = purchases.filter(purchase => {
    if (filter === 'all') return true;
    return purchase.type === filter;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const stats = {
    total: purchases.length,
    thisMonth: purchases.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).length,
    downloads: purchases.reduce((sum, p) => sum + p.downloadCount, 0)
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Head>
          <title>{currentText.title} | Tamil Language Society</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">{currentText.loading}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{currentText.title} | Tamil Language Society</title>
        <meta name="description" content={currentText.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TLS</span>
                </div>
                <span className="text-white font-semibold">Tamil Language Society</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {language === 'en' ? 'தமிழ்' : 'English'}
                </button>
                <Link href="/account" className="text-white hover:text-gray-300 transition-colors duration-200">
                  Account
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {currentText.subtitle}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-gray-300">{currentText.stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.thisMonth}</div>
              <div className="text-gray-300">{currentText.stats.thisMonth}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.downloads}</div>
              <div className="text-gray-300">{currentText.stats.downloads}</div>
            </div>
          </motion.div>

          {/* Filters and Sort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentText.filters).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      filter === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(currentText.sort).map(([key, label]) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Purchases List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {sortedPurchases.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{currentText.empty.title}</h3>
                <p className="text-gray-300 mb-8">{currentText.empty.subtitle}</p>
                <Link
                  href="/books"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {currentText.empty.action}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPurchases.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {language === 'ta' ? purchase.title : purchase.titleEn}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(purchase.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            ₹{purchase.price}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            purchase.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            purchase.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' :
                            purchase.status === 'pending' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {currentText.status[purchase.status]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {purchase.status === 'completed' && (
                          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105">
                            {purchase.downloadCount > 0 ? currentText.actions.redownload : currentText.actions.download}
                          </button>
                        )}
                        <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">
                          {currentText.actions.view}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login?callbackUrl=/account/purchases',
        permanent: false,
      },
    };
  }
  
  return {
    props: {}
  };
}
