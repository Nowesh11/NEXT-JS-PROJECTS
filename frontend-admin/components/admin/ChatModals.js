import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ChatModals = ({ 
  show, 
  type, 
  chat, 
  onClose, 
  onSave, 
  onDelete,
  onExport,
  getText 
}) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    notes: ''
  });

  const getText = (key) => {
    const texts = {
      // Modal titles
      viewChat: {
        en: 'View Chat Details',
        ta: 'அரட்டை விவரங்களைப் பார்க்கவும்'
      },
      editChat: {
        en: 'Edit Chat',
        ta: 'அரட்டையைத் திருத்தவும்'
      },
      deleteChat: {
        en: 'Delete Chat',
        ta: 'அரட்டையை நீக்கவும்'
      },
      exportChat: {
        en: 'Export Chat History',
        ta: 'அரட்டை வரலாற்றை ஏற்றுமதி செய்யவும்'
      },
      
      // Form labels
      status: {
        en: 'Status',
        ta: 'நிலை'
      },
      priority: {
        en: 'Priority',
        ta: 'முன்னுரிமை'
      },
      notes: {
        en: 'Notes',
        ta: 'குறிப்புகள்'
      },
      customer: {
        en: 'Customer',
        ta: 'வாடிக்கையாளர்'
      },
      lastMessage: {
        en: 'Last Message',
        ta: 'கடைசி செய்தி'
      },
      createdAt: {
        en: 'Created At',
        ta: 'உருவாக்கப்பட்ட நேரம்'
      },
      totalMessages: {
        en: 'Total Messages',
        ta: 'மொத்த செய்திகள்'
      },
      
      // Status options
      active: {
        en: 'Active',
        ta: 'செயலில்'
      },
      pending: {
        en: 'Pending',
        ta: 'நிலுவையில்'
      },
      resolved: {
        en: 'Resolved',
        ta: 'தீர்க்கப்பட்டது'
      },
      closed: {
        en: 'Closed',
        ta: 'மூடப்பட்டது'
      },
      
      // Priority options
      high: {
        en: 'High',
        ta: 'உயர்'
      },
      medium: {
        en: 'Medium',
        ta: 'நடுத்தர'
      },
      low: {
        en: 'Low',
        ta: 'குறைந்த'
      },
      
      // Buttons
      save: {
        en: 'Save Changes',
        ta: 'மாற்றங்களைச் சேமிக்கவும்'
      },
      delete: {
        en: 'Delete Chat',
        ta: 'அரட்டையை நீக்கவும்'
      },
      export: {
        en: 'Export',
        ta: 'ஏற்றுமதி'
      },
      cancel: {
        en: 'Cancel',
        ta: 'ரத்து செய்'
      },
      close: {
        en: 'Close',
        ta: 'மூடு'
      },
      
      // Messages
      deleteConfirm: {
        en: 'Are you sure you want to delete this chat? This action cannot be undone.',
        ta: 'இந்த அரட்டையை நீக்க விரும்புகிறீர்களா? இந்த செயலை மாற்ற முடியாது.'
      },
      exportSuccess: {
        en: 'Chat history exported successfully!',
        ta: 'அரட்டை வரலாறு வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது!'
      },
      
      // Export options
      exportFormat: {
        en: 'Export Format',
        ta: 'ஏற்றுமதி வடிவம்'
      },
      dateRange: {
        en: 'Date Range',
        ta: 'தேதி வரம்பு'
      },
      allMessages: {
        en: 'All Messages',
        ta: 'அனைத்து செய்திகள்'
      },
      lastWeek: {
        en: 'Last Week',
        ta: 'கடந்த வாரம்'
      },
      lastMonth: {
        en: 'Last Month',
        ta: 'கடந்த மாதம்'
      }
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  useEffect(() => {
    if (chat && type === 'edit') {
      setFormData({
        status: chat.status || 'active',
        priority: chat.priority || 'medium',
        notes: chat.notes || ''
      });
    }
  }, [chat, type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(chat._id, formData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(chat._id);
    onClose();
  };

  const handleExport = (format, dateRange) => {
    onExport(chat._id, format, dateRange);
    onClose();
  };

  if (!show || !chat) return null;

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes.active;
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return classes[priority] || classes.medium;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === 'view' && getText('viewChat')}
            {type === 'edit' && getText('editChat')}
            {type === 'delete' && getText('deleteChat')}
            {type === 'export' && getText('exportChat')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {type === 'view' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('customer')}
                  </label>
                  <p className="text-gray-900">{chat.user?.name || 'Unknown User'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('status')}
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(chat.status)}`}>
                    {getText(chat.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('priority')}
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(chat.priority || 'medium')}`}>
                    {getText(chat.priority || 'medium')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('totalMessages')}
                  </label>
                  <p className="text-gray-900">{chat.messageCount || 0}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('lastMessage')}
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('createdAt')}
                </label>
                <p className="text-gray-900">
                  {new Date(chat.updatedAt).toLocaleString()}
                </p>
              </div>
              {chat.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('notes')}
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {chat.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {type === 'edit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">{getText('active')}</option>
                    <option value="pending">{getText('pending')}</option>
                    <option value="resolved">{getText('resolved')}</option>
                    <option value="closed">{getText('closed')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('priority')}
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="high">{getText('high')}</option>
                    <option value="medium">{getText('medium')}</option>
                    <option value="low">{getText('low')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this chat..."
                />
              </div>
            </div>
          )}

          {type === 'delete' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getText('deleteChat')}
              </h3>
              <p className="text-gray-500 mb-6">
                {getText('deleteConfirm')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>{getText('customer')}:</strong> {chat.user?.name || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{getText('totalMessages')}:</strong> {chat.messageCount || 0}
                </p>
              </div>
            </div>
          )}

          {type === 'export' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('exportFormat')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('csv', 'all')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    CSV Format
                  </button>
                  <button
                    onClick={() => handleExport('json', 'all')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    JSON Format
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('dateRange')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExport('csv', 'week')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {getText('lastWeek')}
                  </button>
                  <button
                    onClick={() => handleExport('csv', 'month')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {getText('lastMonth')}
                  </button>
                  <button
                    onClick={() => handleExport('csv', 'all')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {getText('allMessages')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          {type === 'view' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {getText('close')}
            </button>
          )}
          
          {type === 'edit' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {getText('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {getText('save')}
              </button>
            </>
          )}
          
          {type === 'delete' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {getText('cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {getText('delete')}
              </button>
            </>
          )}
          
          {type === 'export' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {getText('cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModals;