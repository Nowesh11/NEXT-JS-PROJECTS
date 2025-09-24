'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Edit, Trash2, Eye, EyeOff,
  Pin, PinOff, Mail, Users, TrendingUp, Calendar, DollarSign,
  AlertTriangle, CheckCircle, Clock, Download, Send
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminLayout from '../../components/AdminLayout';
import AnnouncementModal from '../../components/AnnouncementModal';
import EmailSimulationModal from '../../components/EmailSimulationModal';
import StatsCard from '../../components/StatsCard';

const AnnouncementsPage = () => {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pinned: 0,
    totalViews: 0,
    totalEmails: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data || []);
      } else {
        setError(language === 'ta' ? 'அறிவிப்புகளை ஏற்ற முடியவில்லை' : 'Failed to load announcements');
      }
    } catch (err) {
      setError(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/announcements/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateAnnouncement = async (announcementData) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        setAnnouncements(prev => [newAnnouncement.data, ...prev]);
        setShowModal(false);
        fetchStats();
        
        // Show success message
        alert(language === 'ta' ? 'அறிவிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது' : 'Announcement created successfully');
      } else {
        throw new Error('Failed to create announcement');
      }
    } catch (err) {
      alert(language === 'ta' ? 'அறிவிப்பு உருவாக்க முடியவில்லை' : 'Failed to create announcement');
    }
  };

  const handleUpdateAnnouncement = async (id, announcementData) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        setAnnouncements(prev => 
          prev.map(ann => ann._id === id ? updatedAnnouncement.data : ann)
        );
        setShowModal(false);
        setEditingAnnouncement(null);
        fetchStats();
        
        alert(language === 'ta' ? 'அறிவிப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது' : 'Announcement updated successfully');
      } else {
        throw new Error('Failed to update announcement');
      }
    } catch (err) {
      alert(language === 'ta' ? 'அறிவிப்பு புதுப்பிக்க முடியவில்லை' : 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm(language === 'ta' ? 'இந்த அறிவிப்பை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(ann => ann._id !== id));
        fetchStats();
        alert(language === 'ta' ? 'அறிவிப்பு வெற்றிகரமாக நீக்கப்பட்டது' : 'Announcement deleted successfully');
      } else {
        throw new Error('Failed to delete announcement');
      }
    } catch (err) {
      alert(language === 'ta' ? 'அறிவிப்பு நீக்க முடியவில்லை' : 'Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}/toggle-active`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === id ? { ...ann, isActive: !currentStatus } : ann
          )
        );
        fetchStats();
      }
    } catch (err) {
      alert(language === 'ta' ? 'நிலை மாற்ற முடியவில்லை' : 'Failed to toggle status');
    }
  };

  const handleTogglePin = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}/toggle-pin`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === id ? { ...ann, isPinned: !currentStatus } : ann
          )
        );
        fetchStats();
      }
    } catch (err) {
      alert(language === 'ta' ? 'பின் நிலை மாற்ற முடியவில்லை' : 'Failed to toggle pin status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedAnnouncements.length === 0) {
      alert(language === 'ta' ? 'தயவுசெய்து குறைந்தது ஒரு அறிவிப்பை தேர்ந்தெடுக்கவும்' : 'Please select at least one announcement');
      return;
    }

    if (action === 'delete') {
      if (!confirm(language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட அறிவிப்புகளை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete selected announcements?')) {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/announcements/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ids: selectedAnnouncements
        }),
      });

      if (response.ok) {
        fetchAnnouncements();
        fetchStats();
        setSelectedAnnouncements([]);
        alert(language === 'ta' ? 'செயல் வெற்றிகரமாக முடிந்தது' : 'Bulk action completed successfully');
      }
    } catch (err) {
      alert(language === 'ta' ? 'செயல் தோல்வியடைந்தது' : 'Bulk action failed');
    }
  };

  const handleSendEmails = async (announcementId) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}/send-emails`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${language === 'ta' ? 'மின்னஞ்சல்கள் அனுப்பப்பட்டன:' : 'Emails sent:'} ${result.emailsSent}`);
        fetchStats();
      }
    } catch (err) {
      alert(language === 'ta' ? 'மின்னஞ்சல் அனுப்ப முடியவில்லை' : 'Failed to send emails');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/announcements/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `announcements_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      alert(language === 'ta' ? 'ஏற்றுமதி தோல்வியடைந்தது' : 'Export failed');
    }
  };

  const getBilingualContent = (content) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[language] || content.en || content.ta || '';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return `RM ${parseFloat(amount).toFixed(2)}`;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      getBilingualContent(announcement.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBilingualContent(announcement.description).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && announcement.isActive) ||
      (filterStatus === 'inactive' && !announcement.isActive);
    
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || announcement.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ta' ? 'அறிவிப்புகள் நிர்வாகம்' : 'Announcements Management'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ta' ? 'பொது வலைத்தளத்திற்கான அறிவிப்புகளை நிர்வகிக்கவும்' : 'Manage announcements for the public website'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'ta' ? 'CSV ஏற்றுமதி' : 'Export CSV'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ta' ? 'புதிய அறிவிப்பு' : 'New Announcement'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard
            title={language === 'ta' ? 'மொத்தம்' : 'Total'}
            value={stats.total}
            icon={<TrendingUp className="h-5 w-5" />}
            color="blue"
          />
          <StatsCard
            title={language === 'ta' ? 'செயலில்' : 'Active'}
            value={stats.active}
            icon={<CheckCircle className="h-5 w-5" />}
            color="green"
          />
          <StatsCard
            title={language === 'ta' ? 'செயலில் இல்லை' : 'Inactive'}
            value={stats.inactive}
            icon={<Clock className="h-5 w-5" />}
            color="gray"
          />
          <StatsCard
            title={language === 'ta' ? 'பின் செய்யப்பட்ட' : 'Pinned'}
            value={stats.pinned}
            icon={<Pin className="h-5 w-5" />}
            color="purple"
          />
          <StatsCard
            title={language === 'ta' ? 'மொத்த பார்வைகள்' : 'Total Views'}
            value={stats.totalViews}
            icon={<Eye className="h-5 w-5" />}
            color="indigo"
          />
          <StatsCard
            title={language === 'ta' ? 'மின்னஞ்சல்கள்' : 'Emails Sent'}
            value={stats.totalEmails}
            icon={<Mail className="h-5 w-5" />}
            color="pink"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ta' ? 'தேடல்...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'ta' ? 'அனைத்து நிலைகள்' : 'All Status'}</option>
              <option value="active">{language === 'ta' ? 'செயலில்' : 'Active'}</option>
              <option value="inactive">{language === 'ta' ? 'செயலில் இல்லை' : 'Inactive'}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'ta' ? 'அனைத்து முன்னுரிமைகள்' : 'All Priorities'}</option>
              <option value="high">{language === 'ta' ? 'அவசரம்' : 'High'}</option>
              <option value="medium">{language === 'ta' ? 'நடுத்தர' : 'Medium'}</option>
              <option value="low">{language === 'ta' ? 'குறைந்த' : 'Low'}</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => { fetchAnnouncements(); fetchStats(); }}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'ta' ? 'புதுப்பிக்க' : 'Refresh'}
            </button>

            {/* Bulk Actions */}
            {selectedAnnouncements.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                >
                  {language === 'ta' ? 'செயல்படுத்து' : 'Activate'}
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-2 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                >
                  {language === 'ta' ? 'செயலிழக்கச்செய்' : 'Deactivate'}
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  {language === 'ta' ? 'நீக்கு' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : paginatedAnnouncements.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              {language === 'ta' ? 'அறிவிப்புகள் இல்லை' : 'No announcements found'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAnnouncements.length === paginatedAnnouncements.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnnouncements(paginatedAnnouncements.map(ann => ann._id));
                            } else {
                              setSelectedAnnouncements([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'தலைப்பு' : 'Title'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'முன்னுரிமை' : 'Priority'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'நிலை' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'கட்டணம்' : 'Cost'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'பார்வைகள்' : 'Views'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'உருவாக்கப்பட்டது' : 'Created'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ta' ? 'செயல்கள்' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedAnnouncements.map((announcement) => (
                      <tr key={announcement._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAnnouncements.includes(announcement._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAnnouncements(prev => [...prev, announcement._id]);
                              } else {
                                setSelectedAnnouncements(prev => prev.filter(id => id !== announcement._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {announcement.isPinned && (
                              <Pin className="h-4 w-4 text-blue-600 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getBilingualContent(announcement.title)}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {getBilingualContent(announcement.description)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getPriorityIcon(announcement.priority)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {announcement.priority === 'high' && (language === 'ta' ? 'அவசரம்' : 'High')}
                              {announcement.priority === 'medium' && (language === 'ta' ? 'நடுத்தர' : 'Medium')}
                              {announcement.priority === 'low' && (language === 'ta' ? 'குறைந்த' : 'Low')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            announcement.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {announcement.isActive 
                              ? (language === 'ta' ? 'செயலில்' : 'Active')
                              : (language === 'ta' ? 'செயலில் இல்லை' : 'Inactive')
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {announcement.cost ? formatCurrency(announcement.cost) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {announcement.views || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSendEmails(announcement._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title={language === 'ta' ? 'மின்னஞ்சல் அனுப்பு' : 'Send Emails'}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePin(announcement._id, announcement.isPinned)}
                              className={`${announcement.isPinned ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-900`}
                              title={language === 'ta' ? 'பின் டோகிள்' : 'Toggle Pin'}
                            >
                              {announcement.isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleToggleActive(announcement._id, announcement.isActive)}
                              className={`${announcement.isActive ? 'text-green-600' : 'text-gray-400'} hover:text-green-900`}
                              title={language === 'ta' ? 'நிலை மாற்று' : 'Toggle Status'}
                            >
                              {announcement.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingAnnouncement(announcement);
                                setShowModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title={language === 'ta' ? 'திருத்து' : 'Edit'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement._id)}
                              className="text-red-600 hover:text-red-900"
                              title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {language === 'ta' ? 'அடுத்த' : 'Next'}
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {language === 'ta' ? 'காண்பிக்கிறது' : 'Showing'}{' '}
                        <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                        {' '}{language === 'ta' ? 'முதல்' : 'to'}{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredAnnouncements.length)}
                        </span>
                        {' '}{language === 'ta' ? 'வரை, மொத்தம்' : 'of'}{' '}
                        <span className="font-medium">{filteredAnnouncements.length}</span>
                        {' '}{language === 'ta' ? 'முடிவுகள்' : 'results'}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {language === 'ta' ? 'முந்தைய' : 'Previous'}
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {language === 'ta' ? 'அடுத்த' : 'Next'}
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <AnnouncementModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={editingAnnouncement ? 
            (data) => handleUpdateAnnouncement(editingAnnouncement._id, data) :
            handleCreateAnnouncement
          }
          announcement={editingAnnouncement}
          language={language}
        />
      )}

      {showEmailModal && (
        <EmailSimulationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          language={language}
        />
      )}
    </AdminLayout>
  );
};

export default AnnouncementsPage;