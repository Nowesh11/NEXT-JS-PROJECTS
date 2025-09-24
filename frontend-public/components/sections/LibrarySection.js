'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpenIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ShoppingCartIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  ShareIcon,
  LanguageIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const LibrarySection = ({ getText, language }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [hoveredBook, setHoveredBook] = useState(null);

  const categories = [
    { id: 'all', label: getText('library.category.all', 'All Books'), icon: BookOpenIcon },
    { id: 'literature', label: getText('library.category.literature', 'Literature'), icon: DocumentTextIcon },
    { id: 'poetry', label: getText('library.category.poetry', 'Poetry'), icon: SparklesIcon },
    { id: 'history', label: getText('library.category.history', 'History'), icon: BookOpenIcon },
    { id: 'education', label: getText('library.category.education', 'Education'), icon: BookOpenIcon },
    { id: 'research', label: getText('library.category.research', 'Research'), icon: DocumentTextIcon }
  ];

  const books = [
    {
      id: 1,
      title: getText('library.book1.title', 'திருக்குறள் - முழு தொகுப்பு'),
      titleEn: 'Thirukkural - Complete Collection',
      author: getText('library.book1.author', 'திருவள்ளுவர்'),
      authorEn: 'Thiruvalluvar',
      category: 'literature',
      type: 'ebook',
      rating: 4.9,
      reviews: 1250,
      price: 0, // Free
      originalPrice: 299,
      pages: 1330,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book1.desc', 'Complete collection of Thirukkural with modern Tamil commentary and English translations'),
      cover: '/assets/books/thirukkural.jpg',
      tags: ['Classic', 'Philosophy', 'Ethics', 'Tamil Literature'],
      downloadCount: 15420,
      isPopular: true,
      isFree: true,
      gradient: 'gradient-cultural'
    },
    {
      id: 2,
      title: getText('library.book2.title', 'சிலப்பதிகாரம் - விரிவுரை'),
      titleEn: 'Silappatikaram - Detailed Commentary',
      author: getText('library.book2.author', 'இளங்கோ அடிகள்'),
      authorEn: 'Ilango Adigal',
      category: 'literature',
      type: 'ebook',
      rating: 4.7,
      reviews: 890,
      price: 199,
      originalPrice: 399,
      pages: 856,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book2.desc', 'Epic Tamil literature with comprehensive analysis and cultural context'),
      cover: '/assets/books/silappatikaram.jpg',
      tags: ['Epic', 'Literature', 'Culture', 'History'],
      downloadCount: 8750,
      isPopular: true,
      isFree: false,
      gradient: 'gradient-tamil'
    },
    {
      id: 3,
      title: getText('library.book3.title', 'நாலடியார் - பொருள் விளக்கம்'),
      titleEn: 'Naladiyar - Meaning and Explanation',
      author: getText('library.book3.author', 'பல்வேறு புலவர்கள்'),
      authorEn: 'Various Poets',
      category: 'poetry',
      type: 'ebook',
      rating: 4.6,
      reviews: 567,
      price: 149,
      originalPrice: 249,
      pages: 420,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book3.desc', 'Collection of four-line Tamil poems with moral and philosophical teachings'),
      cover: '/assets/books/naladiyar.jpg',
      tags: ['Poetry', 'Philosophy', 'Morals', 'Wisdom'],
      downloadCount: 5230,
      isPopular: false,
      isFree: false,
      gradient: 'gradient-digital'
    },
    {
      id: 4,
      title: getText('library.book4.title', 'தமிழ் இலக்கண வரலாறு'),
      titleEn: 'History of Tamil Grammar',
      author: getText('library.book4.author', 'டாக்டர் கு. சுந்தரம்'),
      authorEn: 'Dr. K. Sundaram',
      category: 'education',
      type: 'ebook',
      rating: 4.8,
      reviews: 342,
      price: 0,
      originalPrice: 199,
      pages: 680,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book4.desc', 'Comprehensive study of Tamil grammar evolution and linguistic development'),
      cover: '/assets/books/grammar-history.jpg',
      tags: ['Grammar', 'Linguistics', 'Education', 'Research'],
      downloadCount: 3890,
      isPopular: false,
      isFree: true,
      gradient: 'gradient-emerald'
    },
    {
      id: 5,
      title: getText('library.book5.title', 'பரிபாடல் - இசை இலக்கியம்'),
      titleEn: 'Paripadal - Musical Literature',
      author: getText('library.book5.author', 'சங்க கால புலவர்கள்'),
      authorEn: 'Sangam Era Poets',
      category: 'literature',
      type: 'ebook',
      rating: 4.5,
      reviews: 234,
      price: 99,
      originalPrice: 179,
      pages: 320,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book5.desc', 'Ancient Tamil musical poetry with detailed annotations and cultural significance'),
      cover: '/assets/books/paripadal.jpg',
      tags: ['Music', 'Poetry', 'Sangam', 'Culture'],
      downloadCount: 2150,
      isPopular: false,
      isFree: false,
      gradient: 'gradient-primary'
    },
    {
      id: 6,
      title: getText('library.book6.title', 'தமிழர் வரலாறு - புதிய பார்வை'),
      titleEn: 'Tamil History - New Perspective',
      author: getText('library.book6.author', 'பேராசிரியர் மு. இராகவன்'),
      authorEn: 'Professor M. Raghavan',
      category: 'history',
      type: 'ebook',
      rating: 4.7,
      reviews: 456,
      price: 249,
      originalPrice: 399,
      pages: 920,
      language: 'Tamil',
      publishYear: '2024',
      description: getText('library.book6.desc', 'Comprehensive Tamil history with archaeological evidence and modern research'),
      cover: '/assets/books/tamil-history.jpg',
      tags: ['History', 'Culture', 'Research', 'Archaeology'],
      downloadCount: 6780,
      isPopular: true,
      isFree: false,
      gradient: 'gradient-cultural'
    }
  ];

  const filteredBooks = books.filter(book => {
    const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.floor(rating);
      const partial = index === Math.floor(rating) && rating % 1 !== 0;
      
      return (
        <div key={index} className="relative">
          {filled ? (
            <StarSolidIcon className="w-4 h-4 text-yellow-400" />
          ) : partial ? (
            <div className="relative">
              <StarIcon className="w-4 h-4 text-gray-300" />
              <StarSolidIcon 
                className="w-4 h-4 text-yellow-400 absolute top-0 left-0" 
                style={{ clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` }}
              />
            </div>
          ) : (
            <StarIcon className="w-4 h-4 text-gray-300" />
          )}
        </div>
      );
    });
  };

  return (
    <section 
      id="library" 
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
      aria-labelledby="library-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-3" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tamil-500 via-cultural-500 to-digital-500" />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-tamil-500/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 left-10 w-28 h-28 bg-cultural-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

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
            <BookOpenIcon className="w-5 h-5 text-tamil-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getText('library.badge', 'Digital Tamil Library')}
            </span>
          </motion.div>
          
          <h2 
            id="library-heading"
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            <span className="gradient-tamil bg-clip-text text-transparent">
              {getText('library.title', 'Tamil Literature')}
            </span>
            <br />
            <span className="text-gray-800 dark:text-white">
              {getText('library.subtitle', 'Digital Collection')}
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {getText(
              'library.description', 
              'Discover our comprehensive digital library featuring classical Tamil literature, modern works, and educational resources with proper Tamil font rendering and accessibility features.'
            )}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={getText('library.search.placeholder', 'Search books, authors, or topics...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 glass-morphism rounded-2xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tamil-500/50"
              />
            </div>
            <motion.button
              className="glass-button px-6 py-4 rounded-2xl font-medium text-gray-800 dark:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FunnelIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'glass-morphism text-tamil-600 dark:text-tamil-400 shadow-tamil'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-5 h-5" />
                  {category.label}
                  {activeCategory === category.id && (
                    <motion.div
                      className="w-2 h-2 bg-tamil-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Books Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${activeCategory}-${searchQuery}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
                className="group"
                onHoverStart={() => setHoveredBook(book.id)}
                onHoverEnd={() => setHoveredBook(null)}
              >
                <motion.div 
                  className="glass-morphism rounded-3xl overflow-hidden h-full card-hover relative"
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Book Cover */}
                  <div className="relative h-64 overflow-hidden">
                    <div className={`absolute inset-0 ${book.gradient} opacity-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Popular Badge */}
                    {book.isPopular && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-tamil-500">
                          <SparklesIcon className="w-3 h-3" />
                          {getText('library.popular', 'Popular')}
                        </div>
                      </div>
                    )}
                    
                    {/* Free Badge */}
                    {book.isFree && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-1 rounded-full text-xs font-medium text-white bg-emerald-500">
                          {getText('library.free', 'Free')}
                        </div>
                      </div>
                    )}
                    
                    {/* Book Cover Placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <BookOpenIcon className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                    </div>
                    
                    {/* Hover Actions */}
                    <motion.div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.button
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <HeartIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShareIcon className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  </div>
                  
                  {/* Book Content */}
                  <div className="p-6">
                    {/* Title and Author */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 font-tamil leading-tight">
                        {language === 'ta' ? book.title : book.titleEn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-tamil">
                        {language === 'ta' ? book.author : book.authorEn}
                      </p>
                    </div>
                    
                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(book.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {book.rating}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({book.reviews} {getText('library.reviews', 'reviews')})
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                      {book.description}
                    </p>
                    
                    {/* Book Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{book.pages} {getText('library.pages', 'pages')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LanguageIcon className="w-4 h-4" />
                        <span>{book.language}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>{book.downloadCount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {book.isFree ? (
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {getText('library.free', 'Free')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-800 dark:text-white">
                              ₹{book.price}
                            </span>
                            {book.originalPrice > book.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{book.originalPrice}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-tamil-600 dark:hover:text-tamil-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </motion.button>
                        
                        {!book.isFree && (
                          <motion.button
                            className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-digital-600 dark:hover:text-digital-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ShoppingCartIcon className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tamil-500 to-cultural-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
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
              <BookOpenIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {getText('library.cta', 'Explore Full Library')}
              <motion.div
                className="w-2 h-2 bg-tamil-500 rounded-full"
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

export default LibrarySection;