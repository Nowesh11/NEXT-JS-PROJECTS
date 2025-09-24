import { connectDB } from '../../../lib/mongodb';
import Activity from '../../../models/Activity';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();

    // Get recent activities (last 20)
    const recentActivities = await Activity.find({
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('user', 'name email')
    .select('title description type createdAt user')
    .lean();

    // Format activities for frontend
    const formattedActivities = recentActivities.map(activity => ({
      id: activity._id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      createdAt: activity.createdAt,
      user: activity.user ? {
        name: activity.user.name,
        email: activity.user.email
      } : null
    }));

    res.status(200).json(formattedActivities);

  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activities',
      error: error.message 
    });
  }
}