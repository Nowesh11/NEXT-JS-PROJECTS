import dbConnect from '../../lib/dbConnect.js';
import Chat from '../../models/Chat.js';
import User from '../../models/User.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth].js';

export default async function handler(req, res) {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method } = req;
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';

    switch (method) {
        case 'GET':
            try {
                let chats;
                
                if (isAdmin) {
                    // Admins can see all chats
                    chats = await Chat.find({
                        status: 'active'
                    })
                    .populate('participants.user', 'name email role avatar')
                    .populate('messages.sender', 'name email role avatar')
                    .sort({ updatedAt: -1 })
                    .limit(100);
                } else {
                    // Regular users can only see their own chats
                    chats = await Chat.find({
                        'participants.user': userId,
                        status: 'active'
                    })
                    .populate('participants.user', 'name email role avatar')
                    .populate('messages.sender', 'name email role avatar')
                    .sort({ updatedAt: -1 })
                    .limit(50);
                }

                // Format chats for frontend
                const formattedChats = chats.map(chat => {
                    const otherParticipant = chat.participants.find(
                        p => p.user._id.toString() !== userId
                    );
                    
                    const unreadCount = chat.messages.filter(msg => 
                        !msg.readBy.some(read => read.user.toString() === userId) &&
                        msg.sender.toString() !== userId
                    ).length;

                    return {
                        _id: chat._id,
                        chatId: chat.chatId,
                        type: chat.type,
                        participant: otherParticipant?.user || null,
                        lastMessage: chat.messages[chat.messages.length - 1] || null,
                        unreadCount,
                        updatedAt: chat.updatedAt
                    };
                });

                res.status(200).json({ chats: formattedChats });
            } catch (error) {
                console.error('Error fetching chats:', error);
                res.status(500).json({ error: 'Failed to fetch chats' });
            }
            break;

        case 'POST':
            try {
                const { recipientId, message, type = 'text' } = req.body;

                if (!recipientId || !message) {
                    return res.status(400).json({ error: 'Recipient ID and message are required' });
                }

                // Check if recipient exists
                const recipient = await User.findById(recipientId);
                if (!recipient) {
                    return res.status(404).json({ error: 'Recipient not found' });
                }

                // Regular users can only chat with admins
                if (!isAdmin && recipient.role !== 'admin') {
                    return res.status(403).json({ error: 'You can only chat with administrators' });
                }

                // Check if chat already exists between these users
                let chat = await Chat.findOne({
                    type: 'direct',
                    'participants.user': { $all: [userId, recipientId] },
                    status: 'active'
                });

                if (!chat) {
                    // Create new chat
                    const chatId = `chat_${userId}_${recipientId}_${Date.now()}`;
                    
                    chat = new Chat({
                        chatId,
                        type: 'direct',
                        participants: [
                            { user: userId, role: session.user.role },
                            { user: recipientId, role: recipient.role }
                        ],
                        messages: [],
                        metadata: {
                            createdBy: userId,
                            source: 'website'
                        }
                    });
                }

                // Add message
                const sender = await User.findById(userId);
                const newMessage = {
                    sender: userId,
                    senderInfo: {
                        name: sender.name,
                        email: sender.email,
                        role: sender.role,
                        avatar: sender.avatar
                    },
                    content: message,
                    type,
                    isAdminMessage: isAdmin,
                    status: 'sent',
                    readBy: [{ user: userId, readAt: new Date() }]
                };

                chat.messages.push(newMessage);
                
                // Update last activity
                chat.updatedAt = new Date();

                await chat.save();

                // Populate the new message for response
                await chat.populate('messages.sender', 'name email role avatar');
                const addedMessage = chat.messages[chat.messages.length - 1];

                res.status(201).json({ 
                    message: 'Message sent successfully',
                    chat: {
                        _id: chat._id,
                        chatId: chat.chatId,
                        message: addedMessage
                    }
                });
            } catch (error) {
                console.error('Error creating/updating chat:', error);
                res.status(500).json({ error: 'Failed to send message' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}