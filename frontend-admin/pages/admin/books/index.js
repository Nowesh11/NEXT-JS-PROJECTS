'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../../components/layout/AdminLayout';
import BookModal from '../../../components/modals/BookModal';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  StarIcon,
  TagIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/solid';

const BooksManagement = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);

  // Sample books data
  const sampleBooks = [
    {
      id: 1,
      title: 'Tamil Poetry Collection',
      author: 'Dr. Kamala Subramaniam',
      category: 'Poetry',
      price: 299,
      status: 'published',
      rating: 4.5,
      reviews: 23,
      publishedDate: '2024-01-15',
      description: 'A comprehensive collection of classical Tamil poetry with modern interpretations.',
      image: '/api/placeholder/300/400',
      isbn: '978-81-123-4567-8',
      pages: 256,
      language: 'Tamil',
      publisher: 'Tamil Literary Society',
      stock: 45,
      tags: ['Poetry', 'Classical', 'Tamil Literature']
    },
    {
      id: 2,
      title: 'Modern Tamil Grammar',
      author: 'Prof. Ravi Shankar',
      category: 'Educational',
      price: 450,
      status: 'published',
      rating: 4.8,
      reviews: 67,
      publishedDate: '2024-02-20',
      description: 'Complete guide to modern Tamil grammar with practical examples.',
      image: '/api/placeholder/300/400',
      isbn: '978-81-123-4567-9',
      pages: 384,
      language: 'Tamil',
      publisher: 'Educational Press',
      stock: 32,
      tags: ['Grammar', 'Educational', 'Reference']
    },
    {
      id: 3,
      title: 'Cultural Heritage of Tamil Nadu',
      author: 'Dr. Meera Rajesh',
      category: 'Cultural Studies',
      price: 599,
      status: 'published',
      rating: 4.3,
      reviews: 41,
      publishedDate: '2024-03-10',
      description: 'Exploring the rich cultural heritage and traditions of Tamil Nadu.',
      image: '/api/placeholder/300/400',
      isbn: '978-81-123-4567-0',
      pages: 512,
      language: 'English',
      publisher: 'Heritage Publications',
      stock: 28,
      tags: ['Culture', 'History', 'Tamil Nadu']
    },
    {
      id: 4,
      title: 'Digital Tamil Dictionary',
      author: 'Tamil Tech Team',
      category: 'Reference',
      price: 199,
      status: 'draft',
      rating: 0,
      reviews: 0,
      publishedDate: null,
      description: 'Comprehensive digital dictionary with pronunciation guides.',
      image: '/api/placeholder/300/400',
      isbn: '978-81-123-4567-1',
      pages: 0,
      language: 'Tamil',
      publisher: 'Digital Press',
      stock: 0,
      tags: ['Dictionary', 'Digital', 'Reference']
    },
    {
      id: 5,
      title: 'Ancient Tamil Scripts',
      author: 'Dr. Kamala Devi',
      category: 'Historical',
      price: 750,
      status: 'inactive',
      rating: 4.1,
      reviews: 15,
      publishedDate: '2023-08-15',
      description: 'Study of ancient Tamil scripts and their evolution.',
      image: '/api/placeholder/300/400',
      isbn: '978-81-123-4567-2',
      pages: 420,
      language: 'Tamil',
      publisher: 'Historical Society',
      stock: 0,
      tags: ['History', 'Scripts', 'Ancient']
    }
  ];

  const categories = ['all', 'Poetry', 'Educational', 'Cultural Studies', 'Reference', 'Historical', 'Fiction', 'Non-Fiction'];
  const statuses = ['all', 'published', 'draft', 'inactive', 'archived'];

  useEffect(() => {
    // Simulate API call to load books
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate potential API error (uncomment to test error state)
        // if (Math.random() > 0.8) throw new Error('Failed to load books');
        
        setBooks(sampleBooks);
      } catch (err) {
        console.error('Error loading books:', err);
        setError(err.message || 'Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Filter and sort books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
      case 'oldest':
        return new Date(a.publishedDate || 0) - new Date(b.publishedDate || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleAddBook = () => {
    setSelectedBook(null);
    setShowAddModal(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setOperationLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate potential API error (uncomment to test)
      // if (Math.random() > 0.8) throw new Error('Failed to delete book');
      
      setBooks(books.filter(book => book.id !== selectedBook.id));
      setShowDeleteModal(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err.message || 'Failed to delete book. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft': return <PencilIcon className="w-4 h-4" />;
      case 'archived': return <ArchiveBoxIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      default: return <QuestionMarkCircleIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const retryLoadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBooks(sampleBooks);
    } catch (err) {
      console.error('Error loading books:', err);
      setError(err.message || 'Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Title',
        'Author',
        'Category',
        'Status',
        'Price',
        'Rating',
        'Reviews',
        'Sales',
        'Created Date'
      ];

      const csvData = filteredBooks.map(book => [
        book.title,
        book.author,
        book.category,
        book.status,
        book.price,
        book.rating,
        book.reviews,
        book.sales,
        new Date(book.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `books-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV. Please try again.');
    }
  };

  if (loading) {
    return (
      <AdminLayout 
        getText={getText} 
        language={language} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage}
      >
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="w-16 h-16 border-4 border-cultural-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        getText={getText} 
        language={language} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage}
      >
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {getText('error', 'Error Loading Books')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <motion.button
              onClick={retryLoadBooks}
              className="px-6 py-2 bg-cultural-500 text-white rounded-lg hover:bg-cultural-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getText('retry', 'Try Again')}
            </motion.button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      getText={getText} 
      language={language} 
      theme={theme} 
      toggleTheme={toggleTheme} 
      toggleLanguage={toggleLanguage}
    >
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getText ? getText('admin.books.title', 'Books Management') : 'Books Management'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.books.subtitle', 'Manage your book collection and inventory') : 'Manage your book collection and inventory'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 sm:px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hidden sm:inline">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
              <span className="sm:hidden">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </motion.button>
            
            <motion.button
              onClick={exportToCSV}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export books to CSV"
            >
              <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </motion.button>
            
            <motion.button
              onClick={handleAddBook}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{getText ? getText('admin.books.addBook', 'Add Book') : 'Add Book'}</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={getText ? getText('admin.books.search.placeholder', 'Search books, authors, categories, tags...') : 'Search books, authors, categories, tags...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="price-high">Price High-Low</option>
              <option value="price-low">Price Low-High</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} books
            </span>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:text-cultural-500 transition-colors">
                <ArrowUpTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 hover:text-cultural-500 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>
        </motion.div>

        {/* Books Grid/List */}
        <motion.div variants={itemVariants}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentBooks.map((book) => (
                <motion.div
                  key={book.id}
                  className="glass-morphism rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Book Cover */}
                  <div className="relative h-48 bg-gradient-to-br from-cultural-100 to-digital-100 dark:from-cultural-900/20 dark:to-digital-900/20">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)}
                        {getStatusText(book.status)}
                      </span>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <motion.button
                        onClick={() => handleEditBook(book)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditBook(book)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteBook(book)}
                        className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl text-white hover:bg-red-500/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {book.author}
                    </p>
                    
                    {/* Rating */}
                    {book.status === 'published' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(book.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({book.reviews})
                        </span>
                      </div>
                    )}
                    
                    {/* Price and Category */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-cultural-600 dark:text-cultural-400">
                        ₹{book.price}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                        {book.category}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-digital-100 dark:bg-digital-900/20 text-digital-600 dark:text-digital-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {book.tags.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          +{book.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Stock: {book.stock}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {book.pages} pages
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {currentBooks.map((book) => (
                <motion.div
                  key={book.id}
                  className="glass-morphism rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <div className="flex items-center gap-6">
                    {/* Book Cover */}
                    <div className="w-20 h-28 bg-gradient-to-br from-cultural-100 to-digital-100 dark:from-cultural-900/20 dark:to-digital-900/20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            by {book.author}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(book.status)}`}>
                          {getStatusIcon(book.status)}
                          {getStatusText(book.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {book.description}
                      </p>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <CurrencyRupeeIcon className="w-5 h-5 text-cultural-500" />
                          <span className="font-bold text-cultural-600 dark:text-cultural-400">
                            ₹{book.price}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {book.category}
                          </span>
                        </div>
                        
                        {book.status === 'published' && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {renderStars(book.rating)}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">
                              ({book.reviews} reviews)
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {book.pages} pages
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Stock: {book.stock}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {book.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-digital-100 dark:bg-digital-900/20 text-digital-600 dark:text-digital-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleEditBook(book)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditBook(book)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-cultural-600 dark:hover:text-cultural-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteBook(book)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto px-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base min-w-[40px] ${
                    currentPage === page
                      ? 'bg-cultural-500 text-white'
                      : 'glass-morphism text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Book Modal */}
      <BookModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onSave={(bookData) => {
          if (showEditModal && selectedBook) {
            // Update existing book
            setBooks(prev => prev.map(book => 
              book.id === selectedBook.id 
                ? { ...book, ...bookData, id: selectedBook.id }
                : book
            ));
          } else {
            // Add new book
            const newBook = {
              ...bookData,
              id: Date.now(),
              rating: 0,
              reviews: 0,
              sales: 0,
              createdAt: new Date().toISOString()
            };
            setBooks(prev => [newBook, ...prev]);
          }
          
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedBook(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Delete Book
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedBook?.title}"? This will permanently remove the book from your collection.
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={operationLoading}
                  className="px-4 py-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!operationLoading ? { scale: 1.05 } : {}}
                  whileTap={!operationLoading ? { scale: 0.95 } : {}}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  disabled={operationLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={!operationLoading ? { scale: 1.05 } : {}}
                  whileTap={!operationLoading ? { scale: 0.95 } : {}}
                >
                  {operationLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {operationLoading ? 'Deleting...' : 'Delete Book'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification Toast */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            className="fixed top-4 right-4 z-50 max-w-md"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="glass-morphism rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Operation Failed
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <motion.button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default BooksManagement;