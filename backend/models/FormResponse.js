const mongoose = require('mongoose');

const FormResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    referenceNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    responseData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected', 'archived'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ip_address: {
        type: String
    },
    user_agent: {
        type: String
    },
    source: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web'
    },
    attachments: [{
        field_name: String,
        original_name: String,
        file_path: String,
        file_size: Number,
        mime_type: String,
        uploaded_at: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate reference number before saving
FormResponseSchema.pre('save', async function(next) {
    if (this.isNew && !this.reference_number) {
        const count = await this.constructor.countDocuments();
        const timestamp = Date.now().toString().slice(-6);
        this.reference_number = `FR${timestamp}${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Virtual for formatted submission date
FormResponseSchema.virtual('formatted_date').get(function() {
    return this.submitted_at.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Virtual for response summary
FormResponseSchema.virtual('response_summary').get(function() {
    const data = this.response_data;
    if (!data || data.size === 0) return 'No data';
    
    const entries = Array.from(data.entries()).slice(0, 3);
    return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
});

// Method to get response by field name
FormResponseSchema.methods.getFieldValue = function(fieldName) {
    return this.response_data.get(fieldName);
};

// Method to set response field
FormResponseSchema.methods.setFieldValue = function(fieldName, value) {
    this.response_data.set(fieldName, value);
};

// Method to validate response data against form fields
FormResponseSchema.methods.validateResponseData = async function() {
    const Form = mongoose.model('Form');
    const FormField = mongoose.model('FormField');
    
    const form = await Form.findById(this.form_id).populate('fields');
    if (!form) {
        throw new Error('Form not found');
    }
    
    const errors = [];
    
    // Check required fields
    for (const field of form.fields) {
        if (field.is_required) {
            const value = this.response_data.get(field.field_name);
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors.push(`${field.label_en} is required`);
            }
        }
    }
    
    // Validate field types and constraints
    for (const [fieldName, value] of this.response_data) {
        const field = form.fields.find(f => f.field_name === fieldName);
        if (!field) continue;
        
        if (!value || (typeof value === 'string' && value.trim() === '')) continue;
        
        switch (field.field_type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push(`${field.label_en} must be a valid email address`);
                }
                break;
                
            case 'phone':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    errors.push(`${field.label_en} must be a valid phone number`);
                }
                break;
                
            case 'url':
                try {
                    new URL(value);
                } catch {
                    errors.push(`${field.label_en} must be a valid URL`);
                }
                break;
                
            case 'number':
                if (isNaN(value)) {
                    errors.push(`${field.label_en} must be a valid number`);
                } else {
                    const numValue = parseFloat(value);
                    if (field.validation_rules?.min_value && numValue < field.validation_rules.min_value) {
                        errors.push(`${field.label_en} must be at least ${field.validation_rules.min_value}`);
                    }
                    if (field.validation_rules?.max_value && numValue > field.validation_rules.max_value) {
                        errors.push(`${field.label_en} must be at most ${field.validation_rules.max_value}`);
                    }
                }
                break;
                
            case 'text':
            case 'textarea':
                if (field.validation_rules?.min_length && value.length < field.validation_rules.min_length) {
                    errors.push(`${field.label_en} must be at least ${field.validation_rules.min_length} characters`);
                }
                if (field.validation_rules?.max_length && value.length > field.validation_rules.max_length) {
                    errors.push(`${field.label_en} must be at most ${field.validation_rules.max_length} characters`);
                }
                if (field.validation_rules?.pattern) {
                    const regex = new RegExp(field.validation_rules.pattern);
                    if (!regex.test(value)) {
                        errors.push(`${field.label_en} format is invalid`);
                    }
                }
                break;
        }
    }
    
    return errors;
};

// Index for better query performance
FormResponseSchema.index({ form_id: 1, submitted_at: -1 });
FormResponseSchema.index({ reference_number: 1 });
FormResponseSchema.index({ user_email: 1 });
FormResponseSchema.index({ status: 1 });
FormResponseSchema.index({ submitted_at: -1 });

module.exports = mongoose.model('FormResponse', FormResponseSchema);