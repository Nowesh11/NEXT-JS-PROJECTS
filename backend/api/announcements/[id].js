import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Announcement from '../../models/Announcement';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// GET /api/announcements/[id] - Get single announcement
export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'en';
        const markAsRead = searchParams.get('markAsRead') === 'true';
        
        const announcement = await Announcement.findById(id)
            .populate('createdBy', 'name email')
            .lean();
        
        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'Announcement not found' },
                { status: 404 }
            );
        }
        
        // Check if announcement is accessible (active and within date range)
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === 'admin';
        
        if (!isAdmin) {
            const now = new Date();
            if (!announcement.isActive || 
                announcement.startDate > now || 
                (announcement.endDate && announcement.endDate < now)) {
                return NextResponse.json(
                    { success: false, error: 'Announcement not found' },
                    { status: 404 }
                );
            }
        }
        
        // Mark as read if requested and user is logged in
        if (markAsRead && session?.user?.id) {
            await Announcement.markAsRead(id, session.user.id);
        }
        
        // Localize content
        const localizedAnnouncement = {
            ...announcement,
            title: announcement.title[locale] || announcement.title.en,
            content: announcement.content[locale] || announcement.content.en
        };
        
        return NextResponse.json({
            success: true,
            data: localizedAnnouncement
        });
        
    } catch (error) {
        console.error('Error fetching announcement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch announcement' },
            { status: 500 }
        );
    }
}

// PUT /api/announcements/[id] - Update announcement (admin only)
export async function PUT(request, { params }) {
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
        
        const { id } = params;
        const body = await request.json();
        
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'Announcement not found' },
                { status: 404 }
            );
        }
        
        // Update fields
        const updateData = { ...body };
        
        // Handle date fields
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }
        
        // Update metadata
        updateData.updatedBy = session.user.id;
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy updatedBy', 'name email');
        
        return NextResponse.json({
            success: true,
            message: 'Announcement updated successfully',
            data: updatedAnnouncement
        });
        
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update announcement' },
            { status: 500 }
        );
    }
}

// DELETE /api/announcements/[id] - Delete announcement (admin only)
export async function DELETE(request, { params }) {
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
        
        const { id } = params;
        
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'Announcement not found' },
                { status: 404 }
            );
        }
        
        // Delete the announcement
        await Announcement.findByIdAndDelete(id);
        
        return NextResponse.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete announcement' },
            { status: 500 }
        );
    }
}

// PATCH /api/announcements/[id] - Toggle announcement status or pin
export async function PATCH(request, { params }) {
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
        
        const { id } = params;
        const body = await request.json();
        const { action, value } = body;
        
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return NextResponse.json(
                { success: false, error: 'Announcement not found' },
                { status: 404 }
            );
        }
        
        let updateData = { updatedBy: session.user.id };
        let message = '';
        
        switch (action) {
            case 'toggle_active':
                updateData.isActive = !announcement.isActive;
                message = `Announcement ${updateData.isActive ? 'activated' : 'deactivated'} successfully`;
                break;
            case 'toggle_pin':
                updateData.isPinned = !announcement.isPinned;
                message = `Announcement ${updateData.isPinned ? 'pinned' : 'unpinned'} successfully`;
                break;
            case 'set_priority':
                if (!['low', 'normal', 'high', 'urgent'].includes(value)) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid priority value' },
                        { status: 400 }
                    );
                }
                updateData.priority = value;
                message = `Announcement priority set to ${value}`;
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('createdBy updatedBy', 'name email');
        
        return NextResponse.json({
            success: true,
            message,
            data: updatedAnnouncement
        });
        
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update announcement' },
            { status: 500 }
        );
    }
}