import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaSearch, FaFilter, FaImage, FaCalendar, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PostersManagement = () => {
  const router = useRouter();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [postersPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [stats, setStats] = useState({
    totalPosters: 0,
    activePosters: 0,
    totalViews: 0,
    totalClicks: 0
  });

  // Form state for Add/Edit modals
  const [formData, setFormData] = useState({
    title: { en: '', ta: '' },
    description: { en: '', ta: '' },
    image_path: '',
    imageAlt: '',
    buttonText: { en: '', ta: '' },
    link_url: '',
    is_active: true,
    start_at: '',
    end_at: '',
    priority: 1,
    seoTitle: '',
    seoDescription: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Load posters data
  const loadPosters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosters(data.data || []);
      } else {
        toast.error('Failed to load posters');
      }
    } catch (error) {
      console.error('Error loading posters:', error);
      toast.error('Error loading posters');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posters/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadPosters();
    loadStats();
  }, []);

  // Filter posters based on search and filters
  const filteredPosters = posters.filter(poster => {
    const matchesSearch = 
      poster.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.title?.ta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.description?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.description?.ta?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && poster.is_active) ||
      (statusFilter === 'inactive' && !poster.is_active);
    
    const matchesPriority = priorityFilter === 'all' || 
      poster.priority.toString() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const indexOfLastPoster = currentPage * postersPerPage;
  const indexOfFirstPoster = indexOfLastPoster - postersPerPage;
  const currentPosters = filteredPosters.slice(indexOfFirstPoster, indexOfLastPoster);
  const totalPages = Math.ceil(filteredPosters.length / postersPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: { en: '', ta: '' },
      description: { en: '', ta: '' },
      image_path: '',
      imageAlt: '',
      buttonText: { en: '', ta: '' },
      link_url: '',
      is_active: true,
      start_at: '',
      end_at: '',
      priority: 1,
      seoTitle: '',
      seoDescription: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  // Handle add poster
  const handleAddPoster = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Handle edit poster
  const handleEditPoster = (poster) => {
    setSelectedPoster(poster);
    setFormData({
      title: poster.title || { en: '', ta: '' },
      description: poster.description || { en: '', ta: '' },
      image_path: poster.image_path || '',
      imageAlt: poster.imageAlt || '',
      buttonText: poster.buttonText || { en: '', ta: '' },
      link_url: poster.link_url || '',
      is_active: poster.is_active,
      start_at: poster.start_at ? new Date(poster.start_at).toISOString().slice(0, 16) : '',
      end_at: poster.end_at ? new Date(poster.end_at).toISOString().slice(0, 16) : '',
      priority: poster.priority || 1,
      seoTitle: poster.seoTitle || '',
      seoDescription: poster.seoDescription || ''
    });
    setImagePreview(poster.image_path ? `/uploads/posters/${poster._id}/poster.png` : '');
    setShowEditModal(true);
  };

  // Handle view poster
  const handleViewPoster = (poster) => {
    setSelectedPoster(poster);
    setShowViewModal(true);
  };

  // Handle save poster (create/update)
  const handleSavePoster = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
          Object.keys(formData[key]).forEach(subKey => {
            formDataToSend.append(`${key}.${subKey}`, formData[key][subKey]);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const url = selectedPoster ? `/api/posters/${selectedPoster._id}` : '/api/posters';
      const method = selectedPoster ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        toast.success(`Poster ${selectedPoster ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        loadPosters();
        loadStats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save poster');
      }
    } catch (error) {
      console.error('Error saving poster:', error);
      toast.error('Error saving poster');
    }
  };

  // Handle delete poster
  const handleDeletePoster = async (posterId) => {
    if (!confirm('Are you sure you want to delete this poster?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posters/${posterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Poster deleted successfully');
        loadPosters();
        loadStats();
      } else {
        toast.error('Failed to delete poster');
      }
    } catch (error) {
      console.error('Error deleting poster:', error);
      toast.error('Error deleting poster');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (posterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posters/${posterId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Poster status updated successfully');
        loadPosters();
        loadStats();
      } else {
        toast.error('Failed to update poster status');
      }
    } catch (error) {
      console.error('Error updating poster status:', error);
      toast.error('Error updating poster status');
    }
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posters/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'posters.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Posters exported successfully');
      } else {
        toast.error('Failed to export posters');
      }
    } catch (error) {
      console.error('Error exporting posters:', error);
      toast.error('Error exporting posters');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Posters Management - Admin Dashboard</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Posters Management</h1>
            <p className="text-gray-600 mt-2">Manage website posters and banners</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleAddPoster}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add New Poster</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosters}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaImage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Posters</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePosters}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaEye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartLine className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalClicks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaChartLine className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {[1,2,3,4,5,6,7,8,9,10].map(priority => (
                <option key={priority} value={priority}>Priority {priority}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">
                {filteredPosters.length} of {posters.length} posters
              </span>
            </div>
          </div>
        </div>

        {/* Posters Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPosters.map((poster) => (
                      <tr key={poster._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {poster.image_path ? (
                              <img
                                src={`/uploads/posters/${poster._id}/poster.png`}
                                alt={poster.imageAlt || 'Poster'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/images/placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaImage className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {poster.title?.en || 'No title'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {poster.description?.en || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            poster.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {poster.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {poster.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {poster.viewCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {poster.clickCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(poster.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewPoster(poster)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPoster(poster)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit Poster"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(poster._id)}
                              className={`p-1 ${
                                poster.is_active 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={poster.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePoster(poster._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Poster"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstPoster + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastPoster, filteredPosters.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredPosters.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Poster Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Poster</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSavePoster} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      name="title.en"
                      value={formData.title.en}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (Tamil)</label>
                    <input
                      type="text"
                      name="title.ta"
                      value={formData.title.ta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                    <textarea
                      name="description.en"
                      value={formData.description.en}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Tamil)</label>
                    <textarea
                      name="description.ta"
                      value={formData.description.ta}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                
                {/* Image Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                  <input
                    type="text"
                    name="imageAlt"
                    value={formData.imageAlt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Button Text and URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (English)</label>
                    <input
                      type="text"
                      name="buttonText.en"
                      value={formData.buttonText.en}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (Tamil)</label>
                    <input
                      type="text"
                      name="buttonText.ta"
                      value={formData.buttonText.ta}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button URL</label>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(priority => (
                        <option key={priority} value={priority}>Priority {priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      name="start_at"
                      value={formData.start_at}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      name="end_at"
                      value={formData.end_at}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Poster
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Poster Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Poster</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSavePoster} className="space-y-6">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      name="title.en"
                      value={formData.title.en}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (Tamil)</label>
                    <input
                      type="text"
                      name="title.ta"
                      value={formData.title.ta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                    <textarea
                      name="description.en"
                      value={formData.description.en}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Tamil)</label>
                    <textarea
                      name="description.ta"
                      value={formData.description.ta}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                
                {/* Image Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                  <input
                    type="text"
                    name="imageAlt"
                    value={formData.imageAlt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Button Text and URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (English)</label>
                    <input
                      type="text"
                      name="buttonText.en"
                      value={formData.buttonText.en}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text (Tamil)</label>
                    <input
                      type="text"
                      name="buttonText.ta"
                      value={formData.buttonText.ta}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button URL</label>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(priority => (
                        <option key={priority} value={priority}>Priority {priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      name="start_at"
                      value={formData.start_at}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      name="end_at"
                      value={formData.end_at}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Update Poster
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Poster Modal */}
      {showViewModal && selectedPoster && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Poster Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Image */}
                {selectedPoster.image_path && (
                  <div className="text-center">
                    <img
                      src={`/uploads/posters/${selectedPoster._id}/poster.png`}
                      alt={selectedPoster.imageAlt || 'Poster'}
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                )}
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Title (English)</h4>
                    <p className="text-gray-600">{selectedPoster.title?.en || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Title (Tamil)</h4>
                    <p className="text-gray-600">{selectedPoster.title?.ta || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Description (English)</h4>
                    <p className="text-gray-600">{selectedPoster.description?.en || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Description (Tamil)</h4>
                    <p className="text-gray-600">{selectedPoster.description?.ta || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Action Button */}
                {(selectedPoster.buttonText?.en || selectedPoster.buttonText?.ta) && (
                  <div>
                    <h4 className="font-medium text-gray-900">Action Button</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-gray-500">Text (EN):</span>
                        <p className="text-gray-600">{selectedPoster.buttonText?.en || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Text (TA):</span>
                        <p className="text-gray-600">{selectedPoster.buttonText?.ta || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedPoster.link_url && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">URL:</span>
                        <p className="text-blue-600 break-all">{selectedPoster.link_url}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Status & Analytics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedPoster.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPoster.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Priority</h4>
                    <p className="text-gray-600">{selectedPoster.priority}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Views</h4>
                    <p className="text-gray-600">{selectedPoster.viewCount || 0}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Clicks</h4>
                    <p className="text-gray-600">{selectedPoster.clickCount || 0}</p>
                  </div>
                </div>
                
                {/* SEO */}
                {(selectedPoster.seoTitle || selectedPoster.seoDescription) && (
                  <div>
                    <h4 className="font-medium text-gray-900">SEO Information</h4>
                    <div className="mt-2 space-y-2">
                      {selectedPoster.seoTitle && (
                        <div>
                          <span className="text-sm text-gray-500">Title:</span>
                          <p className="text-gray-600">{selectedPoster.seoTitle}</p>
                        </div>
                      )}
                      {selectedPoster.seoDescription && (
                        <div>
                          <span className="text-sm text-gray-500">Description:</span>
                          <p className="text-gray-600">{selectedPoster.seoDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Created</h4>
                    <p className="text-gray-600">{new Date(selectedPoster.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Updated</h4>
                    <p className="text-gray-600">{new Date(selectedPoster.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Scheduling */}
                {(selectedPoster.start_at || selectedPoster.end_at) && (
                  <div>
                    <h4 className="font-medium text-gray-900">Schedule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {selectedPoster.start_at && (
                        <div>
                          <span className="text-sm text-gray-500">Start:</span>
                          <p className="text-gray-600">{new Date(selectedPoster.start_at).toLocaleString()}</p>
                        </div>
                      )}
                      {selectedPoster.end_at && (
                        <div>
                          <span className="text-sm text-gray-500">End:</span>
                          <p className="text-gray-600">{new Date(selectedPoster.end_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditPoster(selectedPoster);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PostersManagement;