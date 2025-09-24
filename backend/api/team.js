import dbConnect from '../../lib/dbConnect';
import Team from '../../models/Team';
import { ObjectId } from 'mongodb';

// Database connection helper
async function connectDB() {
    try {
        await dbConnect();
    } catch (error) {
        console.error('Database connection failed:', error);
        throw new Error('Database connection failed');
    }
}

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        await connectDB();
        const { position, status, search, page = 1, limit = 10 } = req.query;
        
        // Build query object
        let query = {};
        
        // Filter by position
        if (position && position !== 'all') {
          query.position = position;
        }
        
        // Filter by status
        if (status && status !== 'all') {
          if (status === 'active') {
            query.status = 'active';
            query.is_active = true;
          } else if (status === 'inactive') {
            query.$or = [
              { status: 'inactive' },
              { is_active: false }
            ];
          }
        } else {
          // Default to active members for public view
          query.status = 'active';
          query.is_active = true;
        }
        
        // Search functionality
        if (search) {
          query.$or = [
            { 'name.en': { $regex: search, $options: 'i' } },
            { 'name.ta': { $regex: search, $options: 'i' } },
            { 'role.en': { $regex: search, $options: 'i' } },
            { 'role.ta': { $regex: search, $options: 'i' } },
            { position: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query with pagination and sorting
        const teamMembers = await Team.find(query)
          .sort({ order: 1, position: 1, 'name.en': 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        // Sort by hierarchy if no specific sorting is applied
        const sortedMembers = teamMembers.sort((a, b) => {
          const orderA = Team.getHierarchyOrder(a.position);
          const orderB = Team.getHierarchyOrder(b.position);
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          return a.order - b.order;
        });
        
        // Get total count for pagination
        const total = await Team.countDocuments(query);
        
        res.status(200).json({
          success: true,
          data: sortedMembers,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit))
        });
      } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch team members',
          error: error.message 
        });
      }
      break;

    case 'POST':
      try {
        await connectDB();
        const teamData = req.body;
        
        // Basic validation
        if (!teamData.name || !teamData.name.en || !teamData.name.ta) {
          return res.status(400).json({ 
            success: false, 
            message: 'Name in both English and Tamil is required' 
          });
        }
        
        if (!teamData.role || !teamData.role.en || !teamData.role.ta) {
          return res.status(400).json({ 
            success: false, 
            message: 'Role in both English and Tamil is required' 
          });
        }
        
        if (!teamData.position) {
          return res.status(400).json({ 
            success: false, 
            message: 'Position is required' 
          });
        }
        
        // Create new team member using Mongoose model
        const newTeamMember = new Team(teamData);
        const savedTeamMember = await newTeamMember.save();
        
        res.status(201).json({
          success: true,
          data: savedTeamMember,
          message: 'Team member created successfully'
        });
      } catch (error) {
        console.error('Error creating team member:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: validationErrors
          });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
          return res.status(400).json({ 
            success: false, 
            message: 'Team member with this information already exists'
          });
        }
        
        res.status(500).json({ 
          success: false, 
          message: 'Failed to create team member',
          error: error.message 
        });
      }
      break;

    case 'PUT':
      try {
        await connectDB();
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Team member ID is required' 
          });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid team member ID format' 
          });
        }
        
        // Find and update team member
        const updatedTeamMember = await Team.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        
        if (!updatedTeamMember) {
          return res.status(404).json({ 
            success: false, 
            message: 'Team member not found' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: updatedTeamMember,
          message: 'Team member updated successfully'
        });
      } catch (error) {
        console.error('Error updating team member:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: validationErrors
          });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
          return res.status(400).json({ 
            success: false, 
            message: 'Team member with this information already exists'
          });
        }
        
        res.status(500).json({ 
          success: false, 
          message: 'Failed to update team member',
          error: error.message 
        });
      }
      break;

    case 'DELETE':
      try {
        await connectDB();
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Team member ID is required' 
          });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid team member ID format' 
          });
        }
        
        // Find and delete team member
        const deletedTeamMember = await Team.findByIdAndDelete(id);
        
        if (!deletedTeamMember) {
          return res.status(404).json({ 
            success: false, 
            message: 'Team member not found' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: deletedTeamMember,
          message: 'Team member deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to delete team member',
          error: error.message 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Helper functions
export const getTeamMemberById = async (id) => {
  try {
    await connectDB();
    const teamMember = await Team.findById(id).lean();
    return teamMember;
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    return null;
  }
};

export const getTeamMembersByPosition = async (position) => {
  try {
    await connectDB();
    const teamMembers = await Team.find({ position, status: 'active', is_active: true })
      .sort({ order: 1, 'name.en': 1 })
      .lean();
    return teamMembers;
  } catch (error) {
    console.error('Error fetching team members by position:', error);
    return [];
  }
};

export const getActiveTeamMembers = async () => {
  try {
    await connectDB();
    const teamMembers = await Team.find({ status: 'active', is_active: true })
      .sort({ order: 1, position: 1, 'name.en': 1 })
      .lean();
    
    // Sort by hierarchy
    return teamMembers.sort((a, b) => {
      const orderA = Team.getHierarchyOrder(a.position);
      const orderB = Team.getHierarchyOrder(b.position);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      return a.order - b.order;
    });
  } catch (error) {
    console.error('Error fetching active team members:', error);
    return [];
  }
};