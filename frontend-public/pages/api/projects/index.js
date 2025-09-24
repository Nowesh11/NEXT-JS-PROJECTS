// API endpoint for fetching projects in frontend-public
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
const COLLECTIONS = {
  PROJECTS: 'projects'
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
    const projectsCollection = db.collection(COLLECTIONS.PROJECTS);

    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = { status: { $ne: 'draft' } }; // Show all except draft projects
    
    if (search) {
      filter.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ta': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ta': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get projects with pagination
    const projects = await projectsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalCount = await projectsCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform projects for frontend consumption
    const transformedProjects = projects.map(project => ({
      _id: project._id,
      id: project._id,
      title: project.title,
      description: project.description,
      category: project.category,
      status: project.status,
      featured: project.featured || false,
      images: project.images || [],
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      teamMembers: project.teamMembers || [],
      tags: project.tags || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        projects: transformedProjects,
        totalCount,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
