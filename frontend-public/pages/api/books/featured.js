// API endpoint for fetching featured books in frontend-public
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
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
    const { db } = await connectToDatabase();
    const booksCollection = db.collection(COLLECTIONS.BOOKS);

    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    // Get featured books
    const books = await booksCollection
      .find({ 
        status: 'active',
        featured: true 
      })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .toArray();

    // Transform books for frontend consumption
    const transformedBooks = books.map(book => ({
      _id: book._id,
      id: book._id,
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
      data: {
        books: transformedBooks
      }
    });

  } catch (error) {
    console.error('Error fetching featured books:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
