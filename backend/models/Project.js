import mongoose from 'mongoose';

// Helper function to create bilingual field with validation
const createBilingualField = (maxLength, fieldName) => ({
    en: {
        type: String,
        required: [true, `English ${fieldName} is required`],
        trim: true,
        maxlength: [maxLength, `English ${fieldName} cannot exceed ${maxLength} characters`]
    },
    ta: {
        type: String,
        required: [true, `Tamil ${fieldName} is required`],
        trim: true,
        maxlength: [maxLength, `Tamil ${fieldName} cannot exceed ${maxLength} characters`]
    }
});

const projectSchema = new mongoose.Schema({
    title: createBilingualField(200, "title"),
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [100, "Slug cannot exceed 100 characters"]
    },
    type: {
        type: String,
        required: [true, "Project type is required"],
        enum: ["project", "activity", "initiative"],
        default: "project"
    },
    bureau: {
        type: String,
        required: [true, "Bureau is required"],
        enum: [
            "media-public-relations",
            "sports-leadership", 
            "education-intellectual",
            "arts-culture",
            "social-welfare-voluntary",
            "language-literature"
        ]
    },
    description: createBilingualField(3000, "description"),
    director: createBilingualField(100, "director"),
    director_name: {
        type: String,
        required: [true, "Director name is required"],
        trim: true,
        maxlength: [100, "Director name cannot exceed 100 characters"]
    },
    director_email: {
        type: String,
        required: [true, "Director email is required"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
    },
    director_phone: {
        type: String,
        trim: true,
        maxlength: [20, "Director phone cannot exceed 20 characters"]
    },
    status: {
        type: String,
        required: [true, "Project status is required"],
        enum: ["draft", "active", "archived"],
        default: "draft"
    },
    primary_image_url: {
        type: String,
        default: null
    },
    images_count: {
        type: Number,
        default: 0
    },
    goals: createBilingualField(2000, "goals"),
    progress: {
        type: Number,
        min: [0, "Progress cannot be negative"],
        max: [100, "Progress cannot exceed 100%"],
        default: 0
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    budget: {
        type: Number,
        min: [0, "Budget cannot be negative"]
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['crew', 'volunteer', 'participant'],
            default: 'participant'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'completed'],
            default: 'active'
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'members-only'],
        default: 'public'
    },
    recruitmentActive: {
        type: Boolean,
        default: false
    },
    recruitmentStartDate: Date,
    recruitmentEndDate: Date,
    maxParticipants: {
        type: Number,
        min: [1, "Max participants must be at least 1"]
    },
    requirements: createBilingualField(1000, "requirements"),
    benefits: createBilingualField(1000, "benefits"),
    location: {
        type: String,
        trim: true
    },
    contactInfo: {
        email: String,
        phone: String,
        website: String
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String
    },
    resources: [{
        title: String,
        url: String,
        type: {
            type: String,
            enum: ['document', 'video', 'image', 'link', 'other'],
            default: 'link'
        }
    }],
    milestones: [{
        title: createBilingualField(200, "milestone title"),
        description: createBilingualField(500, "milestone description"),
        targetDate: Date,
        completedDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
            default: 'pending'
        }
    }],
    metrics: {
        views: {
            type: Number,
            default: 0
        },
        applications: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for primary image
projectSchema.virtual("primaryImage").get(function() {
    return this.primary_image_url || "/assets/default-project.jpg";
});

// Virtual for images count
projectSchema.virtual("imagesCount").get(function() {
    return this.images_count || 0;
});

// Virtual for recruitment status
projectSchema.virtual("isRecruitmentOpen").get(function() {
    if (!this.recruitmentActive) return false;
    const now = new Date();
    const startDate = this.recruitmentStartDate;
    const endDate = this.recruitmentEndDate;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
});

// Virtual for participant count
projectSchema.virtual("participantCount").get(function() {
    return this.participants ? this.participants.length : 0;
});

// Virtual for available spots
projectSchema.virtual("availableSpots").get(function() {
    if (!this.maxParticipants) return null;
    return Math.max(0, this.maxParticipants - this.participantCount);
});

// Index for search functionality
projectSchema.index({
    'title.en': 'text',
    'title.ta': 'text',
    'description.en': 'text',
    'description.ta': 'text'
});

// Index for filtering
projectSchema.index({ bureau: 1, status: 1 });
projectSchema.index({ featured: 1, priority: 1 });
projectSchema.index({ recruitmentActive: 1, recruitmentEndDate: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);