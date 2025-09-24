import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function BooksPage() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState('grid');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Load sample books data
    loadBooks();
    
    // Set loading to false after initialization
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const loadBooks = async () => {
    // Sample books data - in real app, this would come from API
    const sampleBooks = [
      {
        id: 1,
        title: "திருக்குறள் விளக்கம்",
        titleEn: "Thirukkural Commentary",
        author: "Tamil Language Society",
        category: "classical",
        price: 25.99,
        rating: 4.9,
        reviews: 245,
        image: "/images/books/thirukkural.jpg",
        description: "A comprehensive commentary on Thirukkural, the ancient Tamil text of ethics and morality."
      },
      {
        id: 2,
        title: "நவீன தமிழ் கவிதைகள்",
        titleEn: "Modern Tamil Poetry",
        author: "Various Authors",
        category: "poetry",
        price: 18.50,
        rating: 4.7,
        reviews: 189,
        image: "/images/books/poetry.jpg",
        description: "A collection of contemporary Tamil poems by renowned poets."
      },
      {
        id: 3,
        title: "தமிழ் இலக்கண வரலாறு",
        titleEn: "History of Tamil Grammar",
        author: "Dr. K. Rajendran",
        category: "educational",
        price: 32.00,
        rating: 4.8,
        reviews: 156,
        image: "/images/books/grammar.jpg",
        description: "An in-depth study of Tamil grammar evolution through the ages."
      },
      {
        id: 4,
        title: "குழந்தைகளுக்கான தமிழ் கதைகள்",
        titleEn: "Tamil Stories for Children",
        author: "Sita Devi",
        category: "children",
        price: 15.99,
        rating: 4.6,
        reviews: 298,
        image: "/images/books/children.jpg",
        description: "Engaging Tamil stories that teach moral values to children."
      }
    ];
    
    setBooks(sampleBooks);
  };

  const categories = [
    { id: 'all', name: { en: 'All Categories', ta: 'அனைத்து வகைகள்' } },
    { id: 'classical', name: { en: 'Classical Literature', ta: 'பாரம்பரிய இலக்கியம்' } },
    { id: 'poetry', name: { en: 'Poetry', ta: 'கவிதை' } },
    { id: 'modern', name: { en: 'Modern Literature', ta: 'நவீன இலக்கியம்' } },
    { id: 'educational', name: { en: 'Educational', ta: 'கல்வி' } },
    { id: 'children', name: { en: 'Children\'s Books', ta: 'குழந்தைகள் நூல்கள்' } }
  ];

  const sortOptions = [
    { id: 'title', name: { en: 'Title', ta: 'தலைப்பு' } },
    { id: 'author', name: { en: 'Author', ta: 'ஆசிரியர்' } },
    { id: 'price', name: { en: 'Price', ta: 'விலை' } },
    { id: 'rating', name: { en: 'Rating', ta: 'மதிப்பீடு' } }
  ];

  // Filter and sort books
  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return language === 'en' ? a.titleEn.localeCompare(b.titleEn) : a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Books Collection...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Books Collection - Tamil Language Society</title>
        <meta name="description" content="Discover our extensive collection of Tamil literature, educational books, and cultural publications." />
        <meta name="keywords" content="Tamil books, literature, education, cultural publications" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <h1 className="hero-title">
                {language === 'en' ? 'Books Collection' : 'புத்தக தொகுப்பு'}
              </h1>
              <p className="hero-subtitle">
                {language === 'en' 
                  ? 'Discover the rich heritage of Tamil literature' 
                  : 'தமிழ் இலக்கியத்தின் வளமான பாரம்பரியத்தை கண்டறியுங்கள்'
                }
              </p>
              <p className="hero-description">
                {language === 'en'
                  ? 'Explore our extensive collection of Tamil books, from classical literature to modern works, carefully curated to preserve and promote Tamil literary heritage.'
                  : 'பாரம்பரிய இலக்கியம் முதல் நவீன படைப்புகள் வரை, தமிழ் இலக்கிய பாரம்பரியத்தை பாதுகாக்க மற்றும் ஊக்குவிக்க கவனமாக தேர்ந்தெடுக்கப்பட்ட எங்கள் விரிவான தமிழ் புத்தக தொகுப்பை ஆராயுங்கள்.'
                }
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="filter-section">
          <div className="container">
            <div className="filter-controls">
              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search books...' : 'புத்தகங்களைத் தேடுங்கள்...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name[language]}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {language === 'en' ? 'Sort by' : 'வரிसैप्पडुत्तु'} {option.name[language]}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Books Display Section */}
        <section className="books-section">
          <div className="container">
            {sortedBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="no-books"
              >
                <div className="no-books-icon">📚</div>
                <h3 className="no-books-title">
                  {language === 'en' ? 'No books found' : 'நூல்கள் கிடைக்கவில்லை'}
                </h3>
                <p className="no-books-text">
                  {language === 'en' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'உங்கள் தேடல் அல்லது வடிப்பான் அளவுகோல்களை சரிசெய்ய முயற்சிக்கவும்'
                  }
                </p>
              </motion.div>
            ) : (
              <div className={`books-grid ${viewMode}`}>
                {sortedBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="book-card"
                  >
                    <div className="book-image">
                      <img 
                        src={book.image} 
                        alt={language === 'en' ? book.titleEn : book.title}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-book.jpg';
                        }}
                      />
                      <div className="book-overlay">
                        <button className="btn btn-primary">
                          {language === 'en' ? 'View Details' : 'விவரங்களைப் பார்க்கவும்'}
                        </button>
                      </div>
                    </div>
                    <div className="book-info">
                      <h3 className="book-title">
                        {language === 'en' ? book.titleEn : book.title}
                      </h3>
                      <p className="book-author">{book.author}</p>
                      <div className="book-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star ${i < Math.floor(book.rating) ? 'filled' : ''}`}
                            ></i>
                          ))}
                        </div>
                        <span className="rating-text">
                          {book.rating} ({book.reviews} {language === 'en' ? 'reviews' : 'மதிப்புரைகள்'})
                        </span>
                      </div>
                      <div className="book-price">₹{book.price}</div>
                      <button className="btn btn-outline add-to-cart">
                        {language === 'en' ? 'Add to Cart' : 'கார்ட்டில் சேர்க்கவும்'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scripts */}
      <Script 
        src="/js/api-integration.js" 
        strategy="afterInteractive"
      />
      
      <Script 
        src="/js/content-manager.js" 
        strategy="afterInteractive"
      />

      <style jsx global>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--color-bg, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border-light, #e5e7eb);
          border-top: 4px solid var(--color-primary, #1e3a8a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .hero-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, var(--color-primary, #1e3a8a) 0%, var(--color-secondary, #7c3aed) 100%);
          color: white;
          text-align: center;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          opacity: 0.8;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .filter-section {
          padding: 2rem 0;
          background: var(--color-bg-secondary, #f8fafc);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary, #1e3a8a);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary, #64748b);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          font-size: 1rem;
          background: white;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          border: 2px solid var(--border-light, #e5e7eb);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .view-btn {
          padding: 0.75rem 1rem;
          border: none;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: var(--color-primary, #1e3a8a);
          color: white;
        }

        .books-section {
          padding: 3rem 0;
        }

        .books-grid {
          display: grid;
          gap: 2rem;
        }

        .books-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .books-grid.list {
          grid-template-columns: 1fr;
        }

        .book-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .book-image {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .book-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .book-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .book-card:hover .book-overlay {
          opacity: 1;
        }

        .book-info {
          padding: 1.5rem;
        }

        .book-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary, #1e3a8a);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .book-author {
          color: var(--text-secondary, #64748b);
          margin-bottom: 1rem;
        }

        .book-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .stars .fa-star {
          color: #e5e7eb;
          font-size: 0.875rem;
        }

        .stars .fa-star.filled {
          color: #fbbf24;
        }

        .rating-text {
          font-size: 0.875rem;
          color: var(--text-secondary, #64748b);
        }

        .book-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary, #1e3a8a);
          margin-bottom: 1rem;
        }

        .add-to-cart {
          width: 100%;
        }

        .no-books {
          text-align: center;
          padding: 4rem 0;
        }

        .no-books-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-books-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary, #1e3a8a);
          margin-bottom: 0.5rem;
        }

        .no-books-text {
          color: var(--text-secondary, #64748b);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary, #1e3a8a) 0%, var(--color-secondary, #7c3aed) 100%);
          color: white;
        }

        .btn-primary:hover {
          box-shadow: 0 10px 25px -3px rgba(30, 58, 138, 0.3);
        }

        .btn-outline {
          background: transparent;
          color: var(--color-primary, #1e3a8a);
          border: 2px solid var(--color-primary, #1e3a8a);
        }

        .btn-outline:hover {
          background: var(--color-primary, #1e3a8a);
          color: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            min-width: auto;
          }
          
          .books-grid.grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
