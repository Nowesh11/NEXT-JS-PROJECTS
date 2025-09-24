import dbConnect from '../../lib/dbConnect.js';
import Chat from '../../models/Chat.js';
import User from '../../models/User.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth].js';

export default async function handler(req, res) {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const { status = 'active', page = 1, limit = 20, search } = req.query;
                const skip = (parseInt(page) - 1) * parseInt(limit);

                // Build query
                let query = {
                    type: 'direct',
                    status: status
                };

                // Add search functionality
                if (search) {
                    const users = await User.find({
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }).select('_id');
                    
                    const userIds = users.map(user => user._id);
                    query['participants.user'] = { $in: userIds };
                }

                // Get chats with pagination
                const chats = await Chat.find(query)
                    .populate('participants.user', 'name email role avatar createdAt')
                    .populate('messages.sender', 'name email role avatar')
                    .sort({ 'analytics.lastActivity': -1 })
                    .skip(skip)
                    .limit(parseInt(limit));

                // Get total count for pagination
                const totalChats = await Chat.countDocuments(query);

                // Format chats for admin panel
                const formattedChats = chats.map(chat => {
                    const userParticipant = chat.participants.find(
                        p => p.user.role !== 'admin'
                    );
                    const adminParticipant = chat.participants.find(
                        p => p.user.role === 'admin'
                    );

                    // Count unread messages from user to admin
                    const unreadCount = chat.messages.filter(msg => 
                        msg.sender.toString() === userParticipant?.user._id.toString() &&
                        !msg.readBy.some(read => 
                            read.user.toString() === adminParticipant?.user._id.toString()
                        )
                    ).length;

                    const lastMessage = chat.messages[chat.messages.length - 1];

                    return {
                        _id: chat._id,
                        chatId: chat.chatId,
                        user: userParticipant?.user || null,
                        admin: adminParticipant?.user || null,
                        lastMessage: lastMessage ? {
                            content: lastMessage.content,
                            sender: lastMessage.sender,
                            createdAt: lastMessage.createdAt,
                            type: lastMessage.type
                        } : null,
                        unreadCount,
                        totalMessages: chat.analytics.totalMessages,
                        lastActivity: chat.analytics.lastActivity,
                        status: chat.status,
                        priority: chat.priority,
                        category: chat.category,
                        assignedTo: chat.assignedTo,
                        resolvedAt: chat.resolvedAt,
                        rating: chat.rating,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt
                    };
                });

                res.status(200).json({
                    chats: formattedChats,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalChats / parseInt(limit)),
                        totalChats,
                        hasNext: skip + parseInt(limit) < totalChats,
                        hasPrev: parseInt(page) > 1
                    }
                });
            } catch (error) {
                console.error('Error fetching admin chats:', error);
                res.status(500).json({ error: 'Failed to fetch chats' });
            }
            break;

        case 'PUT':
            try {
                const { chatId, action, data } = req.body;

                if (!chatId || !action) {
                    return res.status(400).json({ error: 'Chat ID and action are required' });
                }

                const chat = await Chat.findById(chatId);
                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                const adminId = session.user.id;

                switch (action) {
                    case 'assign':
                        const { assigneeId } = data;
                        if (!assigneeId) {
                            return res.status(400).json({ error: 'Assignee ID is required' });
                        }
                        
                        const assignee = await User.findById(assigneeId);
                        if (!assignee || assignee.role !== 'admin') {
                            return res.status(400).json({ error: 'Invalid assignee' });
                        }

                        chat.assignedTo = assigneeId;
                        chat.assignedAt = new Date();
                        break;

                    case 'priority':
                        const { priority } = data;
                        if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
                            return res.status(400).json({ error: 'Invalid priority' });
                        }
                        chat.priority = priority;
                        break;

                    case 'category':
                        const { category } = data;
                        if (!['general', 'support', 'technical', 'academic', 'administrative', 'emergency'].includes(category)) {
                            return res.status(400).json({ error: 'Invalid category' });
                        }
                        chat.category = category;
                        break;

                    case 'resolve':
                        const { resolution } = data;
                        chat.resolvedAt = new Date();
                        chat.resolvedBy = adminId;
                        chat.resolution = resolution || 'Resolved by admin';
                        chat.status = 'resolved';
                        break;

                    case 'reopen':
                        chat.resolvedAt = null;
                        chat.resolvedBy = null;
                        chat.resolution = null;
                        chat.status = 'active';
                        break;

                    case 'archive':
                        chat.archived = true;
                        chat.archivedAt = new Date();
                        chat.archivedBy = adminId;
                        chat.status = 'archived';
                        break;

                    default:
                        return res.status(400).json({ error: 'Invalid action' });
                }

                await chat.save();
                res.status(200).json({ message: 'Chat updated successfully' });
            } catch (error) {
                console.error('Error updating chat:', error);
                res.status(500).json({ error: 'Failed to update chat' });
            }
            break;

        case 'DELETE':
            try {
                const { chatIds } = req.body;

                if (!chatIds || !Array.isArray(chatIds)) {
                    return res.status(400).json({ error: 'Chat IDs array is required' });
                }

                // Soft delete multiple chats
                await Chat.updateMany(
                    { _id: { $in: chatIds } },
                    {
                        status: 'deleted',
                        archived: true,
                        archivedAt: new Date(),
                        archivedBy: session.user.id
                    }
                );

                res.status(200).json({ 
                    message: `${chatIds.length} chat(s) deleted successfully` 
                });
            } catch (error) {
                console.error('Error deleting chats:', error);
                res.status(500).json({ error: 'Failed to delete chats' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

// Helper function to get chat statistics
export async function getChatStats() {
    try {
        const stats = await Chat.aggregate([
            {
                $match: {
                    type: 'direct',
                    status: { $ne: 'deleted' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalChats: { $sum: 1 },
                    activeChats: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    resolvedChats: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    archivedChats: {
                        $sum: { $cond: ['$archived', 1, 0] }
                    },
                    totalMessages: { $sum: '$analytics.totalMessages' },
                    averageResponseTime: { $avg: '$analytics.averageResponseTime' }
                }
            }
        ]);

        return stats[0] || {
            totalChats: 0,
            activeChats: 0,
            resolvedChats: 0,
            archivedChats: 0,
            totalMessages: 0,
            averageResponseTime: 0
        };
    } catch (error) {
        console.error('Error getting chat stats:', error);
        return null;
    }
}