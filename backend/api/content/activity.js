import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import WebsiteContent from '../../models/WebsiteContent';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type'); // 'created', 'updated', 'published'
    const userId = searchParams.get('userId');
    const contentPage = searchParams.get('contentPage');
    const days = parseInt(searchParams.get('days')) || 30;
    
    const skip = (page - 1) * limit;
    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Build query for recent activity
    let query = {
      $or: [
        { createdAt: { $gte: dateFilter } },
        { updatedAt: { $gte: dateFilter } }
      ]
    };

    // Add filters
    if (userId) {
      query.$or = [
        { createdBy: userId, createdAt: { $gte: dateFilter } },
        { updatedBy: userId, updatedAt: { $gte: dateFilter } }
      ];
    }

    if (contentPage && contentPage !== 'all') {
      query.page = contentPage;
    }

    // Get recent content activity
    const activities = await WebsiteContent.find(query)
      .populate('createdBy updatedBy approvedBy', 'name email')
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await WebsiteContent.countDocuments(query);

    // Process activities to create activity log entries
    const processedActivities = [];
    
    for (const content of activities) {
      // Check if it was recently created
      if (content.createdAt >= dateFilter) {
        processedActivities.push({
          id: `${content._id}_created`,
          type: 'created',
          action: 'Content Created',
          description: `Created content section "${content.sectionKey}" on ${content.page} page`,
          contentId: content._id,
          contentTitle: typeof content.title === 'object' ? content.title.en : content.title,
          contentPage: content.page,
          contentSection: content.section,
          user: content.createdBy,
          timestamp: content.createdAt,
          metadata: {
            sectionType: content.sectionType,
            isActive: content.isActive,
            isVisible: content.isVisible
          }
        });
      }
      
      // Check if it was recently updated (and not just created)
      if (content.updatedAt >= dateFilter && 
          content.updatedAt.getTime() !== content.createdAt.getTime() &&
          content.updatedBy) {
        processedActivities.push({
          id: `${content._id}_updated`,
          type: 'updated',
          action: 'Content Updated',
          description: `Updated content section "${content.sectionKey}" on ${content.page} page`,
          contentId: content._id,
          contentTitle: typeof content.title === 'object' ? content.title.en : content.title,
          contentPage: content.page,
          contentSection: content.section,
          user: content.updatedBy,
          timestamp: content.updatedAt,
          metadata: {
            sectionType: content.sectionType,
            isActive: content.isActive,
            isVisible: content.isVisible,
            version: content.version
          }
        });
      }
      
      // Check if it was recently published
      if (content.publishedAt && content.publishedAt >= dateFilter && content.approvedBy) {
        processedActivities.push({
          id: `${content._id}_published`,
          type: 'published',
          action: 'Content Published',
          description: `Published content section "${content.sectionKey}" on ${content.page} page`,
          contentId: content._id,
          contentTitle: typeof content.title === 'object' ? content.title.en : content.title,
          contentPage: content.page,
          contentSection: content.section,
          user: content.approvedBy,
          timestamp: content.publishedAt,
          metadata: {
            sectionType: content.sectionType,
            isActive: content.isActive,
            isVisible: content.isVisible
          }
        });
      }
    }

    // Sort by timestamp descending and apply type filter
    let filteredActivities = processedActivities.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (type && type !== 'all') {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }

    // Get activity statistics
    const stats = {
      totalActivities: filteredActivities.length,
      createdCount: filteredActivities.filter(a => a.type === 'created').length,
      updatedCount: filteredActivities.filter(a => a.type === 'updated').length,
      publishedCount: filteredActivities.filter(a => a.type === 'published').length,
      uniqueUsers: [...new Set(filteredActivities.map(a => a.user?._id?.toString()).filter(Boolean))].length,
      uniquePages: [...new Set(filteredActivities.map(a => a.contentPage))].length
    };

    return NextResponse.json({
      success: true,
      data: {
        activities: filteredActivities.slice(0, limit),
        pagination: {
          page,
          limit,
          total: filteredActivities.length,
          pages: Math.ceil(filteredActivities.length / limit)
        },
        statistics: stats,
        filters: {
          days,
          type,
          userId,
          contentPage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching content activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content activity' },
      { status: 500 }
    );
  }
}