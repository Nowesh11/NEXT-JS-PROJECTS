import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Move,
  Type,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  List,
  Upload,
  Hash,
  Star,
  ToggleLeft,
  Link,
  Clock,
  User,
  MapPin,
  Globe,
  X,
  Save,
  Eye,
  Settings,
  Copy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const FormBuilder = ({ isOpen, onClose, onSave, initialData = null, linkedId, linkedType }) => {
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    role: 'crew',
    status: 'active',
    fields: [],
    settings: {
      allowMultipleSubmissions: false,
      requireLogin: true,
      autoClose: false,
      closeDate: null,
      confirmationMessage: { en: 'Thank you for your application!', ta: 'உங்கள் விண்ணப்பத்திற்கு நன்றி!' },
      notifyOnSubmission: true,
      showProgressBar: true
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [draggedField, setDraggedField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Field types configuration
  const fieldTypes = [
    {
      type: 'short-text',
      label: 'Short Text',
      icon: Type,
      description: 'Single line text input',
      defaultConfig: {
        label: 'Text Field',
        placeholder: 'Enter text...',
        required: false,
        maxLength: 100
      }
    },
    {
      type: 'paragraph',
      label: 'Paragraph',
      icon: FileText,
      description: 'Multi-line text area',
      defaultConfig: {
        label: 'Paragraph Field',
        placeholder: 'Enter detailed text...',
        required: false,
        maxLength: 1000,
        rows: 4
      }
    },
    {
      type: 'email',
      label: 'Email',
      icon: Mail,
      description: 'Email address input',
      defaultConfig: {
        label: 'Email Address',
        placeholder: 'Enter email address...',
        required: true
      }
    },
    {
      type: 'phone',
      label: 'Phone',
      icon: Phone,
      description: 'Phone number input',
      defaultConfig: {
        label: 'Phone Number',
        placeholder: 'Enter phone number...',
        required: false
      }
    },
    {
      type: 'number',
      label: 'Number',
      icon: Hash,
      description: 'Numeric input',
      defaultConfig: {
        label: 'Number Field',
        placeholder: 'Enter number...',
        required: false,
        min: 0,
        max: 100
      }
    },
    {
      type: 'date',
      label: 'Date',
      icon: Calendar,
      description: 'Date picker',
      defaultConfig: {
        label: 'Date Field',
        required: false
      }
    },
    {
      type: 'dropdown',
      label: 'Dropdown',
      icon: List,
      description: 'Select from options',
      defaultConfig: {
        label: 'Dropdown Field',
        required: false,
        options: ['Option 1', 'Option 2', 'Option 3']
      }
    },
    {
      type: 'checkboxes',
      label: 'Checkboxes',
      icon: CheckSquare,
      description: 'Multiple selection',
      defaultConfig: {
        label: 'Checkbox Field',
        required: false,
        options: ['Option 1', 'Option 2', 'Option 3']
      }
    },
    {
      type: 'radio',
      label: 'Radio Buttons',
      icon: ToggleLeft,
      description: 'Single selection',
      defaultConfig: {
        label: 'Radio Field',
        required: false,
        options: ['Option 1', 'Option 2', 'Option 3']
      }
    },
    {
      type: 'file',
      label: 'File Upload',
      icon: Upload,
      description: 'File attachment',
      defaultConfig: {
        label: 'File Upload',
        required: false,
        acceptedTypes: ['.pdf', '.doc', '.docx'],
        maxSize: 5 // MB
      }
    },
    {
      type: 'rating',
      label: 'Rating',
      icon: Star,
      description: 'Star rating',
      defaultConfig: {
        label: 'Rating Field',
        required: false,
        maxRating: 5
      }
    },
    {
      type: 'url',
      label: 'URL',
      icon: Link,
      description: 'Website URL',
      defaultConfig: {
        label: 'Website URL',
        placeholder: 'https://...',
        required: false
      }
    }
  ];

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Add default fields for new forms
      setFormData(prev => ({
        ...prev,
        fields: [
          {
            id: 'name',
            type: 'short-text',
            label: 'Full Name',
            placeholder: 'Enter your full name...',
            required: true,
            order: 0
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email address...',
            required: true,
            order: 1
          }
        ]
      }));
    }
  }, [initialData]);

  // Add new field
  const addField = (fieldType) => {
    const fieldConfig = fieldTypes.find(f => f.type === fieldType);
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      ...fieldConfig.defaultConfig,
      order: formData.fields.length
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  // Update field
  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  // Delete field
  const deleteField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  // Move field
  const moveField = (fieldId, direction) => {
    const fields = [...formData.fields];
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    
    if (direction === 'up' && fieldIndex > 0) {
      [fields[fieldIndex], fields[fieldIndex - 1]] = [fields[fieldIndex - 1], fields[fieldIndex]];
    } else if (direction === 'down' && fieldIndex < fields.length - 1) {
      [fields[fieldIndex], fields[fieldIndex + 1]] = [fields[fieldIndex + 1], fields[fieldIndex]];
    }
    
    // Update order
    fields.forEach((field, index) => {
      field.order = index;
    });
    
    setFormData(prev => ({ ...prev, fields }));
  };

  // Duplicate field
  const duplicateField = (fieldId) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField = {
        ...field,
        id: `field_${Date.now()}`,
        label: `${field.label} (Copy)`,
        order: formData.fields.length
      };
      
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, duplicatedField]
      }));
    }
  };

  // Handle form save
  const handleSave = () => {
    const formToSave = {
      ...formData,
      linkedId,
      type: linkedType,
      fields: formData.fields.sort((a, b) => a.order - b.order)
    };
    
    onSave(formToSave);
  };

  // Render field editor
  const renderFieldEditor = (field) => {
    const fieldType = fieldTypes.find(f => f.type === field.type);
    const Icon = fieldType?.icon || Type;

    return (
      <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">{fieldType?.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveField(field.id, 'up')}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => duplicateField(field.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteField(field.id)}
              className="p-1 text-red-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Placeholder (for text fields) */}
          {['short-text', 'paragraph', 'email', 'phone', 'number', 'url'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required_${field.id}`}
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`required_${field.id}`} className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>

          {/* Options (for dropdown, checkboxes, radio) */}
          {['dropdown', 'checkboxes', 'radio'].includes(field.type) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={field.options?.join('\n') || ''}
                onChange={(e) => updateField(field.id, { 
                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Option 1\nOption 2\nOption 3"
              />
            </div>
          )}

          {/* Max Length (for text fields) */}
          {['short-text', 'paragraph'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={field.maxLength || ''}
                onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Rows (for paragraph) */}
          {field.type === 'paragraph' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rows
              </label>
              <input
                type="number"
                value={field.rows || 4}
                onChange={(e) => updateField(field.id, { rows: parseInt(e.target.value) })}
                min="2"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Min/Max (for number) */}
          {field.type === 'number' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={field.min || ''}
                  onChange={(e) => updateField(field.id, { min: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={field.max || ''}
                  onChange={(e) => updateField(field.id, { max: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Max Rating (for rating) */}
          {field.type === 'rating' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Rating
              </label>
              <input
                type="number"
                value={field.maxRating || 5}
                onChange={(e) => updateField(field.id, { maxRating: parseInt(e.target.value) })}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* File Upload Settings */}
          {field.type === 'file' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accepted File Types
                </label>
                <input
                  type="text"
                  value={field.acceptedTypes?.join(', ') || ''}
                  onChange={(e) => updateField(field.id, { 
                    acceptedTypes: e.target.value.split(',').map(type => type.trim()) 
                  })}
                  placeholder=".pdf, .doc, .docx, .jpg, .png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={field.maxSize || 5}
                  onChange={(e) => updateField(field.id, { maxSize: parseInt(e.target.value) })}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render field preview
  const renderFieldPreview = (field) => {
    const commonProps = {
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case 'short-text':
        return <input type="text" {...commonProps} />;
      
      case 'paragraph':
        return <textarea rows={field.rows || 4} {...commonProps} />;
      
      case 'email':
        return <input type="email" {...commonProps} />;
      
      case 'phone':
        return <input type="tel" {...commonProps} />;
      
      case 'number':
        return <input type="number" min={field.min} max={field.max} {...commonProps} />;
      
      case 'date':
        return <input type="date" {...commonProps} />;
      
      case 'url':
        return <input type="url" {...commonProps} />;
      
      case 'dropdown':
        return (
          <select {...commonProps}>
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input type="radio" name={field.id} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="ml-2 text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                {field.acceptedTypes?.join(', ')} up to {field.maxSize}MB
              </p>
            </div>
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex space-x-1">
            {Array.from({ length: field.maxRating || 5 }, (_, i) => (
              <Star key={i} className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
            ))}
          </div>
        );
      
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Recruitment Form' : 'Create Recruitment Form'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                previewMode ? 'bg-blue-50 text-blue-700' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {!previewMode && (
          /* Tabs */
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Info', icon: FileText },
                { id: 'fields', label: 'Form Fields', icon: List },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          {previewMode ? (
            /* Preview Mode */
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.title.en}</h2>
                  <p className="text-gray-600">{formData.description.en}</p>
                </div>
                
                <div className="space-y-6">
                  {formData.fields.sort((a, b) => a.order - b.order).map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700">
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div>
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Form Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Title (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.title.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: { ...formData.title, en: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Frontend Developer Application"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Title (Tamil)
                      </label>
                      <input
                        type="text"
                        value={formData.title.ta}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: { ...formData.title, ta: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., முன்பக்க டெவலப்பர் விண்ணப்பம்"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (English) *
                      </label>
                      <textarea
                        value={formData.description.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          description: { ...formData.description, en: e.target.value }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the role and requirements..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Tamil)
                      </label>
                      <textarea
                        value={formData.description.ta}
                        onChange={(e) => setFormData({
                          ...formData,
                          description: { ...formData.description, ta: e.target.value }
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="பாத்திரம் மற்றும் தேவைகளை விவரிக்கவும்..."
                      />
                    </div>
                  </div>

                  {/* Role and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Type *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="crew">Crew Member</option>
                        <option value="lead">Team Lead</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="specialist">Specialist</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fields' && (
                <div>
                  {/* Field Types Palette */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Add Field Types</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {fieldTypes.map((fieldType) => {
                        const Icon = fieldType.icon;
                        return (
                          <button
                            key={fieldType.type}
                            onClick={() => addField(fieldType.type)}
                            className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            title={fieldType.description}
                          >
                            <Icon className="w-6 h-6 text-gray-600 mb-2" />
                            <span className="text-xs text-gray-700 text-center">{fieldType.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Form Fields ({formData.fields.length})
                    </h4>
                    {formData.fields.length > 0 ? (
                      <div className="space-y-4">
                        {formData.fields.sort((a, b) => a.order - b.order).map(renderFieldEditor)}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <List className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No fields added</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add fields from the palette above to build your form.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Form Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Form Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Allow Multiple Submissions</label>
                          <p className="text-sm text-gray-500">Allow users to submit multiple applications</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.settings.allowMultipleSubmissions}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, allowMultipleSubmissions: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Require Login</label>
                          <p className="text-sm text-gray-500">Users must be logged in to submit</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.settings.requireLogin}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, requireLogin: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Show Progress Bar</label>
                          <p className="text-sm text-gray-500">Display progress indicator</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.settings.showProgressBar}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, showProgressBar: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Notify on Submission</label>
                          <p className="text-sm text-gray-500">Send email notifications for new submissions</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.settings.notifyOnSubmission}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, notifyOnSubmission: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto Close Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Auto Close</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoClose"
                          checked={formData.settings.autoClose}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, autoClose: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="autoClose" className="ml-2 text-sm text-gray-700">
                          Automatically close form on specific date
                        </label>
                      </div>
                      
                      {formData.settings.autoClose && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Close Date
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.settings.closeDate || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, closeDate: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Messages */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Confirmation Messages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          English Message
                        </label>
                        <textarea
                          value={formData.settings.confirmationMessage.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              confirmationMessage: {
                                ...formData.settings.confirmationMessage,
                                en: e.target.value
                              }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Thank you for your application!"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tamil Message
                        </label>
                        <textarea
                          value={formData.settings.confirmationMessage.ta}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              confirmationMessage: {
                                ...formData.settings.confirmationMessage,
                                ta: e.target.value
                              }
                            }
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="உங்கள் விண்ணப்பத்திற்கு நன்றி!"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title.en || !formData.description.en || formData.fields.length === 0}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {initialData ? 'Update Form' : 'Create Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;