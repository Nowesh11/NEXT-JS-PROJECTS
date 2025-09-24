import dbConnect from '../../lib/dbConnect.js';
import Chat from '../../models/Chat.js';
import User from '../../models/User.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth].js';
import { chatValidationRules } from '../../middleware/chatValidation.js';

export default async function handler(req, res) {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method } = req;
    const userId = session.user.id;

    switch (method) {
        case 'GET':
            try {
                // Get user's support chat
                const chat = await Chat.findOne({
                    type: 'support',
                    'participants.user': userId,
                    status: { $ne: 'deleted' }
                })
                .populate('participants.user', 'name email role avatar')
                .populate('messages.sender', 'name email role avatar');

                if (!chat) {
                    return res.status(404).json({ error: 'No support chat found' });
                }

                // Mark messages as read
                const unreadMessages = chat.messages.filter(msg => 
                    !msg.readBy.some(read => read.user.toString() === userId) &&
                    msg.sender.toString() !== userId
                );

                unreadMessages.forEach(msg => {
                    msg.readBy.push({ user: userId, readAt: new Date() });
                });

                if (unreadMessages.length > 0) {
                    await chat.save();
                }

                // Format response
                const adminParticipant = chat.participants.find(
                    p => p.user.role === 'admin'
                );

                const formattedChat = {
                    _id: chat._id,
                    chatId: chat.chatId,
                    type: chat.type,
                    subject: chat.title,
                    admin: adminParticipant?.user || null,
                    messages: chat.messages.map(msg => ({
                        _id: msg._id,
                        sender: msg.sender,
                        senderInfo: msg.senderInfo,
                        content: msg.content,
                        type: msg.type,
                        status: msg.status,
                        readBy: msg.readBy,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt
                    })),
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt
                };

                res.status(200).json({ chat: formattedChat });
            } catch (error) {
                console.error('Error fetching support chat:', error);
                res.status(500).json({ error: 'Failed to fetch support chat' });
            }
            break;

        case 'POST':
            // Apply validation
            await Promise.all(chatValidationRules.create.map(validation => validation(req, res)));
            
            try {
                const { subject, message, type = 'text', attachments = [] } = req.body;

                if (!message) {
                    return res.status(400).json({ error: 'Message is required' });
                }

                // Check if user already has a support chat
                let chat = await Chat.findOne({
                    type: 'support',
                    'participants.user': userId,
                    status: { $ne: 'deleted' }
                });

                // Find an admin to assign the chat to
                const admin = await User.findOne({ role: 'admin' });
                if (!admin) {
                    return res.status(500).json({ error: 'No admin available to handle support requests' });
                }

                if (!chat) {
                    // Create new support chat
                    const chatId = `support_${userId}_${Date.now()}`;
                    
                    chat = new Chat({
                        chatId,
                        type: 'support',
                        title: subject || 'Support Request',
                        participants: [
                            { user: userId, role: 'member' },
                            { user: admin._id, role: 'admin' }
                        ],
                        messages: [],
                        status: 'active',
                        priority: 'normal',
                        metadata: {
                            createdBy: userId,
                            source: 'user'
                        }
                    });
                }

                // Add message from user
                const user = await User.findById(userId);
                const newMessage = {
                    sender: userId,
                    senderInfo: {
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar
                    },
                    content: message,
                    type,
                    attachments,
                    status: 'sent',
                    readBy: [{ user: userId, readAt: new Date() }]
                };

                chat.messages.push(newMessage);
                chat.updatedAt = new Date();

                await chat.save();

                // Return the new message with populated sender
                const populatedMessage = {
                    ...newMessage,
                    _id: chat.messages[chat.messages.length - 1]._id,
                    sender: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                res.status(201).json({ 
                    message: populatedMessage,
                    chat: {
                        _id: chat._id,
                        chatId: chat.chatId,
                        subject: chat.title
                    }
                });
            } catch (error) {
                console.error('Error creating/updating support chat:', error);
                res.status(500).json({ error: 'Failed to create/update support chat' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}