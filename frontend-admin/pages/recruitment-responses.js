import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Calendar,
  User,
  Building,
  Tag,
  MessageSquare,
  ArrowLeft,
  Edit,
  Save,
  X,
  ChevronDown,
  Star,
  Flag,
  Archive,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/router';
import AdminLayout from '../components/layout/AdminLayout';
import ResponseCharts from '../components/admin/ResponseCharts';
import ResponseExport from '../components/admin/ResponseExport';

const RecruitmentResponsesPage = () => {
  const router = useRouter();
  const { formId } = router.query;
  
  // State management
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load sample data
  useEffect(() => {
    loadSampleData();
  }, [formId]);

  const loadSampleData = () => {
    // Sample form details
    const sampleForm = {
      _id: formId || '1',
      title: { en: 'Web Developer Recruitment', ta: 'வெப் டெவலப்பர் ஆட்சேர்ப்பு' },
      description: { en: 'Looking for skilled web developers', ta: 'திறமையான வெப் டெவலப்பர்களை தேடுகிறோம்' },
      type: 'project',
      role: 'crew',
      status: 'active'
    };
    
    // Sample responses
    const sampleResponses = [
      {
        _id: '1',
        formId: formId || '1',
        userId: 'user_1',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z',
        reviewedAt: null,
        reviewedBy: null,
        answers: [
          { fieldId: 'name', fieldLabel: 'Full Name', fieldType: 'short-text', value: 'John Doe' },
          { fieldId: 'email', fieldLabel: 'Email', fieldType: 'email', value: 'john.doe@example.com' },
          { fieldId: 'phone', fieldLabel: 'Phone', fieldType: 'phone', value: '+1234567890' },
          { fieldId: 'experience', fieldLabel: 'Years of Experience', fieldType: 'number', value: '5' },
          { fieldId: 'skills', fieldLabel: 'Technical Skills', fieldType: 'checkboxes', value: ['JavaScript', 'React', 'Node.js'] },
          { fieldId: 'portfolio', fieldLabel: 'Portfolio URL', fieldType: 'short-text', value: 'https://johndoe.dev' },
          { fieldId: 'motivation', fieldLabel: 'Why do you want to join?', fieldType: 'paragraph', value: 'I am passionate about web development and want to contribute to meaningful projects.' }
        ],
        attachments: [
          { originalName: 'resume.pdf', filename: 'resume_john_doe.pdf', size: 245760 }
        ],
        notes: '',
        rating: null,
        tags: []
      },
      {
        _id: '2',
        formId: formId || '1',
        userId: 'user_2',
        userEmail: 'jane.smith@example.com',
        userName: 'Jane Smith',
        status: 'approved',
        submittedAt: '2024-01-14T14:20:00Z',
        reviewedAt: '2024-01-16T09:15:00Z',
        reviewedBy: 'admin_1',
        answers: [
          { fieldId: 'name', fieldLabel: 'Full Name', fieldType: 'short-text', value: 'Jane Smith' },
          { fieldId: 'email', fieldLabel: 'Email', fieldType: 'email', value: 'jane.smith@example.com' },
          { fieldId: 'phone', fieldLabel: 'Phone', fieldType: 'phone', value: '+1234567891' },
          { fieldId: 'experience', fieldLabel: 'Years of Experience', fieldType: 'number', value: '8' },
          { fieldId: 'skills', fieldLabel: 'Technical Skills', fieldType: 'checkboxes', value: ['JavaScript', 'React', 'Vue.js', 'Python'] },
          { fieldId: 'portfolio', fieldLabel: 'Portfolio URL', fieldType: 'short-text', value: 'https://janesmith.dev' },
          { fieldId: 'motivation', fieldLabel: 'Why do you want to join?', fieldType: 'paragraph', value: 'I have extensive experience in full-stack development and am excited about the opportunity to work on innovative projects.' }
        ],
        attachments: [
          { originalName: 'resume.pdf', filename: 'resume_jane_smith.pdf', size: 312450 },
          { originalName: 'portfolio.pdf', filename: 'portfolio_jane_smith.pdf', size: 1024000 }
        ],
        notes: 'Excellent candidate with strong technical background.',
        rating: 5,
        tags: ['experienced', 'full-stack']
      },
      {
        _id: '3',
        formId: formId || '1',
        userId: 'user_3',
        userEmail: 'mike.johnson@example.com',
        userName: 'Mike Johnson',
        status: 'rejected',
        submittedAt: '2024-01-13T16:45:00Z',
        reviewedAt: '2024-01-15T11:30:00Z',
        reviewedBy: 'admin_1',
        answers: [
          { fieldId: 'name', fieldLabel: 'Full Name', fieldType: 'short-text', value: 'Mike Johnson' },
          { fieldId: 'email', fieldLabel: 'Email', fieldType: 'email', value: 'mike.johnson@example.com' },
          { fieldId: 'phone', fieldLabel: 'Phone', fieldType: 'phone', value: '+1234567892' },
          { fieldId: 'experience', fieldLabel: 'Years of Experience', fieldType: 'number', value: '2' },
          { fieldId: 'skills', fieldLabel: 'Technical Skills', fieldType: 'checkboxes', value: ['HTML', 'CSS'] },
          { fieldId: 'portfolio', fieldLabel: 'Portfolio URL', fieldType: 'short-text', value: '' },
          { fieldId: 'motivation', fieldLabel: 'Why do you want to join?', fieldType: 'paragraph', value: 'I want to learn more about web development.' }
        ],
        attachments: [],
        notes: 'Insufficient experience for the role requirements.',
        rating: 2,
        tags: ['junior', 'needs-experience']
      }
    ];
    
    setFormDetails(sampleForm);
    setResponses(sampleResponses);
    setFilteredResponses(sampleResponses);
    
    // Calculate stats
    const total = sampleResponses.length;
    const pending = sampleResponses.filter(r => r.status === 'pending').length;
    const approved = sampleResponses.filter(r => r.status === 'approved').length;
    const rejected = sampleResponses.filter(r => r.status === 'rejected').length;
    
    setStats({ total, pending, approved, rejected });
  };

  // Filter functionality
  useEffect(() => {
    let filtered = responses;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(response => response.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(response => new Date(response.submittedAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(response => new Date(response.submittedAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(response => new Date(response.submittedAt) >= filterDate);
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(response => 
        response.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.answers.some(answer => 
          answer.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredResponses(filtered);
  }, [responses, statusFilter, dateFilter, searchTerm]);

  // Response management functions
  const viewResponse = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  const updateResponseStatus = async (responseId, newStatus, notes = '') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedResponses = responses.map(response => 
        response._id === responseId 
          ? { 
              ...response, 
              status: newStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current_admin',
              notes: notes || response.notes
            }
          : response
      );
      
      setResponses(updatedResponses);
      
      // Update selected response if it's currently viewed
      if (selectedResponse && selectedResponse._id === responseId) {
        const updatedResponse = updatedResponses.find(r => r._id === responseId);
        setSelectedResponse(updatedResponse);
      }
      
      // Recalculate stats
      const total = updatedResponses.length;
      const pending = updatedResponses.filter(r => r.status === 'pending').length;
      const approved = updatedResponses.filter(r => r.status === 'approved').length;
      const rejected = updatedResponses.filter(r => r.status === 'rejected').length;
      setStats({ total, pending, approved, rejected });
      
    } catch (error) {
      console.error('Error updating response status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateResponseRating = async (responseId, rating) => {
    const updatedResponses = responses.map(response => 
      response._id === responseId ? { ...response, rating } : response
    );
    setResponses(updatedResponses);
    
    if (selectedResponse && selectedResponse._id === responseId) {
      setSelectedResponse({ ...selectedResponse, rating });
    }
  };

  const addResponseTag = async (responseId, tag) => {
    const updatedResponses = responses.map(response => 
      response._id === responseId 
        ? { ...response, tags: [...(response.tags || []), tag] }
        : response
    );
    setResponses(updatedResponses);
    
    if (selectedResponse && selectedResponse._id === responseId) {
      setSelectedResponse({ ...selectedResponse, tags: [...(selectedResponse.tags || []), tag] });
    }
  };

  const removeResponseTag = async (responseId, tagToRemove) => {
    const updatedResponses = responses.map(response => 
      response._id === responseId 
        ? { ...response, tags: (response.tags || []).filter(tag => tag !== tagToRemove) }
        : response
    );
    setResponses(updatedResponses);
    
    if (selectedResponse && selectedResponse._id === responseId) {
      setSelectedResponse({ 
        ...selectedResponse, 
        tags: (selectedResponse.tags || []).filter(tag => tag !== tagToRemove) 
      });
    }
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredResponses.map(response => response._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (responseId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, responseId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== responseId));
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const bulkStatusChange = async (status) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedResponses = responses.map(response => 
        selectedItems.includes(response._id) 
          ? { 
              ...response, 
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current_admin'
            }
          : response
      );
      setResponses(updatedResponses);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error bulk updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const exportResponses = () => {
    const dataToExport = {
      form: formDetails,
      responses: filteredResponses,
      exportedAt: new Date().toISOString(),
      totalCount: filteredResponses.length
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-responses-${formDetails?.title.en.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStarRating = (rating, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!onRatingChange}
          >
            <Star 
              className={`w-4 h-4 ${
                star <= (rating || 0) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/recruitment')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forms
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formId ? 'Form Responses' : 'All Recruitment Responses'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {formId ? `${formDetails?.title.en} - ${stats.total} total responses` : `${stats.total} total responses`}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => loadSampleData()}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <ResponseExport
                responses={responses}
                formFields={formDetails?.fields || []}
                formTitle={formDetails?.title?.en || 'recruitment-form'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Responses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analytics Charts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Response Analytics</h2>
          <ResponseCharts 
            responses={responses} 
            formFields={formDetails?.fields || []} 
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedItems.length} response(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => bulkStatusChange('approved')}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => bulkStatusChange('rejected')}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => bulkStatusChange('pending')}
                    className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
                  >
                    Mark Pending
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responses Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredResponses.length && filteredResponses.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response) => (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(response._id)}
                        onChange={(e) => handleSelectItem(response._id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {response.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(response.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(response.status)}`}>
                          {response.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStarRating(response.rating, (rating) => updateResponseRating(response._id, rating))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{new Date(response.submittedAt).toLocaleDateString()}</div>
                      <div>{new Date(response.submittedAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {response.attachments.length} file(s)
                      </div>
                      {response.attachments.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {formatFileSize(response.attachments.reduce((sum, file) => sum + file.size, 0))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewResponse(response)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateResponseStatus(response._id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                          disabled={response.status === 'approved'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateResponseStatus(response._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                          disabled={response.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredResponses.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No responses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No responses match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Response Detail Modal */}
      {showResponseModal && selectedResponse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Response Details - {selectedResponse.userName}
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedResponse.userName}</h4>
                      <p className="text-sm text-gray-500">{selectedResponse.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Status</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedResponse.status)}`}>
                        {selectedResponse.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Rating</div>
                      {renderStarRating(selectedResponse.rating, (rating) => updateResponseRating(selectedResponse._id, rating))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <div>{new Date(selectedResponse.submittedAt).toLocaleString()}</div>
                  </div>
                  {selectedResponse.reviewedAt && (
                    <div>
                      <span className="text-gray-500">Reviewed:</span>
                      <div>{new Date(selectedResponse.reviewedAt).toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Attachments:</span>
                    <div>{selectedResponse.attachments.length} file(s)</div>
                  </div>
                </div>
              </div>

              {/* Form Answers */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Form Responses</h4>
                <div className="space-y-4">
                  {selectedResponse.answers.map((answer, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {answer.fieldLabel}
                      </div>
                      <div className="text-sm text-gray-900">
                        {Array.isArray(answer.value) ? (
                          <div className="flex flex-wrap gap-2">
                            {answer.value.map((item, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={answer.fieldType === 'paragraph' ? 'whitespace-pre-wrap' : ''}>
                            {answer.value || 'No response'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {selectedResponse.attachments.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Attachments</h4>
                  <div className="space-y-2">
                    {selectedResponse.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.originalName}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedResponse.tags || []).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {tag}
                      <button
                        onClick={() => removeResponseTag(selectedResponse._id, tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const tag = prompt('Enter tag:');
                      if (tag) addResponseTag(selectedResponse._id, tag);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Review Notes</h4>
                <textarea
                  value={selectedResponse.notes}
                  onChange={(e) => {
                    const updatedResponse = { ...selectedResponse, notes: e.target.value };
                    setSelectedResponse(updatedResponse);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add review notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => updateResponseStatus(selectedResponse._id, 'approved', selectedResponse.notes)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  disabled={selectedResponse.status === 'approved'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => updateResponseStatus(selectedResponse._id, 'rejected', selectedResponse.notes)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  disabled={selectedResponse.status === 'rejected'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => updateResponseStatus(selectedResponse._id, 'pending', selectedResponse.notes)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Pending
                </button>
              </div>
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default RecruitmentResponsesPage;