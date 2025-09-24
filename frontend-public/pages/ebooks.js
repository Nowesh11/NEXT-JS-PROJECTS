import React, { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

export default function Ebooks() {
  const [theme, setTheme] = useState('light');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('latest');
  const [ebooks, setEbooks] = useState([]);
  const [totalEbooks, setTotalEbooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'english';
    setCurrentLanguage(savedLanguage);
    
    // Load sample ebooks data
    loadEbooks();
    
    // Set loading to false after initialization
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'english' ? 'tamil' : 'english';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Mock data for ebooks
  const mockEbooks = [
    {
      id: 1,
      title: { english: 'Thirukkural', tamil: 'திருக்குறள்' },
      author: { english: 'Thiruvalluvar', tamil: 'திருவள்ளுவர்' },
      description: { english: 'Classic Tamil literature on ethics and morality', tamil: 'நீதி மற்றும் ஒழுக்கம் பற்றிய தமிழ் இலக்கியம்' },
      category: 'literature',
      language: 'tamil',
      rating: 4.9,
      downloads: 15420,
      featured: true,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      icon: 'fas fa-book-open',
      image: '/images/ebooks/thirukkural.jpg'
    },
    {
      id: 2,
      title: { english: 'Modern Tamil Poetry', tamil: 'நவீன தமிழ் கவிதைகள்' },
      author: { english: 'Various Authors', tamil: 'பல்வேறு ஆசிரியர்கள்' },
      description: { english: 'Contemporary Tamil poems by renowned poets', tamil: 'புகழ்பெற்ற கவிஞர்களின் சமகால தமிழ் கவிதைகள்' },
      category: 'poetry',
      language: 'tamil',
      rating: 4.7,
      downloads: 8950,
      featured: true,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: 'fas fa-feather-alt',
      image: '/images/ebooks/poetry.jpg'
    },
    {
      id: 3,
      title: { english: 'Tamil Grammar Guide', tamil: 'தமிழ் இலக்கண வழிகாட்டி' },
      author: { english: 'Dr. K. Rajendran', tamil: 'டாக்டர் கே. ராஜேந்திரன்' },
      description: { english: 'Comprehensive guide to Tamil grammar', tamil: 'தமிழ் இலக்கணத்திற்கான விரிவான வழிகாட்டி' },
      category: 'educational',
      language: 'tamil',
      rating: 4.8,
      downloads: 12300,
      featured: false,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      icon: 'fas fa-graduation-cap',
      image: '/images/ebooks/grammar.jpg'
    },
    {
      id: 4,
      title: { english: 'Children Tamil Stories', tamil: 'குழந்தைகளுக்கான தமிழ் கதைகள்' },
      author: { english: 'Priya Natarajan', tamil: 'பிரியா நடராஜன்' },
      description: { english: 'Engaging stories for young Tamil learners', tamil: 'இளம் தமிழ் கற்பவர்களுக்கான ஈர்க்கும் கதைகள்' },
      category: 'children',
      language: 'tamil',
      rating: 4.6,
      downloads: 6780,
      featured: false,
      gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
      icon: 'fas fa-child',
      image: '/images/ebooks/children.jpg'
    }
  ];

  const loadEbooks = async () => {
    setEbooks(mockEbooks);
    setTotalEbooks(mockEbooks.length);
  };

  const categories = [
    { id: 'all', name: { english: 'All Categories', tamil: 'அனைத்து வகைகள்' } },
    { id: 'literature', name: { english: 'Literature', tamil: 'இலக்கியம்' } },
    { id: 'poetry', name: { english: 'Poetry', tamil: 'கவிதை' } },
    { id: 'educational', name: { english: 'Educational', tamil: 'கல்வி' } },
    { id: 'children', name: { english: 'Children', tamil: 'குழந்தைகள்' } }
  ];

  const languages = [
    { id: 'all', name: { english: 'All Languages', tamil: 'அனைத்து மொழிகள்' } },
    { id: 'tamil', name: { english: 'Tamil', tamil: 'தமிழ்' } },
    { id: 'english', name: { english: 'English', tamil: 'ஆங்கிலம்' } }
  ];

  const sortOptions = [
    { id: 'latest', name: { english: 'Latest', tamil: 'சமீபத்திய' } },
    { id: 'popular', name: { english: 'Most Popular', tamil: 'மிகவும் பிரபலமான' } },
    { id: 'rating', name: { english: 'Highest Rated', tamil: 'அதிக மதிப்பீடு' } },
    { id: 'downloads', name: { english: 'Most Downloaded', tamil: 'அதிகம் பதிவிறக்கம்' } }
  ];

  // Filter and sort ebooks
  const filteredEbooks = ebooks.filter(ebook => {
    const matchesCategory = categoryFilter === 'all' || ebook.category === categoryFilter;
    const matchesLanguage = languageFilter === 'all' || ebook.language === languageFilter;
    const matchesSearch = searchTerm === '' || 
      ebook.title[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.author[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  const sortedEbooks = [...filteredEbooks].sort((a, b) => {
    switch (sortFilter) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return b.id - a.id; // Latest first
    }
  });

  const featuredEbooks = ebooks.filter(ebook => ebook.featured);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading E-books Collection...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>E-books Collection - Tamil Language Society</title>
        <meta name="description" content="Discover our extensive collection of Tamil e-books, literature, and digital publications." />
        <meta name="keywords" content="Tamil ebooks, digital books, literature, educational resources" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </Head>

      <Layout>
        <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <h1 className="hero-title">
                {currentLanguage === 'english' ? 'E-books Collection' : 'மின்னூல் தொகுப்பு'}
              </h1>
              <p className="hero-subtitle">
                {currentLanguage === 'english' 
                  ? 'Digital Tamil Literature at Your Fingertips' 
                  : 'உங்கள் விரல் நுனியில் டிஜிட்டல் தமிழ் இலக்கியம்'
                }
              </p>
              <p className="hero-description">
                {currentLanguage === 'english'
                  ? 'Access thousands of Tamil e-books, from classical literature to modern works, available for instant download and reading.'
                  : 'பாரம்பரிய இலக்கியம் முதல் நவீன படைப்புகள் வரை ஆயிரக்கணக்கான தமிழ் மின்னூல்களை உடனடி பதிவிறக்கம் மற்றும் வாசிப்புக்காக அணுகவும்.'
                }
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured E-books Section */}
        {featuredEbooks.length > 0 && (
          <section className="featured-section">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="section-header"
              >
                <h2 className="section-title">
                  {currentLanguage === 'english' ? 'Featured E-books' : 'சிறப்பு மின்னூல்கள்'}
                </h2>
                <p className="section-subtitle">
                  {currentLanguage === 'english' 
                    ? 'Handpicked collection of our most popular titles'
                    : 'எங்கள் மிகவும் பிரபலமான தலைப்புகளின் தேர்ந்தெடுக்கப்பட்ட தொகுப்பு'
                  }
                </p>
              </motion.div>

              <div className="featured-grid">
                {featuredEbooks.map((ebook, index) => (
                  <motion.div
                    key={ebook.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="featured-card"
                    style={{ background: ebook.gradient }}
                    onMouseEnter={() => setHoveredCard(ebook.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="featured-card-content">
                      <div className="featured-icon">
                        <i className={ebook.icon}></i>
                      </div>
                      <h3 className="featured-title">{ebook.title[currentLanguage]}</h3>
                      <p className="featured-author">{ebook.author[currentLanguage]}</p>
                      <p className="featured-description">{ebook.description[currentLanguage]}</p>
                      <div className="featured-stats">
                        <div className="stat">
                          <i className="fas fa-star"></i>
                          <span>{ebook.rating}</span>
                        </div>
                        <div className="stat">
                          <i className="fas fa-download"></i>
                          <span>{ebook.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="btn btn-white">
                        {currentLanguage === 'english' ? 'Read Now' : 'இப்போது படிக்கவும்'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <section className="filter-section">
          <div className="container">
            <div className="filter-controls">
              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder={currentLanguage === 'english' ? 'Search e-books...' : 'மின்னூல்களைத் தேடுங்கள்...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name[currentLanguage]}
                  </option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="filter-select"
              >
                {languages.map(language => (
                  <option key={language.id} value={language.id}>
                    {language.name[currentLanguage]}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name[currentLanguage]}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* E-books Display Section */}
        <section className="ebooks-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {currentLanguage === 'english' ? 'All E-books' : 'அனைத்து மின்னூல்கள்'}
              </h2>
              <p className="results-count">
                {sortedEbooks.length} {currentLanguage === 'english' ? 'e-books found' : 'மின்னூல்கள் கிடைத்தன'}
              </p>
            </div>

            {sortedEbooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="no-results"
              >
                <div className="no-results-icon">📚</div>
                <h3 className="no-results-title">
                  {currentLanguage === 'english' ? 'No e-books found' : 'மின்னூல்கள் கிடைக்கவில்லை'}
                </h3>
                <p className="no-results-text">
                  {currentLanguage === 'english' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'உங்கள் தேடல் அல்லது வடிப்பான் அளவுகோல்களை சரிசெய்ய முயற்சிக்கவும்'
                  }
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setLanguageFilter('all');
                    setSortFilter('latest');
                  }}
                  className="btn btn-primary"
                >
                  {currentLanguage === 'english' ? 'Clear Filters' : 'வடிப்பான்களை அழிக்கவும்'}
                </button>
              </motion.div>
            ) : (
              <div className={`ebooks-grid ${viewMode}`}>
                {sortedEbooks.map((ebook, index) => (
                  <motion.div
                    key={ebook.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="ebook-card"
                    onMouseEnter={() => setHoveredCard(ebook.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="ebook-image">
                      <img 
                        src={ebook.image} 
                        alt={ebook.title[currentLanguage]}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-ebook.jpg';
                        }}
                      />
                      <div className="ebook-overlay">
                        <button className="btn btn-primary">
                          {currentLanguage === 'english' ? 'Read Now' : 'இப்போது படிக்கவும்'}
                        </button>
                        <button className="btn btn-outline">
                          {currentLanguage === 'english' ? 'Download' : 'பதிவிறக்கம்'}
                        </button>
                      </div>
                    </div>
                    <div className="ebook-info">
                      <h3 className="ebook-title">{ebook.title[currentLanguage]}</h3>
                      <p className="ebook-author">{ebook.author[currentLanguage]}</p>
                      <p className="ebook-description">{ebook.description[currentLanguage]}</p>
                      <div className="ebook-meta">
                        <div className="ebook-rating">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i} 
                                className={`fas fa-star ${i < Math.floor(ebook.rating) ? 'filled' : ''}`}
                              ></i>
                            ))}
                          </div>
                          <span className="rating-text">{ebook.rating}</span>
                        </div>
                        <div className="ebook-downloads">
                          <i className="fas fa-download"></i>
                          <span>{ebook.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="ebook-actions">
                        <button className="btn btn-primary btn-small">
                          {currentLanguage === 'english' ? 'Read' : 'படிக்கவும்'}
                        </button>
                        <button className="btn btn-outline btn-small">
                          {currentLanguage === 'english' ? 'Download' : 'பதிவிறக்கம்'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      </Layout>

      {/* Scripts */}
      <Script 
        src="/js/api-integration.js" 
        strategy="afterInteractive"
      />
      
      <Script 
        src="/js/content-manager.js" 
        strategy="afterInteractive"
      />

      <style jsx global>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--color-bg, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border-light, #e5e7eb);
          border-top: 4px solid var(--color-primary, #1e3a8a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .main-content {
          min-height: 100vh;
        }

        .hero-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--color-primary, #1e3a8a) 0%, var(--color-secondary, #7c3aed) 100%);
          color: white;
          text-align: center;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          opacity: 0.8;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .featured-section {
          padding: 4rem 0;
          background: var(--color-bg-secondary, #f8fafc);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary, #1e3a8a);
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary, #64748b);
          max-width: 600px;
          margin: 0 auto;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .featured-card {
          border-radius: 1.5rem;
          padding: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .featured-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
        }

        .featured-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .featured-card:hover::before {
          opacity: 1;
        }

        .featured-card-content {
          position: relative;
          z-index: 1;
        }

        .featured-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .featured-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .featured-author {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .featured-description {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .featured-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .btn-white {
          background: white;
          color: var(--color-primary, #1e3a8a);
          border: none;
        }

        .btn-white:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
        }

        .filter-section {
          padding: 2rem 0;
          background: white;
          border-bottom: 1px solid var(--border-light, #e5e7eb);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary, #1e3a8a);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary, #64748b);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          font-size: 1rem;
          background: white;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .view-btn {
          padding: 0.75rem 1rem;
          border: none;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: var(--color-primary, #1e3a8a);
          color: white;
        }

        .ebooks-section {
          padding: 3rem 0;
        }

        .results-count {
          color: var(--text-secondary, #64748b);
          font-size: 1rem;
        }

        .ebooks-grid {
          display: grid;
          gap: 2rem;
          margin-top: 2rem;
        }

        .ebooks-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .ebooks-grid.list {
          grid-template-columns: 1fr;
        }

        .ebook-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .ebook-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .ebook-image {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .ebook-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .ebook-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ebook-card:hover .ebook-overlay {
          opacity: 1;
        }

        .ebook-info {
          padding: 1.5rem;
        }

        .ebook-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary, #1e3a8a);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .ebook-author {
          color: var(--text-secondary, #64748b);
          margin-bottom: 0.75rem;
        }

        .ebook-description {
          color: var(--text-secondary, #64748b);
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .ebook-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ebook-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .stars .fa-star {
          color: #e5e7eb;
          font-size: 0.875rem;
        }

        .stars .fa-star.filled {
          color: #fbbf24;
        }

        .rating-text {
          font-size: 0.875rem;
          color: var(--text-secondary, #64748b);
        }

        .ebook-downloads {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary, #64748b);
          font-size: 0.875rem;
        }

        .ebook-actions {
          display: flex;
          gap: 0.5rem;
        }

        .no-results {
          text-align: center;
          padding: 4rem 0;
        }

        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-results-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary, #1e3a8a);
          margin-bottom: 0.5rem;
        }

        .no-results-text {
          color: var(--text-secondary, #64748b);
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 1rem;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary, #1e3a8a) 0%, var(--color-secondary, #7c3aed) 100%);
          color: white;
        }

        .btn-primary:hover {
          box-shadow: 0 10px 25px -3px rgba(30, 58, 138, 0.3);
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: var(--color-primary, #1e3a8a);
          border: 2px solid var(--color-primary, #1e3a8a);
        }

        .btn-outline:hover {
          background: var(--color-primary, #1e3a8a);
          color: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            min-width: auto;
          }
          
          .featured-grid {
            grid-template-columns: 1fr;
          }
          
          .ebooks-grid.grid {
            grid-template-columns: 1fr;
          }
          
          .ebook-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
