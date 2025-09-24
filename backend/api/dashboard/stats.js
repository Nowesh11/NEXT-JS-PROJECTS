import { connectDB } from '../../../lib/mongodb';
import Book from '../../../models/Book';
import User from '../../../models/User';
import Project from '../../../models/Project';
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

    // Get counts for different content types
    const [bookCount, ebookCount, userCount, projectCount, activityCount] = await Promise.all([
      Book.countDocuments({ status: 'active' }),
      Book.countDocuments({ status: 'active', type: 'ebook' }),
      User.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'active' }),
      Activity.countDocuments({ status: 'active' })
    ]);

    // Get user growth data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get activity distribution
    const activityDistribution = await Activity.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      bookCount,
      ebookCount,
      userCount,
      projectCount,
      activityCount,
      totalContent: bookCount + ebookCount + projectCount + activityCount
    };

    const chartData = {
      userGrowth: userGrowth.map(item => ({
        date: item._id,
        users: item.count
      })),
      activityDistribution: activityDistribution.map(item => ({
        type: item._id,
        count: item.count
      }))
    };

    res.status(200).json({
      success: true,
      stats,
      chartData
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
}