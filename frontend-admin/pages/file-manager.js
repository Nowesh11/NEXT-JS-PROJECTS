'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Folder,
    File,
    Image,
    FileText,
    Video,
    Download,
    Trash2,
    Search,
    Filter,
    Grid,
    List,
    Upload,
    Eye,
    MoreVertical,
    Calendar,
    HardDrive,
    Archive,
    RefreshCw,
    Package,
    AlertTriangle,
    Link,
    Unlink,
    Info,
    X,
    CheckSquare,
    Square
} from 'lucide-react';

const MODULE_ICONS = {
    books: '📚',
    ebooks: '📖',
    posters: '🎨',
    projects: '🚀',
    activities: '🎯',
    initiatives: '💡',
    slideshow: '🎬',
    content: '🌐'
};

const FILE_TYPE_ICONS = {
    '.jpg': Image,
    '.jpeg': Image,
    '.png': Image,
    '.svg': Image,
    '.pdf': FileText,
    '.epub': FileText,
    '.mp4': Video,
    '.mov': Video
};

export default function FileManager() {
    const { data: session } = useSession();
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedFileDetails, setSelectedFileDetails] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportCategory, setExportCategory] = useState('');
    const [showOrphanedOnly, setShowOrphanedOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(50);

    const modules = Object.keys(MODULE_ICONS);

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchAllFiles(currentPage);
            fetchStats();
        }
    }, [session, currentPage, showOrphanedOnly]);

    useEffect(() => {
        filterFiles();
    }, [files, selectedModule, searchTerm]);

    const fetchAllFiles = async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/files?page=${page}&limit=${itemsPerPage}&orphanedOnly=${showOrphanedOnly}`);
            const data = await response.json();
            
            if (response.ok) {
                setFiles(data.files || []);
                setCurrentPage(data.pagination?.currentPage || 1);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                console.error('Error fetching files:', data.error);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/files/stats');
            const data = await response.json();
            
            if (response.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filterFiles = () => {
        let filtered = files;

        // Filter by module
        if (selectedModule !== 'all') {
            filtered = filtered.filter(file => file.module === selectedModule);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(file => 
                file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.recordId?.includes(searchTerm)
            );
        }

        setFilteredFiles(filtered);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (filename) => {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const IconComponent = FILE_TYPE_ICONS[ext] || File;
        return IconComponent;
    };

    const handleFileSelect = (file) => {
        setSelectedFiles(prev => {
            const isSelected = prev.some(f => f.path === file.path);
            if (isSelected) {
                return prev.filter(f => f.path !== file.path);
            } else {
                return [...prev, file];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === filteredFiles.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles([...filteredFiles]);
        }
    };

    const downloadFile = (file) => {
        const link = document.createElement('a');
        link.href = `/${file.path}`;
        link.download = file.originalName || file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadSelected = async () => {
        if (selectedFiles.length === 1) {
            downloadFile(selectedFiles[0]);
        } else {
            // For multiple files, create a zip
            try {
                const response = await fetch('/api/admin/files/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        files: selectedFiles.map(f => f.path)
                    })
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `files_${Date.now()}.zip`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error('Error downloading files:', error);
                alert('Error downloading files');
            }
        }
    };

    const deleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/files/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    files: selectedFiles.map(f => ({
                        module: f.module,
                        recordId: f.recordId,
                        filename: f.filename
                    }))
                })
            });
            
            if (response.ok) {
                setSelectedFiles([]);
                fetchAllFiles();
                fetchStats();
                alert('Files deleted successfully');
            } else {
                const data = await response.json();
                alert('Error deleting files: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting files:', error);
            alert('Error deleting files');
        }
    };

    const exportFilesByCategory = async (category) => {
        try {
            const response = await fetch('/api/admin/files/export-by-category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${category}-files.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setShowExportModal(false);
            }
        } catch (error) {
            console.error('Error exporting files by category:', error);
        }
    };

    const cleanupOrphanedFiles = async () => {
        if (!confirm('Are you sure you want to delete all orphaned files? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/files/cleanup-orphaned', {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Successfully deleted ${data.deletedCount} orphaned files`);
                fetchAllFiles(currentPage);
                fetchStats();
            }
        } catch (error) {
            console.error('Error cleaning up orphaned files:', error);
        }
    };

    const showFileDetails = async (file) => {
        try {
            const response = await fetch(`/api/admin/files/${file.id}/details`);
            const data = await response.json();
            
            if (response.ok) {
                setSelectedFileDetails(data);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error('Error fetching file details:', error);
        }
    };

    const refreshFileStats = async () => {
        await fetchStats();
        await fetchAllFiles(currentPage);
    };

    const previewImage = (file) => {
        const ext = file.filename.toLowerCase().substring(file.filename.lastIndexOf('.'));
        if (['.jpg', '.jpeg', '.png', '.svg'].includes(ext)) {
            setPreviewFile(file);
        }
    };

    if (session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Access denied. Admin privileges required.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">File Storage Manager</h1>
                <p className="text-gray-600">Manage all uploaded files across different modules</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Files</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                            </div>
                            <File className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Size</p>
                                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                            </div>
                            <HardDrive className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Modules</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.moduleCount}</p>
                            </div>
                            <Folder className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Linked Files</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.linkedFiles || 0}</p>
                            </div>
                            <Link className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Orphaned Files</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.orphanedFiles || 0}</p>
                            </div>
                            <Unlink className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                />
                            </div>

                            {/* Module Filter */}
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Modules</option>
                                {modules.map(module => (
                                    <option key={module} value={module}>
                                        {MODULE_ICONS[module]} {module.charAt(0).toUpperCase() + module.slice(1)}
                                    </option>
                                ))}
                            </select>

                            {/* Orphaned Files Toggle */}
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showOrphanedOnly}
                                    onChange={(e) => setShowOrphanedOnly(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show orphaned files only</span>
                            </label>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Utility Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={refreshFileStats}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                Export by Category
                            </button>
                            {stats?.orphanedFiles > 0 && (
                                <button
                                    onClick={cleanupOrphanedFiles}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Cleanup Orphaned
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedFiles.length > 0 && (
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                                {selectedFiles.length} selected
                            </span>
                            <button
                                 onClick={downloadSelectedFiles}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                             >
                                 <Download className="w-4 h-4" />
                                 Download ({selectedFiles.length})
                             </button>
                             <button
                                 onClick={deleteSelectedFiles}
                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                             >
                                 <Trash2 className="w-4 h-4" />
                                 Delete ({selectedFiles.length})
                             </button>
                        </div>
                    )}
                </div>
            </div>

            {/* File List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                        <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <>
                        {/* Select All Header */}
                        <div className="p-4 border-b border-gray-200">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                                    onChange={handleSelectAll}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-600">
                                    Select All ({filteredFiles.length} files)
                                </span>
                            </label>
                        </div>

                        {/* Files */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                {filteredFiles.map((file, index) => {
                                    const IconComponent = getFileIcon(file.filename);
                                    const isSelected = selectedFiles.some(f => f.path === file.path);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleFileSelect(file)}
                                                    className="mt-1"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => showFileDetails(file)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Details"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => previewImage(file)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadFile(file)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center mb-3">
                                                <IconComponent className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                                <div className="flex flex-col items-center gap-1">
                                                    <h4 className="font-medium text-gray-900 text-sm truncate" title={file.filename}>
                                                        {file.filename}
                                                    </h4>
                                                    {file.isOrphaned && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <Unlink className="w-3 h-3 mr-1" />
                                                            Orphaned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span>Module:</span>
                                                    <span className="font-medium">
                                                        {MODULE_ICONS[file.module]} {file.module}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Size:</span>
                                                    <span>{formatFileSize(file.size)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Created:</span>
                                                    <span>{formatDate(file.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredFiles.map((file, index) => {
                                    const IconComponent = getFileIcon(file.filename);
                                    const isSelected = selectedFiles.some(f => f.path === file.path);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 hover:bg-gray-50 ${
                                                isSelected ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleFileSelect(file)}
                                                    />
                                                    <IconComponent className="w-8 h-8 text-gray-400" />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900">{file.filename}</h4>
                                                            {file.isOrphaned && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    <Unlink className="w-3 h-3 mr-1" />
                                                                    Orphaned
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            {MODULE_ICONS[file.module]} {file.module} • {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(file.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={() => showFileDetails(file)}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="Details"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => previewImage(file)}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadFile(file)}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Export Files by Category</h3>
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {modules.map(module => (
                                    <button
                                        key={module}
                                        onClick={() => exportFilesByCategory(module)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                                    >
                                        <span className="text-2xl">{MODULE_ICONS[module]}</span>
                                        <span className="font-medium">{module.charAt(0).toUpperCase() + module.slice(1)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Details Modal */}
            {showDetailsModal && selectedFileDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">File Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Filename</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedFileDetails.filename}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Module</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedFileDetails.module}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Size</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatFileSize(selectedFileDetails.size)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedFileDetails.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Path</label>
                                    <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{selectedFileDetails.path}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{previewFile.filename}</h3>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={`/${previewFile.path}`}
                                alt={previewFile.filename}
                                className="max-w-full max-h-96 mx-auto"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}