import { useState, useEffect } from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AnnouncementPopup = () => {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    setDismissedAnnouncements(dismissed);
    
    // Fetch active announcements
    fetchActiveAnnouncements();
    
    // Set up polling for new announcements every 30 seconds
    const interval = setInterval(fetchActiveAnnouncements, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?active=true&target=public');
      if (response.ok) {
        const data = await response.json();
        const activeAnnouncements = data.data || [];
        
        // Filter out dismissed announcements
        const newAnnouncements = activeAnnouncements.filter(
          announcement => !dismissedAnnouncements.includes(announcement._id)
        );
        
        setAnnouncements(newAnnouncements);
        
        // Show the first new announcement if any
        if (newAnnouncements.length > 0 && !currentAnnouncement) {
          showAnnouncement(newAnnouncements[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const showAnnouncement = (announcement) => {
    setCurrentAnnouncement(announcement);
    setIsVisible(true);
    
    // Mark as viewed
    markAsViewed(announcement._id);
  };

  const markAsViewed = async (announcementId) => {
    try {
      await fetch(`/api/announcements/${announcementId}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking announcement as viewed:', error);
    }
  };

  const dismissAnnouncement = (announcementId) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    
    setIsVisible(false);
    setCurrentAnnouncement(null);
    
    // Show next announcement if available
    const remainingAnnouncements = announcements.filter(
      ann => ann._id !== announcementId && !newDismissed.includes(ann._id)
    );
    
    if (remainingAnnouncements.length > 0) {
      setTimeout(() => {
        showAnnouncement(remainingAnnouncements[0]);
      }, 2000);
    }
  };

  const handleAction = (action) => {
    if (action === 'dismiss') {
      dismissAnnouncement(currentAnnouncement._id);
    } else if (action === 'view' && currentAnnouncement.links?.[0]) {
      window.open(currentAnnouncement.links[0].url, '_blank');
      dismissAnnouncement(currentAnnouncement._id);
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

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Popup Container */}
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ta' ? 'அறிவிப்பு' : 'Announcement'}
              </h3>
            </div>
            <button
              onClick={() => dismissAnnouncement(currentAnnouncement._id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Priority Badge */}
            {currentAnnouncement.priority && (
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                currentAnnouncement.priority === 'high' 
                  ? 'bg-red-100 text-red-800'
                  : currentAnnouncement.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {currentAnnouncement.priority === 'high' && (language === 'ta' ? 'அவசரம்' : 'High Priority')}
                {currentAnnouncement.priority === 'medium' && (language === 'ta' ? 'நடுத்தர' : 'Medium Priority')}
                {currentAnnouncement.priority === 'low' && (language === 'ta' ? 'குறைந்த' : 'Low Priority')}
              </div>
            )}

            {/* Title */}
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {getBilingualContent(currentAnnouncement.title)}
            </h4>

            {/* Description */}
            <div className="text-gray-700 mb-4 leading-relaxed">
              {getBilingualContent(currentAnnouncement.description)}
            </div>

            {/* Content */}
            {currentAnnouncement.content && (
              <div className="text-gray-600 mb-4 text-sm">
                {getBilingualContent(currentAnnouncement.content)}
              </div>
            )}

            {/* Price/Cost Information */}
            {currentAnnouncement.cost && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {language === 'ta' ? 'கட்டணம்:' : 'Cost:'}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(currentAnnouncement.cost)}
                  </span>
                </div>
              </div>
            )}

            {/* Category */}
            {currentAnnouncement.category && (
              <div className="text-xs text-gray-500 mb-4">
                {language === 'ta' ? 'வகை:' : 'Category:'} {currentAnnouncement.category}
              </div>
            )}

            {/* Schedule Information */}
            {currentAnnouncement.schedule?.publishAt && (
              <div className="text-xs text-gray-500 mb-4">
                {language === 'ta' ? 'வெளியிடப்பட்ட தேதி:' : 'Published:'} {' '}
                {new Date(currentAnnouncement.schedule.publishAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={() => handleAction('dismiss')}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {language === 'ta' ? 'நிராகரிக்க' : 'Dismiss'}
            </button>
            
            {currentAnnouncement.links?.[0] && (
              <button
                onClick={() => handleAction('view')}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <span>{language === 'ta' ? 'மேலும் பார்க்க' : 'Learn More'}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .fixed {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AnnouncementPopup;