import dbConnect from '../../../../lib/dbConnect.js';
import Chat from '../../../../models/Chat.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth].js';

export default async function handler(req, res) {
    await dbConnect();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { method, query } = req;
    const { id: chatId } = query;
    const adminId = session.user.id;

    if (method !== 'PATCH') {
        res.setHeader('Allow', ['PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
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

        // Mark all messages as read by admin
        let updatedCount = 0;
        
        chat.messages.forEach(msg => {
            if (!msg.readBy.some(read => read.user.toString() === adminId) &&
                msg.sender.toString() !== adminId) {
                msg.readBy.push({ user: adminId, readAt: new Date() });
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await chat.save();
        }

        res.status(200).json({ 
            message: 'Messages marked as read',
            updatedCount
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
}