import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Announcement from '../../models/Announcement';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// GET /api/admin/announcements - Get all announcements for admin management
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
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status'); // 'active', 'inactive', 'expired'
        const type = searchParams.get('type');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || '-createdAt';
        const pinned = searchParams.get('pinned');
        const urgent = searchParams.get('urgent');
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        
        // Filter by status
        if (status === 'active') {
            const now = new Date();
            query = {
                isActive: true,
                startDate: { $lte: now },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: now } }
                ]
            };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            const now = new Date();
            query = {
                endDate: { $lt: now }
            };
        }
        
        // Additional filters
        if (type) query.type = type;
        if (priority) query.priority = priority;
        if (pinned === 'true') query.isPinned = true;
        if (urgent === 'true') query.priority = 'urgent';
        
        // Search functionality
        if (search) {
            query.$or = [
                { 'title.en': { $regex: search, $options: 'i' } },
                { 'title.ta': { $regex: search, $options: 'i' } },
                { 'content.en': { $regex: search, $options: 'i' } },
                { 'content.ta': { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const announcements = await Announcement.find(query)
            .populate('createdBy updatedBy', 'name email')
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Announcement.countDocuments(query);
        
        // Get statistics
        const stats = await getAnnouncementStats();
        
        return NextResponse.json({
            success: true,
            data: announcements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            stats
        });
        
    } catch (error) {
        console.error('Error fetching admin announcements:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}

// POST /api/admin/announcements - Bulk operations
export async function POST(request) {
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
        
        const body = await request.json();
        const { action, announcementIds, data } = body;
        
        let result;
        let message;
        
        switch (action) {
            case 'bulk_activate':
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        isActive: true,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements activated`;
                break;
                
            case 'bulk_deactivate':
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        isActive: false,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements deactivated`;
                break;
                
            case 'bulk_pin':
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        isPinned: true,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements pinned`;
                break;
                
            case 'bulk_unpin':
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        isPinned: false,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements unpinned`;
                break;
                
            case 'bulk_delete':
                result = await Announcement.deleteMany(
                    { _id: { $in: announcementIds } }
                );
                message = `${result.deletedCount} announcements deleted`;
                break;
                
            case 'bulk_set_priority':
                if (!['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid priority value' },
                        { status: 400 }
                    );
                }
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        priority: data.priority,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements priority set to ${data.priority}`;
                break;
                
            case 'bulk_set_type':
                const validTypes = ['general', 'urgent', 'maintenance', 'event', 'holiday'];
                if (!validTypes.includes(data.type)) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid type value' },
                        { status: 400 }
                    );
                }
                result = await Announcement.updateMany(
                    { _id: { $in: announcementIds } },
                    { 
                        type: data.type,
                        updatedBy: session.user.id
                    }
                );
                message = `${result.modifiedCount} announcements type set to ${data.type}`;
                break;
                
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
        
        return NextResponse.json({
            success: true,
            message,
            result
        });
        
    } catch (error) {
        console.error('Error performing bulk operation:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform bulk operation' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/announcements - Bulk delete
export async function DELETE(request) {
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
        const ids = searchParams.get('ids')?.split(',') || [];
        
        if (ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No announcement IDs provided' },
                { status: 400 }
            );
        }
        
        const result = await Announcement.deleteMany(
            { _id: { $in: ids } }
        );
        
        return NextResponse.json({
            success: true,
            message: `${result.deletedCount} announcements deleted successfully`
        });
        
    } catch (error) {
        console.error('Error deleting announcements:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete announcements' },
            { status: 500 }
        );
    }
}

// Helper function to get announcement statistics
async function getAnnouncementStats() {
    try {
        const now = new Date();
        
        const [total, active, inactive, expired, pinned, urgent] = await Promise.all([
            Announcement.countDocuments({}),
            Announcement.countDocuments({
                isActive: true,
                startDate: { $lte: now },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: now } }
                ]
            }),
            Announcement.countDocuments({ isActive: false }),
            Announcement.countDocuments({
                endDate: { $lt: now }
            }),
            Announcement.countDocuments({ isPinned: true }),
            Announcement.countDocuments({ priority: 'urgent' })
        ]);
        
        // Get type distribution
        const typeStats = await Announcement.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Get priority distribution
        const priorityStats = await Announcement.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Get recent activity (last 7 days)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = await Announcement.countDocuments({
            createdAt: { $gte: weekAgo }
        });
        
        return {
            total,
            active,
            inactive,
            expired,
            pinned,
            urgent,
            recentActivity,
            typeDistribution: typeStats,
            priorityDistribution: priorityStats
        };
        
    } catch (error) {
        console.error('Error getting announcement stats:', error);
        return {
            total: 0,
            active: 0,
            inactive: 0,
            expired: 0,
            pinned: 0,
            urgent: 0,
            recentActivity: 0,
            typeDistribution: [],
            priorityDistribution: []
        };
    }
}