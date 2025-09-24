// Books API Service
class BooksAPI {
  constructor() {
    this.baseURL = typeof window !== 'undefined' && window.TLS_API_BASE_URL 
      ? window.TLS_API_BASE_URL 
      : 'http://localhost:8080';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // Get auth token
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Generic fetch with retry logic
  async fetchWithRetry(url, options = {}, retries = this.maxRetries) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📚 API Request (attempt ${attempt}/${retries}): ${url}`);
        
        const response = await fetch(url, defaultOptions);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Request successful');
          return { success: true, data: data.data || data };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ API Request failed (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          return { success: false, error: error.message };
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Fetch all books
  async fetchBooks(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    if (params.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.priceMin) {
      queryParams.append('priceMin', params.priceMin);
    }
    if (params.priceMax) {
      queryParams.append('priceMax', params.priceMax);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }

    const url = `${this.baseURL}/api/books${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        books: result.data.books || result.data,
        totalCount: result.data.totalCount || result.data.length,
        currentPage: result.data.currentPage || 1,
        totalPages: result.data.totalPages || 1
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Fetch featured books
  async fetchFeaturedBooks(limit = 6) {
    const url = `${this.baseURL}/api/books/featured?limit=${limit}`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        books: result.data.books || result.data
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Fetch book by ID
  async fetchBookById(id) {
    const url = `${this.baseURL}/api/books/${id}`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        book: result.data.book || result.data
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Fetch books by category
  async fetchBooksByCategory(category, limit = 12) {
    const url = `${this.baseURL}/api/books/category/${category}?limit=${limit}`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        books: result.data.books || result.data
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Search books
  async searchBooks(query, filters = {}) {
    const params = {
      search: query,
      ...filters
    };
    
    return await this.fetchBooks(params);
  }

  // Get book categories
  async fetchCategories() {
    const url = `${this.baseURL}/api/books/categories`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        categories: result.data.categories || result.data
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Rate a book
  async rateBook(bookId, rating, review = '') {
    const url = `${this.baseURL}/api/books/${bookId}/rate`;
    const result = await this.fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        review
      })
    });
    
    if (result.success) {
      return {
        success: true,
        message: 'Rating submitted successfully'
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Get book reviews
  async fetchBookReviews(bookId, page = 1, limit = 10) {
    const url = `${this.baseURL}/api/books/${bookId}/reviews?page=${page}&limit=${limit}`;
    const result = await this.fetchWithRetry(url);
    
    if (result.success) {
      return {
        success: true,
        reviews: result.data.reviews || result.data,
        totalCount: result.data.totalCount || 0,
        currentPage: result.data.currentPage || 1,
        totalPages: result.data.totalPages || 1
      };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Transform book data for consistency
  transformBookData(book) {
    return {
      id: book._id || book.id,
      title: book.title || '',
      titleTamil: book.titleTamil || book.title_tamil || '',
      author: book.author || '',
      authorTamil: book.authorTamil || book.author_tamil || '',
      category: book.category || 'general',
      price: parseFloat(book.price) || 0,
      originalPrice: parseFloat(book.originalPrice || book.original_price) || parseFloat(book.price) || 0,
      image: book.image || book.coverImage || '/images/books/default-book.jpg',
      rating: parseFloat(book.rating) || 0,
      reviews: parseInt(book.reviewCount || book.reviews) || 0,
      description: book.description || '',
      descriptionTamil: book.descriptionTamil || book.description_tamil || '',
      featured: Boolean(book.featured),
      bestseller: Boolean(book.bestseller),
      inStock: Boolean(book.inStock !== false),
      isbn: book.isbn || '',
      publishedDate: book.publishedDate || book.published_date || '',
      publisher: book.publisher || '',
      pages: parseInt(book.pages) || 0,
      language: book.language || 'tamil',
      tags: Array.isArray(book.tags) ? book.tags : [],
      createdAt: book.createdAt || book.created_at || new Date().toISOString(),
      updatedAt: book.updatedAt || book.updated_at || new Date().toISOString()
    };
  }

  // Get mock data for development/fallback
  getMockBooks() {
    return [
      {
        id: 1,
        title: 'Tamil Literature Classics',
        titleTamil: 'தமிழ் இலக்கிய சிறப்பு',
        author: 'Dr. Tamil Scholar',
        authorTamil: 'டாக்டர் தமிழ் அறிஞர்',
        category: 'fiction',
        price: 15.99,
        originalPrice: 19.99,
        image: '/images/books/book1.jpg',
        rating: 4.5,
        reviews: 128,
        description: 'A comprehensive collection of Tamil literary works.',
        descriptionTamil: 'தமிழ் இலக்கிய படைப்புகளின் விரிவான தொகுப்பு.',
        featured: true,
        bestseller: true,
        inStock: true
      },
      {
        id: 2,
        title: 'Modern Tamil Poetry',
        titleTamil: 'நவீன தமிழ் கவிதைகள்',
        author: 'Kavitha Raman',
        authorTamil: 'கவிதா ராமன்',
        category: 'poetry',
        price: 12.99,
        originalPrice: 16.99,
        image: '/images/books/book2.jpg',
        rating: 4.2,
        reviews: 89,
        description: 'Contemporary Tamil poetry collection.',
        descriptionTamil: 'சமகால தமிழ் கவிதை தொகுப்பு.',
        featured: true,
        bestseller: false,
        inStock: true
      },
      {
        id: 3,
        title: 'Tamil Grammar Guide',
        titleTamil: 'தமிழ் இலக்கண வழிகாட்டி',
        author: 'Prof. Linguistics',
        authorTamil: 'பேராசிரியர் மொழியியல்',
        category: 'academic',
        price: 24.99,
        originalPrice: 29.99,
        image: '/images/books/book3.jpg',
        rating: 4.7,
        reviews: 156,
        description: 'Complete guide to Tamil grammar and linguistics.',
        descriptionTamil: 'தமிழ் இலக்கணம் மற்றும் மொழியியலுக்கான முழுமையான வழிகாட்டி.',
        featured: false,
        bestseller: false,
        inStock: true
      },
      {
        id: 4,
        title: 'Children Tamil Stories',
        titleTamil: 'குழந்தைகள் தமிழ் கதைகள்',
        author: 'Story Teller',
        authorTamil: 'கதை சொல்லி',
        category: 'children',
        price: 8.99,
        originalPrice: 12.99,
        image: '/images/books/book4.jpg',
        rating: 4.8,
        reviews: 203,
        description: 'Engaging stories for Tamil children.',
        descriptionTamil: 'தமிழ் குழந்தைகளுக்கான சுவாரஸ்யமான கதைகள்.',
        featured: true,
        bestseller: true,
        inStock: true
      },
      {
        id: 5,
        title: 'Tamil History Chronicles',
        titleTamil: 'தமிழ் வரலாற்று குறிப்புகள்',
        author: 'Historian Tamil',
        authorTamil: 'வரலாற்றாசிரியர் தமிழ்',
        category: 'non-fiction',
        price: 18.99,
        originalPrice: 22.99,
        image: '/images/books/book5.jpg',
        rating: 4.4,
        reviews: 97,
        description: 'Comprehensive Tamil historical documentation.',
        descriptionTamil: 'விரிவான தமிழ் வரலாற்று ஆவணங்கள்.',
        featured: false,
        bestseller: false,
        inStock: true
      },
      {
        id: 6,
        title: 'Tamil Cultural Studies',
        titleTamil: 'தமிழ் கலாச்சார ஆய்வுகள்',
        author: 'Cultural Expert',
        authorTamil: 'கலாச்சார நிபுணர்',
        category: 'academic',
        price: 21.99,
        originalPrice: 26.99,
        image: '/images/books/book6.jpg',
        rating: 4.3,
        reviews: 74,
        description: 'In-depth study of Tamil culture and traditions.',
        descriptionTamil: 'தமிழ் கலாச்சாரம் மற்றும் பாரம்பரியங்களின் ஆழமான ஆய்வு.',
        featured: true,
        bestseller: false,
        inStock: true
      }
    ];
  }

  // Load books with fallback to mock data
  async loadBooks(params = {}) {
    try {
      const result = await this.fetchBooks(params);
      
      if (result.success) {
        // Transform the data
        const transformedBooks = result.books.map(book => this.transformBookData(book));
        return {
          success: true,
          books: transformedBooks,
          totalCount: result.totalCount,
          currentPage: result.currentPage,
          totalPages: result.totalPages
        };
      } else {
        console.warn('API failed, using mock data:', result.error);
        const mockBooks = this.getMockBooks();
        return {
          success: true,
          books: mockBooks,
          totalCount: mockBooks.length,
          currentPage: 1,
          totalPages: 1,
          usingMockData: true
        };
      }
    } catch (error) {
      console.error('Error loading books:', error);
      const mockBooks = this.getMockBooks();
      return {
        success: true,
        books: mockBooks,
        totalCount: mockBooks.length,
        currentPage: 1,
        totalPages: 1,
        usingMockData: true
      };
    }
  }
}

// Create and export singleton instance
const booksAPI = new BooksAPI();
export default booksAPI;

// Also export the class for custom instances
export { BooksAPI };