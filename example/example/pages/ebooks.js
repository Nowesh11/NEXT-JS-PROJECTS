import React, { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../components/AccessibilityProvider';
import LazyImage from '../components/LazyImage';
import LazySection from '../components/LazySection';
import SEOHead from '../components/SEOHead';
import styles from '../styles/Ebooks.module.css';

export default function Ebooks() {
  // Accessibility hook
  const { reducedMotion, announceToScreenReader } = useAccessibility();
  
  // State management
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
      icon: 'fas fa-book-open'
    },
    {
      id: 2,
      title: { english: 'Silapathikaram', tamil: 'சிலப்பதிகாரம்' },
      author: { english: 'Ilango Adigal', tamil: 'இளங்கோ அடிகள்' },
      description: { english: 'Ancient Tamil epic poem', tamil: 'பண்டைய தமிழ் காவியம்' },
      category: 'literature',
      language: 'tamil',
      rating: 4.8,
      downloads: 12350,
      featured: true,
      gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
      icon: 'fas fa-scroll'
    },
    {
      id: 3,
      title: { english: 'Tamil Grammar', tamil: 'தமிழ் இலக்கணம்' },
      author: { english: 'Tolkappiyar', tamil: 'தொல்காப்பியர்' },
      description: { english: 'Comprehensive guide to Tamil language structure', tamil: 'தமிழ் மொழி அமைப்பின் விரிவான வழிகாட்டி' },
      category: 'education',
      language: 'tamil',
      rating: 4.6,
      downloads: 8920,
      featured: true,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      icon: 'fas fa-language'
    },
    {
      id: 4,
      title: { english: 'Tamil Poetry Collection', tamil: 'தமிழ் கவிதை தொகுப்பு' },
      author: { english: 'Various Authors', tamil: 'பல்வேறு ஆசிரியர்கள்' },
      description: { english: 'Collection of modern Tamil poetry', tamil: 'நவீன தமிழ் கவிதைகளின் தொகுப்பு' },
      category: 'poetry',
      language: 'tamil',
      rating: 4.4,
      downloads: 6780,
      featured: false,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: 'fas fa-heart'
    },
    {
      id: 5,
      title: { english: 'Tamil History', tamil: 'தமிழர் வரலாறு' },
      author: { english: 'Dr. K. Rajayyan', tamil: 'டாக்டர் கே. ராஜய்யன்' },
      description: { english: 'Comprehensive history of Tamil people', tamil: 'தமிழர்களின் விரிவான வரலாறு' },
      category: 'history',
      language: 'tamil',
      rating: 4.7,
      downloads: 9540,
      featured: false,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      icon: 'fas fa-landmark'
    },
    {
      id: 6,
      title: { english: 'Children Stories', tamil: 'குழந்தைகள் கதைகள்' },
      author: { english: 'Sujatha', tamil: 'சுஜாதா' },
      description: { english: 'Fun stories for Tamil children', tamil: 'தமிழ் குழந்தைகளுக்கான வேடிக்கையான கதைகள்' },
      category: 'children',
      language: 'tamil',
      rating: 4.5,
      downloads: 7230,
      featured: false,
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      icon: 'fas fa-child'
    }
  ];

  // Categories data
  const categories = [
    {
      id: 'literature',
      title: { english: 'Literature', tamil: 'இலக்கியம்' },
      description: { english: 'Classic and contemporary Tamil literature', tamil: 'பாரம்பரிய மற்றும் நவீன தமிழ் இலக்கியம்' },
      count: '1,200+',
      icon: 'fas fa-feather-alt',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    {
      id: 'education',
      title: { english: 'Education', tamil: 'கல்வி' },
      description: { english: 'Educational resources and textbooks', tamil: 'கல்வி வளங்கள் மற்றும் பாடப்புத்தகங்கள்' },
      count: '800+',
      icon: 'fas fa-graduation-cap',
      gradient: 'linear-gradient(135deg, #f59e0b, #f97316)'
    },
    {
      id: 'culture',
      title: { english: 'Culture', tamil: 'பண்பாடு' },
      description: { english: 'Cultural traditions and practices', tamil: 'பண்பாட்டு மரபுகள் மற்றும் நடைமுறைகள்' },
      count: '450+',
      icon: 'fas fa-theater-masks',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      id: 'history',
      title: { english: 'History', tamil: 'வரலாறு' },
      description: { english: 'Tamil history and heritage', tamil: 'தமிழர் வரலாறு மற்றும் பாரம்பரியம்' },
      count: '350+',
      icon: 'fas fa-landmark',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      id: 'poetry',
      title: { english: 'Poetry', tamil: 'கவிதை' },
      description: { english: 'Classical and modern Tamil poetry', tamil: 'பாரம்பரிய மற்றும் நவீன தமிழ் கவிதைகள்' },
      count: '600+',
      icon: 'fas fa-heart',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      id: 'children',
      title: { english: 'Children\'s Books', tamil: 'குழந்தைகள் புத்தகங்கள்' },
      description: { english: 'Stories and learning materials for kids', tamil: 'குழந்தைகளுக்கான கதைகள் மற்றும் கற்றல் பொருட்கள்' },
      count: '300+',
      icon: 'fas fa-child',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    }
  ];

  // Fetch ebooks function
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredEbooks = [...mockEbooks];
      
      // Apply filters
      if (categoryFilter !== 'all') {
        filteredEbooks = filteredEbooks.filter(ebook => ebook.category === categoryFilter);
      }
      
      if (languageFilter !== 'all') {
        filteredEbooks = filteredEbooks.filter(ebook => ebook.language === languageFilter);
      }
      
      if (searchTerm) {
        filteredEbooks = filteredEbooks.filter(ebook => 
          ebook.title.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ebook.title.tamil.includes(searchTerm) ||
          ebook.author.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ebook.author.tamil.includes(searchTerm)
        );
      }
      
      // Apply sorting
      switch (sortFilter) {
        case 'rating':
          filteredEbooks.sort((a, b) => b.rating - a.rating);
          break;
        case 'downloads':
          filteredEbooks.sort((a, b) => b.downloads - a.downloads);
          break;
        case 'alphabetical':
          filteredEbooks.sort((a, b) => a.title.english.localeCompare(b.title.english));
          break;
        default:
          // Latest (default order)
          break;
      }
      
      setTotalEbooks(filteredEbooks.length);
      
      // Pagination
      const startIndex = (currentPage - 1) * 12;
      const endIndex = startIndex + 12;
      setEbooks(filteredEbooks.slice(startIndex, endIndex));
      
    } catch (err) {
      setError('Failed to load ebooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get featured ebooks
  const featuredEbooks = mockEbooks.filter(ebook => ebook.featured);

  // Language toggle function
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'english' ? 'tamil' : 'english');
  };

  // Get text based on current language
  const getText = (english, tamil) => {
    return currentLanguage === 'english' ? english : tamil;
  };

  // Handle download
  const handleDownload = async (ebook) => {
    try {
      announceToScreenReader(`Downloading ${ebook.title[currentLanguage]}`);
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock download link
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${ebook.title.english}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      announceToScreenReader(`${ebook.title[currentLanguage]} download started`);
    } catch (error) {
      announceToScreenReader('Download failed. Please try again.');
    }
  };

  // Open rating modal
  const openRatingModal = (ebook) => {
    setSelectedBook(ebook);
    setSelectedRating(0);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (selectedRating > 0 && selectedBook) {
      // Simulate rating submission
      announceToScreenReader(`Rated ${selectedBook.title[currentLanguage]} with ${selectedRating} stars`);
      
      // Update the book's rating (in a real app, this would be sent to the server)
      const updatedEbooks = ebooks.map(ebook => 
        ebook.id === selectedBook.id 
          ? { ...ebook, rating: ((ebook.rating * 100) + selectedRating) / 101 }
          : ebook
      );
      setEbooks(updatedEbooks);
      
      setShowRatingModal(false);
      setSelectedBook(null);
      setSelectedRating(0);
    }
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredEbooks.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredEbooks.length) % featuredEbooks.length);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fas fa-star ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Effects
  useEffect(() => {
    fetchEbooks();
  }, [currentPage, categoryFilter, languageFilter, sortFilter, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [categoryFilter, languageFilter, sortFilter, searchTerm]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!reducedMotion && featuredEbooks.length > 1) {
        nextSlide();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredEbooks.length]);

  return (
    <div>
      <SEOHead
        title="Tamil E-Books - Digital Library"
        description="Explore our extensive collection of Tamil e-books, literature, and digital resources. Download and read Tamil books online for free from our comprehensive digital library."
        keywords="Tamil ebooks, Tamil books, Tamil literature, Tamil digital library, free Tamil books, Tamil reading, Tamil novels, Tamil poetry, Tamil educational books"
        url="/ebooks"
        type="website"
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            {getText('Digital Library', 'டிஜிட்டல் நூலகம்')}
          </h1>
          <p>
            {getText(
              'Discover thousands of Tamil ebooks, literature, and educational resources at your fingertips',
              'ஆயிரக்கணக்கான தமிழ் மின்னூல்கள், இலக்கியம் மற்றும் கல்வி வளங்களை உங்கள் விரல் நுனியில் கண்டறியுங்கள்'
            )}
          </p>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredEbooks.length > 0 && (
        <section className={styles.featured}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              {getText('Featured Books', 'சிறப்பு புத்தகங்கள்')}
            </h2>
            
            <div className={styles.carouselContainer}>
              <button 
                className={`${styles.carouselBtn} ${styles.carouselPrev}`}
                onClick={prevSlide}
                aria-label={getText('Previous book', 'முந்தைய புத்தகம்')}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className={styles.carousel}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    className={styles.carouselSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={styles.featuredBook}>
                      <div className={styles.featuredBookImage}>
                        <LazyImage
                          src={featuredEbooks[currentSlide]?.cover || '/images/book-placeholder.jpg'}
                          alt={featuredEbooks[currentSlide]?.title[currentLanguage] || 'Featured book'}
                          width={300}
                          height={400}
                          className={styles.bookCover}
                        />
                        <div className={styles.featuredBadge}>
                          {getText('Featured', 'சிறப்பு')}
                        </div>
                      </div>
                      
                      <div className={styles.featuredBookInfo}>
                        <h3 className={styles.featuredBookTitle}>
                          {featuredEbooks[currentSlide]?.title[currentLanguage]}
                        </h3>
                        <p className={styles.featuredBookAuthor}>
                          {getText('By', 'எழுதியவர்')} {featuredEbooks[currentSlide]?.author[currentLanguage]}
                        </p>
                        <p className={styles.featuredBookDescription}>
                          {featuredEbooks[currentSlide]?.description[currentLanguage]}
                        </p>
                        
                        <div className={styles.featuredBookMeta}>
                          <div className={styles.rating}>
                            {renderStars(featuredEbooks[currentSlide]?.rating || 0)}
                            <span className={styles.ratingText}>
                              {featuredEbooks[currentSlide]?.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <div className={styles.downloads}>
                            <i className="fas fa-download"></i>
                            <span>{featuredEbooks[currentSlide]?.downloads || 0}</span>
                          </div>
                        </div>
                        
                        <div className={styles.featuredBookActions}>
                          <button
                            onClick={() => handleDownload(featuredEbooks[currentSlide])}
                            className={styles.btnDownload}
                            aria-label={`Download ${featuredEbooks[currentSlide]?.title[currentLanguage]}`}
                          >
                            <i className="fas fa-download"></i>
                            {getText('Download', 'பதிவிறக்கம்')}
                          </button>
                          <button
                            onClick={() => openRatingModal(featuredEbooks[currentSlide])}
                            className={styles.btnRate}
                            aria-label={`Rate ${featuredEbooks[currentSlide]?.title[currentLanguage]}`}
                          >
                            <i className="fas fa-star"></i>
                            {getText('Rate', 'மதிப்பீடு')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <button 
                className={`${styles.carouselBtn} ${styles.carouselNext}`}
                onClick={nextSlide}
                aria-label={getText('Next book', 'அடுத்த புத்தகம்')}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            {/* Carousel Indicators */}
            <div className={styles.carouselIndicators}>
              {featuredEbooks.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentSlide ? styles.indicatorActive : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Books Section */}
      <section className={styles.section} data-section="all-books">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            {getText('All Books', 'அனைத்து புத்தகங்கள்')}
          </h2>

          {/* Search and Filters */}
          <div className={styles.searchFilters}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder={getText('Search books...', 'புத்தகங்களைத் தேடுங்கள்...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <i className="fas fa-search"></i>
            </div>

            <div className={styles.filters}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{getText('All Categories', 'அனைத்து வகைகள்')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title[currentLanguage]}
                  </option>
                ))}
              </select>

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{getText('All Languages', 'அனைத்து மொழிகள்')}</option>
                <option value="tamil">{getText('Tamil', 'தமிழ்')}</option>
                <option value="english">{getText('English', 'ஆங்கிலம்')}</option>
              </select>

              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="latest">{getText('Latest', 'சமீபத்திய')}</option>
                <option value="rating">{getText('Highest Rated', 'அதிக மதிப்பீடு')}</option>
                <option value="downloads">{getText('Most Downloaded', 'அதிக பதிவிறக்கம்')}</option>
                <option value="alphabetical">{getText('A-Z', 'அ-ஃ')}</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>

          {/* Results Summary */}
          <div className={styles.resultsInfo}>
            <p>{getText(`Showing ${ebooks.length} of ${totalEbooks} books`, `${totalEbooks} புத்தகங்களில் ${ebooks.length} காட்டப்படுகிறது`)}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>{getText('Loading books...', 'புத்தகங்கள் ஏற்றப்படுகின்றன...')}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Books Grid/List */}
          {!loading && !error && (
            <AnimatePresence>
              <motion.div
                className={viewMode === 'grid' ? styles.booksGrid : styles.booksList}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {ebooks.map((ebook, index) => (
                  <motion.div
                    key={ebook.id}
                    className={`${styles.ebookCard} ${
                      viewMode === 'list' ? styles.ebookCardList : styles.ebookCardGrid
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredCard(ebook.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Book Cover */}
                    <div className={`${styles.ebookCover} ${
                      viewMode === 'list' ? styles.ebookCoverList : styles.ebookCoverGrid
                    }`}>
                      <div 
                        className={styles.ebookCoverGradient}
                        style={{ background: ebook.gradient }}
                      >
                        <i className={`${ebook.icon} ${styles.ebookCoverIcon} ${
                          viewMode === 'list' ? styles.ebookCoverIconList : styles.ebookCoverIconGrid
                        }`}></i>
                      </div>
                      
                      {/* Download Badge */}
                      {ebook.downloads > 10000 && (
                        <div className={styles.downloadBadge}>
                          {getText('Popular', 'பிரபலமான')}
                        </div>
                      )}
                    </div>
                    
                    {/* Book Content */}
                    <div className={`${styles.ebookContent} ${
                      viewMode === 'list' ? styles.ebookContentList : styles.ebookContentGrid
                    }`}>
                      {viewMode === 'list' ? (
                        <div className={styles.ebookContentListLayout}>
                          <div className={styles.ebookContentListMain}>
                            <h3 className={`${styles.ebookTitle} ${styles.ebookTitleList}`}>
                              {ebook.title[currentLanguage] || ebook.title?.english || ebook.title}
                            </h3>
                            <p className={styles.ebookAuthor}>
                              {ebook.author[currentLanguage] || ebook.author?.english || ebook.author}
                            </p>
                            <p className={`${styles.ebookDescription} ${styles.ebookDescriptionList}`}>
                              {ebook.description[currentLanguage] || ebook.description?.english || ebook.description}
                            </p>
                          </div>
                          
                          <div className={`${styles.ebookStats} ${styles.ebookStatsList}`}>
                            <div className={styles.ebookRating}>
                              {renderStars(ebook.rating)}
                              <span className={styles.ebookRatingText}>{ebook.rating}</span>
                            </div>
                            <div className={styles.ebookDownloads}>
                              <i className="fas fa-download mr-1"></i>
                              {ebook.downloads?.toLocaleString() || '0'}
                            </div>
                            <span className={styles.ebookCategory}>
                              {getText(
                                categories.find(cat => cat.id === ebook.category)?.title?.english || ebook.category,
                                categories.find(cat => cat.id === ebook.category)?.title?.tamil || ebook.category
                              )}
                            </span>
                          </div>
                          
                          <div className={`${styles.ebookActions} ${styles.ebookActionsList}`}>
                            <button
                              onClick={() => handleDownload(ebook)}
                              className={styles.downloadBtn}
                            >
                              <i className="fas fa-download"></i>
                              {getText('Download', 'பதிவிறக்கம்')}
                            </button>
                            <button
                              onClick={() => openRatingModal(ebook)}
                              className={styles.rateBtn}
                            >
                              <i className="fas fa-star"></i>
                            </button>
                            <button
                              onClick={() => window.open(`/preview/${ebook.id}`, '_blank')}
                              className={styles.previewBtn}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className={`${styles.ebookTitle} ${styles.ebookTitleGrid}`}>
                            {ebook.title[currentLanguage] || ebook.title?.english || ebook.title}
                          </h3>
                          <p className={styles.ebookAuthor}>
                            {ebook.author[currentLanguage] || ebook.author?.english || ebook.author}
                          </p>
                          <p className={`${styles.ebookDescription} ${styles.ebookDescriptionGrid}`}>
                            {ebook.description[currentLanguage] || ebook.description?.english || ebook.description}
                          </p>
                          
                          <div className={`${styles.ebookStats} ${styles.ebookStatsGrid}`}>
                            <div className={styles.ebookRating}>
                              {renderStars(ebook.rating)}
                              <span className={styles.ebookRatingText}>{ebook.rating}</span>
                            </div>
                            <div className={styles.ebookDownloads}>
                              <i className="fas fa-download mr-1"></i>
                              {ebook.downloads?.toLocaleString() || '0'}
                            </div>
                            <span className={styles.ebookCategory}>
                              {getText(
                                categories.find(cat => cat.id === ebook.category)?.title?.english || ebook.category,
                                categories.find(cat => cat.id === ebook.category)?.title?.tamil || ebook.category
                              )}
                            </span>
                          </div>
                          
                          <div className={`${styles.ebookActions} ${styles.ebookActionsGrid}`}>
                            <button
                              onClick={() => handleDownload(ebook)}
                              className={styles.downloadBtn}
                            >
                              <i className="fas fa-download mr-2"></i>
                              {getText('Download', 'பதிவிறக்கம்')}
                            </button>
                            <button
                              onClick={() => openRatingModal(ebook)}
                              className={styles.rateBtn}
                            >
                              <i className="fas fa-star"></i>
                            </button>
                            <button
                              onClick={() => window.open(`/preview/${ebook.id}`, '_blank')}
                              className={styles.previewBtn}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Featured Badge */}
                    {ebook.featured && (
                      <div className={styles.featuredBadgeContainer}>
                        <span className={styles.featuredBadge}>
                          {getText('Featured', 'சிறப்பு')}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
          
          {/* Pagination Controls */}
          {!loading && !error && totalEbooks > 12 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                <i className="fas fa-chevron-left mr-2"></i>
                {getText('Previous', 'முந்தைய')}
              </button>
              
              <div className={styles.paginationNumbers}>
                {Array.from({ length: Math.min(5, Math.ceil(totalEbooks / 12)) }, (_, i) => {
                  const totalPages = Math.ceil(totalEbooks / 12);
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`${styles.paginationNumber} ${
                        currentPage === pageNumber ? styles.paginationNumberActive : ''
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalEbooks / 12)))}
                disabled={currentPage >= Math.ceil(totalEbooks / 12)}
                className={styles.paginationBtn}
              >
                {getText('Next', 'அடுத்த')}
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          )}
          
          {ebooks.length === 0 && !loading && (
            <div className={styles.noBooksContainer}>
              <p className={styles.noBooksText}>{getText('No books found matching your criteria', 'உங்கள் அளவுகோல்களுக்கு பொருந்தும் புத்தகங்கள் எதுவும் கிடைக்கவில்லை')}</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Book Categories Section */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            {getText('Browse by Category', 'வகை வாரியாக உலாவுங்கள்')}
          </h2>
          <p className={styles.sectionDescription}>
            {getText(
              'Explore our diverse collection of books organized by categories',
              'வகைகளால் ஒழுங்கமைக்கப்பட்ட எங்கள் பல்வேறு புத்தக சேகரிப்பை ஆராயுங்கள்'
            )}
          </p>
          
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => {
              const categoryBooks = mockEbooks.filter(book => book.category === category.id);
              return (
                <motion.div
                  key={category.id}
                  className={styles.categoryCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    setCategoryFilter(category.id);
                    setCurrentPage(1);
                    // Scroll to All Books section
                    document.querySelector('[data-section="all-books"]')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  <div className={styles.categoryIcon}>
                    <i className={`fas ${category.icon}`}></i>
                  </div>
                  
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryTitle}>
                      {category.title[currentLanguage]}
                    </h3>
                    <p className={styles.categoryDescription}>
                      {category.description[currentLanguage]}
                    </p>
                    <div className={styles.categoryStats}>
                      <span className={styles.bookCount}>
                        {categoryBooks.length} {getText('books', 'புத்தகங்கள்')}
                      </span>
                      <span className={styles.categoryArrow}>
                        <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                  
                  {/* Category Background Pattern */}
                  <div className={styles.categoryPattern}>
                    <div className={styles.patternDot}></div>
                    <div className={styles.patternDot}></div>
                    <div className={styles.patternDot}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* View All Categories Button */}
          <div className={styles.categoryActions}>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setCurrentPage(1);
                document.querySelector('[data-section="all-books"]')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className={styles.viewAllBtn}
            >
              {getText('View All Books', 'அனைத்து புத்தகங்களையும் பார்க்கவும்')}
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
      
      {/* Rating Modal */}
      {showRatingModal && selectedBook && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {getText('Rate this Book', 'இந்த புத்தகத்தை மதிப்பிடுங்கள்')}
            </h3>
            <p className={styles.modalSubtitle}>{selectedBook.title[currentLanguage]}</p>
            
            <div className={styles.modalStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`${styles.modalStar} ${
                    star <= selectedRating ? styles.modalStarActive : ''
                  }`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
            
            <div className={styles.modalActions}>
              <button
                onClick={submitRating}
                disabled={selectedRating === 0}
                className={styles.modalSubmitBtn}
              >
                {getText('Submit', 'சமர்ப்பிக்கவும்')}
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className={styles.modalCancelBtn}
              >
                {getText('Cancel', 'ரத்து செய்யவும்')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className={styles.languageToggle}
      >
        {currentLanguage === 'english' ? 'தமிழ்' : 'English'}
      </button>
    </div>
  );
}