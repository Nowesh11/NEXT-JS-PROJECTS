const mongoose = require('mongoose');
const slugify = require('slugify');

// Field schema for form fields
const FieldSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['short-text', 'paragraph', 'email', 'phone', 'number', 'date', 'select', 'radio', 'checkboxes', 'file-upload', 'section-break']
    },
    required: {
        type: Boolean,
        default: false
    },
    options: {
        type: [String],
        default: []
    },
    placeholder: {
        type: String
    },
    helpText: {
        type: String
    },
    validation: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, { _id: false });

const FormSchema = new mongoose.Schema({
    title: {
        type: Object,
        required: [true, 'Please add a form title'],
        en: {
            type: String,
            required: [true, 'Please add an English title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters']
        },
        ta: {
            type: String,
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters']
        }
    },
    slug: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Please specify target type'],
        enum: ['project', 'activity', 'initiative']
    },
    linkedId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Please specify the linked entity ID'],
        refPath: 'type'
    },
    role: {
        type: String,
        required: [true, 'Please specify role'],
        enum: ['crew', 'volunteer', 'participant']
    },
    description: {
        type: Object,
        en: {
            type: String,
            maxlength: [1000, 'Description cannot be more than 1000 characters']
        },
        ta: {
            type: String,
            maxlength: [1000, 'Description cannot be more than 1000 characters']
        }
    },
    fields: {
        type: [FieldSchema],
        required: [true, 'Please add at least one field']
    },
    startDate: {
        type: Date,
        required: [true, 'Please add start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please add end date']
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    settings: {
        allowMultipleSubmissions: {
            type: Boolean,
            default: false
        },
        maxApplications: {
            type: Number,
            default: null
        },
        requireAuthentication: {
            type: Boolean,
            default: true
        },
        autoClose: {
            type: Boolean,
            default: true
        },
        notifyAdmin: {
            type: Boolean,
            default: true
        },
        notifyApplicant: {
            type: Boolean,
            default: true
        }
    },
    responseCount: {
        type: Number,
        default: 0
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create form slug from title
FormSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    this.updated_at = Date.now();
    next();
});

// Validate that available_date is before deadline_date
FormSchema.pre('save', function(next) {
    if (this.available_date >= this.deadline_date) {
        next(new Error('Available date must be before deadline date'));
    }
    next();
});

// Set target_type_model based on target_type
FormSchema.pre('save', function(next) {
    if (this.target_type && this.target_id) {
        switch (this.target_type) {
            case 'project':
                this.target_type_model = 'Project';
                break;
            case 'activity':
                this.target_type_model = 'Activity';
                break;
            case 'initiative':
                this.target_type_model = 'Initiative';
                break;
        }
    }
    next();
});

// Virtual for form fields
FormSchema.virtual('formFields', {
    ref: 'FormField',
    localField: '_id',
    foreignField: 'form_id',
    justOne: false
});

// Virtual for form responses
FormSchema.virtual('responses', {
    ref: 'FormResponse',
    localField: '_id',
    foreignField: 'form_id',
    justOne: false
});

// Virtual for response count
FormSchema.virtual('response_count', {
    ref: 'FormResponse',
    localField: '_id',
    foreignField: 'form_id',
    count: true
});

// Virtual for form status based on dates
FormSchema.virtual('computedStatus').get(function() {
    const now = new Date();
    if (!this.is_active) {
        return 'inactive';
    }
    if (now < this.available_date) {
        return 'upcoming';
    }
    if (now > this.deadline_date) {
        return 'expired';
    }
    return 'active';
});

// Virtual for CTA button text based on role
FormSchema.virtual('cta_text').get(function() {
    switch (this.role) {
        case 'crew':
            return 'Work With Us';
        case 'volunteer':
            return 'Volunteering';
        case 'participant':
            return 'Participate';
        default:
            return 'Apply';
    }
});

// Index for better query performance
FormSchema.index({ target_type: 1, target_id: 1, role: 1 });
FormSchema.index({ available_date: 1, deadline_date: 1 });
FormSchema.index({ is_active: 1 });

module.exports = mongoose.model('Form', FormSchema);