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

// Helper function for optional bilingual field
const createOptionalBilingualField = (maxLength, fieldName) => ({
    en: {
        type: String,
        trim: true,
        maxlength: [maxLength, `English ${fieldName} cannot exceed ${maxLength} characters`]
    },
    ta: {
        type: String,
        trim: true,
        maxlength: [maxLength, `Tamil ${fieldName} cannot exceed ${maxLength} characters`]
    }
});

const TeamSchema = new mongoose.Schema({
    name: createBilingualField(100, "name"),
    role: createBilingualField(100, "role"),
    position: {
        type: String,
        required: [true, "Position is required"],
        enum: {
            values: [
                "President", 
                "Vice President", 
                "Secretary", 
                "Treasurer", 
                "Executive Committee - Media & Public Relations Bureau",
                "Executive Committee - Sports & Leadership Bureau", 
                "Executive Committee - Education & Intellectual Bureau",
                "Executive Committee - Arts & Culture Bureau",
                "Executive Committee - Social Welfare & Voluntary Bureau",
                "Executive Committee - Language & Literature Bureau",
                "Chief Auditor",
                "Auditor",
                "Member"
            ],
            message: "Position must be one of the specified organizational roles"
        }
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, "Department cannot be more than 100 characters"]
    },
    bio: createOptionalBilingualField(1000, "bio"),
    image: {
        type: String,
        default: "/assets/default-avatar.jpg"
    },
    profilePicture: {
        type: String,
        default: "/assets/default-avatar.jpg"
    },
    photo: {
        type: String,
        default: "/assets/default-avatar.jpg"
    },
    contact: {
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email"
            ]
        },
        phone: {
            type: String,
            maxlength: [20, "Phone number cannot be more than 20 characters"]
        }
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    phone: {
        type: String,
        maxlength: [20, "Phone number cannot be more than 20 characters"]
    },
    order: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create index for position and order for efficient querying
TeamSchema.index({ position: 1, order: 1 });

// Static method to get hierarchy order for sorting
TeamSchema.statics.getHierarchyOrder = function(position) {
    const hierarchy = {
        'President': 1,
        'Vice President': 2,
        'Secretary': 3,
        'Treasurer': 4,
        'Executive Committee - Media & Public Relations Bureau': 5,
        'Executive Committee - Sports & Leadership Bureau': 6,
        'Executive Committee - Education & Intellectual Bureau': 7,
        'Executive Committee - Arts & Culture Bureau': 8,
        'Executive Committee - Social Welfare & Voluntary Bureau': 9,
        'Executive Committee - Language & Literature Bureau': 10,
        'Chief Auditor': 11,
        'Auditor': 12,
        'Member': 13
    };
    return hierarchy[position] || 999;
};

// Instance method to get display name for position
TeamSchema.methods.getPositionDisplayName = function() {
    // Since positions are now stored with proper display names, return as-is
    return this.position;
};

// Instance method to get short position name for compact display
TeamSchema.methods.getShortPositionName = function() {
    const shortNames = {
        'President': 'President',
        'Vice President': 'Vice President',
        'Secretary': 'Secretary',
        'Treasurer': 'Treasurer',
        'Executive Committee - Media & Public Relations Bureau': 'EC - Media & PR',
        'Executive Committee - Sports & Leadership Bureau': 'EC - Sports & Leadership',
        'Executive Committee - Education & Intellectual Bureau': 'EC - Education & Intellectual',
        'Executive Committee - Arts & Culture Bureau': 'EC - Arts & Culture',
        'Executive Committee - Social Welfare & Voluntary Bureau': 'EC - Social Welfare',
        'Executive Committee - Language & Literature Bureau': 'EC - Language & Literature',
        'Chief Auditor': 'Chief Auditor',
        'Auditor': 'Auditor',
        'Member': 'Member'
    };
    return shortNames[this.position] || this.position;
};

// Pre-save validation for bilingual content
TeamSchema.pre('save', function(next) {
    const validation = this.constructor.validateBilingualContent(this);
    if (!validation.isValid) {
        return next(new Error(`Bilingual validation failed: ${validation.errors.join(', ')}`));
    }
    next();
});

// Static method to validate bilingual content
TeamSchema.statics.validateBilingualContent = function(doc) {
    const errors = [];
    const requiredFields = ['name', 'role'];
    
    for (const field of requiredFields) {
        if (!doc[field] || typeof doc[field] !== 'object') {
            errors.push(`${field} must be an object with en and ta properties`);
            continue;
        }
        
        if (!doc[field].en || !doc[field].en.trim()) {
            errors.push(`English ${field} is required`);
        }
        
        if (!doc[field].ta || !doc[field].ta.trim()) {
            errors.push(`Tamil ${field} is required`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);