import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';

const ProjectsManagement = () => {
  const [activeType, setActiveType] = useState('projects');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bureauFilter, setBureauFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'project',
    title: { en: '', ta: '' },
    bureau: '',
    status: 'draft',
    director: { en: '', ta: '' },
    teamSize: 1,
    progress: 0,
    description: { en: '', ta: '' },
    goals: { en: '', ta: '' },
    achievements: { en: '', ta: '' },
    featured: false,
    acceptingVolunteers: true,
    images: []
  });

  const bureauOptions = [
    { value: 'media-public-relations', label: 'Media & Public Relations' },
    { value: 'sports-leadership', label: 'Sports & Leadership' },
    { value: 'education-intellectual', label: 'Education & Intellectual' },
    { value: 'arts-culture', label: 'Arts & Culture' },
    { value: 'social-welfare-voluntary', label: 'Social Welfare & Voluntary' },
    { value: 'language-literature', label: 'Language & Literature' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' }
  ];

  const typeOptions = [
    { value: 'projects', label: 'Projects', icon: '🚀' },
    { value: 'activities', label: 'Activities', icon: '⚡' },
    { value: 'initiatives', label: 'Initiatives', icon: '💡' }
  ];

  // Mock data
  const mockData = {
    projects: [
      {
        id: 1,
        type: 'project',
        title: { en: 'Digital Learning Platform', ta: 'டிஜிட்டல் கற்றல் தளம்' },
        bureau: 'education-intellectual',
        status: 'active',
        director: { en: 'Dr. Sarah Johnson', ta: 'டாக்டர் சாரா ஜான்சன்' },
        teamSize: 12,
        progress: 75,
        description: { en: 'A comprehensive digital learning platform for students', ta: 'மாணவர்களுக்கான விரிவான டிஜிட்டல் கற்றல் தளம்' },
        goals: { en: 'Improve digital literacy', ta: 'டிஜிட்டல் கல்வியறிவை மேம்படுத்துதல்' },
        achievements: { en: 'Launched beta version', ta: 'பீட்டா பதிப்பு வெளியிடப்பட்டது' },
        featured: true,
        acceptingVolunteers: true,
        images: [],
        createdAt: '2024-01-15'
      }
    ],
    activities: [
      {
        id: 2,
        type: 'activity',
        title: { en: 'Community Sports Day', ta: 'சமூக விளையாட்டு நாள்' },
        bureau: 'sports-leadership',
        status: 'active',
        director: { en: 'Mike Chen', ta: 'மைக் சென்' },
        teamSize: 8,
        progress: 50,
        description: { en: 'Annual community sports event', ta: 'வருடாந்திர சமூக விளையாட்டு நிகழ்வு' },
        goals: { en: 'Promote physical fitness', ta: 'உடல் ஆரோக்கியத்தை ஊக்குவித்தல்' },
        achievements: { en: 'Registered 200+ participants', ta: '200+ பங்கேற்பாளர்கள் பதிவு செய்யப்பட்டுள்ளனர்' },
        featured: false,
        acceptingVolunteers: true,
        images: [],
        createdAt: '2024-02-01'
      }
    ],
    initiatives: [
      {
        id: 3,
        type: 'initiative',
        title: { en: 'Green Campus Initiative', ta: 'பசுமை வளாக முன்முயற்சி' },
        bureau: 'social-welfare-voluntary',
        status: 'draft',
        director: { en: 'Emma Wilson', ta: 'எம்மா வில்சன்' },
        teamSize: 15,
        progress: 25,
        description: { en: 'Environmental sustainability initiative', ta: 'சுற்றுச்சூழல் நிலைத்தன்மை முன்முயற்சி' },
        goals: { en: 'Reduce carbon footprint', ta: 'கார்பன் தடம் குறைத்தல்' },
        achievements: { en: 'Planted 100 trees', ta: '100 மரங்கள் நடப்பட்டன' },
        featured: true,
        acceptingVolunteers: true,
        images: [],
        createdAt: '2024-01-20'
      }
    ]
  };

  useEffect(() => {
    loadItems();
  }, [activeType]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter, bureauFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = mockData[activeType] || [];
      setItems(data);
      toast.success(`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} loaded successfully`);
    } catch (error) {
      toast.error(`Failed to load ${activeType}`);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.ta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.director.en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (bureauFilter !== 'all') {
      filtered = filtered.filter(item => item.bureau === bureauFilter);
    }

    setFilteredItems(filtered);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setSearchTerm('');
    setStatusFilter('all');
    setBureauFilter('all');
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        type: activeType.slice(0, -1), // Remove 's' from plural
        title: { en: '', ta: '' },
        bureau: '',
        status: 'draft',
        director: { en: '', ta: '' },
        teamSize: 1,
        progress: 0,
        description: { en: '', ta: '' },
        goals: { en: '', ta: '' },
        achievements: { en: '', ta: '' },
        featured: false,
        acceptingVolunteers: true,
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.en.trim()) {
      errors.titleEn = 'English title is required';
    }
    
    if (!formData.bureau) {
      errors.bureau = 'Bureau selection is required';
    }
    
    if (!formData.director.en.trim()) {
      errors.directorEn = 'English director name is required';
    }
    
    if (!formData.director.ta.trim()) {
      errors.directorTa = 'Tamil director name is required';
    }
    
    if (!formData.description.en.trim()) {
      errors.descriptionEn = 'English description is required';
    }
    
    if (formData.progress < 0 || formData.progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }
    
    if (formData.teamSize < 1) {
      errors.teamSize = 'Team size must be at least 1';
    }
    
    if (formData.images.length > 10) {
      errors.images = 'Maximum 10 images allowed';
    }
    
    const oversizedImages = formData.images.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedImages.length > 0) {
      errors.images = 'Each image must be less than 5MB';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }
    
    setSubmitLoading(true);

    try {
      // Handle image uploads
      let uploadedImageUrls = [];
      if (formData.images.length > 0) {
        toast.info('Uploading images...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        uploadedImageUrls = formData.images.map(file => URL.createObjectURL(file));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const itemData = {
        ...formData,
        images: uploadedImageUrls,
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      if (editingItem) {
        // Update existing item
        const updatedItems = items.map(item => 
          item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
        );
        setItems(updatedItems);
        toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} updated successfully`);
      } else {
        // Create new item
        const newItem = {
          ...itemData,
          id: Date.now()
        };
        setItems([...items, newItem]);
        toast.success(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created successfully`);
      }
      
      closeModal();
    } catch (error) {
      toast.error('Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setDeleteLoading(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const headers = ['ID', 'Title (EN)', 'Title (TA)', 'Bureau', 'Status', 'Director (EN)', 'Team Size', 'Progress', 'Created Date'];
      const csvData = filteredItems.map(item => [
        item.id,
        item.title.en,
        item.title.ta,
        item.bureau,
        item.status,
        item.director.en,
        item.teamSize,
        `${item.progress}%`,
        item.createdAt
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeType}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Projects Management
            </h1>
            <p className="text-slate-300">
              Manage projects, activities, and initiatives in one unified interface
            </p>
          </motion.div>

          {/* Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeType === type.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            <div className="glass-morphism p-4 sm:p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-slate-300 text-sm sm:text-base">Total {activeType.charAt(0).toUpperCase() + activeType.slice(1)}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{items.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg sm:text-xl">{typeOptions.find(t => t.value === activeType)?.icon}</span>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-4 sm:p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-slate-300 text-sm sm:text-base">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {items.filter(item => item.status === 'active').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-lg sm:text-xl">✅</span>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-4 sm:p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-slate-300 text-sm sm:text-base">Draft</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                    {items.filter(item => item.status === 'draft').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 text-lg sm:text-xl">📝</span>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-4 sm:p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-slate-300 text-sm sm:text-base">Featured</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">
                    {items.filter(item => item.featured).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 text-lg sm:text-xl">⭐</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism p-4 sm:p-6 rounded-xl mb-6"
          >
            <div className="space-y-4">
              {/* Search Bar - Full Width on Mobile */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
                <svg className="absolute left-3 top-3.5 sm:top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filters and Actions - Responsive Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value} className="bg-slate-800">
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={bureauFilter}
                  onChange={(e) => setBureauFilter(e.target.value)}
                  className="px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="all" className="bg-slate-800">All Bureaus</option>
                  {bureauOptions.map(bureau => (
                    <option key={bureau.value} value={bureau.value} className="bg-slate-800">
                      {bureau.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={exportToCSV}
                  disabled={filteredItems.length === 0 || exportLoading}
                  className="px-4 py-2.5 sm:py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-base sm:text-sm font-medium touch-manipulation"
                >
                  {exportLoading ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <span className="hidden xs:inline">{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
                  <span className="xs:hidden">{exportLoading ? 'Exporting...' : 'Export'}</span>
                </button>

                <button
                  onClick={() => openModal()}
                  className="px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-base sm:text-sm font-medium touch-manipulation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden xs:inline">Add New</span>
                  <span className="xs:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Stats and Refresh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-slate-300">
                Showing <span className="font-medium text-white">{filteredItems.length}</span> of <span className="font-medium text-white">{items.length}</span> {activeType}
              </span>
              <button
                onClick={loadItems}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors duration-200 touch-manipulation"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-white">Loading {activeType}...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-white mb-2">No {activeType} found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm || statusFilter !== 'all' || bureauFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : `Start by creating your first ${activeType.slice(0, -1)}`
                  }
                </p>
                <button
                  onClick={() => openModal()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Add New {activeType.slice(0, -1).charAt(0).toUpperCase() + activeType.slice(1, -1)}
                </button>
              </div>
            ) : (
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Bureau
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Team Size
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Director
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <AnimatePresence>
                      {filteredItems.map((item, index) => {
                        const statusOption = statusOptions.find(s => s.value === item.status);
                        const bureauOption = bureauOptions.find(b => b.value === item.bureau);
                        
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-white/5 transition-colors duration-200"
                          >
                            <td className="px-4 xl:px-6 py-4">
                              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                                {item.images && item.images.length > 0 ? (
                                  <img src={item.images[0]} alt={item.title.en} className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="max-w-xs">
                                <div className="text-sm font-medium text-white truncate" title={item.title.en}>
                                  {item.title.en}
                                  {item.featured && <span className="ml-2 text-yellow-400">⭐</span>}
                                </div>
                                {item.title.ta && (
                                  <div className="text-sm text-slate-400 truncate" 
                                       style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                                       title={item.title.ta}>
                                    {item.title.ta}
                                  </div>
                                )}
                                {item.acceptingVolunteers && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    🤝 Volunteers Welcome
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.type === 'project' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'activity' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="max-w-24 truncate" title={bureauOption?.label || item.bureau}>
                                <span className="text-sm text-slate-300">
                                  {bureauOption?.label || item.bureau}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusOption?.color || 'bg-gray-100 text-gray-800'
                              }`}>
                                {statusOption?.label || item.status}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <span className="text-sm text-slate-300">
                                  {item.teamSize}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-2 min-w-16">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      item.progress >= 80 ? 'bg-green-500' :
                                      item.progress >= 50 ? 'bg-blue-500' :
                                      item.progress >= 25 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400 w-10 text-right">
                                  {item.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="max-w-24">
                                <div className="text-sm text-slate-300 truncate" title={item.director.en}>
                                  {item.director.en}
                                </div>
                                {item.director.ta && (
                                  <div className="text-xs text-slate-400 truncate" 
                                       style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                                       title={item.director.ta}>
                                    {item.director.ta}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="text-xs text-slate-300">
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openModal(item)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-1.5 rounded-lg transition-all duration-200"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete this ${item.type}?`)) {
                                      handleDelete(item.id);
                                    }
                                  }}
                                  disabled={deleteLoading === item.id}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                >
                                  {deleteLoading === item.id ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedItems = items.map(i => 
                                      i.id === item.id ? { ...i, featured: !i.featured } : i
                                    );
                                    setItems(updatedItems);
                                    toast.success(`${item.type} ${item.featured ? 'removed from' : 'added to'} featured`);
                                  }}
                                  className={`${item.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'} hover:bg-yellow-400/10 p-1.5 rounded-lg transition-all duration-200`}
                                  title={item.featured ? 'Remove from Featured' : 'Add to Featured'}
                                >
                                  <svg className="w-4 h-4" fill={item.featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                
                {/* Pagination */}
                {filteredItems.length > 0 && (
                  <div className="bg-white/5 px-4 xl:px-6 py-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="text-sm text-slate-400">
                        Showing {filteredItems.length} of {items.length} {activeType}
                      </div>
                      <div className="text-sm text-slate-400">
                        {filteredItems.filter(item => item.status === 'active').length} Active • 
                        {filteredItems.filter(item => item.status === 'draft').length} Draft • 
                        {filteredItems.filter(item => item.featured).length} Featured
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                <AnimatePresence>
                  {filteredItems.map((item, index) => {
                    const statusOption = statusOptions.find(s => s.value === item.status);
                    const bureauOption = bureauOptions.find(b => b.value === item.bureau);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Image */}
                          <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0]} alt={item.title.en} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Type */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-medium text-white truncate" title={item.title.en}>
                                  {item.title.en}
                                  {item.featured && <span className="ml-2 text-yellow-400">⭐</span>}
                                </h3>
                                {item.title.ta && (
                                  <p className="text-sm text-slate-400 truncate mt-1" 
                                     style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                                     title={item.title.ta}>
                                    {item.title.ta}
                                  </p>
                                )}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                                item.type === 'project' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'activity' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                            </div>

                            {/* Status and Bureau */}
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusOption?.color || 'bg-gray-100 text-gray-800'
                              }`}>
                                {statusOption?.label || item.status}
                              </span>
                              <span className="text-sm text-slate-300">
                                {bureauOption?.label || item.bureau}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">Progress</span>
                                <span className="text-xs text-slate-400">{item.progress}%</span>
                              </div>
                              <div className="bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    item.progress >= 80 ? 'bg-green-500' :
                                    item.progress >= 50 ? 'bg-blue-500' :
                                    item.progress >= 25 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Director and Team Size */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm text-slate-300 truncate" title={item.director.en}>
                                  {item.director.en}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <span className="text-sm text-slate-300">{item.teamSize}</span>
                              </div>
                            </div>

                            {/* Date and Actions */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openModal(item)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-lg transition-all duration-200 touch-manipulation"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete this ${item.type}?`)) {
                                      handleDelete(item.id);
                                    }
                                  }}
                                  disabled={deleteLoading === item.id}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                >
                                  {deleteLoading === item.id ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedItems = items.map(i => 
                                      i.id === item.id ? { ...i, featured: !i.featured } : i
                                    );
                                    setItems(updatedItems);
                                    toast.success(`${item.type} ${item.featured ? 'removed from' : 'added to'} featured`);
                                  }}
                                  className={`${item.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'} hover:bg-yellow-400/10 p-2 rounded-lg transition-all duration-200 touch-manipulation`}
                                  title={item.featured ? 'Remove from Featured' : 'Add to Featured'}
                                >
                                  <svg className="w-4 h-4" fill={item.featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Volunteers Badge */}
                            {item.acceptingVolunteers && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  🤝 Volunteers Welcome
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Unified CRUD Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Edit' : 'Add New'} {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Field (Hidden but used for logic) */}
                <input type="hidden" name="type" value={formData.type} />
                
                {/* Title Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.title.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title (Tamil)
                    </label>
                    <input
                      type="text"
                      value={formData.title.ta}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, ta: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Bureau and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bureau *
                    </label>
                    <select
                      value={formData.bureau}
                      onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Bureau</option>
                      {bureauOptions.map(bureau => (
                        <option key={bureau.value} value={bureau.value} className="bg-slate-800">
                          {bureau.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value} className="bg-slate-800">
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Director Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Director (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.director.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        director: { ...formData.director, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Director name in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Director (Tamil) *
                    </label>
                    <input
                      type="text"
                      value={formData.director.ta}
                      onChange={(e) => setFormData({
                        ...formData,
                        director: { ...formData.director, ta: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Director name in Tamil"
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                {/* Team Size and Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      placeholder="0-100"
                    />
                  </div>
                </div>

                {/* Description Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (English) *
                    </label>
                    <textarea
                      value={formData.description.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Tamil)
                    </label>
                    <textarea
                      value={formData.description.ta}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, ta: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Images
                    <span className="text-slate-500 text-xs ml-2">(Max 10 images, 5MB each)</span>
                  </label>
                  
                  {/* Drag and Drop Area */}
                  <div 
                    className="relative border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/30 transition-colors duration-200"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
                      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                      if (files.length > 0) {
                        const newImages = [...formData.images, ...files].slice(0, 10);
                        setFormData({ ...formData, images: newImages });
                        if (files.length + formData.images.length > 10) {
                          toast.warning('Only first 10 images were added (maximum limit)');
                        }
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          // Check file sizes
                          const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
                          if (oversizedFiles.length > 0) {
                            toast.error(`${oversizedFiles.length} file(s) exceed 5MB limit and were skipped`);
                          }
                          
                          const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
                          const newImages = [...formData.images, ...validFiles].slice(0, 10);
                          setFormData({ ...formData, images: newImages });
                          
                          if (validFiles.length + formData.images.length > 10) {
                            toast.warning('Only first 10 images were added (maximum limit)');
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-slate-300">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, WebP, GIF up to 5MB each
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300">
                          {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: [] })}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Primary Image Badge */}
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Primary
                              </div>
                            )}
                            
                            {/* File Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                              <div className="truncate" title={file.name}>{file.name}</div>
                              <div className="text-slate-300">{(file.size / 1024 / 1024).toFixed(1)}MB</div>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImages });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                            
                            {/* Move to Primary Button */}
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = [...formData.images];
                                  const [movedImage] = newImages.splice(index, 1);
                                  newImages.unshift(movedImage);
                                  setFormData({ ...formData, images: newImages });
                                  toast.success('Image set as primary');
                                }}
                                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                title="Set as primary image"
                              >
                                ⭐
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Goals & Objectives */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Goals & Objectives (English)
                    </label>
                    <textarea
                      value={formData.goals.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        goals: { ...formData.goals, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder={`What are the main goals of this ${formData.type}?`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Goals & Objectives (Tamil)
                    </label>
                    <textarea
                      value={formData.goals.ta}
                      onChange={(e) => setFormData({
                        ...formData,
                        goals: { ...formData.goals, ta: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder={formData.type === 'project' ? 'இந்த திட்டத்தின் முக்கிய இலக்குகள் என்ன?' : 
                                 formData.type === 'activity' ? 'இந்த செயல்பாட்டின் முக்கிய இலக்குகள் என்ன?' : 
                                 'இந்த முன்முயற்சியின் முக்கிய இலக்குகள் என்ன?'}
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Key Achievements */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Key Achievements (English)
                    </label>
                    <textarea
                      value={formData.achievements.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        achievements: { ...formData.achievements, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="List key achievements or milestones"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Key Achievements (Tamil)
                    </label>
                    <textarea
                      value={formData.achievements.ta}
                      onChange={(e) => setFormData({
                        ...formData,
                        achievements: { ...formData.achievements, ta: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="முக்கிய சாதனைகள் அல்லது மைல்கற்களை பட்டியலிடுங்கள்"
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="featured" className="text-sm text-slate-300">
                      Featured {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="acceptingVolunteers"
                      checked={formData.acceptingVolunteers}
                      onChange={(e) => setFormData({ ...formData, acceptingVolunteers: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="acceptingVolunteers" className="text-sm text-slate-300">
                      Accepting Volunteers
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    {submitLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{submitLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectsManagement;