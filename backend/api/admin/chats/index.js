import dbConnect from '../../../lib/dbConnect.js';
import Chat from '../../../models/Chat.js';
import User from '../../../models/User.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth].js';
import { chatValidationRules } from '../../../middleware/chatValidation.js';

export default async function handler(req, res) {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { method } = req;
    const adminId = session.user.id;

    switch (method) {
        case 'GET':
            // Apply validation
            await Promise.all(chatValidationRules.get.map(validation => validation(req, res)));
            
            try {
                // Get all chats for admin view
                const { status, priority, search } = req.query;
                
                // Build query
                const query = {};
                
                // Filter by status if provided
                if (status) {
                    query.status = status;
                } else {
                    // By default, don't show deleted chats
                    query.status = { $ne: 'deleted' };
                }
                
                // Filter by priority if provided
                if (priority) {
                    query.priority = priority;
                }
                
                // Search functionality
                if (search) {
                    const searchRegex = new RegExp(search, 'i');
                    query.$or = [
                        { 'participants.user.name': searchRegex },
                        { 'participants.user.email': searchRegex },
                        { subject: searchRegex },
                        { 'messages.content': searchRegex }
                    ];
                }

                // Get chats with populated user info
                const chats = await Chat.find(query)
                    .populate('participants.user', 'name email role avatar')
                    .sort({ updatedAt: -1 })
                    .limit(100);

                // Format chats for admin view
                const formattedChats = chats.map(chat => {
                    // Find the user (non-admin) participant
                    const userParticipant = chat.participants.find(
                        p => p.user.role !== 'admin'
                    );
                    
                    // Get last message
                    const lastMessage = chat.messages && chat.messages.length > 0 
                        ? chat.messages[chat.messages.length - 1].content 
                        : null;
                    
                    // Count unread messages for admin
                    const unreadCount = chat.messages.filter(msg => 
                        !msg.readBy.some(read => read.user.toString() === adminId) &&
                        msg.sender.toString() !== adminId
                    ).length;

                    return {
                        _id: chat._id,
                        chatId: chat.chatId,
                        subject: chat.title || 'No Subject',
                        status: chat.status,
                        priority: chat.priority || 'normal',
                        user: userParticipant?.user || null,
                        lastMessage,
                        unreadCount,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt
                    };
                });

                res.status(200).json({ chats: formattedChats });
            } catch (error) {
                console.error('Error fetching admin chats:', error);
                res.status(500).json({ error: 'Failed to fetch chats' });
            }
            break;

        case 'POST':
            // Apply validation
            await Promise.all(chatValidationRules.create.map(validation => validation(req, res)));
            
            try {
                const { userId, subject, message, priority = 'normal' } = req.body;

                if (!userId || !message) {
                    return res.status(400).json({ error: 'User ID and message are required' });
                }

                // Check if user exists
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Check if chat already exists between admin and this user
                let chat = await Chat.findOne({
                    type: 'support',
                    'participants.user': { $all: [adminId, userId] },
                    status: { $ne: 'deleted' }
                });

                if (!chat) {
                    // Create new chat
                    const chatId = `support_${adminId}_${userId}_${Date.now()}`;
                    
                    chat = new Chat({
                        chatId,
                        type: 'support',
                        title: subject || `Support chat with ${user.name}`,
                        participants: [
                            { user: adminId, role: 'admin' },
                            { user: userId, role: 'member' }
                        ],
                        messages: [],
                        status: 'active',
                        priority,
                        metadata: {
                            createdBy: adminId,
                            source: 'admin'
                        }
                    });
                }

                // Add message
                const admin = await User.findById(adminId);
                const newMessage = {
                    sender: adminId,
                    senderInfo: {
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                        avatar: admin.avatar
                    },
                    content: message,
                    type: 'text',
                    status: 'sent',
                    readBy: [{ user: adminId, readAt: new Date() }]
                };

                chat.messages.push(newMessage);
                chat.updatedAt = new Date();

                await chat.save();

                res.status(201).json({ 
                    message: 'Chat created/updated successfully',
                    chat: {
                        _id: chat._id,
                        chatId: chat.chatId,
                        subject: chat.title,
                        status: chat.status,
                        priority: chat.priority
                    }
                });
            } catch (error) {
                console.error('Error creating/updating admin chat:', error);
                res.status(500).json({ error: 'Failed to create/update chat' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}