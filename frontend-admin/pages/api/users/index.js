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
    const usersCollection = db.collection(COLLECTIONS.USERS);

    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res, usersCollection);
      case 'POST':
        return await handleCreateUser(req, res, usersCollection);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/users - Get all users with pagination and filtering
async function handleGetUsers(req, res, usersCollection) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get users with pagination
    const users = await usersCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const totalUsers = await usersCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res.status(200).json({
      users: sanitizedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Handle POST /api/users - Create new user
async function handleCreateUser(req, res, usersCollection) {
  try {
    const userData = req.body;

    // Validate required fields
    const validationErrors = validateData(userData, SCHEMAS.USER);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Prepare user data
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: userData.status || 'active',
      role: userData.role || 'user'
    };

    // Insert user
    const result = await usersCollection.insertOne(newUser);
    
    if (!result.insertedId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Get created user without sensitive data
    const createdUser = await usersCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );

    return res.status(201).json({
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

// Export helper functions for testing
export { validateAdminToken, handleGetUsers, handleCreateUser };