import { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, Link, Users, AlertTriangle } from 'lucide-react';

const AnnouncementModal = ({ isOpen, onClose, onSubmit, announcement, language }) => {
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    content: { en: '', ta: '' },
    priority: 'medium',
    category: '',
    cost: '',
    targetAudience: 'all',
    isActive: true,
    isPinned: false,
    schedule: {
      publishAt: '',
      expireAt: ''
    },
    links: [{ title: '', url: '' }],
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || { en: '', ta: '' },
        description: announcement.description || { en: '', ta: '' },
        content: announcement.content || { en: '', ta: '' },
        priority: announcement.priority || 'medium',
        category: announcement.category || '',
        cost: announcement.cost || '',
        targetAudience: announcement.targetAudience || 'all',
        isActive: announcement.isActive !== undefined ? announcement.isActive : true,
        isPinned: announcement.isPinned || false,
        schedule: {
          publishAt: announcement.schedule?.publishAt ? 
            new Date(announcement.schedule.publishAt).toISOString().slice(0, 16) : '',
          expireAt: announcement.schedule?.expireAt ? 
            new Date(announcement.schedule.expireAt).toISOString().slice(0, 16) : ''
        },
        links: announcement.links?.length > 0 ? announcement.links : [{ title: '', url: '' }],
        tags: announcement.tags || []
      });
    }
  }, [announcement]);

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

  const handleScheduleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
    }));
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '' }]
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.en.trim() && !formData.title.ta.trim()) {
      newErrors.title = language === 'ta' ? 'தலைப்பு தேவை' : 'Title is required';
    }

    // Description validation
    if (!formData.description.en.trim() && !formData.description.ta.trim()) {
      newErrors.description = language === 'ta' ? 'விளக்கம் தேவை' : 'Description is required';
    }

    // Cost validation
    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = language === 'ta' ? 'செல்லுபடியான கட்டணம் உள்ளிடவும்' : 'Please enter a valid cost';
    }

    // Schedule validation
    if (formData.schedule.publishAt && formData.schedule.expireAt) {
      const publishDate = new Date(formData.schedule.publishAt);
      const expireDate = new Date(formData.schedule.expireAt);
      if (expireDate <= publishDate) {
        newErrors.schedule = language === 'ta' ? 'காலாவधி தேதி வெளியீட்டு தேதிக்கு பிறகு இருக்க வேண்டும்' : 'Expire date must be after publish date';
      }
    }

    // Links validation
    formData.links.forEach((link, index) => {
      if (link.url && !isValidUrl(link.url)) {
        newErrors[`link_${index}`] = language === 'ta' ? 'செல்லுபடியான URL உள்ளிடவும்' : 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Clean up data before submission
      const submitData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        links: formData.links.filter(link => link.url.trim()),
        schedule: {
          publishAt: formData.schedule.publishAt || null,
          expireAt: formData.schedule.expireAt || null
        }
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {announcement 
              ? (language === 'ta' ? 'அறிவிப்பு திருத்து' : 'Edit Announcement')
              : (language === 'ta' ? 'புதிய அறிவிப்பு' : 'New Announcement')
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Language Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'en'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ta')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ta'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  தமிழ்
                </button>
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'தலைப்பு' : 'Title'} *
                </label>
                <input
                  type="text"
                  value={formData.title[activeTab]}
                  onChange={(e) => handleInputChange('title', e.target.value, activeTab)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={activeTab === 'en' ? 'Enter title in English' : 'தமிழில் தலைப்பு உள்ளிடவும்'}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'விளக்கம்' : 'Description'} *
                </label>
                <textarea
                  value={formData.description[activeTab]}
                  onChange={(e) => handleInputChange('description', e.target.value, activeTab)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={activeTab === 'en' ? 'Enter description in English' : 'தமிழில் விளக்கம் உள்ளிடவும்'}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'உள்ளடக்கம்' : 'Content'}
                </label>
                <textarea
                  value={formData.content[activeTab]}
                  onChange={(e) => handleInputChange('content', e.target.value, activeTab)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={activeTab === 'en' ? 'Enter detailed content in English' : 'தமிழில் விரிவான உள்ளடக்கம் உள்ளிடவும்'}
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'முன்னுரிமை' : 'Priority'}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">{language === 'ta' ? 'குறைந்த' : 'Low'}</option>
                    <option value="medium">{language === 'ta' ? 'நடுத்தர' : 'Medium'}</option>
                    <option value="high">{language === 'ta' ? 'அவசரம்' : 'High'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'வகை' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'ta' ? 'வகை உள்ளிடவும்' : 'Enter category'}
                  />
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  {language === 'ta' ? 'கட்டணம் (RM)' : 'Cost (RM)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cost ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  {language === 'ta' ? 'இலக்கு பார்வையாளர்கள்' : 'Target Audience'}
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{language === 'ta' ? 'அனைவரும்' : 'All Users'}</option>
                  <option value="students">{language === 'ta' ? 'மாணவர்கள்' : 'Students'}</option>
                  <option value="teachers">{language === 'ta' ? 'ஆசிரியர்கள்' : 'Teachers'}</option>
                  <option value="parents">{language === 'ta' ? 'பெற்றோர்கள்' : 'Parents'}</option>
                </select>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {language === 'ta' ? 'அட்டவணை' : 'Schedule'}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {language === 'ta' ? 'வெளியீட்டு தேதி' : 'Publish Date'}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.schedule.publishAt}
                      onChange={(e) => handleScheduleChange('publishAt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {language === 'ta' ? 'காலாவधி தேதி' : 'Expire Date'}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.schedule.expireAt}
                      onChange={(e) => handleScheduleChange('expireAt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {errors.schedule && (
                  <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>
                )}
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="inline h-4 w-4 mr-1" />
                  {language === 'ta' ? 'இணைப்புகள்' : 'Links'}
                </label>
                <div className="space-y-3">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={language === 'ta' ? 'இணைப்பு தலைப்பு' : 'Link title'}
                        value={link.title}
                        onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`link_${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLink}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + {language === 'ta' ? 'இணைப்பு சேர்க்க' : 'Add Link'}
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'குறிச்சொற்கள்' : 'Tags'}
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'ta' ? 'குறிச்சொற்களை கமாவால் பிரிக்கவும்' : 'Separate tags with commas'}
                />
              </div>

              {/* Status Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'செயலில் உள்ளது' : 'Active'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'பின் செய்யப்பட்டது' : 'Pinned'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading 
                ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...')
                : (language === 'ta' ? 'சேமிக்க' : 'Save')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;