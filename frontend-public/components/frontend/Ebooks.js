import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiDownload, FiHeart, FiStar, FiEye, FiBook, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';

const Ebooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    language: '',
    isFree: '',
    featured: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({
    totalEbooks: 0,
    freeEbooks: 0,
    featuredEbooks: 0
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchEbooks();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('ebookWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });

      const response = await fetch(`/api/ebooks?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setEbooks(data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems
        }));
        if (data.filters) {
          setCategories(data.filters.categories || []);
          setLanguages(data.filters.languages || []);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.message || 'Failed to fetch ebooks');
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      toast.error('Failed to fetch ebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      language: '',
      isFree: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleDownload = async (ebook) => {
    if (!user) {
      toast.error('Please login to download ebooks');
      return;
    }

    if (!ebook.isFree && !ebook.isPurchased) {
      toast.error('This ebook requires purchase');
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [ebook._id]: true }));
      
      const response = await fetch(`/api/ebooks/${ebook._id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${ebook.title?.en || ebook.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Download started successfully!');
        
        // Update download count
        setEbooks(prev => prev.map(e => 
          e._id === ebook._id 
            ? { ...e, downloadCount: (e.downloadCount || 0) + 1 }
            : e
        ));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(prev => ({ ...prev, [ebook._id]: false }));
    }
  };

  const handleWishlist = (ebook) => {
    const ebookId = ebook._id;
    let newWishlist;
    
    if (wishlist.includes(ebookId)) {
      newWishlist = wishlist.filter(id => id !== ebookId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, ebookId];
      toast.success('Added to wishlist');
    }
    
    setWishlist(newWishlist);
    localStorage.setItem('ebookWishlist', JSON.stringify(newWishlist));
  };

  const isInWishlist = (ebookId) => {
    return wishlist.includes(ebookId);
  };

  const openEbookModal = (ebook) => {
    setSelectedEbook(ebook);
    setShowEbookModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-yellow-400 fill-current opacity-50" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital Library</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our collection of digital books, research papers, and educational materials.
            </p>
          </div>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <FiBook className="mx-auto text-3xl text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{stats.totalEbooks}</div>
              <div className="text-blue-700">Total Ebooks</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <FiDownload className="mx-auto text-3xl text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-900">{stats.freeEbooks}</div>
              <div className="text-green-700">Free Downloads</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <FiStar className="mx-auto text-3xl text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-900">{stats.featuredEbooks}</div>
              <div className="text-purple-700">Featured</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search ebooks by title, author, or keywords..."
                value={filters.search}
                onChange={handleFilterChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <FiFilter /> Filters
            </button>
            
            {/* Sort */}
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Newest First</option>
              <option value="title">Title A-Z</option>
              <option value="downloadCount">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="fileSize">File Size</option>
            </select>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Languages</option>
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                
                <select
                  name="isFree"
                  value={filters.isFree}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Ebooks</option>
                  <option value="true">Free Only</option>
                  <option value="false">Premium Only</option>
                </select>
                
                <select
                  name="featured"
                  value={filters.featured}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Featured Only</option>
                </select>
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {ebooks.length} of {pagination.totalItems} ebooks
          </p>
          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>

        {/* Ebooks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {ebooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {ebooks.map((ebook) => (
                  <div key={ebook._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Ebook Cover */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                      <img
                        src={ebook.coverImage || '/assets/default-ebook-cover.jpg'}
                        alt={ebook.title?.en || ebook.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEbookModal(ebook)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                            title="Quick View"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleWishlist(ebook)}
                            className={`p-2 bg-white rounded-full transition-colors ${
                              isInWishlist(ebook._id) ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                            }`}
                            title={isInWishlist(ebook._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            <FiHeart className={isInWishlist(ebook._id) ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {ebook.isFree && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                            Free
                          </span>
                        )}
                        {ebook.featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                            Featured
                          </span>
                        )}
                        {!ebook.isFree && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                            Premium
                          </span>
                        )}
                      </div>
                      
                      {/* File Format */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded">
                          <FiFileText className="inline mr-1" />PDF
                        </span>
                      </div>
                    </div>
                    
                    {/* Ebook Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {ebook.title?.en || ebook.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {ebook.author?.en || ebook.author}
                      </p>
                      
                      {/* Rating */}
                      {ebook.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {renderStars(ebook.rating)}
                          </div>
                          <span className="text-sm text-gray-600">({ebook.reviewCount || 0})</span>
                        </div>
                      )}
                      
                      {/* Category and File Size */}
                      <div className="flex items-center justify-between mb-2">
                        {ebook.category && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {ebook.category}
                          </span>
                        )}
                        {ebook.fileSize && (
                          <span className="text-xs text-gray-500">
                            {formatFileSize(ebook.fileSize)}
                          </span>
                        )}
                      </div>
                      
                      {/* Download Count */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">
                          <FiDownload className="inline mr-1" />
                          {ebook.downloadCount || 0} downloads
                        </span>
                        {ebook.pages && (
                          <span className="text-sm text-gray-600">
                            {ebook.pages} pages
                          </span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(ebook)}
                          disabled={downloading[ebook._id] || (!ebook.isFree && !ebook.isPurchased && !user)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            downloading[ebook._id]
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : (!ebook.isFree && !ebook.isPurchased && user)
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {downloading[ebook._id] ? (
                            'Downloading...'
                          ) : (!ebook.isFree && !ebook.isPurchased && user) ? (
                            'Purchase Required'
                          ) : !user ? (
                            'Login to Download'
                          ) : (
                            <><FiDownload className="inline mr-1" /> Download</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <FiSearch size={48} className="mx-auto mb-4" />
                  <p className="text-lg">No ebooks found</p>
                  <p className="text-sm">Try adjusting your search criteria or filters</p>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            />
          </div>
        )}
      </div>

      {/* Ebook Detail Modal */}
      <Modal
        isOpen={showEbookModal}
        onClose={() => setShowEbookModal(false)}
        title="Ebook Details"
        size="large"
      >
        {selectedEbook && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ebook Cover */}
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={selectedEbook.coverImage || '/assets/default-ebook-cover.jpg'}
                alt={selectedEbook.title?.en || selectedEbook.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Ebook Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEbook.title?.en || selectedEbook.title}
                </h2>
                {selectedEbook.title?.ta && (
                  <h3 className="text-lg text-gray-600 mb-2">{selectedEbook.title.ta}</h3>
                )}
                <p className="text-lg text-gray-700">
                  by {selectedEbook.author?.en || selectedEbook.author}
                </p>
              </div>
              
              {/* Rating */}
              {selectedEbook.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(selectedEbook.rating)}
                  </div>
                  <span className="text-gray-600">({selectedEbook.reviewCount || 0} reviews)</span>
                </div>
              )}
              
              {/* Price/Free Status */}
              <div className="flex items-center gap-3">
                {selectedEbook.isFree ? (
                  <span className="text-2xl font-bold text-green-600">Free Download</span>
                ) : (
                  <span className="text-2xl font-bold text-blue-600">Premium Content</span>
                )}
              </div>
              
              {/* Description */}
              {selectedEbook.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEbook.description?.en || selectedEbook.description}
                  </p>
                </div>
              )}
              
              {/* Ebook Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedEbook.isbn && (
                  <div>
                    <span className="font-medium text-gray-900">ISBN:</span>
                    <span className="ml-2 text-gray-700">{selectedEbook.isbn}</span>
                  </div>
                )}
                {selectedEbook.publisher && (
                  <div>
                    <span className="font-medium text-gray-900">Publisher:</span>
                    <span className="ml-2 text-gray-700">{selectedEbook.publisher?.en || selectedEbook.publisher}</span>
                  </div>
                )}
                {selectedEbook.pages && (
                  <div>
                    <span className="font-medium text-gray-900">Pages:</span>
                    <span className="ml-2 text-gray-700">{selectedEbook.pages}</span>
                  </div>
                )}
                {selectedEbook.language && (
                  <div>
                    <span className="font-medium text-gray-900">Language:</span>
                    <span className="ml-2 text-gray-700">{selectedEbook.language}</span>
                  </div>
                )}
                {selectedEbook.category && (
                  <div>
                    <span className="font-medium text-gray-900">Category:</span>
                    <span className="ml-2 text-gray-700">{selectedEbook.category}</span>
                  </div>
                )}
                {selectedEbook.fileSize && (
                  <div>
                    <span className="font-medium text-gray-900">File Size:</span>
                    <span className="ml-2 text-gray-700">{formatFileSize(selectedEbook.fileSize)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Downloads:</span>
                  <span className="ml-2 text-gray-700">{selectedEbook.downloadCount || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Format:</span>
                  <span className="ml-2 text-gray-700">PDF</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedEbook)}
                  disabled={downloading[selectedEbook._id] || (!selectedEbook.isFree && !selectedEbook.isPurchased && !user)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    downloading[selectedEbook._id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : (!selectedEbook.isFree && !selectedEbook.isPurchased && user)
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {downloading[selectedEbook._id] ? (
                    'Downloading...'
                  ) : (!selectedEbook.isFree && !selectedEbook.isPurchased && user) ? (
                    'Purchase Required'
                  ) : !user ? (
                    'Login to Download'
                  ) : (
                    <><FiDownload className="inline mr-2" /> Download PDF</>
                  )}
                </button>
                
                <button
                  onClick={() => handleWishlist(selectedEbook)}
                  className={`px-6 py-3 rounded-lg border transition-colors ${
                    isInWishlist(selectedEbook._id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <FiHeart className={`inline mr-2 ${isInWishlist(selectedEbook._id) ? 'fill-current' : ''}`} />
                  {isInWishlist(selectedEbook._id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ebooks;