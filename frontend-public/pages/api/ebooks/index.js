// API endpoint for fetching ebooks in frontend-public
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
const COLLECTIONS = {
  EBOOKS: 'ebooks'
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
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);

    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      bookLanguage = '',
      format = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = { status: 'active' }; // Only show active ebooks
    
    if (search) {
      filter.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ta': { $regex: search, $options: 'i' } },
        { 'author.en': { $regex: search, $options: 'i' } },
        { 'author.ta': { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ta': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (bookLanguage && bookLanguage !== 'all') {
      filter.bookLanguage = bookLanguage;
    }

    if (format && format !== 'all') {
      filter.format = format;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get ebooks with pagination
    const ebooks = await ebooksCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalCount = await ebooksCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform ebooks for frontend consumption
    const transformedEbooks = ebooks.map(ebook => ({
      _id: ebook._id,
      id: ebook._id,
      title: ebook.title,
      author: ebook.author,
      category: ebook.category,
      price: ebook.price,
      originalPrice: ebook.originalPrice || ebook.price,
      coverImage: ebook.coverImage,
      image: ebook.coverImage, // Alias for compatibility
      rating: ebook.rating || 0,
      reviewCount: ebook.reviewCount || 0,
      reviews: ebook.reviewCount || 0, // Alias for compatibility
      description: ebook.description,
      featured: ebook.featured || false,
      bestseller: ebook.bestseller || false,
      format: ebook.format,
      fileSize: ebook.fileSize,
      downloadUrl: ebook.downloadUrl,
      previewUrl: ebook.previewUrl,
      bookLanguage: ebook.bookLanguage,
      isbn: ebook.isbn,
      publishedDate: ebook.publishedDate,
      publisher: ebook.publisher,
      pages: ebook.pages,
      tags: ebook.tags || [],
      createdAt: ebook.createdAt,
      updatedAt: ebook.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        ebooks: transformedEbooks,
        totalCount,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
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
}
