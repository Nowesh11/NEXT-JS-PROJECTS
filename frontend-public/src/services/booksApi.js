// Books API Service
class BooksAPI {
  constructor() {
    this.baseURL = typeof window !== 'undefined' && window.TLS_API_BASE_URL 
      ? window.TLS_API_BASE_URL 
      : '/api'; // Use local Next.js API routes
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

  // Transform book data from API response
  transformBookData(book) {
    return {
      id: book._id || book.id,
      title: book.title || 'Untitled',
      titleTamil: book.titleTamil || book.title?.ta || book.title,
      author: book.author || 'Unknown Author',
      authorTamil: book.authorTamil || book.author?.ta || book.author,
      category: book.category || 'general',
      price: parseFloat(book.price) || 0,
      originalPrice: parseFloat(book.originalPrice || book.price) || 0,
      image: book.image || book.coverImage || '/images/default-book.jpg',
      coverImage: book.coverImage || book.image || '/images/default-book.jpg',
      rating: parseFloat(book.rating) || 0,
      reviews: parseInt(book.reviews || book.reviewCount) || 0,
      reviewCount: parseInt(book.reviewCount || book.reviews) || 0,
      description: book.description || '',
      descriptionTamil: book.descriptionTamil || book.description?.ta || book.description,
      featured: Boolean(book.featured),
      bestseller: Boolean(book.bestseller),
      inStock: Boolean(book.inStock !== false && book.stock !== 0),
      stock: parseInt(book.stock) || 0,
      isbn: book.isbn || '',
      publishedDate: book.publishedDate || book.published_date,
      publisher: book.publisher || '',
      pages: parseInt(book.pages) || 0,
      language: book.language || 'tamil',
      tags: Array.isArray(book.tags) ? book.tags : [],
      createdAt: book.createdAt || book.created_at || new Date().toISOString(),
      updatedAt: book.updatedAt || book.updated_at || new Date().toISOString()
    };
  }



  // Load books from API only
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
        console.error('API failed:', result.error);
        return {
          success: false,
          error: result.error,
          books: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0
        };
      }
    } catch (error) {
      console.error('Error loading books:', error);
      return {
        success: false,
        error: error.message,
        books: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      };
    }
  }
}

// Create and export singleton instance
const booksAPI = new BooksAPI();
export default booksAPI;

// Also export the class for custom instances
export { BooksAPI };