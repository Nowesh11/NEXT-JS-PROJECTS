import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Target,
  Activity,
  Lightbulb,
  UserPlus,
  Settings,
  Send,
  X,
  ChevronDown,
  Save,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building,
  FileDown,
  FileUp
} from 'lucide-react';
import { useRouter } from 'next/router';
import FormBuilder from '../components/recruitment/FormBuilder';

const RecruitmentPage = () => {
  const router = useRouter();
  // State management
  const [activeTab, setActiveTab] = useState('projects');
  const [recruitmentForms, setRecruitmentForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedFormResponses, setSelectedFormResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalForms: 0,
    activeForms: 0,
    totalResponses: 0,
    pendingReviews: 0
  });

  // Form builder state
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    type: 'project',
    linkedId: '',
    role: 'crew',
    fields: [],
    startDate: '',
    endDate: '',
    settings: {
      allowMultipleSubmissions: false,
      maxApplications: null,
      requireAuthentication: true,
      showProgressBar: true,
      confirmationMessage: {
        en: 'Thank you for your application. We will review it and get back to you soon.',
        ta: 'உங்கள் விண்ணப்பத்திற்கு நன்றி. நாங்கள் அதை மதிப்பாய்வு செய்து விரைவில் உங்களைத் தொடர்பு கொள்வோம்.'
      },
      emailNotifications: {
        enabled: true,
        recipients: []
      }
    }
  });

  const fileInputRef = useRef(null);

  // Calculate statistics
  const calculateStats = () => {
    const totalForms = recruitmentForms.length;
    const activeForms = recruitmentForms.filter(form => form.status === 'active').length;
    const draftForms = recruitmentForms.filter(form => form.status === 'draft').length;
    const archivedForms = recruitmentForms.filter(form => form.status === 'archived').length;
    const totalResponses = recruitmentForms.reduce((sum, form) => sum + (form.responseCount || 0), 0);
    const avgResponsesPerForm = totalForms > 0 ? Math.round(totalResponses / totalForms) : 0;
    
    const projectForms = recruitmentForms.filter(form => form.type === 'project').length;
    const activityForms = recruitmentForms.filter(form => form.type === 'activity').length;
    const initiativeForms = recruitmentForms.filter(form => form.type === 'initiative').length;
    
    return {
      totalForms,
      activeForms,
      draftForms,
      archivedForms,
      totalResponses,
      avgResponsesPerForm,
      projectForms,
      activityForms,
      initiativeForms
    };
  };

  const calculatedStats = calculateStats();

  // Sample data for demonstration
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleForms = [
      {
        _id: '1',
        title: { en: 'Web Developer Recruitment', ta: 'வெப் டெவலப்பர் ஆட்சேர்ப்பு' },
        description: { en: 'Looking for skilled web developers', ta: 'திறமையான வெப் டெவலப்பர்களை தேடுகிறோம்' },
        type: 'project',
        linkedId: 'proj_1',
        role: 'crew',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        responseCount: 25,
        createdAt: '2024-01-10',
        settings: { maxApplications: 50 }
      },
      {
        _id: '2',
        title: { en: 'Community Volunteer Program', ta: 'சமூக தன்னார்வ திட்டம்' },
        description: { en: 'Join our community service initiative', ta: 'எங்கள் சமூக சேவை முயற்சியில் சேரவும்' },
        type: 'activity',
        linkedId: 'act_1',
        role: 'volunteer',
        status: 'active',
        startDate: '2024-01-20',
        endDate: '2024-03-20',
        responseCount: 42,
        createdAt: '2024-01-15',
        settings: { maxApplications: 100 }
      },
      {
        _id: '3',
        title: { en: 'Innovation Workshop Participants', ta: 'புதுமை பட்டறை பங்கேற்பாளர்கள்' },
        description: { en: 'Participate in our innovation workshop', ta: 'எங்கள் புதுமை பட்டறையில் பங்கேற்கவும்' },
        type: 'initiative',
        linkedId: 'init_1',
        role: 'participant',
        status: 'draft',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        responseCount: 8,
        createdAt: '2024-01-25',
        settings: { maxApplications: 30 }
      }
    ];
    
    setRecruitmentForms(sampleForms);
    setFilteredForms(sampleForms);
    
    // Calculate stats
    const totalForms = sampleForms.length;
    const activeForms = sampleForms.filter(form => form.status === 'active').length;
    const totalResponses = sampleForms.reduce((sum, form) => sum + form.responseCount, 0);
    const pendingReviews = Math.floor(totalResponses * 0.3); // Simulate pending reviews
    
    setStats({ totalForms, activeForms, totalResponses, pendingReviews });
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = recruitmentForms;

    // Filter by tab (type)
    if (activeTab !== 'all') {
      const typeMap = {
        'projects': 'project',
        'activities': 'activity', 
        'initiatives': 'initiative'
      };
      filtered = filtered.filter(form => form.type === typeMap[activeTab]);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter);
    }

    // Filter by role type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(form => form.role === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.title.ta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredForms(filtered);
  }, [recruitmentForms, activeTab, statusFilter, typeFilter, searchTerm]);

  // Form management functions
  const openFormBuilder = (form = null) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };



  const saveForm = async (formData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingForm) {
        // Update existing form
        const updatedForms = recruitmentForms.map(form => 
          form._id === editingForm._id 
            ? { ...form, ...formData, updatedAt: new Date().toISOString() }
            : form
        );
        setRecruitmentForms(updatedForms);
        alert('Form updated successfully!');
      } else {
        // Create new form
        const newForm = {
          _id: Date.now().toString(),
          ...formData,
          status: 'draft',
          responseCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRecruitmentForms([...recruitmentForms, newForm]);
        alert('Form created successfully!');
      }
      
      setShowFormBuilder(false);
      setEditingForm(null);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this recruitment form?')) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedForms = recruitmentForms.filter(form => form._id !== formId);
        setRecruitmentForms(updatedForms);
      } catch (error) {
        console.error('Error deleting form:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleFormStatus = async (formId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedForms = recruitmentForms.map(form => 
        form._id === formId 
          ? { ...form, status: form.status === 'active' ? 'paused' : 'active' }
          : form
      );
      setRecruitmentForms(updatedForms);
    } catch (error) {
      console.error('Error updating form status:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewResponses = (form) => {
    setSelectedFormResponses(form);
    setShowResponseModal(true);
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredForms.map(form => form._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (formId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, formId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== formId));
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const bulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} recruitment forms?`)) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedForms = recruitmentForms.filter(form => !selectedItems.includes(form._id));
        setRecruitmentForms(updatedForms);
        setSelectedItems([]);
      } catch (error) {
        console.error('Error bulk deleting forms:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const bulkStatusChange = async (status) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedForms = recruitmentForms.map(form => 
        selectedItems.includes(form._id) ? { ...form, status } : form
      );
      setRecruitmentForms(updatedForms);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error bulk updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const exportData = (format) => {
    try {
      const dataToExport = {
        forms: filteredForms,
        exportDate: new Date().toISOString(),
        totalForms: filteredForms.length,
        statistics: calculatedStats
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recruitment-forms-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvHeaders = [
          'ID', 'Title (EN)', 'Title (TA)', 'Type', 'Status', 'Role', 
          'Response Count', 'Created Date', 'Start Date', 'End Date'
        ];
        
        const csvRows = filteredForms.map(form => [
          form._id,
          form.title?.en || '',
          form.title?.ta || '',
          form.type,
          form.status,
          form.role,
          form.responseCount || 0,
          new Date(form.createdAt).toLocaleDateString(),
          form.startDate || '',
          form.endDate || ''
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recruitment-forms-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setShowExportModal(false);
      alert(`Data exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Import functionality
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let importedData;

        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          importedData = JSON.parse(content);
          
          if (importedData.forms && Array.isArray(importedData.forms)) {
            const newForms = importedData.forms.map(form => ({
              ...form,
              _id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              responseCount: 0
            }));
            
            setRecruitmentForms([...recruitmentForms, ...newForms]);
            alert(`Successfully imported ${newForms.length} forms!`);
          } else {
            alert('Invalid JSON format. Please ensure the file contains a "forms" array.');
          }
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          
          const newForms = lines.slice(1)
            .filter(line => line.trim())
            .map((line, index) => {
              const values = line.split(',').map(v => v.replace(/"/g, ''));
              return {
                _id: `imported_csv_${Date.now()}_${index}`,
                title: {
                  en: values[1] || '',
                  ta: values[2] || ''
                },
                type: values[3] || 'project',
                status: values[4] || 'draft',
                role: values[5] || 'crew',
                responseCount: 0,
                createdAt: new Date().toISOString(),
                description: { en: '', ta: '' },
                fields: [],
                settings: {
                  allowMultipleSubmissions: false,
                  maxApplications: null,
                  requireAuthentication: true,
                  showProgressBar: true,
                  confirmationMessage: {
                    en: 'Thank you for your application.',
                    ta: 'உங்கள் விண்ணப்பத்திற்கு நன்றி.'
                  },
                  emailNotifications: { enabled: true, recipients: [] }
                }
              };
            });
          
          setRecruitmentForms([...recruitmentForms, ...newForms]);
          alert(`Successfully imported ${newForms.length} forms from CSV!`);
        } else {
          alert('Unsupported file format. Please use JSON or CSV files.');
        }
        
        setShowImportModal(false);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format and try again.');
      }
    };
    
    reader.readAsText(file);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadSampleData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'crew': return <Users className="w-4 h-4" />;
      case 'volunteer': return <UserPlus className="w-4 h-4" />;
      case 'participant': return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'project': return <FileText className="w-4 h-4" />;
      case 'activity': return <Activity className="w-4 h-4" />;
      case 'initiative': return <Lightbulb className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
              <p className="text-gray-600 mt-1">Manage recruitment forms for projects, activities, and initiatives</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Forms
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {calculatedStats.totalForms}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">{calculatedStats.activeForms} Active</span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="text-yellow-600 font-medium">{calculatedStats.draftForms} Draft</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Responses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {calculatedStats.totalResponses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-blue-600 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {calculatedStats.avgResponsesPerForm} avg per form
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Project Forms
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {calculatedStats.projectForms}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {calculatedStats.totalForms > 0 ? Math.round((calculatedStats.projectForms / calculatedStats.totalForms) * 100) : 0}% of total
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Activity & Initiative
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {calculatedStats.activityForms + calculatedStats.initiativeForms}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-purple-600 font-medium">{calculatedStats.activityForms} Activities</span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="text-indigo-600 font-medium">{calculatedStats.initiativeForms} Initiatives</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'projects', label: 'Projects', icon: FileText },
                { key: 'activities', label: 'Activities', icon: Activity },
                { key: 'initiatives', label: 'Initiatives', icon: Lightbulb }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters and Actions */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search forms..."
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                  <option value="closed">Closed</option>
                </select>

                {/* Role Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="crew">Crew</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="participant">Participant</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => router.push('/recruitment-responses')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Responses
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
                <button
                  onClick={() => openFormBuilder()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Form
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedItems.length} item(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => bulkStatusChange('active')}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => bulkStatusChange('paused')}
                      className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200"
                    >
                      Pause
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forms Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredForms.length && filteredForms.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map((form) => (
                  <tr key={form._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(form._id)}
                        onChange={(e) => handleSelectItem(form._id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {form.title.en}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {form.description.en}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {form.linkedId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(form.type)}
                        <span className="text-sm text-gray-900 capitalize">{form.type}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(form.role)}
                        <span className="text-sm text-gray-500 capitalize">{form.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {form.responseCount} responses
                      </div>
                      <div className="text-xs text-gray-500">
                        {form.settings.maxApplications ? `/ ${form.settings.maxApplications} max` : 'No limit'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Start: {new Date(form.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(form.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/recruitment-responses?formId=${form._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Responses"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openFormBuilder(form)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Form"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFormStatus(form._id)}
                          className={`${form.status === 'active' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                          title={form.status === 'active' ? 'Pause Form' : 'Activate Form'}
                        >
                          {form.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteForm(form._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Form"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredForms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recruitment forms</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new recruitment form.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => openFormBuilder()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Builder Modal */}
      <FormBuilder
        isOpen={showFormBuilder}
        onClose={() => {
          setShowFormBuilder(false);
          setEditingForm(null);
        }}
        onSave={saveForm}
        initialData={editingForm}
        linkedId=""
        linkedType={activeTab === 'projects' ? 'project' : activeTab === 'activities' ? 'activity' : 'initiative'}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Export Recruitment Data
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose the format to export your recruitment forms data:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => exportData('json')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export as JSON
                </button>
                
                <button
                  onClick={() => exportData('csv')}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export as CSV
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-4">
                <p>• JSON format includes all form data and settings</p>
                <p>• CSV format includes basic form information</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Import Recruitment Data
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a JSON or CSV file to import recruitment forms:
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Click to upload file
                  </span>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JSON and CSV files
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>• JSON files should contain a "forms" array</p>
                <p>• CSV files should have headers in the first row</p>
                <p>• Imported forms will be added to existing data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal - Basic structure */}
      {showResponseModal && selectedFormResponses && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Responses for: {selectedFormResponses.title.en}
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {selectedFormResponses.responseCount} Responses
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Response management functionality will be implemented in the next phase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPage;