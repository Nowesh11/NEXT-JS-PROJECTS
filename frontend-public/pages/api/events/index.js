// API endpoint for fetching events in frontend-public
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls_platform';
const COLLECTIONS = {
  ACTIVITIES: 'activities'
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
      status = '',
      upcoming = '',
      sortBy = 'eventDate',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Connect to database
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTIONS.ACTIVITIES);

    // Build query
    let query = { status: 'active' };

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (status && status !== 'active') {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.eventDate = { $gt: new Date() };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalEvents = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limitNum);

    // Fetch events with pagination
    const events = await collection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Format response
    const formattedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      endDate: event.endDate,
      location: event.location,
      category: event.category,
      status: event.status,
      featured: event.featured || false,
      image: event.image,
      organizer: event.organizer,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees || 0,
      registrationDeadline: event.registrationDeadline,
      price: event.price || 0,
      tags: event.tags || [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedEvents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEvents,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
