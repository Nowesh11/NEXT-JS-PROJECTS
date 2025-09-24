'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Search, 
    Filter,
    MoreVertical,
    Copy,
    Settings,
    BarChart3,
    Image,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Palette,
    Clock,
    Link,
    Type
} from 'lucide-react';

const SlidesPage = () => {
    const { data: session } = useSession();
    const [slides, setSlides] = useState([]);
    const [slideshows, setSlideshows] = useState([]);
    const [selectedSlide, setSelectedSlide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // create, edit, view
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSlideshow, setFilterSlideshow] = useState('all');
    const [filterAnimation, setFilterAnimation] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: { en: '', ta: '' },
        content: { en: '', ta: '' },
        imageUrl: '',
        buttonText: { en: '', ta: '' },
        buttonLink: '',
        slideshow: '',
        isActive: true,
        order: 1,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        animation: 'fade',
        duration: 5000
    });

    const animationOptions = [
        { value: 'fade', label: 'Fade' },
        { value: 'slide', label: 'Slide' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'flip', label: 'Flip' }
    ];

    // Fetch slides
    const fetchSlides = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                includeStats: 'true'
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active');
            if (filterSlideshow !== 'all') params.append('slideshow', filterSlideshow);
            if (filterAnimation !== 'all') params.append('animation', filterAnimation);

            const response = await fetch(`/api/admin/slides?${params}`);
            const data = await response.json();

            if (data.success) {
                setSlides(data.data);
                setTotalPages(data.pagination.pages);
                setStats(data.stats);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch slides');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch slideshows for dropdown
    const fetchSlideshows = async () => {
        try {
            const response = await fetch('/api/slideshows?limit=100');
            const data = await response.json();

            if (data.success) {
                setSlideshows(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch slideshows:', err);
        }
    };

    // Create/Update slide
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = modalType === 'edit' 
                ? `/api/slides/${selectedSlide._id}`
                : '/api/slides';
            
            const method = modalType === 'edit' ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowModal(false);
                fetchSlides();
                resetForm();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to save slide');
        }
    };

    // Delete slide
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this slide?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/slides/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to delete slide');
        }
    };

    // Toggle slide status
    const toggleStatus = async (id) => {
        try {
            const response = await fetch(`/api/slides/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle-active' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to update slide status');
        }
    };

    // Move slide
    const moveSlide = async (id, direction) => {
        try {
            const response = await fetch(`/api/slides/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'move',
                    direction
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to move slide');
        }
    };

    // Bulk operations
    const handleBulkAction = async (action, additionalData = {}) => {
        try {
            const response = await fetch('/api/admin/slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    slideIds: selectedItems,
                    ...additionalData
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchSlides();
                setSelectedItems([]);
                setShowBulkActions(false);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to perform bulk action');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: { en: '', ta: '' },
            content: { en: '', ta: '' },
            imageUrl: '',
            buttonText: { en: '', ta: '' },
            buttonLink: '',
            slideshow: '',
            isActive: true,
            order: 1,
            backgroundColor: '#ffffff',
            textColor: '#000000',
            animation: 'fade',
            duration: 5000
        });
    };

    // Modal handlers
    const openModal = (type, slide = null) => {
        setModalType(type);
        setSelectedSlide(slide);
        
        if (type === 'edit' && slide) {
            setFormData({
                title: slide.title,
                content: slide.content,
                imageUrl: slide.imageUrl || '',
                buttonText: slide.buttonText || { en: '', ta: '' },
                buttonLink: slide.buttonLink || '',
                slideshow: slide.slideshow._id || slide.slideshow,
                isActive: slide.isActive,
                order: slide.order,
                backgroundColor: slide.backgroundColor || '#ffffff',
                textColor: slide.textColor || '#000000',
                animation: slide.animation || 'fade',
                duration: slide.duration || 5000
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSlide(null);
        resetForm();
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchSlides();
            fetchSlideshows();
        }
    }, [session, currentPage, searchTerm, filterStatus, filterSlideshow, filterAnimation]);

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
                            <h1 className="text-3xl font-bold text-gray-900">Slide Management</h1>
                            <p className="text-gray-600 mt-1">Manage individual slides across all slideshows</p>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Slide</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Slides</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <Eye className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <EyeOff className="w-8 h-8 text-red-600" />
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
                                    <p className="text-sm font-medium text-gray-600">With Images</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withImages}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search slides..."
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
                            value={filterSlideshow}
                            onChange={(e) => setFilterSlideshow(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Slideshows</option>
                            {slideshows.map(slideshow => (
                                <option key={slideshow._id} value={slideshow._id}>
                                    {slideshow.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterAnimation}
                            onChange={(e) => setFilterAnimation(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Animations</option>
                            {animationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
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
                            <div className="flex flex-wrap gap-2">
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
                                <button
                                    onClick={() => {
                                        const animation = prompt('Enter animation type (fade, slide, zoom, flip):');
                                        if (animation && animationOptions.find(opt => opt.value === animation)) {
                                            handleBulkAction('update-animation', { animation });
                                        }
                                    }}
                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                                >
                                    Update Animation
                                </button>
                                <button
                                    onClick={() => {
                                        const duration = prompt('Enter duration in milliseconds (1000-30000):');
                                        const durationNum = parseInt(duration);
                                        if (durationNum >= 1000 && durationNum <= 30000) {
                                            handleBulkAction('update-duration', { duration: durationNum });
                                        }
                                    }}
                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                                >
                                    Update Duration
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

                {/* Slides List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading slides...</span>
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="text-center py-12">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No slides found</p>
                            <button
                                onClick={() => openModal('create')}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create your first slide
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
                                                        setSelectedItems(slides.map(s => s._id));
                                                    } else {
                                                        setSelectedItems([]);
                                                    }
                                                }}
                                                checked={selectedItems.length === slides.length}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slideshow
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Animation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
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
                                    {slides.map((slide) => (
                                        <tr key={slide._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(slide._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([...selectedItems, slide._id]);
                                                        } else {
                                                            setSelectedItems(selectedItems.filter(id => id !== slide._id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        #{slide.order}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => moveSlide(slide._id, 'up')}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => moveSlide(slide._id, 'down')}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {slide.imageUrl && (
                                                        <img 
                                                            src={slide.imageUrl} 
                                                            alt="Slide" 
                                                            className="w-10 h-10 rounded object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {slide.title.en || slide.title.ta || 'Untitled'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {slide.content.en || slide.content.ta || 'No content'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {slide.slideshow?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {slide.animation}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {slide.duration}ms
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    slide.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {slide.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(slide.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => openModal('edit', slide)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(slide._id)}
                                                        className={slide.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                        title={slide.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slide._id)}
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
                                    {modalType === 'create' ? 'Create New Slide' : 'Edit Slide'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Slideshow Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slideshow *
                                    </label>
                                    <select
                                        value={formData.slideshow}
                                        onChange={(e) => setFormData({...formData, slideshow: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a slideshow</option>
                                        {slideshows.map(slideshow => (
                                            <option key={slideshow._id} value={slideshow._id}>
                                                {slideshow.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Title */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title (English) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title.en}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                title: {...formData.title, en: e.target.value}
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                title: {...formData.title, ta: e.target.value}
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content (English)
                                        </label>
                                        <textarea
                                            value={formData.content.en}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                content: {...formData.content, en: e.target.value}
                                            })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content (Tamil)
                                        </label>
                                        <textarea
                                            value={formData.content.ta}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                content: {...formData.content, ta: e.target.value}
                                            })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Button Text */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Text (English)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.buttonText.en}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                buttonText: {...formData.buttonText, en: e.target.value}
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Text (Tamil)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.buttonText.ta}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                buttonText: {...formData.buttonText, ta: e.target.value}
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Image and Button Link */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Link
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.buttonLink}
                                            onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Animation and Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Animation
                                        </label>
                                        <select
                                            value={formData.animation}
                                            onChange={(e) => setFormData({...formData, animation: e.target.value})}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration (ms)
                                        </label>
                                        <input
                                            type="number"
                                            min="1000"
                                            max="30000"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.order}
                                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Background Color
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={formData.backgroundColor}
                                                onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.backgroundColor}
                                                onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text Color
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={formData.textColor}
                                                onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.textColor}
                                                onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
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
                                        {modalType === 'create' ? 'Create' : 'Update'} Slide
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlidesPage;