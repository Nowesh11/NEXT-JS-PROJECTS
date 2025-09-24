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

// Unified schema for Projects, Activities, and Initiatives
const unifiedProjectSchema = new mongoose.Schema({
  title: createBilingualField(200, "title"),
  slug: {
    type: String,
    required: [true, "Slug is required"],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, "Slug cannot exceed 100 characters"]
  },
  bureau: {
    type: String,
    required: [true, "Bureau is required"],
    trim: true,
    maxlength: [100, "Bureau cannot exceed 100 characters"]
    // Note: No enum restriction to allow dynamic bureau values from frontend buttons
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
    required: [true, "Status is required"],
    enum: ["draft", "active", "archived", "completed", "on-hold"],
    default: "draft"
  },
  primary_image: {
    type: String,
    default: null
  },
  images: [{
    type: String,
    trim: true
  }],
  goals: createBilingualField(2000, "goals"),
  progress: {
    type: Number,
    min: [0, "Progress cannot be negative"],
    max: [100, "Progress cannot exceed 100%"],
    default: 0
  },
  // Additional fields for enhanced functionality
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: ["project", "activity", "initiative"],
    index: true
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  budget: {
    type: Number,
    min: [0, "Budget cannot be negative"],
    default: 0
  },
  participants_count: {
    type: Number,
    min: [0, "Participants count cannot be negative"],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  visibility: {
    type: String,
    enum: ["public", "private", "members-only"],
    default: "public"
  },
  featured: {
    type: Boolean,
    default: false
  },
  views_count: {
    type: Number,
    default: 0
  },
  likes_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
unifiedProjectSchema.virtual('primaryImage').get(function() {
  return this.primary_image || `/assets/default-${this.type}.jpg`;
});

unifiedProjectSchema.virtual('imagesCount').get(function() {
  return this.images ? this.images.length : 0;
});

unifiedProjectSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

unifiedProjectSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.progress === 100;
});

unifiedProjectSchema.virtual('duration').get(function() {
  if (this.start_date && this.end_date) {
    const diffTime = Math.abs(this.end_date - this.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

unifiedProjectSchema.virtual('progressStatus').get(function() {
  if (this.progress === 0) return 'not-started';
  if (this.progress < 25) return 'just-started';
  if (this.progress < 50) return 'in-progress';
  if (this.progress < 75) return 'halfway';
  if (this.progress < 100) return 'almost-done';
  return 'completed';
});

// Indexes for efficient querying
unifiedProjectSchema.index({ "title.en": "text", "title.ta": "text", "description.en": "text", "description.ta": "text" });
unifiedProjectSchema.index({ bureau: 1, type: 1 });
unifiedProjectSchema.index({ status: 1, type: 1 });
unifiedProjectSchema.index({ type: 1, featured: 1 });
unifiedProjectSchema.index({ createdAt: -1 });
unifiedProjectSchema.index({ updatedAt: -1 });
unifiedProjectSchema.index({ progress: 1 });
unifiedProjectSchema.index({ priority: 1 });
unifiedProjectSchema.index({ visibility: 1 });
unifiedProjectSchema.index({ tags: 1 });

// Pre-save middleware
unifiedProjectSchema.pre('save', function(next) {
  // Generate slug from English title
  if (this.isModified('title') || this.isNew) {
    if (this.title && this.title.en) {
      const baseSlug = this.title.en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Add type prefix to ensure uniqueness across types
      this.slug = `${this.type}-${baseSlug}`;
    }
  }
  
  // Validate bilingual content
  const validation = this.constructor.validateBilingualContent(this);
  if (!validation.isValid) {
    return next(new Error(`Bilingual validation failed: ${validation.errors.join(', ')}`));
  }
  
  // Auto-complete if progress is 100%
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  // Validate date range
  if (this.start_date && this.end_date && this.start_date > this.end_date) {
    return next(new Error('Start date cannot be after end date'));
  }
  
  next();
});

// Static methods
unifiedProjectSchema.statics.validateBilingualContent = function(doc) {
  const errors = [];
  const requiredFields = ['title', 'description', 'goals', 'director'];
  
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

unifiedProjectSchema.statics.findByType = function(type, filters = {}) {
  return this.find({ type, ...filters });
};

unifiedProjectSchema.statics.findByBureau = function(bureau, type = null) {
  const query = { bureau };
  if (type) query.type = type;
  return this.find(query);
};

unifiedProjectSchema.statics.findFeatured = function(type = null, limit = 10) {
  const query = { featured: true, status: 'active' };
  if (type) query.type = type;
  return this.find(query).limit(limit).sort({ createdAt: -1 });
};

unifiedProjectSchema.statics.getStatsByType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

// Instance methods
unifiedProjectSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.max(0, Math.min(100, newProgress));
  if (this.progress === 100) {
    this.status = 'completed';
  }
  return this.save();
};

unifiedProjectSchema.methods.addImage = function(imageUrl) {
  if (!this.images) this.images = [];
  this.images.push(imageUrl);
  return this.save();
};

unifiedProjectSchema.methods.removeImage = function(imageUrl) {
  if (this.images) {
    this.images = this.images.filter(img => img !== imageUrl);
  }
  return this.save();
};

unifiedProjectSchema.methods.incrementViews = function() {
  this.views_count += 1;
  return this.save();
};

unifiedProjectSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

// Export the model
const UnifiedProject = mongoose.models.UnifiedProject || mongoose.model('UnifiedProject', unifiedProjectSchema);

export default UnifiedProject;