const express = require('express');
const router = express.Router();

// Mock data for testing
const mockEbooks = [
  {
    _id: '1',
    title: { en: 'Tamil Literature Classics', ta: 'தமிழ் இலக்கிய சிறப்பு' },
    author: { en: 'Dr. Tamil Scholar', ta: 'டாக்டர் தமிழ் அறிஞர்' },
    category: 'fiction',
    price: 15.99,
    originalPrice: 19.99,
    coverImage: '/images/books/book1.jpg',
    rating: 4.5,
    reviewCount: 128,
    description: { en: 'A comprehensive collection of Tamil literary works.', ta: 'தமிழ் இலக்கிய படைப்புகளின் விரிவான தொகுப்பு.' },
    featured: true,
    bestseller: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: { en: 'Modern Tamil Poetry', ta: 'நவீன தமிழ் கவிதைகள்' },
    author: { en: 'Kavitha Raman', ta: 'கவிதா ராமன்' },
    category: 'poetry',
    price: 12.99,
    originalPrice: 16.99,
    coverImage: '/images/books/book2.jpg',
    rating: 4.2,
    reviewCount: 89,
    description: { en: 'Contemporary Tamil poetry collection.', ta: 'சமகால தமிழ் கவிதை தொகுப்பு.' },
    featured: true,
    bestseller: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    title: { en: 'Tamil Grammar Guide', ta: 'தமிழ் இலக்கண வழிகாட்டி' },
    author: { en: 'Prof. Linguistics', ta: 'பேராசிரியர் மொழியியல்' },
    category: 'academic',
    price: 24.99,
    originalPrice: 29.99,
    coverImage: '/images/books/book3.jpg',
    rating: 4.7,
    reviewCount: 156,
    description: { en: 'Complete guide to Tamil grammar and linguistics.', ta: 'தமிழ் இலக்கணம் மற்றும் மொழியியலுக்கான முழுமையான வழிகாட்டி.' },
    featured: false,
    bestseller: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/ebooks - Get all ebooks with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      search,
      featured,
      newArrival,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filteredEbooks = [...mockEbooks];
    
    // Filter by status
    if (status) {
      filteredEbooks = filteredEbooks.filter(ebook => ebook.status === status);
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filteredEbooks = filteredEbooks.filter(ebook => ebook.category === category);
    }
    
    // Filter by flags
    if (featured === 'true') {
      filteredEbooks = filteredEbooks.filter(ebook => ebook.featured === true);
    }
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEbooks = filteredEbooks.filter(ebook => 
        ebook.title.en.toLowerCase().includes(searchLower) ||
        ebook.title.ta.includes(search) ||
        ebook.author.en.toLowerCase().includes(searchLower) ||
        ebook.author.ta.includes(search) ||
        ebook.description.en.toLowerCase().includes(searchLower) ||
        ebook.description.ta.includes(search)
      );
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEbooks = filteredEbooks.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        ebooks: paginatedEbooks,
        total: filteredEbooks.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredEbooks.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/ebooks/:id - Get single ebook
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ebook = mockEbooks.find(book => book._id === id);
    
    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'Ebook not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ebook
    });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;