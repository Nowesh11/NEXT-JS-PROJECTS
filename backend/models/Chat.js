import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required']
    },
    senderInfo: {
        name: String,
        email: String,
        role: String,
        avatar: String
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    isAdminMessage: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video', 'link', 'system'],
        default: 'text'
    },
    attachments: [{
        name: String,
        url: String,
        type: String, // image, document, audio, video
        size: Number,
        mimeType: String,
        thumbnail: String
    }],
    metadata: {
        edited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        originalContent: String,
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        mentions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        reactions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            emoji: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    status: {
        type: String,
        enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    deliveredAt: Date,
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
    },
    type: {
        type: String,
        enum: ['direct', 'group', 'support', 'announcement'],
        default: 'direct'
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Chat title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Chat description cannot exceed 500 characters']
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'member', 'guest'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        notifications: {
            type: Boolean,
            default: true
        },
        permissions: {
            canSendMessages: {
                type: Boolean,
                default: true
            },
            canSendFiles: {
                type: Boolean,
                default: true
            },
            canDeleteMessages: {
                type: Boolean,
                default: false
            },
            canAddParticipants: {
                type: Boolean,
                default: false
            }
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'banned', 'left'],
            default: 'active'
        }
    }],
    messages: [messageSchema],
    settings: {
        allowFileSharing: {
            type: Boolean,
            default: true
        },
        allowImageSharing: {
            type: Boolean,
            default: true
        },
        maxFileSize: {
            type: Number,
            default: 10485760 // 10MB in bytes
        },
        allowedFileTypes: [{
            type: String,
            default: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
        }],
        messageRetention: {
            type: Number,
            default: 365 // days
        },
        autoDeleteAfter: Number, // days
        requireApproval: {
            type: Boolean,
            default: false
        },
        moderationEnabled: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived', 'deleted'],
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    category: {
        type: String,
        enum: ['general', 'support', 'technical', 'academic', 'administrative', 'emergency'],
        default: 'general'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: Date,
    resolvedAt: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolution: {
        type: String,
        trim: true
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        ratedAt: Date
    },
    analytics: {
        totalMessages: {
            type: Number,
            default: 0
        },
        totalParticipants: {
            type: Number,
            default: 0
        },
        averageResponseTime: Number, // in minutes
        lastActivity: {
            type: Date,
            default: Date.now
        },
        messageFrequency: {
            daily: { type: Number, default: 0 },
            weekly: { type: Number, default: 0 },
            monthly: { type: Number, default: 0 }
        }
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        source: {
            type: String,
            enum: ['website', 'mobile-app', 'admin-panel', 'api'],
            default: 'website'
        },
        userAgent: String,
        ipAddress: String,
        location: {
            country: String,
            city: String,
            timezone: String
        }
    },
    archived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date,
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Virtual for unread count for a specific user
chatSchema.virtual('getUnreadCount').get(function() {
    return function(userId) {
        if (!this.lastMessage) return 0;
        const participant = this.participants.find(p => p.user.toString() === userId.toString());
        if (!participant) return 0;
        
        return this.messages.filter(msg => 
            msg.createdAt > participant.lastSeen && 
            msg.sender.toString() !== userId.toString() &&
            !msg.deleted
        ).length;
    }.bind(this);
});

// Virtual for active participants count
chatSchema.virtual('activeParticipantsCount').get(function() {
    return this.participants.filter(p => p.status === 'active').length;
});

// Virtual for chat duration
chatSchema.virtual('chatDuration').get(function() {
    if (this.messages.length === 0) return 0;
    const firstMessage = this.messages[0];
    const lastMessage = this.messages[this.messages.length - 1];
    return Math.floor((lastMessage.createdAt - firstMessage.createdAt) / (1000 * 60)); // minutes
});

// Virtual for is resolved
chatSchema.virtual('isResolved').get(function() {
    return !!this.resolvedAt;
});

// Pre-save middleware to update analytics
chatSchema.pre('save', function(next) {
    // Update total messages count
    this.analytics.totalMessages = this.messages.filter(msg => !msg.deleted).length;
    
    // Update total participants count
    this.analytics.totalParticipants = this.participants.filter(p => p.status === 'active').length;
    
    // Update last activity
    if (this.messages.length > 0) {
        this.analytics.lastActivity = this.messages[this.messages.length - 1].createdAt;
    }
    
    next();
});

// Method to add message
chatSchema.methods.addMessage = function(senderId, content, type = 'text', attachments = []) {
    const message = {
        sender: senderId,
        content,
        type,
        attachments,
        status: 'sent'
    };
    
    this.messages.push(message);
    this.analytics.lastActivity = new Date();
    
    return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId, messageId = null) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) return Promise.resolve(this);
    
    participant.lastSeen = new Date();
    
    if (messageId) {
        const message = this.messages.id(messageId);
        if (message && !message.readBy.some(r => r.user.toString() === userId.toString())) {
            message.readBy.push({ user: userId, readAt: new Date() });
            if (message.status === 'delivered') {
                message.status = 'read';
            }
        }
    } else {
        // Mark all unread messages as read
        this.messages.forEach(message => {
            if (message.sender.toString() !== userId.toString() && 
                !message.readBy.some(r => r.user.toString() === userId.toString())) {
                message.readBy.push({ user: userId, readAt: new Date() });
                if (message.status === 'delivered') {
                    message.status = 'read';
                }
            }
        });
    }
    
    return this.save();
};

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
    const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
    if (existingParticipant) {
        existingParticipant.status = 'active';
        existingParticipant.joinedAt = new Date();
    } else {
        this.participants.push({
            user: userId,
            role,
            joinedAt: new Date(),
            lastSeen: new Date()
        });
    }
    
    return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant) {
        participant.status = 'left';
    }
    
    return this.save();
};

