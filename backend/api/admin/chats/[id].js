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

    const { method, query } = req;
    const { id: chatId } = query;
    const adminId = session.user.id;

    switch (method) {
        case 'GET':
            // Validate chat ID
            await Promise.all(chatValidationRules.update.slice(0, 1).map(validation => validation(req, res)));
            
            try {
                // Get specific chat with messages for admin
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    status: { $ne: 'deleted' }
                })
                .populate('participants.user', 'name email role avatar')
                .populate('messages.sender', 'name email role avatar');

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                // Mark messages as read by admin
                const unreadMessages = chat.messages.filter(msg => 
                    !msg.readBy.some(read => read.user.toString() === adminId) &&
                    msg.sender.toString() !== adminId
                );

                unreadMessages.forEach(msg => {
                    msg.readBy.push({ user: adminId, readAt: new Date() });
                });

                if (unreadMessages.length > 0) {
                    await chat.save();
                }

                // Format response for admin view
                const userParticipant = chat.participants.find(
                    p => p.user.role !== 'admin'
                );

                const formattedChat = {
                    _id: chat._id,
                    chatId: chat.chatId,
                    type: chat.type,
                    subject: chat.title,
                    status: chat.status,
                    priority: chat.priority || 'normal',
                    user: userParticipant?.user || null,
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
                console.error('Error fetching admin chat:', error);
                res.status(500).json({ error: 'Failed to fetch chat' });
            }
            break;

        case 'POST':
            // Apply validation
            await Promise.all(chatValidationRules.message.map(validation => validation(req, res)));
            
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
                    status: { $ne: 'deleted' }
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                // Add message from admin
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
                    type,
                    attachments,
                    status: 'sent',
                    readBy: [{ user: adminId, readAt: new Date() }]
                };

                chat.messages.push(newMessage);
                chat.updatedAt = new Date();

                await chat.save();

                // Return the new message with populated sender
                const populatedMessage = {
                    ...newMessage,
                    _id: chat.messages[chat.messages.length - 1]._id,
                    sender: {
                        _id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                        avatar: admin.avatar
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                res.status(201).json({ message: populatedMessage });
            } catch (error) {
                console.error('Error sending admin message:', error);
                res.status(500).json({ error: 'Failed to send message' });
            }
            break;

        case 'PATCH':
            // Apply validation
            await Promise.all(chatValidationRules.update.map(validation => validation(req, res)));
            
            try {
                const { status, priority } = req.body;
                
                // Find the chat
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    status: { $ne: 'deleted' }
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                // Update chat properties
                if (status) {
                    chat.status = status;
                }

                if (priority) {
                    chat.priority = priority;
                }

                chat.updatedAt = new Date();
                await chat.save();

                res.status(200).json({ 
                    message: 'Chat updated successfully',
                    chat: {
                        _id: chat._id,
                        chatId: chat.chatId,
                        status: chat.status,
                        priority: chat.priority
                    }
                });
            } catch (error) {
                console.error('Error updating admin chat:', error);
                res.status(500).json({ error: 'Failed to update chat' });
            }
            break;

        case 'DELETE':
            // Validate chat ID
            await Promise.all(chatValidationRules.update.slice(0, 1).map(validation => validation(req, res)));
            
            try {
                // Soft delete the chat
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    status: { $ne: 'deleted' }
                });

                if (!chat) {
                    return res.status(404).json({ error: 'Chat not found' });
                }

                chat.status = 'deleted';
                chat.metadata = {
                    ...chat.metadata,
                    deletedBy: adminId,
                    deletedAt: new Date()
                };

                await chat.save();

                res.status(200).json({ message: 'Chat deleted successfully' });
            } catch (error) {
                console.error('Error deleting admin chat:', error);
                res.status(500).json({ error: 'Failed to delete chat' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}