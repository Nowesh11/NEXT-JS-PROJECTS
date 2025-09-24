import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiShoppingCart, FiHeart, FiStar, FiEye, FiX } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    language: '',
    minPrice: '',
    maxPrice: '',
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
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('bookWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });

      const response = await fetch(`/api/books?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setBooks(data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems
        }));
        if (data.filters) {
          setCategories(data.filters.categories || []);
          setLanguages(data.filters.languages || []);
        }
      } else {
        toast.error(data.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
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
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAddToCart = (book) => {
    try {
      addToCart({
        id: book._id,
        title: book.title,
        price: book.price,
        coverImage: book.coverImage,
        author: book.author,
        type: 'book'
      });
      toast.success(`${book.title?.en || book.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = (book) => {
    const bookId = book._id;
    let newWishlist;
    
    if (wishlist.includes(bookId)) {
      newWishlist = wishlist.filter(id => id !== bookId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, bookId];
      toast.success('Added to wishlist');
    }
    
    setWishlist(newWishlist);
    localStorage.setItem('bookWishlist', JSON.stringify(newWishlist));
  };

  const isInCart = (bookId) => {
    return cartItems.some(item => item.id === bookId);
  };

  const isInWishlist = (bookId) => {
    return wishlist.includes(bookId);
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(price);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Books Collection</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our extensive collection of Tamil literature, educational books, and cultural publications.
            </p>
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
                placeholder="Search books by title, author, or ISBN..."
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
              <option value="price">Price Low-High</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price (RM)"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price (RM)"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {books.length} of {pagination.totalItems} books
          </p>
          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {books.map((book) => (
                  <div key={book._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Book Cover */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                      <img
                        src={book.coverImage || '/assets/default-book-cover.jpg'}
                        alt={book.title?.en || book.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openBookModal(book)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                            title="Quick View"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleWishlist(book)}
                            className={`p-2 bg-white rounded-full transition-colors ${
                              isInWishlist(book._id) ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                            }`}
                            title={isInWishlist(book._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            <FiHeart className={isInWishlist(book._id) ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {book.featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                            Featured
                          </span>
                        )}
                        {book.stock <= 5 && book.stock > 0 && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                            Low Stock
                          </span>
                        )}
                        {book.stock === 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {book.title?.en || book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {book.author?.en || book.author}
                      </p>
                      
                      {/* Rating */}
                      {book.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {renderStars(book.rating)}
                          </div>
                          <span className="text-sm text-gray-600">({book.reviewCount || 0})</span>
                        </div>
                      )}
                      
                      {/* Category */}
                      {book.category && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">
                          {book.category}
                        </span>
                      )}
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(book.price)}
                          </span>
                          {book.originalPrice && book.originalPrice > book.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(book.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(book)}
                          disabled={book.stock === 0 || isInCart(book._id)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            book.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isInCart(book._id)
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {book.stock === 0 ? (
                            'Out of Stock'
                          ) : isInCart(book._id) ? (
                            'In Cart'
                          ) : (
                            <><FiShoppingCart className="inline mr-1" /> Add to Cart</>
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
                  <p className="text-lg">No books found</p>
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

      {/* Book Detail Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Book Details"
        size="large"
      >
        {selectedBook && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Cover */}
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={selectedBook.coverImage || '/assets/default-book-cover.jpg'}
                alt={selectedBook.title?.en || selectedBook.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Book Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedBook.title?.en || selectedBook.title}
                </h2>
                {selectedBook.title?.ta && (
                  <h3 className="text-lg text-gray-600 mb-2">{selectedBook.title.ta}</h3>
                )}
                <p className="text-lg text-gray-700">
                  by {selectedBook.author?.en || selectedBook.author}
                </p>
              </div>
              
              {/* Rating */}
              {selectedBook.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(selectedBook.rating)}
                  </div>
                  <span className="text-gray-600">({selectedBook.reviewCount || 0} reviews)</span>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(selectedBook.price)}
                </span>
                {selectedBook.originalPrice && selectedBook.originalPrice > selectedBook.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(selectedBook.originalPrice)}
                  </span>
                )}
              </div>
              
              {/* Description */}
              {selectedBook.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedBook.description?.en || selectedBook.description}
                  </p>
                </div>
              )}
              
              {/* Book Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedBook.isbn && (
                  <div>
                    <span className="font-medium text-gray-900">ISBN:</span>
                    <span className="ml-2 text-gray-700">{selectedBook.isbn}</span>
                  </div>
                )}
                {selectedBook.publisher && (
                  <div>
                    <span className="font-medium text-gray-900">Publisher:</span>
                    <span className="ml-2 text-gray-700">{selectedBook.publisher?.en || selectedBook.publisher}</span>
                  </div>
                )}
                {selectedBook.pages && (
                  <div>
                    <span className="font-medium text-gray-900">Pages:</span>
                    <span className="ml-2 text-gray-700">{selectedBook.pages}</span>
                  </div>
                )}
                {selectedBook.language && (
                  <div>
                    <span className="font-medium text-gray-900">Language:</span>
                    <span className="ml-2 text-gray-700">{selectedBook.language}</span>
                  </div>
                )}
                {selectedBook.category && (
                  <div>
                    <span className="font-medium text-gray-900">Category:</span>
                    <span className="ml-2 text-gray-700">{selectedBook.category}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Stock:</span>
                  <span className={`ml-2 ${
                    selectedBook.stock === 0 ? 'text-red-600' : 
                    selectedBook.stock <= 5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedBook.stock} available
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleAddToCart(selectedBook)}
                  disabled={selectedBook.stock === 0 || isInCart(selectedBook._id)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    selectedBook.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isInCart(selectedBook._id)
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedBook.stock === 0 ? (
                    'Out of Stock'
                  ) : isInCart(selectedBook._id) ? (
                    'In Cart'
                  ) : (
                    <><FiShoppingCart className="inline mr-2" /> Add to Cart</>
                  )}
                </button>
                
                <button
                  onClick={() => handleWishlist(selectedBook)}
                  className={`px-6 py-3 rounded-lg border transition-colors ${
                    isInWishlist(selectedBook._id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <FiHeart className={`inline mr-2 ${isInWishlist(selectedBook._id) ? 'fill-current' : ''}`} />
                  {isInWishlist(selectedBook._id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Books;