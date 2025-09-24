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

  const { id } = req.query;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    switch (req.method) {
      case 'GET':
        return await handleGetUser(req, res, usersCollection, id);
      case 'PUT':
        return await handleUpdateUser(req, res, usersCollection, id);
      case 'DELETE':
        return await handleDeleteUser(req, res, usersCollection, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/users/[id] - Get single user
async function handleGetUser(req, res, usersCollection, id) {
  try {
    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// Handle PUT /api/users/[id] - Update user
async function handleUpdateUser(req, res, usersCollection, id) {
  try {
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, ...allowedUpdates } = updateData;

    // Validate update data
    const validationErrors = [];
    
    // Validate individual fields if provided
    if (allowedUpdates.email && typeof allowedUpdates.email !== 'string') {
      validationErrors.push('Email must be a string');
    }
    
    if (allowedUpdates.name && typeof allowedUpdates.name !== 'string') {
      validationErrors.push('Name must be a string');
    }
    
    if (allowedUpdates.role && !['admin', 'moderator', 'editor', 'user'].includes(allowedUpdates.role)) {
      validationErrors.push('Role must be one of: admin, moderator, editor, user');
    }
    
    if (allowedUpdates.status && !['active', 'inactive', 'suspended'].includes(allowedUpdates.status)) {
      validationErrors.push('Status must be one of: active, inactive, suspended');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email uniqueness if email is being updated
    if (allowedUpdates.email && allowedUpdates.email !== existingUser.email) {
      const emailExists = await usersCollection.findOne({ 
        email: allowedUpdates.email,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (emailExists) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    // Prepare update data
    const updatePayload = {
      ...allowedUpdates,
      updatedAt: new Date()
    };

    // Update user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

// Handle DELETE /api/users/[id] - Delete user
async function handleDeleteUser(req, res, usersCollection, id) {
  try {
    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of admin users (safety measure)
    if (existingUser.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      deletedUserId: id
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Export helper functions for testing
export { validateAdminToken, handleGetUser, handleUpdateUser, handleDeleteUser };