import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        en: {
            type: String,
            required: [true, 'English title is required'],
            trim: true,
            maxlength: [200, 'English title cannot exceed 200 characters']
        },
        ta: {
            type: String,
            trim: true,
            maxlength: [200, 'Tamil title cannot exceed 200 characters']
        }
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        en: {
            type: String,
            required: [true, 'English description is required'],
            trim: true,
            maxlength: [2000, 'English description cannot exceed 2000 characters']
        },
        ta: {
            type: String,
            trim: true,
            maxlength: [2000, 'Tamil description cannot exceed 2000 characters']
        }
    },
    content: {
        en: {
            type: String,
            trim: true
        },
        ta: {
            type: String,
            trim: true
        }
    },
    type: {
        type: String,
        enum: ['general', 'urgent', 'event', 'academic', 'cultural', 'sports', 'technical', 'recruitment', 'deadline', 'celebration'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    category: {
        type: String,
        enum: ['news', 'event', 'update', 'reminder', 'alert', 'achievement', 'opportunity', 'notice'],
        default: 'news'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled', 'archived', 'expired'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'members-only', 'students-only', 'staff-only', 'private'],
        default: 'public'
    },
    targetAudience: [{
        type: String,
        enum: ['all', 'students', 'faculty', 'staff', 'alumni', 'parents', 'visitors', 'members']
    }],
    images: {
        featured: String,
        gallery: [String],
        thumbnail: String
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    links: [{
        title: {
            en: String,
            ta: String
        },
        url: {
            type: String,
            required: true,
            match: [/^https?:\/\/.*$/, 'Please provide a valid URL']
        },
        description: {
            en: String,
            ta: String
        },
        external: {
            type: Boolean,
            default: true
        }
    }],
    schedule: {
        publishAt: {
            type: Date,
            default: Date.now
        },
        expireAt: Date,
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        recurring: {
            enabled: {
                type: Boolean,
                default: false
            },
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'yearly']
            },
            interval: {
                type: Number,
                min: 1,
                default: 1
            },
            endDate: Date
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    authorInfo: {
        name: String,
        role: String,
        department: String,
        email: String
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    location: {
        venue: {
            en: String,
            ta: String
        },
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        mapLink: String
    },
    eventDetails: {
        startDate: Date,
        endDate: Date,
        startTime: String,
        endTime: String,
        duration: String,
        capacity: Number,
        registrationRequired: {
            type: Boolean,
            default: false
        },
        registrationLink: String,
        registrationDeadline: Date,
        contactPerson: {
            name: String,
            email: String,
            phone: String
        }
    },
    interactions: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
        bookmarks: {
            type: Number,
            default: 0
        }
    },
    engagement: {
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        sharedBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            platform: String,
            sharedAt: {
                type: Date,
                default: Date.now
            }
        }],
        bookmarkedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    notifications: {
        sent: {
            type: Boolean,
            default: false
        },
        sentAt: Date,
        channels: [{
            type: String,
            enum: ['email', 'sms', 'push', 'website', 'social']
        }],
        recipients: {
            total: {
                type: Number,
                default: 0
            },
            delivered: {
                type: Number,
                default: 0
            },
            opened: {
                type: Number,
                default: 0
            },
            clicked: {
                type: Number,
                default: 0
            }
        }
    },
    seo: {
        metaTitle: {
            en: String,
            ta: String
        },
        metaDescription: {
            en: String,
            ta: String
        },
        keywords: [String],
        canonicalUrl: String
    },
    featured: {
        type: Boolean,
        default: false
    },
    pinned: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date,
    lastModified: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {
        type: Number,
        default: 1
    },
    history: [{
        version: Number,
        changes: String,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        modifiedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for display title
announcementSchema.virtual('displayTitle').get(function() {
    return this.title.en || this.title.ta || 'Untitled';
});

// Virtual for display description
announcementSchema.virtual('displayDescription').get(function() {
    return this.description.en || this.description.ta || '';
});

// Virtual for reading time (words per minute = 200)
announcementSchema.virtual('readingTime').get(function() {
    const content = (this.content.en || this.content.ta || this.description.en || this.description.ta || '').split(' ').length;
    return Math.ceil(content / 200);
});

// Virtual for status display
announcementSchema.virtual('statusDisplay').get(function() {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Virtual for priority display
announcementSchema.virtual('priorityDisplay').get(function() {
    return this.priority.charAt(0).toUpperCase() + this.priority.slice(1);
});

// Virtual for engagement rate
announcementSchema.virtual('engagementRate').get(function() {
    if (this.interactions.views === 0) return 0;
    const totalEngagements = this.interactions.likes + this.interactions.shares + this.interactions.comments;
    return ((totalEngagements / this.interactions.views) * 100).toFixed(2);
});

// Virtual for time until expiry
announcementSchema.virtual('timeUntilExpiry').get(function() {
    if (!this.schedule.expireAt) return null;
    const now = new Date();
    const expiry = new Date(this.schedule.expireAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Less than an hour';
});

// Virtual for is active
announcementSchema.virtual('isActive').get(function() {
    const now = new Date();
    const publishAt = new Date(this.schedule.publishAt);
    const expireAt = this.schedule.expireAt ? new Date(this.schedule.expireAt) : null;
    
    return this.status === 'published' && 
           now >= publishAt && 
           (!expireAt || now <= expireAt) && 
           !this.archived;
});

// Pre-save middleware to generate slug
announcementSchema.pre('save', function(next) {
    if (this.isModified('title.en') || !this.slug) {
        const title = this.title.en || this.title.ta || 'announcement';
        this.slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    // Update last modified
    if (this.isModified() && !this.isNew) {
        this.lastModified = new Date();
        this.version += 1;
    }
    
    // Auto-expire if past expiry date
    if (this.schedule.expireAt && new Date() > this.schedule.expireAt && this.status === 'published') {
        this.status = 'expired';
    }
    
    next();
});

// Method to increment views
announcementSchema.methods.incrementViews = function() {
    this.interactions.views += 1;
    return this.save();
};

// Method to toggle like
announcementSchema.methods.toggleLike = function(userId) {
    const index = this.engagement.likedBy.indexOf(userId);
    if (index > -1) {
        this.engagement.likedBy.splice(index, 1);
        this.interactions.likes -= 1;
    } else {
        this.engagement.likedBy.push(userId);
        this.interactions.likes += 1;
    }
    return this.save();
};

// Method to add share
announcementSchema.methods.addShare = function(userId, platform) {
    this.engagement.sharedBy.push({ user: userId, platform });
    this.interactions.shares += 1;
    return this.save();
};

// Method to toggle bookmark
announcementSchema.methods.toggleBookmark = function(userId) {
    const index = this.engagement.bookmarkedBy.indexOf(userId);
    if (index > -1) {
        this.engagement.bookmarkedBy.splice(index, 1);
        this.interactions.bookmarks -= 1;
    } else {
        this.engagement.bookmarkedBy.push(userId);
        this.interactions.bookmarks += 1;
    }
    return this.save();
};

// Static method to get active announcements
announcementSchema.statics.getActive = function(options = {}) {
    const now = new Date();
    const query = {
        status: 'published',
        'schedule.publishAt': { $lte: now },
        $or: [
            { 'schedule.expireAt': { $exists: false } },
            { 'schedule.expireAt': null },
            { 'schedule.expireAt': { $gte: now } }
        ],
        archived: false
    };
    
    if (options.type) query.type = options.type;
    if (options.category) query.category = options.category;
    if (options.visibility) query.visibility = options.visibility;
    if (options.featured !== undefined) query.featured = options.featured;
    if (options.pinned !== undefined) query.pinned = options.pinned;
    
    return this.find(query)
        .populate('author', 'name email role')
        .sort({ pinned: -1, priority: -1, 'schedule.publishAt': -1 });
};

// Static method to get by priority
announcementSchema.statics.getByPriority = function(priority) {
    return this.getActive({ priority });
};

// Indexes for efficient querying
announcementSchema.index({ status: 1, 'schedule.publishAt': -1 });
announcementSchema.index({ type: 1, status: 1 });
announcementSchema.index({ category: 1, status: 1 });
announcementSchema.index({ priority: 1, status: 1 });
announcementSchema.index({ featured: 1, pinned: 1, status: 1 });
announcementSchema.index({ 'schedule.expireAt': 1 });
announcementSchema.index({ archived: 1, status: 1 });
announcementSchema.index({ 'title.en': 'text', 'title.ta': 'text', 'description.en': 'text', 'description.ta': 'text' });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);