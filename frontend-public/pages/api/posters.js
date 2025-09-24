// API endpoint for fetching posters in frontend-public
// Using MongoDB database

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'tls_database';

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(MONGODB_DB);
}

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to database
    const db = await connectToDatabase();
    const collection = db.collection('posters');

    // Get query parameters
    const { category, featured } = req.query;

    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Fetch posters from database
    const posters = await collection.find(query).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: posters
    });

  } catch (error) {
    console.error('Posters API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
