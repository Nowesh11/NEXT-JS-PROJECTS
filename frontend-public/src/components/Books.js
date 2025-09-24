import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import booksAPI from '../services/booksApi';
import styles from '../styles/Books.module.css';

const Books = () => {
  // Local cart state (can be replaced with CartContext later)
  const [cart, setCart] = useState([]);
  
  // Cart functions
  const addToCart = (book) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === book.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...book, quantity: 1 }];
      }
    });
  };
  
  const removeFromCart = (bookId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== bookId));
  };
  
  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === bookId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };
  
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };
  
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  // Simple language state (can be replaced with proper context later)
  const [isEnglish, setIsEnglish] = useState(true);
  const getText = (key) => {
    const translations = {
      'search_books': isEnglish ? 'Search books...' : 'புத்தகங்களைத் தேடுங்கள்...',
      'filters': isEnglish ? 'Filters' : 'வடிகட்டிகள்',
      'clear_all': isEnglish ? 'Clear All' : 'அனைத்தையும் அழிக்கவும்',
      'category': isEnglish ? 'Category' : 'வகை',
      'all_categories': isEnglish ? 'All Categories' : 'அனைத்து வகைகள்',
      'price_range': isEnglish ? 'Price Range' : 'விலை வரம்பு',
      'book_categories': isEnglish ? 'Book Categories' : 'புத்தக வகைகள்',
      'view_all_books': isEnglish ? 'View All Books' : 'அனைத்து புத்தகங்களையும் பார்க்கவும்',
      'featured_books': isEnglish ? 'Featured Books' : 'சிறப்பு புத்தகங்கள்',
      'loading_books': isEnglish ? 'Loading books...' : 'புத்தகங்கள் ஏற்றப்படுகின்றன...',
      'retry': isEnglish ? 'Retry' : 'மீண்டும் முயற்சிக்கவும்',
      'no_books_found': isEnglish ? 'No books found' : 'புத்தகங்கள் எதுவும் கிடைக்கவில்லை',
      'clear_filters': isEnglish ? 'Clear Filters' : 'வடிகட்டிகளை அழிக்கவும்',
      'load_more': isEnglish ? 'Load More' : 'மேலும் ஏற்றவும்',
      'previous': isEnglish ? 'Previous' : 'முந்தைய',
      'next': isEnglish ? 'Next' : 'அடுத்த',
      'page': isEnglish ? 'Page' : 'பக்கம்',
      'of': isEnglish ? 'of' : 'இல்',
      'add_to_cart': isEnglish ? 'Add to Cart' : 'கார்ட்டில் சேர்க்கவும்',
      'bestseller': isEnglish ? 'Bestseller' : 'சிறந்த விற்பனை',
      'reviews': isEnglish ? 'reviews' : 'மதிப்புரைகள்',
      'shopping_cart': isEnglish ? 'Shopping Cart' : 'ஷாப்பிங் கார்ட்',
      'cart_empty': isEnglish ? 'Your cart is empty' : 'உங்கள் கார்ட் காலியாக உள்ளது',
      'total': isEnglish ? 'Total' : 'மொத்தம்',
      'checkout': isEnglish ? 'Checkout' : 'செக்அவுட்',
      'fiction': 'Fiction',
      'non_fiction': 'Non-Fiction',
      'academic': 'Academic',
      'children': 'Children',
      'poetry': 'Poetry',
      'history': 'History',
      'culture': 'Culture'
    };
    return translations[key] || key;
  };

  // State management
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Book categories
  const bookCategories = [
    {
      id: 'fiction',
      name: getText('fiction'),
      nameTamil: 'கற்பனை',
      color: '#667eea'
    },
    {
      id: 'non-fiction',
      name: getText('non_fiction'),
      nameTamil: 'உண்மை',
      color: '#f093fb'
    },
    {
      id: 'academic',
      name: getText('academic'),
      nameTamil: 'கல்வி',
      color: '#4facfe'
    },
    {
      id: 'children',
      name: getText('children'),
      nameTamil: 'குழந்தைகள்',
      color: '#43e97b'
    },
    {
      id: 'poetry',
      name: getText('poetry'),
      nameTamil: 'கவிதை',
      color: '#fa709a'
    },
    {
      id: 'history',
      name: getText('history'),
      nameTamil: 'வரலாறு',
      color: '#ffecd2'
    },
    {
      id: 'culture',
      name: getText('culture'),
      nameTamil: 'கலாச்சாரம்',
      color: '#a8edea'
    }
  ];

  // Load books from API
  const loadBooks = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await booksAPI.loadBooks({
        page: currentPage,
        limit: booksPerPage,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
        priceMax: priceRange[1] < 100 ? priceRange[1] : undefined,
        ...params
      });
      
      if (result.success) {
        if (params.loadMore) {
          setBooks(prev => [...prev, ...result.books]);
        } else {
          setBooks(result.books);
          setAllBooks(result.books);
        }
        setTotalPages(result.totalPages || 1);
        
        if (result.usingMockData) {
          console.warn('Using mock data - API not available');
        }
      } else {
        setError(result.error || 'Failed to load books');
      }
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  // Load books on component mount and when filters change
  useEffect(() => {
    loadBooks();
  }, []);
  
  // Reload books when filters change
  useEffect(() => {
    if (allBooks.length > 0) {
      setCurrentPage(1);
      loadBooks();
    }
  }, [selectedCategory, searchQuery, priceRange]);
  
  // Load more books when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadBooks({ loadMore: true });
    }
  }, [currentPage]);
  
  // Filter books for display (client-side filtering for better UX)
  useEffect(() => {
    let filtered = allBooks;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.titleTamil.includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authorTamil.includes(searchQuery)
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(book => 
      book.price >= priceRange[0] && book.price <= priceRange[1]
    );
    
    setFilteredBooks(filtered);
  }, [allBooks, selectedCategory, searchQuery, priceRange]);

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const paginationTotalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 100]);
    setCurrentPage(1);
  };

  // Load more functionality
  const loadMoreBooks = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.starFilled}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starFilled}>☆</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.starEmpty}>☆</span>);
    }
    
    return stars;
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    // Scroll to books grid
    const booksGrid = document.getElementById('books-grid');
    if (booksGrid) {
      booksGrid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle view all books
  const handleViewAllBooks = () => {
    setSelectedCategory('all');
    setCurrentPage(1);
    
    // Scroll to books grid
    const booksGrid = document.getElementById('books-grid');
    if (booksGrid) {
      booksGrid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.booksPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {isEnglish ? 'Discover Tamil Literature' : 'தமிழ் இலக்கியங்களை கண்டறியுங்கள்'}
          </motion.h1>
          
          <motion.h2 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {isEnglish ? 'Books Collection' : 'புத்தக தொகுப்பு'}
          </motion.h2>
          
          <motion.p 
            className={styles.heroQuote}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            "கல்வி கரையில் நின்று கற்பதல்ல, கடலில் மூழ்கி முத்தெடுப்பதே"
          </motion.p>
        </div>
      </section>

      {/* Shopping Cart Summary */}
      <div className={`${styles.cartSummary} ${showCart ? styles.cartOpen : ''}`}>
        <div className={styles.cartHeader}>
          <h3>{getText('shopping_cart')}</h3>
          <button 
            className={styles.cartClose}
            onClick={() => setShowCart(false)}
          >
            <span>✕</span>
          </button>
        </div>
        
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <p className={styles.emptyCart}>{getText('cart_empty')}</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.title} />
                <div className={styles.cartItemInfo}>
                  <h4>{isEnglish ? item.title : item.titleTamil}</h4>
                  <p>${item.price}</p>
                  <div className={styles.quantityControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button 
                  className={styles.removeItem}
                  onClick={() => removeFromCart(item.id)}
                >
                  <span>✕</span>
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className={styles.cartTotal}>
            <p><strong>{getText('total')}: ${getTotalPrice()}</strong></p>
            <button className={styles.checkoutBtn}>
              {getText('checkout')}
            </button>
          </div>
        )}
      </div>

      {/* Cart Toggle Button */}
      <button 
        className={styles.cartToggle}
        onClick={() => setShowCart(!showCart)}
      >
        <span>🛒</span>
        {getTotalItems() > 0 && (
          <span className={styles.cartBadge}>{getTotalItems()}</span>
        )}
      </button>

      {/* Search and Filter Section */}
      <section className={styles.searchFilter}>
        <div className={styles.container}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={getText('search_books')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.filterControls}>
            <button 
              className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>⚙️</span> {getText('filters')}
            </button>
            
            <button 
              className={styles.clearBtn}
              onClick={clearFilters}
            >
              {getText('clear_all')}
            </button>
          </div>
          
          {showFilters && (
            <motion.div 
              className={styles.filterPanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.filterGroup}>
                <label>{getText('category')}</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">{getText('all_categories')}</option>
                  {bookCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {isEnglish ? category.name : category.nameTamil}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>{getText('price_range')}</label>
                <div className={styles.priceRange}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className={styles.priceLabels}>
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Book Categories Section */}
      <section className={styles.bookCategories}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {getText('book_categories')}
          </motion.h2>
          
          <div className={styles.categoriesGrid}>
            {bookCategories.map((category, index) => {
              return (
                <motion.div
                  key={category.id}
                  className={styles.categoryCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleCategoryFilter(category.id)}
                  style={{ '--category-color': category.color }}
                >
                  <div className={styles.categoryIcon}>
                    <span>📚</span>
                  </div>
                  <h3>{isEnglish ? category.name : category.nameTamil}</h3>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div 
            className={styles.viewAllContainer}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button 
              className={styles.viewAllBtn}
              onClick={handleViewAllBooks}
            >
              {getText('view_all_books')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Books Grid Section */}
      <section className={styles.booksGrid} id="books-grid">
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {getText('featured_books')}
          </motion.h2>
          
          {/* Error State */}
          {error && (
            <motion.div 
              className={styles.errorMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>{error}</p>
              <button 
                className={styles.retryBtn}
                onClick={() => loadBooks()}
              >
                {getText('retry')}
              </button>
            </motion.div>
          )}
          
          {/* Loading State */}
          {loading && (
            <motion.div 
              className={styles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.loadingSpinner}></div>
              <p>{getText('loading_books')}</p>
            </motion.div>
          )}
          
          {/* Books Container */}
          {!loading && !error && (
            <div className={styles.booksContainer}>
              <AnimatePresence>
                {currentBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    className={styles.bookCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className={styles.bookImage}>
                      <img src={book.image} alt={book.title} />
                      {book.bestseller && (
                        <span className={styles.bestsellerBadge}>
                          {getText('bestseller')}
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.bookInfo}>
                      <h3 className={styles.bookTitle}>
                        {isEnglish ? book.title : book.titleTamil}
                      </h3>
                      <p className={styles.bookAuthor}>
                        {isEnglish ? book.author : book.authorTamil}
                      </p>
                      
                      <div className={styles.bookRating}>
                        {renderStars(book.rating)}
                        <span className={styles.reviewCount}>
                          ({book.reviews} {getText('reviews')})
                        </span>
                      </div>
                      
                      <div className={styles.bookPrice}>
                        <span className={styles.currentPrice}>${book.price}</span>
                        {book.originalPrice > book.price && (
                          <span className={styles.originalPrice}>${book.originalPrice}</span>
                        )}
                      </div>
                      
                      <motion.button
                        className={styles.addToCartBtn}
                        onClick={() => addToCart(book)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {getText('add_to_cart')}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* No Books Found */}
          {!loading && !error && filteredBooks.length === 0 && (
            <motion.div 
              className={styles.noBooksFound}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>{getText('no_books_found')}</p>
              <button 
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                {getText('clear_filters')}
              </button>
            </motion.div>
          )}
          
          {/* Load More Button */}
          {!loading && !error && currentPage < totalPages && (
            <motion.div 
              className={styles.loadMoreContainer}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <button 
                className={styles.loadMoreBtn}
                onClick={loadMoreBooks}
              >
                {getText('load_more')}
              </button>
            </motion.div>
          )}
          
          {/* Pagination */}
          {!loading && !error && paginationTotalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                {getText('previous')}
              </button>
              
              <span className={styles.pageInfo}>
                {getText('page')} {currentPage} {getText('of')} {paginationTotalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationTotalPages))}
                disabled={currentPage === paginationTotalPages}
                className={styles.paginationBtn}
              >
                {getText('next')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Books;