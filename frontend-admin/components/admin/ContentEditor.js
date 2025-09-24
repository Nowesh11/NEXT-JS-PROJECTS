import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

const ContentEditor = () => {
  const { data: session } = useSession();
  const [content, setContent] = useState([]);
  const [globalContent, setGlobalContent] = useState([]);
  const [selectedPage, setSelectedPage] = useState('global');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pages = [
    { value: 'global', label: 'Global Content' },
    { value: 'home', label: 'Home Page' },
    { value: 'about', label: 'About Page' },
    { value: 'projects', label: 'Projects Page' },
    { value: 'initiatives', label: 'Initiatives Page' },
    { value: 'activities', label: 'Activities Page' },
    { value: 'books', label: 'Books Page' },
    { value: 'contact', label: 'Contact Page' },
    { value: 'team', label: 'Team Page' }
  ];

  const sectionTypes = [
    { value: 'text', label: 'Text Content' },
    { value: 'image', label: 'Image Only' },
    { value: 'image-text', label: 'Image with Text' },
    { value: 'feature-list', label: 'Feature List' },
    { value: 'hero', label: 'Hero Banner' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'testimonial', label: 'Testimonials' },
    { value: 'stats', label: 'Statistics' },
    { value: 'cta', label: 'Call to Action' },
    { value: 'custom', label: 'Custom Section' }
  ];

  const layouts = [
    { value: 'full-width', label: 'Full Width' },
    { value: 'one-column', label: 'One Column' },
    { value: 'two-column', label: 'Two Columns' },
    { value: 'three-column', label: 'Three Columns' },
    { value: 'four-column', label: 'Four Columns' },
    { value: 'grid', label: 'Grid Layout' },
    { value: 'carousel', label: 'Carousel Layout' }
  ];

  const stylePresets = [
    { value: 'default', label: 'Default' },
    { value: 'highlight', label: 'Highlight' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
    { value: 'primary', label: 'Primary Color' },
    { value: 'secondary', label: 'Secondary Color' },
    { value: 'accent', label: 'Accent Color' }
  ];

  useEffect(() => {
    fetchContent();
  }, [selectedPage]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content?page=${selectedPage}&includeInactive=true`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (selectedPage === 'global') {
          setGlobalContent(data.data || []);
        } else {
          setContent(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionData) => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('data', JSON.stringify(sectionData));
      
      // Handle file uploads
      if (sectionData.newImages && sectionData.newImages.length > 0) {
        sectionData.newImages.forEach((file, index) => {
          formData.append('files', file);
        });
      }

      const url = sectionData._id ? `/api/content?id=${sectionData._id}` : '/api/content';
      const method = sectionData._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        toast.success(sectionData._id ? 'Section updated successfully' : 'Section created successfully');
        fetchContent();
        setEditingSection(null);
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      const response = await fetch(`/api/content?id=${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        toast.success('Section deleted successfully');
        fetchContent();
      } else {
        toast.error('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const currentContent = selectedPage === 'global' ? globalContent : content;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Management</h1>
        
        {/* Page Selector */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Page
            </label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pages.map(page => (
                <option key={page.value} value={page.value}>
                  {page.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Create Section
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {currentContent.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No content sections found for this page.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Section
            </button>
          </div>
        ) : (
          currentContent.map((section) => (
            <ContentSection
              key={section._id}
              section={section}
              isExpanded={expandedSections[section._id]}
              onToggle={() => toggleSection(section._id)}
              onEdit={() => setEditingSection(section)}
              onDelete={() => handleDeleteSection(section._id)}
              onSave={handleSaveSection}
              isEditing={editingSection?._id === section._id}
              saving={saving}
              sectionTypes={sectionTypes}
              layouts={layouts}
              stylePresets={stylePresets}
            />
          ))
        )}
      </div>

      {/* Create Section Modal */}
      {showCreateModal && (
        <CreateSectionModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveSection}
          saving={saving}
          selectedPage={selectedPage}
          sectionTypes={sectionTypes}
          layouts={layouts}
          stylePresets={stylePresets}
          pages={pages}
        />
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <EditSectionModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveSection}
          saving={saving}
          sectionTypes={sectionTypes}
          layouts={layouts}
          stylePresets={stylePresets}
        />
      )}
    </div>
  );
};

// Content Section Component
const ContentSection = ({ 
  section, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  isEditing, 
  saving 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div 
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {section.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {section.title?.en || section.sectionKey}
            </h3>
            <p className="text-sm text-gray-500">
              {section.sectionType} • {section.layout} • Order: {section.order || 0}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">English Content</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Title:</strong> {section.title?.en || 'No title'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Content:</strong> {section.content?.en ? 
                  (section.content.en.length > 100 ? 
                    section.content.en.substring(0, 100) + '...' : 
                    section.content.en
                  ) : 'No content'
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tamil Content</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Title:</strong> {section.title?.ta || 'No title'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Content:</strong> {section.content?.ta ? 
                  (section.content.ta.length > 100 ? 
                    section.content.ta.substring(0, 100) + '...' : 
                    section.content.ta
                  ) : 'No content'
                }
              </p>
            </div>
          </div>
          
          {section.images && section.images.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Images</h4>
              <div className="flex flex-wrap gap-2">
                {section.images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <Image
                      src={img.url || img}
                      alt={img.alt?.en || 'Section image'}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Create Section Modal Component
const CreateSectionModal = ({ 
  onClose, 
  onSave, 
  saving, 
  selectedPage, 
  sectionTypes, 
  layouts, 
  stylePresets, 
  pages 
}) => {
  const [formData, setFormData] = useState({
    page: selectedPage,
    section: '',
    sectionKey: '',
    sectionType: 'text',
    layout: 'full-width',
    title: { en: '', ta: '' },
    content: { en: '', ta: '' },
    subtitle: { en: '', ta: '' },
    stylePreset: 'default',
    isActive: true,
    isVisible: true,
    order: 0,
    newImages: []
  });

  const handleInputChange = (field, value, language = null) => {
    if (language) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      newImages: files
    }));
  };

  const generateSectionKey = () => {
    if (formData.page && formData.section) {
      const slug = formData.section.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const key = `${formData.page}-${slug}`;
      setFormData(prev => ({ ...prev, sectionKey: key }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Section</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page
                </label>
                <select
                  value={formData.page}
                  onChange={(e) => handleInputChange('page', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {pages.map(page => (
                    <option key={page.value} value={page.value}>
                      {page.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => {
                    handleInputChange('section', e.target.value);
                    setTimeout(generateSectionKey, 100);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Key
                </label>
                <input
                  type="text"
                  value={formData.sectionKey}
                  onChange={(e) => handleInputChange('sectionKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Type
                </label>
                <select
                  value={formData.sectionType}
                  onChange={(e) => handleInputChange('sectionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bilingual Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Content (Bilingual)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title.en}
                    onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Tamil)
                  </label>
                  <input
                    type="text"
                    value={formData.title.ta}
                    onChange={(e) => handleInputChange('title', e.target.value, 'ta')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (English)
                  </label>
                  <textarea
                    value={formData.content.en}
                    onChange={(e) => handleInputChange('content', e.target.value, 'en')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (Tamil)
                  </label>
                  <textarea
                    value={formData.content.ta}
                    onChange={(e) => handleInputChange('content', e.target.value, 'ta')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Layout and Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <select
                  value={formData.layout}
                  onChange={(e) => handleInputChange('layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {layouts.map(layout => (
                    <option key={layout.value} value={layout.value}>
                      {layout.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Preset
                </label>
                <select
                  value={formData.stylePreset}
                  onChange={(e) => handleInputChange('stylePreset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stylePresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.newImages.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {formData.newImages.length} file(s) selected
                </p>
              )}
            </div>

            {/* Status Toggles */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Visible</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Section Modal Component (similar to Create but with existing data)
const EditSectionModal = ({ 
  section, 
  onClose, 
  onSave, 
  saving, 
  sectionTypes, 
  layouts, 
  stylePresets 
}) => {
  const [formData, setFormData] = useState({
    ...section,
    newImages: []
  });

  const handleInputChange = (field, value, language = null) => {
    if (language) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      newImages: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Section</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Similar form structure as CreateSectionModal but with existing data */}
            {/* Bilingual Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Content (Bilingual)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title?.en || ''}
                    onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Tamil)
                  </label>
                  <input
                    type="text"
                    value={formData.title?.ta || ''}
                    onChange={(e) => handleInputChange('title', e.target.value, 'ta')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (English)
                  </label>
                  <textarea
                    value={formData.content?.en || ''}
                    onChange={(e) => handleInputChange('content', e.target.value, 'en')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (Tamil)
                  </label>
                  <textarea
                    value={formData.content?.ta || ''}
                    onChange={(e) => handleInputChange('content', e.target.value, 'ta')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Layout and Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Type
                </label>
                <select
                  value={formData.sectionType}
                  onChange={(e) => handleInputChange('sectionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <select
                  value={formData.layout}
                  onChange={(e) => handleInputChange('layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {layouts.map(layout => (
                    <option key={layout.value} value={layout.value}>
                      {layout.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Preset
                </label>
                <select
                  value={formData.stylePreset}
                  onChange={(e) => handleInputChange('stylePreset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stylePresets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Current Images */}
            {formData.images && formData.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <Image
                        src={img.url || img}
                        alt={img.alt?.en || 'Section image'}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.newImages.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {formData.newImages.length} new file(s) selected
                </p>
              )}
            </div>

            {/* Status Toggles */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Visible</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;