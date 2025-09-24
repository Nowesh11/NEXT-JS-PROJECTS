import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value) => {
    return mongoose.Types.ObjectId.isValid(value);
};

// Helper function to handle validation results
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating/updating chats
export const chatValidationRules = {
    create: [
        body('userId')
            .optional()
            .custom(isValidObjectId)
            .withMessage('Invalid user ID format'),
        body('subject')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Subject must be between 1 and 200 characters'),
        body('message')
            .notEmpty()
            .withMessage('Message is required')
            .isString()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message must be between 1 and 5000 characters'),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent'])
            .withMessage('Priority must be low, normal, high, or urgent'),
        body('type')
            .optional()
            .isIn(['text', 'image', 'file', 'system'])
            .withMessage('Type must be text, image, file, or system'),
        validateRequest
    ],
    
    update: [
        param('id')
            .custom(value => {
                return isValidObjectId(value) || /^[a-zA-Z0-9_]+$/.test(value);
            })
            .withMessage('Invalid chat ID format'),
        body('status')
            .optional()
            .isIn(['active', 'pending', 'resolved', 'closed', 'deleted'])
            .withMessage('Status must be active, pending, resolved, closed, or deleted'),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent'])
            .withMessage('Priority must be low, normal, high, or urgent'),
        validateRequest
    ],
    
    message: [
        param('id')
            .custom(value => {
                return isValidObjectId(value) || /^[a-zA-Z0-9_]+$/.test(value);
            })
            .withMessage('Invalid chat ID format'),
        body('message')
            .notEmpty()
            .withMessage('Message is required')
            .isString()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message must be between 1 and 5000 characters'),
        body('type')
            .optional()
            .isIn(['text', 'image', 'file', 'system'])
            .withMessage('Type must be text, image, file, or system'),
        validateRequest
    ],
    
    get: [
        query('status')
            .optional()
            .isIn(['active', 'pending', 'resolved', 'closed', 'deleted', 'all'])
            .withMessage('Status must be active, pending, resolved, closed, deleted, or all'),
        query('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent', 'all'])
            .withMessage('Priority must be low, normal, high, urgent, or all'),
        query('search')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be between 1 and 100 characters'),
        validateRequest
    ]
};

// Security middleware to check if user has access to the chat
export const ensureChatAccess = async (req, res, next, Chat) => {
    try {
        const { id: chatId } = req.query;
        const userId = req.session.user.id;
        
        const chat = await Chat.findOne({
            $or: [
                { _id: chatId },
                { chatId: chatId }
            ],
            'participants.user': userId,
            status: { $ne: 'deleted' }
        });
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found or access denied' });
        }
        
        // Attach chat to request for later use
        req.chat = chat;
        next();
    } catch (error) {
        console.error('Error checking chat access:', error);
        res.status(500).json({ error: 'Server error while checking access' });
    }
};

// Security middleware to check if user is an admin
export const ensureAdmin = (req, res, next) => {
    if (!req.session?.user?.role || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};