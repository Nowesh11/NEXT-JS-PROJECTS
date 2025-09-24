// API endpoint for fetching books in frontend-public
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls_platform';
const COLLECTIONS = {
  BOOKS: 'books'
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      priceMin = '',
      priceMax = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Connect to database
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTIONS.BOOKS);

    // Build query
    let query = { status: 'active' };

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (priceMin) {
      query.price = { ...query.price, $gte: parseFloat(priceMin) };
    }

    if (priceMax) {
      query.price = { ...query.price, $lte: parseFloat(priceMax) };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalBooks = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limitNum);

    // Fetch books with pagination
    const books = await collection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Format response
    const formattedBooks = books.map(book => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      originalPrice: book.originalPrice || book.price,
      coverImage: book.coverImage,
      image: book.coverImage, // Alias for compatibility
      rating: book.rating || 0,
      reviewCount: book.reviewCount || 0,
      reviews: book.reviewCount || 0, // Alias for compatibility
      description: book.description,
      featured: book.featured || false,
      bestseller: book.bestseller || false,
      inStock: book.stock > 0,
      stock: book.stock,
      isbn: book.isbn,
      publishedDate: book.publishedDate,
      publisher: book.publisher,
      pages: book.pages,
      language: book.language,
      tags: book.tags || [],
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Books API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
