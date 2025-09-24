import { connectToDatabase, COLLECTIONS, SCHEMAS, validateData } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Validate admin token (mock implementation)
function validateAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  // Mock validation - in production, verify JWT token
  return token && token.length > 10;
}

export default async function handler(req, res) {
  // Validate authentication
  if (!validateAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    const booksCollection = db.collection(COLLECTIONS.BOOKS);

    switch (req.method) {
      case 'GET':
        return await handleGetBooks(req, res, booksCollection);
      case 'POST':
        return await handleCreateBook(req, res, booksCollection);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Books API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/books - Get all books with pagination and filtering
async function handleGetBooks(req, res, booksCollection) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice = '',
      maxPrice = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get books with pagination
    const books = await booksCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalBooks = await booksCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalBooks / limitNum);

    // Get category statistics
    const categoryStats = await booksCollection.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get status statistics
    const statusStats = await booksCollection.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    return res.status(200).json({
      books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      statistics: {
        categories: categoryStats,
        statuses: statusStats
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
}

// Handle POST /api/books - Create new book
async function handleCreateBook(req, res, booksCollection) {
  try {
    const bookData = req.body;

    // Validate required fields
    const validationErrors = validateData(bookData, SCHEMAS.BOOK);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if book with same ISBN already exists (if ISBN provided)
    if (bookData.isbn) {
      const existingBook = await booksCollection.findOne({ isbn: bookData.isbn });
      if (existingBook) {
        return res.status(409).json({ error: 'Book with this ISBN already exists' });
      }
    }

    // Prepare book data
    const newBook = {
      ...bookData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: bookData.status || 'active',
      stock: bookData.stock || 0,
      images: bookData.images || [],
      // Generate a simple slug for SEO
      slug: bookData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    // Insert book
    const result = await booksCollection.insertOne(newBook);
    
    if (!result.insertedId) {
      return res.status(500).json({ error: 'Failed to create book' });
    }

    // Get created book
    const createdBook = await booksCollection.findOne({ _id: result.insertedId });

    return res.status(201).json({
      message: 'Book created successfully',
      book: createdBook
    });
  } catch (error) {
    console.error('Create book error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to create book' });
  }
}

// Export helper functions for testing
export { validateAdminToken, handleGetBooks, handleCreateBook };