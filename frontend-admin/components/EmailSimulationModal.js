import { useState, useEffect } from 'react';
import { X, Mail, Send, Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const EmailSimulationModal = ({ isOpen, onClose, language }) => {
  const [emailData, setEmailData] = useState({
    subject: { en: '', ta: '' },
    content: { en: '', ta: '' },
    targetAudience: 'all',
    priority: 'normal',
    includeUnsubscribeLink: true,
    sendImmediately: true,
    scheduledTime: ''
  });
  const [activeTab, setActiveTab] = useState('en');
  const [simulation, setSimulation] = useState({
    isRunning: false,
    progress: 0,
    totalUsers: 0,
    sentCount: 0,
    failedCount: 0,
    results: []
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    parents: 0,
    active: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchUserStats();
    }
  }, [isOpen]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setEmailData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setEmailData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getTargetUserCount = () => {
    switch (emailData.targetAudience) {
      case 'students':
        return userStats.students;
      case 'teachers':
        return userStats.teachers;
      case 'parents':
        return userStats.parents;
      case 'active':
        return userStats.active;
      default:
        return userStats.total;
    }
  };

  const simulateEmailSending = async () => {
    const targetCount = getTargetUserCount();
    
    setSimulation({
      isRunning: true,
      progress: 0,
      totalUsers: targetCount,
      sentCount: 0,
      failedCount: 0,
      results: []
    });

    // Simulate email sending process
    const batchSize = Math.max(1, Math.floor(targetCount / 20)); // 20 progress updates
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (let i = 0; i < targetCount; i += batchSize) {
      const currentBatch = Math.min(batchSize, targetCount - i);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate some failures (5% failure rate)
      const batchFailed = Math.floor(Math.random() * currentBatch * 0.05);
      const batchSent = currentBatch - batchFailed;
      
      sentCount += batchSent;
      failedCount += batchFailed;
      
      // Add batch results
      if (batchSent > 0) {
        results.push({
          type: 'success',
          message: `${language === 'ta' ? 'வெற்றிகரமாக அனுப்பப்பட்டது:' : 'Successfully sent:'} ${batchSent} ${language === 'ta' ? 'மின்னஞ்சல்கள்' : 'emails'}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      if (batchFailed > 0) {
        results.push({
          type: 'error',
          message: `${language === 'ta' ? 'தோல்வியடைந்தது:' : 'Failed:'} ${batchFailed} ${language === 'ta' ? 'மின்னஞ்சல்கள்' : 'emails'}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      setSimulation(prev => ({
        ...prev,
        progress: Math.min(100, ((i + currentBatch) / targetCount) * 100),
        sentCount,
        failedCount,
        results: [...results]
      }));
    }

    // Final update
    setSimulation(prev => ({
      ...prev,
      isRunning: false,
      progress: 100
    }));

    // Add completion message
    results.push({
      type: 'info',
      message: `${language === 'ta' ? 'மின்னஞ்சல் அனுப்புதல் முடிந்தது. மொத்தம்:' : 'Email sending completed. Total:'} ${sentCount} ${language === 'ta' ? 'வெற்றி,' : 'success,'} ${failedCount} ${language === 'ta' ? 'தோல்வி' : 'failed'}`,
      timestamp: new Date().toLocaleTimeString()
    });

    setSimulation(prev => ({
      ...prev,
      results: [...results]
    }));
  };

  const handleSendEmails = async () => {
    if (!emailData.subject.en.trim() && !emailData.subject.ta.trim()) {
      alert(language === 'ta' ? 'தலைப்பு தேவை' : 'Subject is required');
      return;
    }

    if (!emailData.content.en.trim() && !emailData.content.ta.trim()) {
      alert(language === 'ta' ? 'உள்ளடக்கம் தேவை' : 'Content is required');
      return;
    }

    await simulateEmailSending();
  };

  const resetSimulation = () => {
    setSimulation({
      isRunning: false,
      progress: 0,
      totalUsers: 0,
      sentCount: 0,
      failedCount: 0,
      results: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'ta' ? 'மின்னஞ்சல் அறிவிப்பு அனுப்பு' : 'Send Email Notification'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* User Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.total}</div>
              <div className="text-sm text-blue-800">{language === 'ta' ? 'மொத்த பயனர்கள்' : 'Total Users'}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.students}</div>
              <div className="text-sm text-green-800">{language === 'ta' ? 'மாணவர்கள்' : 'Students'}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userStats.teachers}</div>
              <div className="text-sm text-purple-800">{language === 'ta' ? 'ஆசிரியர்கள்' : 'Teachers'}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{userStats.parents}</div>
              <div className="text-sm text-orange-800">{language === 'ta' ? 'பெற்றோர்கள்' : 'Parents'}</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{userStats.active}</div>
              <div className="text-sm text-indigo-800">{language === 'ta' ? 'செயலில் உள்ளவர்கள்' : 'Active Users'}</div>
            </div>
          </div>

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
            {/* Left Column - Email Composition */}
            <div className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'தலைப்பு' : 'Subject'} *
                </label>
                <input
                  type="text"
                  value={emailData.subject[activeTab]}
                  onChange={(e) => handleInputChange('subject', e.target.value, activeTab)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={activeTab === 'en' ? 'Enter email subject' : 'மின்னஞ்சல் தலைப்பு உள்ளிடவும்'}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'உள்ளடக்கம்' : 'Content'} *
                </label>
                <textarea
                  value={emailData.content[activeTab]}
                  onChange={(e) => handleInputChange('content', e.target.value, activeTab)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={activeTab === 'en' ? 'Enter email content' : 'மின்னஞ்சல் உள்ளடக்கம் உள்ளிடவும்'}
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  {language === 'ta' ? 'இலக்கு பார்வையாளர்கள்' : 'Target Audience'}
                </label>
                <select
                  value={emailData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{language === 'ta' ? 'அனைத்து பயனர்கள்' : 'All Users'} ({userStats.total})</option>
                  <option value="students">{language === 'ta' ? 'மாணவர்கள்' : 'Students'} ({userStats.students})</option>
                  <option value="teachers">{language === 'ta' ? 'ஆசிரியர்கள்' : 'Teachers'} ({userStats.teachers})</option>
                  <option value="parents">{language === 'ta' ? 'பெற்றோர்கள்' : 'Parents'} ({userStats.parents})</option>
                  <option value="active">{language === 'ta' ? 'செயலில் உள்ளவர்கள்' : 'Active Users'} ({userStats.active})</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'ta' ? 'மின்னஞ்சல் அனுப்பப்படும்:' : 'Will send to:'} {getTargetUserCount()} {language === 'ta' ? 'பயனர்கள்' : 'users'}
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'முன்னுரிமை' : 'Priority'}
                </label>
                <select
                  value={emailData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">{language === 'ta' ? 'குறைந்த' : 'Low'}</option>
                  <option value="normal">{language === 'ta' ? 'சாதாரண' : 'Normal'}</option>
                  <option value="high">{language === 'ta' ? 'அவசரம்' : 'High'}</option>
                </select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeUnsubscribe"
                    checked={emailData.includeUnsubscribeLink}
                    onChange={(e) => handleInputChange('includeUnsubscribeLink', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeUnsubscribe" className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'குழுவிலகல் இணைப்பு சேர்க்க' : 'Include unsubscribe link'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendImmediately"
                    checked={emailData.sendImmediately}
                    onChange={(e) => handleInputChange('sendImmediately', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sendImmediately" className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'உடனே அனுப்பு' : 'Send immediately'}
                  </label>
                </div>
              </div>

              {/* Scheduled Time */}
              {!emailData.sendImmediately && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {language === 'ta' ? 'அட்டவணை நேரம்' : 'Scheduled Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={emailData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Right Column - Simulation Results */}
            <div className="space-y-6">
              {/* Progress */}
              {simulation.totalUsers > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {language === 'ta' ? 'அனுப்புதல் முன்னேற்றம்' : 'Sending Progress'}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{Math.round(simulation.progress)}%</span>
                      <span>{simulation.sentCount + simulation.failedCount} / {simulation.totalUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${simulation.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{simulation.sentCount}</div>
                      <div className="text-sm text-gray-600">{language === 'ta' ? 'வெற்றி' : 'Sent'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{simulation.failedCount}</div>
                      <div className="text-sm text-gray-600">{language === 'ta' ? 'தோல்வி' : 'Failed'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{simulation.totalUsers - simulation.sentCount - simulation.failedCount}</div>
                      <div className="text-sm text-gray-600">{language === 'ta' ? 'மீதம்' : 'Remaining'}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    {simulation.isRunning ? (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        {language === 'ta' ? 'அனுப்புகிறது...' : 'Sending...'}
                      </div>
                    ) : simulation.progress === 100 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {language === 'ta' ? 'முடிந்தது!' : 'Completed!'}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Results Log */}
              {simulation.results.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {language === 'ta' ? 'அனுப்புதல் பதிவு' : 'Sending Log'}
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {simulation.results.map((result, index) => (
                      <div key={index} className={`flex items-start space-x-2 text-sm p-2 rounded ${
                        result.type === 'success' ? 'bg-green-50 text-green-800' :
                        result.type === 'error' ? 'bg-red-50 text-red-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        {result.type === 'success' && <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {result.type === 'error' && <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {result.type === 'info' && <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <div>{result.message}</div>
                          <div className="text-xs opacity-75">{result.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'ta' ? 'மின்னஞ்சல் முன்னோட்டம்' : 'Email Preview'}
                </h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="border-b pb-2 mb-3">
                    <div className="text-sm text-gray-600">{language === 'ta' ? 'தலைப்பு:' : 'Subject:'}</div>
                    <div className="font-medium">
                      {emailData.subject[activeTab] || `(${language === 'ta' ? 'தலைப்பு இல்லை' : 'No subject'})`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {emailData.content[activeTab] || `(${language === 'ta' ? 'உள்ளடக்கம் இல்லை' : 'No content'})`}
                  </div>
                  {emailData.includeUnsubscribeLink && (
                    <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                      {language === 'ta' ? 'இந்த மின்னஞ்சல்களை பெற விரும்பவில்லையா?' : "Don't want to receive these emails?"}{' '}
                      <a href="#" className="text-blue-600 underline">
                        {language === 'ta' ? 'குழுவிலகல்' : 'Unsubscribe'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {simulation.results.length > 0 && (
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {language === 'ta' ? 'மீட்டமை' : 'Reset'}
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                onClick={handleSendEmails}
                disabled={simulation.isRunning}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {simulation.isRunning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {simulation.isRunning 
                  ? (language === 'ta' ? 'அனுப்புகிறது...' : 'Sending...')
                  : (language === 'ta' ? 'மின்னஞ்சல் அனுப்பு' : 'Send Emails')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSimulationModal;