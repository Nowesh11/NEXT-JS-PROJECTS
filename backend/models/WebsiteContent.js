import mongoose from 'mongoose';

// Helper function to create bilingual required fields
const createBilingualField = (maxLength, fieldName) => ({
  en: {
    type: String,
    required: [true, `English ${fieldName} is required for bilingual content`],
    trim: true,
    maxlength: [maxLength, `English ${fieldName} cannot exceed ${maxLength} characters`]
  },
  ta: {
    type: String,
    required: [true, `Tamil ${fieldName} is required for bilingual content`],
    trim: true,
    maxlength: [maxLength, `Tamil ${fieldName} cannot exceed ${maxLength} characters`]
  }
});

// Helper function for optional bilingual fields
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

const websiteContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: [true, "Page identifier is required"],
    enum: ["global", "home", "about", "contact", "footer", "header", "hero", "services", "testimonials", "faq", "navigation", "logo", "books", "ebooks", "projects", "team", "announcements", "activities", "initiatives", "homepage", "login", "signup", "admin-login", "admin", "posters", "dashboard", "profile", "cart", "checkout", "orders", "notifications", "settings", "help", "privacy", "terms", "404", "error", "reset-password", "forgot-password", "detail"],
    index: true
  },
  section: {
    type: String,
    required: [true, "Section identifier is required"],
    trim: true,
    maxlength: [100, "Section identifier cannot exceed 100 characters"]
  },
  sectionKey: {
    type: String,
    required: [true, "Section key is required"],
    trim: true,
    maxlength: [100, "Section key cannot exceed 100 characters"]
  },
  sectionType: {
    type: String,
    enum: ["text", "image", "image-text", "feature-list", "hero", "banner", "cards", "cta", "gallery", "form", "statistics", "announcements", "navigation", "footer", "carousel", "testimonial", "stats", "custom"],
    default: "text"
  },
  layout: {
    type: String,
    enum: ["full-width", "one-column", "two-column", "three-column", "four-column", "grid", "flex", "carousel", "custom"],
    default: "full-width"
  },
  position: {
    type: Number,
    default: 0
  },
  title: createBilingualField(200, "title"),
  content: createBilingualField(5000, "content"),
  subtitle: createOptionalBilingualField(300, "subtitle"),
  buttonText: createOptionalBilingualField(50, "button text"),
  buttonUrl: {
    type: String,
    trim: true,
    maxlength: [500, "Button URL cannot exceed 500 characters"]
  },
  image: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: createBilingualField(200, "image alt text"),
    caption: createOptionalBilingualField(300, "image caption"),
    order: {
      type: Number,
      default: 0
    }
  }],
  videos: [{
    url: {
      type: String,
      required: true
    },
    title: createOptionalBilingualField(200, "video title"),
    description: createOptionalBilingualField(500, "video description"),
    thumbnail: String,
    duration: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  stylePreset: {
    type: String,
    enum: ["default", "modern", "classic", "minimal", "bold", "elegant"],
    default: "default"
  },
  customStyles: {
    type: mongoose.Schema.Types.Mixed // For custom CSS properties
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  hasTamilTranslation: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // For flexible additional data
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  
  // Additional content fields for enhanced CMS
  order: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Style and appearance
  stylePreset: {
    type: String,
    enum: ['default', 'highlight', 'dark', 'light', 'primary', 'secondary', 'accent'],
    default: 'default'
  },
  customCSS: {
    type: String,
    trim: true
  },
  backgroundColor: {
    type: String,
    trim: true
  },
  textColor: {
    type: String,
    trim: true
  },
  
  // Global content flag
  isGlobal: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Additional data for complex sections
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Feature list specific fields
  features: [{
    icon: {
      type: String,
      trim: true
    },
    title: createBilingualField(200, "feature title"),
    description: createBilingualField(500, "feature description"),
    image: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }],
  
  // Stats specific fields
  stats: [{
    number: {
      type: String,
      trim: true
    },
    label: createBilingualField(100, "stat label"),
    suffix: {
      type: String,
      trim: true
    },
    prefix: {
      type: String,
      trim: true
    }
  }],
  
  // Testimonial specific fields
  testimonials: [{
    name: {
      type: String,
      trim: true
    },
    role: createBilingualField(100, "testimonial role"),
    company: {
      type: String,
      trim: true
    },
    content: createBilingualField(1000, "testimonial content"),
    image: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Links and CTAs
  links: [{
    url: {
      type: String,
      trim: true
    },
    text: createBilingualField(100, "link text"),
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self'
    },
    type: {
      type: String,
      enum: ['primary', 'secondary', 'link'],
      default: 'primary'
    }
  }],
  
  // Primary image for sections
  primaryImage: {
    type: String,
    trim: true
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  
  seoTitle: {
    type: String,
    maxlength: [60, "SEO title cannot exceed 60 characters"]
  },
  seoDescription: {
    type: String,
    maxlength: [160, "SEO description cannot exceed 160 characters"]
  },
  seoKeywords: {
    en: {
      type: [String],
      required: [true, "English SEO keywords are required for bilingual content"],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "At least one English SEO keyword is required"
      }
    },
    ta: {
      type: [String],
      required: [true, "Tamil SEO keywords are required for bilingual content"],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "At least one Tamil SEO keyword is required"
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for page, section, and sectionKey (unique combination)
websiteContentSchema.index({ page: 1, sectionKey: 1 }, { unique: true });

// Index for performance
websiteContentSchema.index({ page: 1, section: 1 });
websiteContentSchema.index({ isActive: 1, isVisible: 1 });
websiteContentSchema.index({ publishedAt: 1, expiresAt: 1 });
websiteContentSchema.index({ position: 1, createdAt: 1 });

// Virtual for checking if content is currently published
websiteContentSchema.virtual('isPublished').get(function() {
  const now = new Date();
  const isPublished = !this.publishedAt || this.publishedAt <= now;
  const isNotExpired = !this.expiresAt || this.expiresAt > now;
  return isPublished && isNotExpired && this.isActive && this.isVisible;
});

// Method to get content for specific language
websiteContentSchema.methods.getLocalizedContent = function(lang = 'en') {
  const content = this.toObject();
  
  // Transform bilingual fields to single language
  if (content.title && typeof content.title === 'object') {
    content.title = content.title[lang] || content.title.en;
  }
  if (content.content && typeof content.content === 'object') {
    content.content = content.content[lang] || content.content.en;
  }
  if (content.subtitle && typeof content.subtitle === 'object') {
    content.subtitle = content.subtitle[lang] || content.subtitle.en;
  }
  if (content.buttonText && typeof content.buttonText === 'object') {
    content.buttonText = content.buttonText[lang] || content.buttonText.en;
  }
  
  // Transform features
  if (content.features && content.features.length > 0) {
    content.features = content.features.map(feature => ({
      ...feature,
      title: feature.title[lang] || feature.title.en,
      description: feature.description[lang] || feature.description.en
    }));
  }
  
  // Transform stats
  if (content.stats && content.stats.length > 0) {
    content.stats = content.stats.map(stat => ({
      ...stat,
      label: stat.label[lang] || stat.label.en
    }));
  }
  
  // Transform testimonials
  if (content.testimonials && content.testimonials.length > 0) {
    content.testimonials = content.testimonials.map(testimonial => ({
      ...testimonial,
      role: testimonial.role[lang] || testimonial.role.en,
      content: testimonial.content[lang] || testimonial.content.en
    }));
  }
  
  // Transform links
  if (content.links && content.links.length > 0) {
    content.links = content.links.map(link => ({
      ...link,
      text: link.text[lang] || link.text.en
    }));
  }
  
  return content;
};

// Instance method to update content
websiteContentSchema.methods.updateContent = function(updateData) {
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      this[key] = updateData[key];
    }
  });
  
  this.version += 1;
  return this.save();
};

// Static method to get published content for a page
websiteContentSchema.statics.getPublishedContent = function(page, lang = null) {
  const now = new Date();
  const query = {
    page,
    isActive: true,
    isVisible: true,
    $or: [
      { publishedAt: { $lte: now } },
      { publishedAt: null }
    ],
    $and: [
      {
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: null }
        ]
      }
    ]
  };
  
  let queryBuilder = this.find(query)
    .sort('order position createdAt')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
    
  return queryBuilder;
};

// Static method to get global content
websiteContentSchema.statics.getGlobalContent = function(language = 'en') {
  return this.find({ 
    page: 'global', 
    isActive: true, 
    isVisible: true 
  }).sort({ order: 1, position: 1 });
};

// Static method to get page content
websiteContentSchema.statics.getPageContent = function(page, language = 'en') {
  return this.find({ 
    page: page, 
    isActive: true, 
    isVisible: true 
  }).sort({ order: 1, position: 1 });
};

// Static method to get content by section key
websiteContentSchema.statics.getByKey = function(sectionKey) {
  return this.findOne({ sectionKey, isActive: true });
};

// Pre-save middleware to generate sectionKey if not provided and set global flag
websiteContentSchema.pre('save', function(next) {
  // Set isGlobal flag for global page content
  if (this.page === 'global') {
    this.isGlobal = true;
  }
  
  next();
});

export default mongoose.models.WebsiteContent || mongoose.model('WebsiteContent', websiteContentSchema);