'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageSquare, Users, Settings, Search, Filter, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdminLayout from '../components/AdminLayout';
import AnnouncementsTab from '../components/notifications/AnnouncementsTab';

const NotificationsPage = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('announcements');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Tab configuration
  const tabs = [
    {
      id: 'announcements',
      label: language === 'ta' ? 'அறிவிப்புகள்' : 'Announcements',
      icon: Bell,
      count: 0
    },
    {
      id: 'messages',
      label: language === 'ta' ? 'செய்திகள்' : 'Messages',
      icon: MessageSquare,
      count: 0
    },
    {
      id: 'users',
      label: language === 'ta' ? 'பயனர்கள்' : 'Users',
      icon: Users,
      count: 0
    },
    {
      id: 'system',
      label: language === 'ta' ? 'கணினி' : 'System',
      icon: Settings,
      count: 0
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcements':
        return (
          <AnnouncementsTab 
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onRefresh={handleRefresh}
          />
        );
      case 'messages':
        return (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ta' ? 'செய்திகள் விரைவில்' : 'Messages Coming Soon'}
            </h3>
            <p className="text-gray-500">
              {language === 'ta' 
                ? 'இந்த அம்சம் விரைவில் கிடைக்கும்' 
                : 'This feature will be available soon'}
            </p>
          </div>
        );
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ta' ? 'பயனர் அறிவிப்புகள் விரைவில்' : 'User Notifications Coming Soon'}
            </h3>
            <p className="text-gray-500">
              {language === 'ta' 
                ? 'இந்த அம்சம் விரைவில் கிடைக்கும்' 
                : 'This feature will be available soon'}
            </p>
          </div>
        );
      case 'system':
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ta' ? 'கணினி அறிவிப்புகள் விரைவில்' : 'System Notifications Coming Soon'}
            </h3>
            <p className="text-gray-500">
              {language === 'ta' 
                ? 'இந்த அம்சம் விரைவில் கிடைக்கும்' 
                : 'This feature will be available soon'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'ta' 
                ? 'அனைத்து அறிவிப்புகளையும் நிர்வகிக்கவும்' 
                : 'Manage all notifications and announcements'}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ta' ? 'தேடுங்கள்...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'ta' ? 'அனைத்தும்' : 'All'}</option>
              <option value="active">{language === 'ta' ? 'செயலில்' : 'Active'}</option>
              <option value="scheduled">{language === 'ta' ? 'திட்டமிடப்பட்ட' : 'Scheduled'}</option>
              <option value="archived">{language === 'ta' ? 'காப்பகப்படுத்தப்பட்ட' : 'Archived'}</option>
            </select>
            
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {language === 'ta' ? 'புதுப்பிக்க' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;