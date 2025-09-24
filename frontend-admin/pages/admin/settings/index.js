'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../../components/layout/AdminLayout';
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ServerIcon,
  DatabaseIcon,
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CloudIcon,
  WifiIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { 
  SunIcon as SunSolidIcon,
  MoonIcon as MoonSolidIcon 
} from '@heroicons/react/24/solid';

const SettingsPage = ({ getText, language, theme, toggleTheme, toggleLanguage }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Tamil Literary Society',
    siteDescription: 'Preserving and promoting Tamil literature and culture',
    siteUrl: 'https://tls.example.com',
    adminEmail: 'admin@tls.com',
    contactEmail: 'contact@tls.com',
    supportEmail: 'support@tls.com',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Appearance Settings
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4',
    culturalColor: '#F59E0B',
    digitalColor: '#10B981',
    darkMode: false,
    defaultLanguage: 'en',
    enableRTL: false,
    customCSS: '',
    
    // User Settings
    allowRegistration: true,
    requireEmailVerification: true,
    enableSocialLogin: true,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Content Settings
    enableComments: true,
    moderateComments: true,
    allowFileUploads: true,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'gif'],
    enableVersioning: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    notifyNewUsers: true,
    notifyNewContent: true,
    notifyComments: true,
    notifyPayments: true,
    
    // Payment Settings
    enablePayments: true,
    currency: 'INR',
    paymentGateway: 'razorpay',
    taxRate: 18,
    enableSubscriptions: true,
    freeTrialDays: 7,
    
    // Security Settings
    enableTwoFactor: false,
    enableSSL: true,
    enableCORS: true,
    allowedOrigins: ['https://tls.example.com'],
    enableRateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    
    // Backup Settings
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'cloud',
    
    // API Settings
    enableAPI: true,
    apiVersion: 'v1',
    enableAPIKeys: true,
    enableWebhooks: true,
    
    // Performance Settings
    enableCaching: true,
    cacheExpiry: 3600,
    enableCompression: true,
    enableCDN: false,
    cdnUrl: '',
    
    // Analytics Settings
    enableAnalytics: true,
    analyticsProvider: 'google',
    trackingId: '',
    enableHeatmaps: false,
    enableUserTracking: true
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'users', name: 'Users', icon: UserIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Backup', icon: ArchiveBoxIcon },
    { id: 'api', name: 'API', icon: ServerIcon },
    { id: 'performance', name: 'Performance', icon: ComputerDesktopIcon },
    { id: 'analytics', name: 'Analytics', icon: GlobeAltIcon }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUnsavedChanges(false);
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setUnsavedChanges(false);
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

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleSettingChange('siteName', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <select
            value={settings.timeFormat}
            onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          >
            <option value="24h">24 Hour</option>
            <option value="12h">12 Hour</option>
          </select>
        </div>
      </div>
     </div>
   );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
              className="flex-1 px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
              className="flex-1 px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cultural Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.culturalColor}
              onChange={(e) => handleSettingChange('culturalColor', e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.culturalColor}
              onChange={(e) => handleSettingChange('culturalColor', e.target.value)}
              className="flex-1 px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Digital Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.digitalColor}
              onChange={(e) => handleSettingChange('digitalColor', e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={settings.digitalColor}
              onChange={(e) => handleSettingChange('digitalColor', e.target.value)}
              className="flex-1 px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Language
          </label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          >
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enable RTL Support
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Right-to-left text direction
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('enableRTL', !settings.enableRTL)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enableRTL ? 'bg-cultural-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enableRTL ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom CSS
        </label>
        <textarea
          value={settings.customCSS}
          onChange={(e) => handleSettingChange('customCSS', e.target.value)}
          rows={6}
          placeholder="/* Add your custom CSS here */"
          className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
        />
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allow User Registration
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enable new user signups
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('allowRegistration', !settings.allowRegistration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.allowRegistration ? 'bg-cultural-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Require Email Verification
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verify email before activation
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('requireEmailVerification', !settings.requireEmailVerification)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.requireEmailVerification ? 'bg-cultural-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password Min Length
          </label>
          <input
            type="number"
            min="6"
            max="20"
            value={settings.passwordMinLength}
            onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-4 py-2 glass-morphism rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cultural-500/50"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'users':
        return renderUserSettings();
      default:
        return (
          <div className="text-center py-12">
            <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              Settings for {activeTab}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              This section is under development
            </p>
          </div>
        );
    }
  };

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
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getText ? getText('admin.settings.title', 'Settings') : 'Settings'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getText ? getText('admin.settings.subtitle', 'Configure your platform settings and preferences') : 'Configure your platform settings and preferences'}
            </p>
          </div>
          
          {unsavedChanges && (
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleReset}
                className="px-4 py-2 glass-morphism rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-cultural-500 text-white rounded-xl font-medium hover:bg-cultural-600 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Settings Container */}
        <motion.div variants={itemVariants} className="glass-morphism rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-cultural-100 dark:bg-cultural-900/20 text-cultural-600 dark:text-cultural-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.name}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {/* Content */}
            <div className="lg:w-3/4">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default SettingsPage;