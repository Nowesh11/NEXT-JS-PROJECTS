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

const posterSchema = new mongoose.Schema({
  title: createBilingualField(200, "title"),
  description: createBilingualField(1000, "description"),
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  link_url: {
    type: String,
    required: [true, 'Link URL is required'],
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['announcement', 'event', 'news', 'promotion', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnailUrl: {
    type: String
  },
  highResUrl: {
    type: String
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [1, 'Width must be positive']
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [1, 'Height must be positive']
    },
    unit: {
      type: String,
      enum: ['px', 'cm', 'in', 'mm'],
      default: 'px'
    }
  },
  fileInfo: {
    format: {
      type: String,
      enum: ['jpg', 'jpeg', 'png', 'pdf', 'svg', 'tiff'],
      required: [true, 'File format is required']
    },
    size: {
      type: Number, // in bytes
      min: [0, 'File size cannot be negative']
    },
    resolution: {
      type: Number, // DPI
      min: [72, 'Resolution must be at least 72 DPI'],
      default: 300
    },
    colorMode: {
      type: String,
      enum: ['RGB', 'CMYK', 'Grayscale'],
      default: 'RGB'
    }
  },
  pricing: {
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD']
    }
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isLimitedEdition: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    unlimitedStock: {
      type: Boolean,
      default: true
    }
  },
  printOptions: {
    availableSizes: [{
      name: {
        type: String,
        required: true
      },
      dimensions: {
        width: Number,
        height: Number,
        unit: {
          type: String,
          enum: ['cm', 'in', 'mm'],
          default: 'cm'
        }
      },
      price: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    }],
    paperTypes: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      additionalCost: {
        type: Number,
        default: 0,
        min: [0, 'Additional cost cannot be negative']
      }
    }],
    finishOptions: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      additionalCost: {
        type: Number,
        default: 0,
        min: [0, 'Additional cost cannot be negative']
      }
    }]
  },
  language: {
    type: String,
    enum: ['tamil', 'english', 'bilingual'],
    default: 'tamil'
  },
  culturalSignificance: {
    type: String,
    maxlength: [500, 'Cultural significance cannot exceed 500 characters']
  },
  historicalContext: {
    type: String,
    maxlength: [500, 'Historical context cannot exceed 500 characters']
  },
  stats: {
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative']
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, 'Download count cannot be negative']
    },
    purchaseCount: {
      type: Number,
      default: 0,
      min: [0, 'Purchase count cannot be negative']
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: [0, 'Favorite count cannot be negative']
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
posterSchema.virtual('discountedPrice').get(function() {
  if (this.pricing.discount > 0) {
    return this.pricing.price * (1 - this.pricing.discount / 100);
  }
  return this.pricing.price;
});

// Virtual for aspect ratio
posterSchema.virtual('aspectRatio').get(function() {
  return (this.dimensions.width / this.dimensions.height).toFixed(2);
});

// Virtual for file size in MB
posterSchema.virtual('fileSizeMB').get(function() {
  return this.fileInfo.size ? (this.fileInfo.size / (1024 * 1024)).toFixed(2) : 0;
});

// Virtual for popularity score
posterSchema.virtual('popularityScore').get(function() {
  const views = this.stats.viewCount || 0;
  const downloads = this.stats.downloadCount || 0;
  const purchases = this.stats.purchaseCount || 0;
  const favorites = this.stats.favoriteCount || 0;
  const rating = this.rating.average || 0;
  
  return (views * 0.1) + (downloads * 0.3) + (purchases * 0.4) + (favorites * 0.2) + (rating * 10);
});

// Pre-save middleware
posterSchema.pre('save', function(next) {
  // Set original price if not provided
  if (!this.pricing.originalPrice) {
    this.pricing.originalPrice = this.pricing.price;
  }
  
  // Generate slug if not provided
  if (!this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  next();
});

// Indexes for efficient querying
posterSchema.index({ category: 1, 'availability.isActive': 1 });
posterSchema.index({ 'availability.isFeatured': 1, 'availability.isActive': 1 });
posterSchema.index({ tags: 1 });
posterSchema.index({ 'pricing.price': 1 });
posterSchema.index({ 'rating.average': -1 });
posterSchema.index({ createdAt: -1 });
posterSchema.index({ status: 1 });

export default mongoose.models.Poster || mongoose.model('Poster', posterSchema);