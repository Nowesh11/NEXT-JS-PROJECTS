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
    const page = searchParams.get('page');
    const language = searchParams.get('language') || 'en';

    // Build query
    let query = {};
    if (page && page !== 'all') {
      query.page = page;
    }

    // Get content overview
    const content = await WebsiteContent.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ page: 1, position: 1, createdAt: -1 })
      .lean();

    // Get statistics
    const totalContent = await WebsiteContent.countDocuments();
    const activeContent = await WebsiteContent.countDocuments({ isActive: true });
    const publishedContent = await WebsiteContent.countDocuments({ 
      isActive: true, 
      isVisible: true,
      $or: [
        { publishedAt: { $lte: new Date() } },
        { publishedAt: null }
      ]
    });
    
    // Get content by page
    const contentByPage = await WebsiteContent.aggregate([
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          published: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    '$isActive',
                    '$isVisible',
                    {
                      $or: [
                        { $lte: ['$publishedAt', new Date()] },
                        { $eq: ['$publishedAt', null] }
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent activity
    const recentActivity = await WebsiteContent.find()
      .populate('createdBy updatedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Process content for localization
    const processedContent = content.map(item => {
      const processed = { ...item };
      
      // Localize bilingual fields
      if (processed.title && typeof processed.title === 'object') {
        processed.title = processed.title[language] || processed.title.en;
      }
      if (processed.content && typeof processed.content === 'object') {
        processed.content = processed.content[language] || processed.content.en;
      }
      if (processed.subtitle && typeof processed.subtitle === 'object') {
        processed.subtitle = processed.subtitle[language] || processed.subtitle.en;
      }
      
      return processed;
    });

    return NextResponse.json({
      success: true,
      data: {
        content: processedContent,
        statistics: {
          total: totalContent,
          active: activeContent,
          published: publishedContent,
          byPage: contentByPage
        },
        recentActivity: recentActivity.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error fetching content overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content overview' },
      { status: 500 }
    );
  }
}