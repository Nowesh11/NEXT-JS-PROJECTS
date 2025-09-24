// API endpoint for fetching team members in frontend-public
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
const COLLECTIONS = {
  TEAM: 'team'
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
    const teamCollection = db.collection(COLLECTIONS.TEAM);

    const {
      page = 1,
      limit = 12,
      search = '',
      department = '',
      position = '',
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = { status: 'active' }; // Only show active team members
    
    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ta': { $regex: search, $options: 'i' } },
        { 'position.en': { $regex: search, $options: 'i' } },
        { 'position.ta': { $regex: search, $options: 'i' } },
        { 'department.en': { $regex: search, $options: 'i' } },
        { 'department.ta': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department && department !== 'all') {
      filter['department.en'] = department;
    }

    if (position && position !== 'all') {
      filter['position.en'] = position;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get team members with pagination
    const teamMembers = await teamCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalCount = await teamCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform team members for frontend consumption
    const transformedTeamMembers = teamMembers.map(member => ({
      _id: member._id,
      id: member._id,
      name: member.name,
      position: member.position,
      department: member.department,
      bio: member.bio,
      email: member.email,
      phone: member.phone,
      profileImage: member.profileImage,
      socialLinks: member.socialLinks || {},
      skills: member.skills || [],
      experience: member.experience,
      education: member.education || [],
      order: member.order || 0,
      joinDate: member.joinDate,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        teamMembers: transformedTeamMembers,
        totalCount,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
