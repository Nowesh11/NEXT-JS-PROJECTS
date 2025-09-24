'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Play, 
    Pause, 
    Search, 
    Filter,
    MoreVertical,
    Copy,
    Settings,
    BarChart3,
    Image,
    ChevronLeft,
    Upload,
    Download,
    X,
    Check,
    AlertCircle,
    FileImage,
    Loader,
    ChevronRight
} from 'lucide-react';

const SlideshowsPage = () => {
    const { data: session } = useSession();
    const [slideshows, setSlideshows] = useState([]);
    const [slides, setSlides] = useState([]);
    const [selectedSlideshow, setSelectedSlideshow] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // create, edit, view, slides
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPage, setFilterPage] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    
    // Image upload states
    const [uploadModal, setUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);
    
    // Export/Import states
    const [exportModal, setExportModal] = useState(false);
    const [importModal, setImportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('json');
    const [exportData, setExportData] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pages: [],
        isActive: true,
        autoPlay: true,
        interval: 5000,
        showControls: true,
        showIndicators: true
    });

    const [slideFormData, setSlideFormData] = useState({
        title: { en: '', ta: '' },
        content: { en: '', ta: '' },
        imageUrl: '',
        buttonText: { en: '', ta: '' },
        buttonLink: '',
        isActive: true,
        order: 1,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        animation: 'fade',
        duration: 5000
    });

    const pageOptions = [
        'home', 'about', 'services', 'products', 'contact', 
        'news', 'events', 'gallery', 'testimonials'
    ];

    const animationOptions = [
        { value: 'fade', label: 'Fade' },
        { value: 'slide', label: 'Slide' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'flip', label: 'Flip' }
    ];

    // Fetch slideshows
    const fetchSlideshows = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                includeStats: 'true'
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active');
            if (filterPage !== 'all') params.append('page', filterPage);

            const response = await fetch(`/api/admin/slideshows?${params}`);
            const data = await response.json();

            if (data.success) {
                setSlideshows(data.data);
                setTotalPages(data.pagination.pages);
                setStats(data.stats);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch slideshows');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch slides for a slideshow
    const fetchSlides = async (slideshowId) => {
        try {
            const response = await fetch(`/api/slides?slideshow=${slideshowId}`);
            const data = await response.json();

            if (data.success) {
                setSlides(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch slides:', err);
        }
    };

    // Create/Update slideshow
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = modalType === 'edit' 
                ? `/api/slideshows/${selectedSlideshow._id}`
                : '/api/slideshows';
            
            const method = modalType === 'edit' ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowModal(false);
                fetchSlideshows();
                resetForm();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to save slideshow');
        }
    };

    // Create/Update slide
    const handleSlideSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const slideData = {
                ...slideFormData,
                slideshow: selectedSlideshow._id
            };
            
            const url = slideFormData._id 
                ? `/api/slides/${slideFormData._id}`
                : '/api/slides';
            
            const method = slideFormData._id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slideData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides(selectedSlideshow._id);
                resetSlideForm();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to save slide');
        }
    };

    // Delete slideshow
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this slideshow? This will also delete all associated slides.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/slideshows/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlideshows();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to delete slideshow');
        }
    };

    // Delete slide
    const handleDeleteSlide = async (slideId) => {
        if (!confirm('Are you sure you want to delete this slide?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/slides/${slideId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides(selectedSlideshow._id);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to delete slide');
        }
    };

    // Toggle slideshow status
    const toggleStatus = async (id) => {
        try {
            const response = await fetch(`/api/slideshows/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle-active' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlideshows();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to update slideshow status');
        }
    };

    // Toggle slide status
    const toggleSlideStatus = async (slideId) => {
        try {
            const response = await fetch(`/api/slides/${slideId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle-active' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides(selectedSlideshow._id);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to update slide status');
        }
    };

    // Bulk operations
    const handleBulkAction = async (action) => {
        try {
            const response = await fetch('/api/admin/slideshows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    slideshowIds: selectedItems
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlideshows();
                setSelectedItems([]);
                setShowBulkActions(false);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to perform bulk action');
        }
    };

    // Reset forms
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            pages: [],
            isActive: true,
            autoPlay: true,
            interval: 5000,
            showControls: true,
            showIndicators: true
        });
    };

    const resetSlideForm = () => {
        setSlideFormData({
            title: { en: '', ta: '' },
            content: { en: '', ta: '' },
            imageUrl: '',
            buttonText: { en: '', ta: '' },
            buttonLink: '',
            isActive: true,
            order: slides.length + 1,
            backgroundColor: '#ffffff',
            textColor: '#000000',
            animation: 'fade',
            duration: 5000
        });
    };

    // Image upload functions
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        setUploadFiles(prev => [...prev, ...fileArray]);
    };

    const uploadImages = async () => {
        const formData = new FormData();
        uploadFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('/api/upload/images', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                setUploadFiles([]);
                setUploadModal(false);
                // Update slide form with first uploaded image
                if (result.urls && result.urls.length > 0) {
                    setSlideFormData(prev => ({ ...prev, imageUrl: result.urls[0] }));
                }
            }
        } catch (error) {
            setError('Failed to upload images');
        }
    };

    const removeUploadFile = (index) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Export/Import functions
    const exportSlideshows = async () => {
        try {
            const response = await fetch('/api/slideshows/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            const data = await response.json();
            
            if (exportFormat === 'json') {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `slideshows-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
            setExportModal(false);
        } catch (error) {
            setError('Failed to export slideshows');
        }
    };

    const importSlideshows = async (file) => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const response = await fetch('/api/slideshows/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                fetchSlideshows();
                setImportModal(false);
            }
        } catch (error) {
            setError('Failed to import slideshows');
        }
    };

    // Modal handlers
    const openModal = (type, slideshow = null) => {
        setModalType(type);
        setSelectedSlideshow(slideshow);
        
        if (type === 'edit' && slideshow) {
            setFormData({
                name: slideshow.name,
                description: slideshow.description,
                pages: slideshow.pages,
                isActive: slideshow.isActive,
                autoPlay: slideshow.autoPlay,
                interval: slideshow.interval,
                showControls: slideshow.showControls,
                showIndicators: slideshow.showIndicators
            });
        } else if (type === 'slides' && slideshow) {
            fetchSlides(slideshow._id);
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSlideshow(null);
        resetForm();
        resetSlideForm();
        setSlides([]);
    };

    // Edit slide
    const editSlide = (slide) => {
        setSlideFormData({
            ...slide,
            _id: slide._id
        });
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchSlideshows();
        }
    }, [session, currentPage, searchTerm, filterStatus, filterPage]);

    if (!session || session.user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Slideshow Management</h1>
                            <p className="text-gray-600 mt-1">Manage hero section slideshows and slides</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setExportModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => setImportModal(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Import</span>
                            </button>
                            <button
                                onClick={() => openModal('create')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Slideshow</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Slideshows</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <Play className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <Pause className="w-8 h-8 text-red-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <Image className="w-8 h-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Slides</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalSlides}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search slideshows..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={filterPage}
                            onChange={(e) => setFilterPage(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Pages</option>
                            {pageOptions.map(page => (
                                <option key={page} value={page}>
                                    {page.charAt(0).toUpperCase() + page.slice(1)}
                                </option>
                            ))}
                        </select>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Bulk Actions ({selectedItems.length})</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Bulk Actions */}
                    {showBulkActions && selectedItems.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={() => handleBulkAction('duplicate')}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button 
                            onClick={() => setError(null)}
                            className="float-right text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Slideshows List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading slideshows...</span>
                        </div>
                    ) : slideshows.length === 0 ? (
                        <div className="text-center py-12">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No slideshows found</p>
                            <button
                                onClick={() => openModal('create')}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create your first slideshow
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedItems(slideshows.map(s => s._id));
                                                    } else {
                                                        setSelectedItems([]);
                                                    }
                                                }}
                                                checked={selectedItems.length === slideshows.length}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pages
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slides
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {slideshows.map((slideshow) => (
                                        <tr key={slideshow._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(slideshow._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([...selectedItems, slideshow._id]);
                                                        } else {
                                                            setSelectedItems(selectedItems.filter(id => id !== slideshow._id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {slideshow.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {slideshow.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {slideshow.pages.map(page => (
                                                        <span key={page} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {page}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {slideshow.slideCount || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    slideshow.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {slideshow.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {slideshow.views || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(slideshow.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => openModal('slides', slideshow)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Manage Slides"
                                                    >
                                                        <Image className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('edit', slideshow)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(slideshow._id)}
                                                        className={slideshow.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                        title={slideshow.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {slideshow.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slideshow._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
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
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalType === 'create' && 'Create New Slideshow'}
                                    {modalType === 'edit' && 'Edit Slideshow'}
                                    {modalType === 'slides' && `Manage Slides - ${selectedSlideshow?.name}`}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            {(modalType === 'create' || modalType === 'edit') && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Interval (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="1000"
                                                max="30000"
                                                value={formData.interval}
                                                onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pages
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {pageOptions.map(page => (
                                                <label key={page} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.pages.includes(page)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({...formData, pages: [...formData.pages, page]});
                                                            } else {
                                                                setFormData({...formData, pages: formData.pages.filter(p => p !== page)});
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm capitalize">{page}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Active</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.autoPlay}
                                                onChange={(e) => setFormData({...formData, autoPlay: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Auto Play</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.showControls}
                                                onChange={(e) => setFormData({...formData, showControls: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Show Controls</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.showIndicators}
                                                onChange={(e) => setFormData({...formData, showIndicators: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Show Indicators</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            {modalType === 'create' ? 'Create' : 'Update'} Slideshow
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modalType === 'slides' && (
                                <div className="space-y-6">
                                    {/* Add New Slide Form */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {slideFormData._id ? 'Edit Slide' : 'Add New Slide'}
                                        </h3>
                                        <form onSubmit={handleSlideSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Title (English) *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={slideFormData.title.en}
                                                        onChange={(e) => setSlideFormData({
                                                            ...slideFormData, 
                                                            title: {...slideFormData.title, en: e.target.value}
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Title (Tamil)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={slideFormData.title.ta}
                                                        onChange={(e) => setSlideFormData({
                                                            ...slideFormData, 
                                                            title: {...slideFormData.title, ta: e.target.value}
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Content (English)
                                                    </label>
                                                    <textarea
                                                        value={slideFormData.content.en}
                                                        onChange={(e) => setSlideFormData({
                                                            ...slideFormData, 
                                                            content: {...slideFormData.content, en: e.target.value}
                                                        })}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Content (Tamil)
                                                    </label>
                                                    <textarea
                                                        value={slideFormData.content.ta}
                                                        onChange={(e) => setSlideFormData({
                                                            ...slideFormData, 
                                                            content: {...slideFormData.content, ta: e.target.value}
                                                        })}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Image URL
                                                    </label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="url"
                                                            value={slideFormData.imageUrl}
                                                            onChange={(e) => setSlideFormData({...slideFormData, imageUrl: e.target.value})}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Enter image URL or upload"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setUploadModal(true)}
                                                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                                            title="Upload Image"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {slideFormData.imageUrl && (
                                                        <div className="mt-2">
                                                            <img 
                                                                src={slideFormData.imageUrl} 
                                                                alt="Preview" 
                                                                className="w-full h-20 object-cover rounded border"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Animation
                                                    </label>
                                                    <select
                                                        value={slideFormData.animation}
                                                        onChange={(e) => setSlideFormData({...slideFormData, animation: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        {animationOptions.map(option => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Duration (ms)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1000"
                                                        max="30000"
                                                        value={slideFormData.duration}
                                                        onChange={(e) => setSlideFormData({...slideFormData, duration: parseInt(e.target.value)})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                {slideFormData._id && (
                                                    <button
                                                        type="button"
                                                        onClick={resetSlideForm}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    {slideFormData._id ? 'Update' : 'Add'} Slide
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Slides List */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Slides ({slides.length})
                                        </h3>
                                        {slides.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No slides added yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {slides.map((slide, index) => (
                                                    <div key={slide._id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-sm font-medium text-gray-500">
                                                                        #{slide.order}
                                                                    </span>
                                                                    <h4 className="text-lg font-medium text-gray-900">
                                                                        {slide.title.en || slide.title.ta}
                                                                    </h4>
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                        slide.isActive 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {slide.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-600 text-sm mb-2">
                                                                    {slide.content.en || slide.content.ta}
                                                                </p>
                                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                    <span>Animation: {slide.animation}</span>
                                                                    <span>Duration: {slide.duration}ms</span>
                                                                    {slide.imageUrl && <span>Has Image</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => editSlide(slide)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleSlideStatus(slide._id)}
                                                                    className={slide.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                                    title={slide.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteSlide(slide._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Upload Images</h3>
                            <button
                                onClick={() => setUploadModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Drag and drop images here</p>
                            <p className="text-sm text-gray-500 mb-4">or</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Browse Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFiles(e.target.files)}
                                className="hidden"
                            />
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Selected Files:</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {uploadFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm truncate">{file.name}</span>
                                            <button
                                                onClick={() => removeUploadFile(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadProgress > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setUploadModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadImages}
                                disabled={uploadFiles.length === 0 || uploadProgress > 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploadProgress > 0 ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Upload'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {exportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Export Slideshows</h3>
                            <button
                                onClick={() => setExportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Export Format
                                </label>
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                    <option value="xml">XML</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Include
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" defaultChecked className="mr-2" />
                                        <span className="text-sm">Slideshow Details</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" defaultChecked className="mr-2" />
                                        <span className="text-sm">Slides Content</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        <span className="text-sm">Statistics</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setExportModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={exportSlideshows}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Download className="w-4 h-4 mr-2 inline" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {importModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Import Slideshows</h3>
                            <button
                                onClick={() => setImportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select File
                                </label>
                                <input
                                    type="file"
                                    accept=".json,.csv,.xml"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800">Import Notes</h4>
                                        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                            <li>• Existing slideshows with same names will be updated</li>
                                            <li>• Invalid data will be skipped</li>
                                            <li>• Images must be uploaded separately</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setImportModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={importSlideshows}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <Upload className="w-4 h-4 mr-2 inline" />
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlideshowsPage;