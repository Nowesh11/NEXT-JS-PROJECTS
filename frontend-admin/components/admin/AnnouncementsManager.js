'use client'

import { useState, useEffect } from 'react'

export default function AnnouncementsManager({ 
  announcements, 
  selectedAnnouncement, 
  isModalOpen, 
  onEdit, 
  onDelete, 
  onSave, 
  onCloseModal 
}) {
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    content: { en: '', ta: '' },
    type: 'general',
    priority: 'medium',
    isActive: true,
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    targetAudience: 'all',
    showOnHomepage: false
  })
  const [activeTab, setActiveTab] = useState('en')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (selectedAnnouncement) {
      setFormData({
        title: selectedAnnouncement.title || { en: '', ta: '' },
        content: selectedAnnouncement.content || { en: '', ta: '' },
        type: selectedAnnouncement.type || 'general',
        priority: selectedAnnouncement.priority || 'medium',
        isActive: selectedAnnouncement.isActive !== false,
        publishDate: selectedAnnouncement.publishDate ? 
          new Date(selectedAnnouncement.publishDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        expiryDate: selectedAnnouncement.expiryDate ? 
          new Date(selectedAnnouncement.expiryDate).toISOString().split('T')[0] : '',
        targetAudience: selectedAnnouncement.targetAudience || 'all',
        showOnHomepage: selectedAnnouncement.showOnHomepage || false
      })
    } else {
      setFormData({
        title: { en: '', ta: '' },
        content: { en: '', ta: '' },
        type: 'general',
        priority: 'medium',
        isActive: true,
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        targetAudience: 'all',
        showOnHomepage: false
      })
    }
  }, [selectedAnnouncement])

  const handleInputChange = (field, value, language = null) => {
    if (language) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.en.trim()) {
      alert('English title is required')
      return
    }
    if (!formData.content.en.trim()) {
      alert('English content is required')
      return
    }
    
    onSave(formData)
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesFilter = filter === 'all' || announcement.type === filter
    const matchesSearch = 
      announcement.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.title?.ta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.ta?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨'
      case 'event': return '📅'
      case 'news': return '📰'
      case 'maintenance': return '🔧'
      default: return '📢'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="event">Event</option>
              <option value="news">News</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full md:w-64"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4">Announcements ({filteredAnnouncements.length})</h3>
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(announcement.type)}</span>
                      <h4 className="font-semibold text-lg">
                        {announcement.title?.en || 'No Title'}
                      </h4>
                      {announcement.title?.ta && (
                        <span className="text-sm text-gray-600">({announcement.title.ta})</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getPriorityColor(announcement.priority)
                      }`}>
                        {announcement.priority}
                      </span>
                      {!announcement.isActive && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                          Inactive
                        </span>
                      )}
                      {announcement.showOnHomepage && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                          Homepage
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-2">
                      {announcement.content?.en || 'No content'}
                    </p>
                    {announcement.content?.ta && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                        Tamil: {announcement.content.ta}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 {formatDate(announcement.publishDate)}</span>
                      {announcement.expiryDate && (
                        <span>⏰ Expires: {formatDate(announcement.expiryDate)}</span>
                      )}
                      <span>👥 {announcement.targetAudience}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(announcement)}
                      className="btn-secondary text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(announcement._id)}
                      className="btn-danger text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📢</div>
            <p>No announcements found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={onCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language Tabs */}
              <div className="flex border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'en'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ta')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'ta'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tamil (தமிழ்)
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title ({activeTab === 'en' ? 'English' : 'Tamil'}) *
                </label>
                <input
                  type="text"
                  value={formData.title[activeTab]}
                  onChange={(e) => handleInputChange('title', e.target.value, activeTab)}
                  className="form-input"
                  required={activeTab === 'en'}
                  placeholder={activeTab === 'en' ? 'Enter title in English' : 'தலைப்பை தமிழில் உள்ளிடவும்'}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content ({activeTab === 'en' ? 'English' : 'Tamil'}) *
                </label>
                <textarea
                  value={formData.content[activeTab]}
                  onChange={(e) => handleInputChange('content', e.target.value, activeTab)}
                  className="form-input h-32"
                  required={activeTab === 'en'}
                  placeholder={activeTab === 'en' ? 'Enter content in English' : 'உள்ளடக்கத்தை தமிழில் உள்ளிடவும்'}
                />
              </div>

              {/* Settings (only show on English tab) */}
              {activeTab === 'en' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="form-input"
                      >
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                        <option value="event">Event</option>
                        <option value="news">News</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="form-input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Publish Date</label>
                      <input
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => handleInputChange('publishDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="form-input"
                    >
                      <option value="all">All Users</option>
                      <option value="members">Members Only</option>
                      <option value="admins">Admins Only</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showOnHomepage}
                        onChange={(e) => handleInputChange('showOnHomepage', e.target.checked)}
                        className="mr-2"
                      />
                      Show on Homepage
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {selectedAnnouncement ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}