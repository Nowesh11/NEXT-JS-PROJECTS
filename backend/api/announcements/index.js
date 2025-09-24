import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Announcement from '../../models/Announcement';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// GET /api/announcements - Get all active announcements (public)
// POST /api/announcements - Create new announcement (admin only)
export async function GET(request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const type = searchParams.get('type');
        const priority = searchParams.get('priority');
        const locale = searchParams.get('locale') || 'en';
        const audience = searchParams.get('audience') || 'all';
        
        const skip = (page - 1) * limit;
        
        // Build query for active announcements
        const query = {
            isActive: true,
            startDate: { $lte: new Date() },
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        };
        
        if (audience !== 'all') {
            query.targetAudience = { $in: [audience, 'all'] };
        }
        
        if (type) {
            query.type = type;
        }
        
        if (priority) {
            query.priority = priority;
        }
        
        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name email')
            .sort({ isPinned: -1, priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Announcement.countDocuments(query);
        
        // Localize content based on requested locale
        const localizedAnnouncements = announcements.map(announcement => {
            const localized = {
                ...announcement,
                title: announcement.title[locale] || announcement.title.en,
                content: announcement.content[locale] || announcement.content.en
            };
            
            // Remove the original bilingual objects to avoid confusion
            delete localized.title;
            delete localized.content;
            
            return {
                ...localized,
                title: announcement.title[locale] || announcement.title.en,
                content: announcement.content[locale] || announcement.content.en
            };
        });
        
        return NextResponse.json({
            success: true,
            data: localizedAnnouncements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}

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
        const {
            title,
            content,
            type = 'general',
            priority = 'normal',
            targetAudience = ['all'],
            startDate,
            endDate,
            isPinned = false,
            tags = [],
            attachments = []
        } = body;
        
        // Validate required fields
        if (!title?.en || !content?.en) {
            return NextResponse.json(
                { success: false, error: 'English title and content are required' },
                { status: 400 }
            );
        }
        
        // Create announcement
        const announcement = new Announcement({
            title,
            content,
            type,
            priority,
            targetAudience,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            isPinned,
            tags,
            attachments,
            createdBy: session.user.id,
            isActive: true
        });
        
        await announcement.save();
        
        // Populate creator info
        await announcement.populate('createdBy', 'name email');
        
        return NextResponse.json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create announcement' },
            { status: 500 }
        );
    }
}