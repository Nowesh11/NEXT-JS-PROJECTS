'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../../components/layout/AdminLayout';
import {
  DeviceTabletIcon,
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
  CloudArrowDownIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const EBooksManagement = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ebooksPerPage] = useState(12);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample ebooks data
  const sampleEbooks = [
    {
      id: 1,
      title: 'Digital Tamil Literature',
      titleTa: 'டிஜிட்டல் தமிழ் இலக்கியம்',
      author: 'Dr. Priya Krishnan',
      authorTa: 'டாக்டர் பிரியா கிருஷ்ணன்',
      category: 'Literature',
      price: 199,
      status: 'published',
      rating: 4.6,
      reviews: 34,
      publishedDate: '2024-01-20',
      description: 'Comprehensive collection of modern Tamil literature in digital format.',
      descriptionTa: 'டிஜிட்டல் வடிவத்தில் நவீன தமிழ் இலக்கியத்தின் விரிவான தொகுப்பு.',
      cover: '/api/placeholder/300/400',
      format: 'PDF',
      fileSize: '15.2 MB',
      pages: 324,
      language: 'Tamil',
      publisher: 'Digital Tamil Press',
      downloads: 1250,
      audiobook: true,
      duration: '8h 45m',
      tags: ['Literature', 'Tamil', 'Modern', 'Digital']
    },
    {
      id: 2,
      title: 'Interactive Tamil Grammar',
      titleTa: 'ஊடாடும் தமிழ் இலக்கணம்',
      author: 'Prof. Suresh Kumar',
      authorTa: 'பேராசிரியர் சுரேஷ் குமார்',
      category: 'Educational',
      price: 299,
      status: 'published',
      rating: 4.8,
      reviews: 89,
      publishedDate: '2024-02-15',
      description: 'Interactive e-book with multimedia content for learning Tamil grammar.',
      descriptionTa: 'தமிழ் இலக்கணம் கற்றுக்கொள்வதற்கான பல்லூடக உள்ளடக்கத்துடன் கூடிய ஊடாடும் மின்னூல்.',
      cover: '/api/placeholder/300/400',
      format: 'EPUB',
      fileSize: '45.8 MB',
      pages: 256,
      language: 'Tamil',
      publisher: 'EduTech Publications',
      downloads: 2100,
      audiobook: false,
      duration: null,
      tags: ['Grammar', 'Educational', 'Interactive', 'Multimedia']
    },
    {
      id: 3,
      title: 'Tamil Cultural Heritage',
      titleTa: 'தமிழ் கலாச்சார பாரம்பரியம்',
      author: 'Dr. Lakshmi Narayan',
      authorTa: 'டாக்டர் லக்ஷ்மி நாராயணன்',
      category: 'Cultural Studies',
      price: 399,
      status: 'published',
      rating: 4.4,
      reviews: 56,
      publishedDate: '2024-03-05',
      description: 'Rich multimedia exploration of Tamil cultural heritage and traditions.',
      descriptionTa: 'தமிழ் கலாச்சார பாரம்பரியம் மற்றும் பாரம்பரியங்களின் வளமான பல்லூடக ஆய்வு.',
      cover: '/api/placeholder/300/400',
      format: 'Interactive',
      fileSize: '125.6 MB',
      pages: 412,
      language: 'English',
      publisher: 'Heritage Digital',
      downloads: 890,
      audiobook: true,
      duration: '12h 30m',
      tags: ['Culture', 'Heritage', 'Multimedia', 'History']
    },
    {
      id: 4,
      title: 'Modern Tamil Poetry Collection',
      author: 'Various Authors',
      category: 'Poetry',
      price: 149,
      status: 'draft',
      rating: 0,
      reviews: 0,
      publishedDate: null,
      description: 'Curated collection of contemporary Tamil poetry with audio narrations.',
      cover: '/api/placeholder/300/400',
      format: 'EPUB',
      fileSize: '8.4 MB',
      pages: 180,
      language: 'Tamil',
      publisher: 'Poetry Digital',
      downloads: 0,
      audiobook: true,
      duration: '4h 15m',
      tags: ['Poetry', 'Contemporary', 'Audio', 'Collection']
    },
    {
      id: 5,
      title: 'Tamil Language Learning App',
      author: 'Language Tech Team',
      category: 'Educational',
      price: 599,
      status: 'published',
      rating: 4.9,
      reviews: 156,
      publishedDate: '2024-01-10',
      description: 'Interactive app-based e-book for learning Tamil with games and exercises.',
      cover: '/api/placeholder/300/400',
      format: 'App',
      fileSize: '89.2 MB',
      pages: 0,
      language: 'Multi',
      publisher: 'LangTech Digital',
      downloads: 3400,
      audiobook: true,
      duration: '20h+',
      tags: ['Learning', 'Interactive', 'Games', 'App']
    }
  ];

  const categories = ['all', 'Literature', 'Educational', 'Cultural Studies', 'Poetry', 'Reference', 'Fiction'];
  const formats = ['all', 'PDF', 'EPUB', 'Interactive', 'App', 'Audiobook'];
  const statuses = ['all', 'published', 'draft', 'archived'];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEbooks(sampleEbooks);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort ebooks
  const filteredEbooks = ebooks.filter(ebook => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = ebook.title.toLowerCase().includes(searchLower) ||
                         ebook.author.toLowerCase().includes(searchLower) ||
                         (ebook.titleTa && ebook.titleTa.includes(searchTerm)) ||
                         (ebook.authorTa && ebook.authorTa.includes(searchTerm)) ||
                         (ebook.description && ebook.description.toLowerCase().includes(searchLower)) ||
                         (ebook.descriptionTa && ebook.descriptionTa.includes(searchTerm)) ||
                         ebook.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                         ebook.category.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || ebook.category === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || ebook.format === selectedFormat;
    const matchesStatus = selectedStatus === 'all' || ebook.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesFormat && matchesStatus;
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
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastEbook = currentPage * ebooksPerPage;
  const indexOfFirstEbook = indexOfLastEbook - ebooksPerPage;
  const currentEbooks = filteredEbooks.slice(indexOfFirstEbook, indexOfLastEbook);
  const totalPages = Math.ceil(filteredEbooks.length / ebooksPerPage);

  const handleAddEbook = () => {
    setSelectedEbook(null);
    setShowAddModal(true);
  };

  const handleEditEbook = (ebook) => {
    setSelectedEbook(ebook);
    setShowEditModal(true);
  };

  const handleDeleteEbook = (ebook) => {
    setSelectedEbook(ebook);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEbooks(ebooks.filter(ebook => ebook.id !== selectedEbook.id));
      showNotification('success', 'E-book deleted successfully!');
      setShowDeleteModal(false);
      setSelectedEbook(null);
    } catch (error) {
      showNotification('error', 'Failed to delete e-book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedEbook) {
        // Edit existing ebook
        const updatedEbooks = ebooks.map(ebook => 
          ebook.id === selectedEbook.id ? { ...ebook, ...formData } : ebook
        );
        setEbooks(updatedEbooks);
        showNotification('success', 'E-book updated successfully!');
        setShowEditModal(false);
      } else {
        // Add new ebook
        const newEbook = {
          ...formData,
          id: Math.max(...ebooks.map(e => e.id)) + 1,
          publishedDate: new Date().toISOString().split('T')[0],
          downloads: 0,
          reviews: 0,
          rating: 0
        };
        setEbooks([...ebooks, newEbook]);
        showNotification('success', 'E-book added successfully!');
        setShowAddModal(false);
      }
      setSelectedEbook(null);
    } catch (error) {
      setError('Failed to save e-book. Please try again.');
      showNotification('error', 'Failed to save e-book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'ID', 'Title (English)', 'Title (Tamil)', 'Author (English)', 'Author (Tamil)',
      'Category', 'Language', 'Format', 'Status', 'Price', 'Pages', 'Publisher',
      'Description (English)', 'Description (Tamil)', 'Tags', 'Published Date',
      'Downloads', 'Rating', 'Reviews', 'Audiobook', 'Duration'
    ];

    const csvData = filteredEbooks.map(ebook => [
      ebook.id,
      `"${ebook.title || ''}"`,
      `"${ebook.titleTa || ''}"`,
      `"${ebook.author || ''}"`,
      `"${ebook.authorTa || ''}"`,
      ebook.category,
      ebook.language,
      ebook.format,
      ebook.status,
      ebook.price,
      ebook.pages,
      `"${ebook.publisher || ''}"`,
      `"${ebook.description || ''}"`,
      `"${ebook.descriptionTa || ''}"`,
      `"${ebook.tags ? ebook.tags.join(', ') : ''}"`,
      ebook.publishedDate,
      ebook.downloads,
      ebook.rating,
      ebook.reviews,
      ebook.audiobook ? 'Yes' : 'No',
      `"${ebook.duration || ''}"`
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ebooks-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', 'E-books exported to CSV successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'PDF': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'EPUB': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Interactive': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'App': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Audiobook': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
            className="w-16 h-16 border-4 border-digital-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
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
      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckIcon className="w-5 h-5" />}
            {notification.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </motion.div>
      )}

      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getText ? getText('admin.ebooks.title', 'E-Books Management') : 'E-Books Management'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.ebooks.subtitle', 'Manage your digital book collection and downloads') : 'Manage your digital book collection and downloads'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </motion.button>
            
            <motion.button
              onClick={handleAddEbook}
              className="flex items-center gap-2 px-4 py-2 bg-digital-500 text-white rounded-xl font-medium hover:bg-digital-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-5 h-5" />
              {getText ? getText('admin.ebooks.addEbook', 'Add E-Book') : 'Add E-Book'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-morphism rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-digital-100 dark:bg-digital-900/20 rounded-xl">
                <DeviceTabletIcon className="w-5 h-5 sm:w-6 sm:h-6 text-digital-600 dark:text-digital-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {ebooks.filter(e => e.status === 'published').length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Published E-Books</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <CloudArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {ebooks.reduce((sum, e) => sum + e.downloads, 0).toLocaleString()}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Total Downloads</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <SpeakerWaveIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {ebooks.filter(e => e.audiobook).length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Audiobooks</h3>
          </div>
          
          <div className="glass-morphism rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {ebooks.filter(e => e.status === 'draft').length}
              </span>
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Drafts</h3>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="glass-morphism rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={getText ? getText('admin.ebooks.search.placeholder', 'Search e-books, authors, tags...') : 'Search e-books, authors, tags...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
            >
              {formats.map(format => (
                <option key={format} value={format}>
                  {format === 'all' ? 'All Formats' : format}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
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
              className="px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="price-high">Price High-Low</option>
              <option value="price-low">Price Low-High</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-center sm:text-left">
              Showing {indexOfFirstEbook + 1}-{Math.min(indexOfLastEbook, filteredEbooks.length)} of {filteredEbooks.length} e-books
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg sm:rounded-none bg-gray-100 sm:bg-transparent dark:bg-gray-800 sm:dark:bg-transparent hover:text-digital-500 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span className="sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg sm:rounded-none bg-gray-100 sm:bg-transparent dark:bg-gray-800 sm:dark:bg-transparent hover:text-digital-500 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="sm:inline">Import</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* E-books Grid/List */}
        <motion.div variants={itemVariants}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentEbooks.map((ebook) => (
                <motion.div
                  key={ebook.id}
                  className="glass-morphism rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* E-book Cover */}
                  <div className="relative h-48 bg-gradient-to-br from-digital-100 to-cultural-100 dark:from-digital-900/20 dark:to-cultural-900/20">
                    <img
                      src={ebook.cover}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(ebook.format)}`}>
                        {ebook.format}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ebook.status)}`}>
                        {ebook.status.charAt(0).toUpperCase() + ebook.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Audiobook indicator */}
                    {ebook.audiobook && (
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                          <SpeakerWaveIcon className="w-3 h-3" />
                          {ebook.duration}
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <motion.button
                        onClick={() => handleEditEbook(ebook)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditEbook(ebook)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteEbook(ebook)}
                        className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl text-white hover:bg-red-500/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* E-book Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">
                        {ebook.title}
                      </h3>
                      {ebook.titleTa && (
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                          {ebook.titleTa}
                        </h4>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {ebook.author}
                      </p>
                      {ebook.authorTa && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {ebook.authorTa}
                        </p>
                      )}
                    </div>
                    
                    {/* Rating */}
                    {ebook.status === 'published' && ebook.rating > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(ebook.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({ebook.reviews})
                        </span>
                      </div>
                    )}
                    
                    {/* Price and Downloads */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-digital-600 dark:text-digital-400">
                        ₹{ebook.price}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {ebook.downloads.toLocaleString()} downloads
                      </span>
                    </div>
                    
                    {/* File info */}
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>{ebook.fileSize}</span>
                      <span>{ebook.pages > 0 ? `${ebook.pages} pages` : 'Interactive'}</span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ebook.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-cultural-100 dark:bg-cultural-900/20 text-cultural-600 dark:text-cultural-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {ebook.tags.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          +{ebook.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Category */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {ebook.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {currentEbooks.map((ebook) => (
                <motion.div
                  key={ebook.id}
                  className="glass-morphism rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <div className="flex items-center gap-6">
                    {/* E-book Cover */}
                    <div className="w-20 h-28 bg-gradient-to-br from-digital-100 to-cultural-100 dark:from-digital-900/20 dark:to-cultural-900/20 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img
                        src={ebook.cover}
                        alt={ebook.title}
                        className="w-full h-full object-cover"
                      />
                      {ebook.audiobook && (
                        <div className="absolute bottom-1 left-1">
                          <SpeakerWaveIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* E-book Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              {ebook.title}
                            </h3>
                            {ebook.titleTa && (
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mt-1">
                                {ebook.titleTa}
                              </h4>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              by {ebook.author}
                            </p>
                            {ebook.authorTa && (
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {ebook.authorTa}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(ebook.format)}`}>
                            {ebook.format}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ebook.status)}`}>
                            {ebook.status.charAt(0).toUpperCase() + ebook.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {ebook.description}
                      </p>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <CurrencyRupeeIcon className="w-5 h-5 text-digital-500" />
                          <span className="font-bold text-digital-600 dark:text-digital-400">
                            ₹{ebook.price}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CloudArrowDownIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {ebook.downloads.toLocaleString()} downloads
                          </span>
                        </div>
                        
                        {ebook.status === 'published' && ebook.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {renderStars(ebook.rating)}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">
                              ({ebook.reviews} reviews)
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            {ebook.fileSize}
                          </span>
                        </div>
                        
                        {ebook.audiobook && (
                          <div className="flex items-center gap-2">
                            <SpeakerWaveIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {ebook.duration}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ebook.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-cultural-100 dark:bg-cultural-900/20 text-cultural-600 dark:text-cultural-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleEditEbook(ebook)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditEbook(ebook)}
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-digital-600 dark:hover:text-digital-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteEbook(ebook)}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-digital-500 text-white'
                      : 'glass-morphism text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit E-Book Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }} />
            <motion.div
              className="relative glass-morphism rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {showAddModal ? 'Add New E-Book' : 'Edit E-Book'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                // Convert tags string to array
                if (data.tags) {
                  data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                }
                // Convert numeric fields
                data.price = parseFloat(data.price) || 0;
                data.pages = parseInt(data.pages) || 0;
                data.audiobook = data.audiobook === 'on';
                handleFormSubmit(data);
              }}>
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title (English) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedEbook?.title || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="Enter English title"
                      required
                    />
                  </div>

                  {/* Title (Tamil) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (Tamil) *
                    </label>
                    <input
                      type="text"
                      name="titleTa"
                      defaultValue={selectedEbook?.titleTa || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="தமிழ் தலைப்பை உள்ளிடவும்"
                      required
                    />
                  </div>

                  {/* Author (English) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author (English) *
                    </label>
                    <input
                      type="text"
                      name="author"
                      defaultValue={selectedEbook?.author || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="Enter author name"
                      required
                    />
                  </div>

                  {/* Author (Tamil) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author (Tamil) *
                    </label>
                    <input
                      type="text"
                      name="authorTa"
                      defaultValue={selectedEbook?.authorTa || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="ஆசிரியர் பெயரை உள்ளிடவும்"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      defaultValue={selectedEbook?.category || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Literature">Literature</option>
                      <option value="Educational">Educational</option>
                      <option value="Cultural Studies">Cultural Studies</option>
                      <option value="Poetry">Poetry</option>
                      <option value="History">History</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language *
                    </label>
                    <select
                      name="language"
                      defaultValue={selectedEbook?.language || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      required
                    >
                      <option value="">Select Language</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                      <option value="Bilingual">Bilingual</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format *
                    </label>
                    <select
                      name="format"
                      defaultValue={selectedEbook?.format || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      required
                    >
                      <option value="">Select Format</option>
                      <option value="PDF">PDF</option>
                      <option value="EPUB">EPUB</option>
                      <option value="Interactive">Interactive</option>
                      <option value="App">App</option>
                      <option value="Audiobook">Audiobook</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedEbook?.status || 'draft'}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Description (English) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (English) *
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={selectedEbook?.description || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50 resize-none"
                      placeholder="Enter English description"
                      required
                    />
                  </div>

                  {/* Description (Tamil) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Tamil) *
                    </label>
                    <textarea
                      name="descriptionTa"
                      rows={4}
                      defaultValue={selectedEbook?.descriptionTa || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50 resize-none"
                      placeholder="தமிழ் விளக்கத்தை உள்ளிடவும்"
                      required
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-digital-500 transition-colors">
                      <CloudArrowDownIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload cover image</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      <input type="file" name="coverImage" accept="image/*" className="hidden" />
                    </div>
                  </div>

                  {/* E-Book File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-Book File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-digital-500 transition-colors">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload e-book file</p>
                      <p className="text-sm text-gray-500">PDF, EPUB up to 100MB</p>
                      <input type="file" name="ebookFile" accept=".pdf,.epub" className="hidden" />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      defaultValue={selectedEbook?.price || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Pages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Pages
                    </label>
                    <input
                      type="number"
                      name="pages"
                      min="1"
                      defaultValue={selectedEbook?.pages || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="0"
                    />
                  </div>

                  {/* Publisher */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      defaultValue={selectedEbook?.publisher || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="Publisher name"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={selectedEbook?.tags?.join(', ') || ''}
                    className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                    placeholder="literature, tamil, modern, digital"
                  />
                </div>

                {/* Audiobook Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="audiobook"
                      defaultChecked={selectedEbook?.audiobook || false}
                      className="w-4 h-4 text-digital-500 bg-gray-100 border-gray-300 rounded focus:ring-digital-500 dark:focus:ring-digital-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Has Audiobook Version
                    </span>
                  </label>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      name="duration"
                      defaultValue={selectedEbook?.duration || ''}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-digital-500/50"
                      placeholder="Duration (e.g., 8h 45m)"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-6 py-3 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-digital-500 text-white rounded-xl font-medium hover:bg-digital-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <CheckIcon className="w-5 h-5" />
                    )}
                    {isSubmitting ? 'Saving...' : (showAddModal ? 'Add E-Book' : 'Update E-Book')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    Delete E-Book
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedEbook?.title}"? This will permanently remove the e-book and all associated files.
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-red-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting && (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {isSubmitting ? 'Deleting...' : 'Delete E-Book'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default EBooksManagement;