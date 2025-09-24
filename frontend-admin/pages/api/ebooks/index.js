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
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);

    switch (req.method) {
      case 'GET':
        return await handleGetEbooks(req, res, ebooksCollection);
      case 'POST':
        return await handleCreateEbook(req, res, ebooksCollection);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('E-books API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/ebooks - Get all e-books with pagination and filtering
async function handleGetEbooks(req, res, ebooksCollection) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      format = '',
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
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (format) {
      filter.format = format;
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

    // Get e-books with pagination
    const ebooks = await ebooksCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalEbooks = await ebooksCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalEbooks / limitNum);

    // Get category statistics
    const categoryStats = await ebooksCollection.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get format statistics
    const formatStats = await ebooksCollection.aggregate([
      { $match: filter },
      { $group: { _id: '$format', count: { $sum: 1 } } }
    ]).toArray();

    // Get status statistics
    const statusStats = await ebooksCollection.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    return res.status(200).json({
      ebooks,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEbooks,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      statistics: {
        categories: categoryStats,
        formats: formatStats,
        statuses: statusStats
      }
    });
  } catch (error) {
    console.error('Get e-books error:', error);
    return res.status(500).json({ error: 'Failed to fetch e-books' });
  }
}

// Handle POST /api/ebooks - Create new e-book
async function handleCreateEbook(req, res, ebooksCollection) {
  try {
    const ebookData = req.body;

    // Validate required fields
    const validationErrors = validateData(ebookData, SCHEMAS.EBOOK);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if e-book with same title and author already exists
    const existingEbook = await ebooksCollection.findOne({ 
      title: ebookData.title,
      author: ebookData.author
    });
    
    if (existingEbook) {
      return res.status(409).json({ 
        error: 'E-book with this title and author already exists' 
      });
    }

    // Validate file format
    if (!['pdf', 'epub', 'mobi'].includes(ebookData.format)) {
      return res.status(400).json({ 
        error: 'Format must be one of: pdf, epub, mobi' 
      });
    }

    // Prepare e-book data
    const newEbook = {
      ...ebookData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ebookData.status || 'active',
      // Generate a simple slug for SEO
      slug: ebookData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      // Track download count
      downloadCount: 0,
      // File metadata
      fileMetadata: {
        uploadedAt: new Date(),
        originalName: ebookData.originalFileName || ebookData.title,
        mimeType: getMimeTypeFromFormat(ebookData.format)
      }
    };

    // Insert e-book
    const result = await ebooksCollection.insertOne(newEbook);
    
    if (!result.insertedId) {
      return res.status(500).json({ error: 'Failed to create e-book' });
    }

    // Get created e-book
    const createdEbook = await ebooksCollection.findOne({ _id: result.insertedId });

    return res.status(201).json({
      message: 'E-book created successfully',
      ebook: createdEbook
    });
  } catch (error) {
    console.error('Create e-book error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'E-book with this title and author already exists' 
      });
    }
    
    return res.status(500).json({ error: 'Failed to create e-book' });
  }
}

// Helper function to get MIME type from format
function getMimeTypeFromFormat(format) {
  const mimeTypes = {
    pdf: 'application/pdf',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook'
  };
  return mimeTypes[format] || 'application/octet-stream';
}

// Export helper functions for testing
export { validateAdminToken, handleGetEbooks, handleCreateEbook, getMimeTypeFromFormat };