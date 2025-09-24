import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationsPage() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    emailAnnouncements: true,
    emailNewContent: true,
    emailWeekly: false,
    pushBreaking: true,
    pushNewContent: true,
    pushUpdates: false,
    language: 'bilingual'
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setPageLoading(false), 1000);
    loadNotifications();
    loadPreferences();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      const mockNotifications = [
        {
          id: '1',
          type: 'announcement',
          title: language === 'ta' ? 'புதிய தமிழ் இலக்கிய சங்க அம்சங்கள்' : 'New Tamil Literary Society Features',
          message: language === 'ta' ? 'புதிய ஒத்துழைப்பு கருவிகள் மற்றும் மேம்படுத்தப்பட்ட பயனர் அனுபவம் சேர்க்கப்பட்டுள்ளது.' : 'We\'ve added new collaboration tools and enhanced the user experience.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'content',
          title: language === 'ta' ? 'புதிய தமிழ் நூல்கள் சேர்க்கப்பட்டுள்ளன' : 'New Tamil Books Added',
          message: language === 'ta' ? '50 புதிய தமிழ் இலக்கிய நூல்கள் நமது தொகுப்பில் சேர்க்கப்பட்டுள்ளன.' : '50 new Tamil literary works have been added to our collection.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'event',
          title: language === 'ta' ? 'தமிழ் கவிதை போட்டி' : 'Tamil Poetry Competition',
          message: language === 'ta' ? 'வருடாந்திர தமிழ் கவிதை போட்டிக்கு பதிவு செய்யுங்கள். கடைசி தேதி: மார்ச் 31.' : 'Register for the annual Tamil poetry competition. Deadline: March 31.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: false,
          priority: 'high'
        },
        {
          id: '4',
          type: 'update',
          title: language === 'ta' ? 'வலைத்தள மேம்பாடு' : 'Website Maintenance',
          message: language === 'ta' ? 'மார்ச் 25 அன்று திட்டமிடப்பட்ட பராமரிப்பு பணி. சேவை தற்காலிகமாக நிறுத்தப்படும்.' : 'Scheduled maintenance on March 25. Service will be temporarily unavailable.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          priority: 'low'
        },
        {
          id: '5',
          type: 'content',
          title: language === 'ta' ? 'மாதாந்திர செய்திமடல்' : 'Monthly Newsletter',
          message: language === 'ta' ? 'மார்ச் மாத செய்திமடல் வெளியிடப்பட்டுள்ளது. புதிய கட்டுரைகள் மற்றும் நிகழ்வுகளைப் பார்க்கவும்.' : 'March newsletter is now available. Check out new articles and events.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: false,
          priority: 'medium'
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // Load from localStorage or API
      const savedPreferences = localStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === filter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      // API call to mark as read
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      showToastMessage(language === 'ta' ? 'அனைத்தும் படிக்கப்பட்டதாக குறிக்கப்பட்டது' : 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      showToastMessage(language === 'ta' ? 'அறிவிப்பு நீக்கப்பட்டது' : 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      setNotifications(prev =>
        prev.filter(n => !selectedNotifications.includes(n.id))
      );
      setSelectedNotifications([]);
      showToastMessage(language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட அறிவிப்புகள் நீக்கப்பட்டன' : 'Selected notifications deleted');
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const savePreferences = async () => {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      setShowPreferences(false);
      showToastMessage(language === 'ta' ? 'விருப்பத்தேர்வுகள் சேமிக்கப்பட்டன' : 'Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      announcement: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      content: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      event: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      update: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };
    return icons[type] || icons.announcement;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority] || colors.medium;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return language === 'ta' ? `${minutes} நிமிடங்களுக்கு முன்` : `${minutes}m ago`;
    } else if (hours < 24) {
      return language === 'ta' ? `${hours} மணி நேரத்திற்கு முன்` : `${hours}h ago`;
    } else {
      return language === 'ta' ? `${days} நாட்களுக்கு முன்` : `${days}d ago`;
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{language === 'ta' ? 'அறிவிப்புகள் - தமிழ் இலக்கிய சங்கம்' : 'Notifications - Tamil Literary Society'}</title>
        <meta name="description" content={language === 'ta' ? 'உங்கள் அறிவிப்புகளை நிர்வகிக்கவும்' : 'Manage your notifications'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-display">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ta' ? 'வடிகட்டி' : 'Filter'}
                </h3>
                
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={language === 'ta' ? 'அறிவிப்புகளைத் தேடுங்கள்...' : 'Search notifications...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filter Options */}
                <div className="space-y-2">
                  {[
                    { key: 'all', label: language === 'ta' ? 'அனைத்தும்' : 'All' },
                    { key: 'unread', label: language === 'ta' ? 'படிக்காதவை' : 'Unread' },
                    { key: 'announcement', label: language === 'ta' ? 'அறிவிப்புகள்' : 'Announcements' },
                    { key: 'content', label: language === 'ta' ? 'உள்ளடக்கம்' : 'Content' },
                    { key: 'event', label: language === 'ta' ? 'நிகழ்வுகள்' : 'Events' },
                    { key: 'update', label: language === 'ta' ? 'புதுப்பிப்புகள்' : 'Updates' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filter === option.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <button
                    onClick={markAllAsRead}
                    className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {language === 'ta' ? 'அனைத்தையும் படித்ததாக குறிக்கவும்' : 'Mark all as read'}
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {language === 'ta' ? 'விருப்பத்தேர்வுகள்' : 'Preferences'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="lg:col-span-3">
              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'ta' 
                        ? `${selectedNotifications.length} தேர்ந்தெடுக்கப்பட்டது`
                        : `${selectedNotifications.length} selected`
                      }
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={deleteSelected}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {language === 'ta' ? 'நீக்கு' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {language === 'ta' ? 'அறிவிப்புகள் இல்லை' : 'No notifications'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {language === 'ta' ? 'புதிய அறிவிப்புகள் வரும்போது இங்கே தோன்றும்' : 'New notifications will appear here when available'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                        notification.read ? 'border-gray-300' : 'border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleNotificationSelection(notification.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className={`flex-shrink-0 p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-lg font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                <span className="capitalize">{notification.type}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title={language === 'ta' ? 'படித்ததாக குறிக்கவும்' : 'Mark as read'}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Modal */}
        <AnimatePresence>
          {showPreferences && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowPreferences(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ta' ? 'அறிவிப்பு விருப்பத்தேர்வுகள்' : 'Notification Preferences'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'மின்னஞ்சல் அறிவிப்புகள்' : 'Email Notifications'}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { key: 'emailAnnouncements', label: language === 'ta' ? 'அறிவிப்புகள்' : 'Announcements' },
                        { key: 'emailNewContent', label: language === 'ta' ? 'புதிய உள்ளடக்கம்' : 'New Content' },
                        { key: 'emailWeekly', label: language === 'ta' ? 'வாராந்திர சுருக்கம்' : 'Weekly Summary' }
                      ].map((option) => (
                        <label key={option.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences[option.key]}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              [option.key]: e.target.checked
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'உடனடி அறிவிப்புகள்' : 'Push Notifications'}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { key: 'pushBreaking', label: language === 'ta' ? 'முக்கிய செய்திகள்' : 'Breaking News' },
                        { key: 'pushNewContent', label: language === 'ta' ? 'புதிய உள்ளடக்கம்' : 'New Content' },
                        { key: 'pushUpdates', label: language === 'ta' ? 'புதுப்பிப்புகள்' : 'Updates' }
                      ].map((option) => (
                        <label key={option.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences[option.key]}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              [option.key]: e.target.checked
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                  </button>
                  <button
                    onClick={savePreferences}
                    className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {language === 'ta' ? 'சேமிக்கவும்' : 'Save'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