// Method to delete message
chatSchema.methods.deleteMessage = function(messageId, deletedBy) {
    const message = this.messages.id(messageId);
    if (message) {
        message.deleted = true;
        message.deletedAt = new Date();
        message.deletedBy = deletedBy;
    }
    
    return this.save();
};

// Method to edit message
chatSchema.methods.editMessage = function(messageId, newContent) {
    const message = this.messages.id(messageId);
    if (message) {
        message.metadata.originalContent = message.content;
        message.content = newContent;
        message.metadata.edited = true;
        message.metadata.editedAt = new Date();
    }
    
    return this.save();
};

// Method to resolve chat
chatSchema.methods.resolve = function(resolvedBy, resolution) {
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    this.resolution = resolution;
    this.status = 'archived';
    
    return this.save();
};

// Static method to get user chats
chatSchema.statics.getUserChats = function(userId) {
    return this.find({
        'participants.user': userId,
        'participants.status': 'active',
        status: { $in: ['active', 'inactive'] }
    })
    .populate('participants.user', 'name email avatar role')
    .populate('assignedTo', 'name email role')
    .sort({ 'analytics.lastActivity': -1 });
};

// Static method to get support chats
chatSchema.statics.getSupportChats = function(status = 'active') {
    return this.find({
        type: 'support',
        status
    })
    .populate('participants.user', 'name email avatar role')
    .populate('assignedTo', 'name email role')
    .sort({ priority: -1, 'analytics.lastActivity': -1 });
};

// Indexes for efficient querying
chatSchema.index({ chatId: 1 });
chatSchema.index({ 'participants.user': 1, status: 1 });
chatSchema.index({ type: 1, status: 1 });
chatSchema.index({ assignedTo: 1, status: 1 });
chatSchema.index({ 'analytics.lastActivity': -1 });
chatSchema.index({ category: 1, priority: 1 });
chatSchema.index({ archived: 1, status: 1 });
chatSchema.index({ 'messages.sender': 1, 'messages.createdAt': -1 });

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);