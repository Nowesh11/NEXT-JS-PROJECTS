'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  TagIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserIcon,
  BuildingLibraryIcon,
  LanguageIcon,
  HashtagIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const BookModal = ({ isOpen, onClose, book, onSave, getText }) => {
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    author: { en: '', ta: '' },
    description: { en: '', ta: '' },
    category: '',
    price: '',
    originalPrice: '',
    coverImage: '',
    isbn: '',
    publisher: { en: '', ta: '' },
    publicationDate: '',
    pages: '',
    language: 'bilingual',
    stock: '',
    status: 'draft',
    tags: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const categories = [
    'Poetry', 'Educational', 'Cultural Studies', 'Reference', 
    'Fiction', 'Non-Fiction', 'History', 'Literature', 'Philosophy',
    'Religion', 'Science', 'Technology', 'Arts', 'Biography'
  ];

  const languages = [
    { value: 'tamil', label: 'Tamil' },
    { value: 'english', label: 'English' },
    { value: 'bilingual', label: 'Bilingual (Tamil & English)' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || { en: '', ta: '' },
        author: book.author || { en: '', ta: '' },
        description: book.description || { en: '', ta: '' },
        category: book.category || '',
        price: book.price || '',
        originalPrice: book.originalPrice || '',
        coverImage: book.image || book.coverImage || '',
        isbn: book.isbn || '',
        publisher: book.publisher || { en: '', ta: '' },
        publicationDate: book.publicationDate ? book.publicationDate.split('T')[0] : '',
        pages: book.pages || '',
        language: book.language?.toLowerCase() || 'bilingual',
        stock: book.stock || '',
        status: book.status || 'draft',
        tags: book.tags || []
      });
    } else {
      // Reset form for new book
      setFormData({
        title: { en: '', ta: '' },
        author: { en: '', ta: '' },
        description: { en: '', ta: '' },
        category: '',
        price: '',
        originalPrice: '',
        coverImage: '',
        isbn: '',
        publisher: { en: '', ta: '' },
        publicationDate: '',
        pages: '',
        language: 'bilingual',
        stock: '',
        status: 'draft',
        tags: []
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [book, isOpen]);

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.title.en.trim()) newErrors['title.en'] = 'English title is required';
    if (!formData.author.en.trim()) newErrors['author.en'] = 'English author name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    if (!formData.pages) newErrors.pages = 'Number of pages is required';

    // Numeric validation
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      newErrors.price = 'Price must be a valid positive number';
    }
    if (formData.originalPrice && (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) < 0)) {
      newErrors.originalPrice = 'Original price must be a valid positive number';
    }
    if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'Stock must be a valid positive number';
    }
    if (formData.pages && (isNaN(formData.pages) || parseInt(formData.pages) < 1)) {
      newErrors.pages = 'Pages must be a valid positive number';
    }

    // ISBN validation (basic)
    if (formData.isbn && !/^[0-9-]{10,17}$/.test(formData.isbn.replace(/[^0-9-]/g, ''))) {
      newErrors.isbn = 'ISBN format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process form data
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        pages: parseInt(formData.pages)
      };
      
      onSave(processedData);
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpenIcon },
    { id: 'details', label: 'Details', icon: DocumentTextIcon },
    { id: 'pricing', label: 'Pricing & Stock', icon: CurrencyRupeeIcon },
    { id: 'media', label: 'Media & Tags', icon: PhotoIcon }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass-morphism rounded-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
              {book ? 'Edit Book' : 'Add New Book'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
              {book ? 'Update book information' : 'Add a new book to your collection'}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 font-medium transition-colors relative whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'text-cultural-600 dark:text-cultural-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cultural-500"
                    layoutId="activeTab"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.title.en}
                        onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors['title.en'] ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="Enter book title in English"
                      />
                      {errors['title.en'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['title.en']}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title (Tamil)
                      </label>
                      <input
                        type="text"
                        value={formData.title.ta}
                        onChange={(e) => handleInputChange('title', e.target.value, 'ta')}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                        placeholder="Enter book title in Tamil"
                      />
                    </div>
                  </div>

                  {/* Author */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Author (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.author.en}
                        onChange={(e) => handleInputChange('author', e.target.value, 'en')}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors['author.en'] ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="Enter author name in English"
                      />
                      {errors['author.en'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['author.en']}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Author (Tamil)
                      </label>
                      <input
                        type="text"
                        value={formData.author.ta}
                        onChange={(e) => handleInputChange('author', e.target.value, 'ta')}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                        placeholder="Enter author name in Tamil"
                      />
                    </div>
                  </div>

                  {/* Category and Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors.category ? 'ring-2 ring-red-500' : ''
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                      >
                        {languages.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (English)
                      </label>
                      <textarea
                        value={formData.description.en}
                        onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                        rows={4}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 resize-none"
                        placeholder="Enter book description in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Tamil)
                      </label>
                      <textarea
                        value={formData.description.ta}
                        onChange={(e) => handleInputChange('description', e.target.value, 'ta')}
                        rows={4}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 resize-none"
                        placeholder="Enter book description in Tamil"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* ISBN and Pages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange('isbn', e.target.value)}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors.isbn ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="978-81-123-4567-8"
                      />
                      {errors.isbn && (
                        <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Pages *
                      </label>
                      <input
                        type="number"
                        value={formData.pages}
                        onChange={(e) => handleInputChange('pages', e.target.value)}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors.pages ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="256"
                        min="1"
                      />
                      {errors.pages && (
                        <p className="text-red-500 text-sm mt-1">{errors.pages}</p>
                      )}
                    </div>
                  </div>

                  {/* Publisher */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publisher (English)
                      </label>
                      <input
                        type="text"
                        value={formData.publisher.en}
                        onChange={(e) => handleInputChange('publisher', e.target.value, 'en')}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                        placeholder="Enter publisher name in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publisher (Tamil)
                      </label>
                      <input
                        type="text"
                        value={formData.publisher.ta}
                        onChange={(e) => handleInputChange('publisher', e.target.value, 'ta')}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                        placeholder="Enter publisher name in Tamil"
                      />
                    </div>
                  </div>

                  {/* Publication Date and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        value={formData.publicationDate}
                        onChange={(e) => handleInputChange('publicationDate', e.target.value)}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'pricing' && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Price and Original Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors.price ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="299"
                        min="0"
                        step="0.01"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                          errors.originalPrice ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="399"
                        min="0"
                        step="0.01"
                      />
                      {errors.originalPrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>
                      )}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      className={`w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50 ${
                        errors.stock ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder="50"
                      min="0"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                    )}
                  </div>

                  {/* Price Preview */}
                  {formData.price && (
                    <div className="glass-morphism rounded-xl p-4">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Price Preview</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-cultural-600 dark:text-cultural-400">
                          ₹{formData.price}
                        </span>
                        {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                          <>
                            <span className="text-lg text-gray-500 line-through">
                              ₹{formData.originalPrice}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'media' && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      className="w-full px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                      placeholder="https://example.com/book-cover.jpg"
                    />
                    {formData.coverImage && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                        <div className="w-32 h-44 bg-gradient-to-br from-cultural-100 to-digital-100 dark:from-cultural-900/20 dark:to-digital-900/20 rounded-xl overflow-hidden">
                          <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="flex-1 px-4 py-3 glass-morphism rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
                        placeholder="Enter a tag and press Enter"
                      />
                      <motion.button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-3 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add
                      </motion.button>
                    </div>
                    
                    {/* Display Tags */}
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-digital-100 dark:bg-digital-900/20 text-digital-600 dark:text-digital-400 rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-digital-400 hover:text-digital-600 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
          <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            * Required fields
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 glass-button rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  {book ? 'Update Book' : 'Add Book'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookModal;