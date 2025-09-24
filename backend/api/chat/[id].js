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

    const { method, query } = req;
    const { id: chatId } = query;
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';

    switch (method) {
        case 'GET':
            try {
                // Get specific chat with messages
                let chatQuery = {
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    status: 'active'
                };
                
                // If not admin, restrict to chats where user is a participant
                if (!isAdmin) {
                    chatQuery['participants.user'] = userId;
                }
                
                const chat = await Chat.findOne(chatQuery)
                .populate('participants.user', 'name email role avatar')
                .populate('messages.sender', 'name email role avatar');

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
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
                const otherParticipant = chat.participants.find(
                    p => p.user._id.toString() !== userId
                );

                const formattedChat = {
                    _id: chat._id,
                    chatId: chat.chatId,
                    type: chat.type,
                    participant: otherParticipant?.user || null,
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
                    updatedAt: chat.updatedAt
                };

                res.status(200).json({ chat: formattedChat });
            } catch (error) {
                console.error('Error fetching chat:', error);
                res.status(500).json({ error: 'Failed to fetch chat' });
            }
            break;

        case 'POST':
            try {
                const { message, type = 'text', attachments = [] } = req.body;

                if (!message) {
                    return res.status(400).json({ error: 'Message is required' });
                }

                // Find the chat
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    'participants.user': userId,
                    status: 'active'
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
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
                    attachments,
                    status: 'sent',
                    readBy: [{ user: userId, readAt: new Date() }]
                };

                chat.messages.push(newMessage);
                chat.analytics.totalMessages += 1;
                chat.analytics.lastActivity = new Date();

                await chat.save();

                // Populate the new message for response
                await chat.populate('messages.sender', 'name email role avatar');
                const addedMessage = chat.messages[chat.messages.length - 1];

                res.status(201).json({ 
                    message: 'Message sent successfully',
                    data: addedMessage
                });
            } catch (error) {
                console.error('Error sending message:', error);
                res.status(500).json({ error: 'Failed to send message' });
            }
            break;

        case 'PUT':
            try {
                const { messageId, action, content } = req.body;

                if (!messageId || !action) {
                    return res.status(400).json({ error: 'Message ID and action are required' });
                }

                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    'participants.user': userId,
                    status: 'active'
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                const message = chat.messages.id(messageId);
                if (!message) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                switch (action) {
                    case 'edit':
                        if (message.sender.toString() !== userId) {
                            return res.status(403).json({ error: 'Can only edit your own messages' });
                        }
                        if (!content) {
                            return res.status(400).json({ error: 'Content is required for editing' });
                        }
                        message.metadata.originalContent = message.content;
                        message.content = content;
                        message.metadata.edited = true;
                        message.metadata.editedAt = new Date();
                        break;

                    case 'delete':
                        if (message.sender.toString() !== userId) {
                            return res.status(403).json({ error: 'Can only delete your own messages' });
                        }
                        message.deleted = true;
                        message.deletedAt = new Date();
                        message.deletedBy = userId;
                        break;

                    case 'read':
                        if (!message.readBy.some(read => read.user.toString() === userId)) {
                            message.readBy.push({ user: userId, readAt: new Date() });
                        }
                        break;

                    default:
                        return res.status(400).json({ error: 'Invalid action' });
                }

                await chat.save();
                res.status(200).json({ message: 'Message updated successfully' });
            } catch (error) {
                console.error('Error updating message:', error);
                res.status(500).json({ error: 'Failed to update message' });
            }
            break;

        case 'DELETE':
            try {
                // Archive the chat (soft delete)
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    'participants.user': userId,
                    status: 'active'
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                chat.archived = true;
                chat.archivedAt = new Date();
                chat.archivedBy = userId;
                chat.status = 'archived';

                await chat.save();
                res.status(200).json({ message: 'Chat archived successfully' });
            } catch (error) {
                console.error('Error archiving chat:', error);
                res.status(500).json({ error: 'Failed to archive chat' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}