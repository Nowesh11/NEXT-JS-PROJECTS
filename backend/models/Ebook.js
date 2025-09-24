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

const ebookSchema = new mongoose.Schema({
  title: createBilingualField(200, "title"),
  author: createBilingualField(100, "author"),
  description: createBilingualField(2000, "description"),
  fileUrl: {
    type: String,
    required: [true, 'Ebook file URL is required']
  },
  coverImage: {
    type: String,
    default: '/assets/default-ebook-cover.svg'
  },
  category: {
    type: String,
    required: [true, 'Ebook category is required'],
    enum: ['poetry', 'literature', 'history', 'culture', 'language', 'children', 'academic', 'fiction', 'non-fiction', 'biography', 'education', 'other']
  },
  bookLanguage: {
    type: String,
    enum: ['tamil', 'english', 'bilingual'],
    default: 'tamil'
  },
  tags: [{
    type: String,
    trim: true
  }],
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
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  publisher: createOptionalBilingualField(100, 'publisher'),
  pages: {
    type: Number,
    min: [1, 'Page count must be at least 1']
  },
  fileFormat: {
    type: String,
    enum: ['PDF', 'EPUB', 'MOBI', 'TXT'],
    default: 'PDF'
  },
  fileSize: {
    type: Number, // in bytes
    min: [0, 'File size cannot be negative']
  },
  isFree: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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
  seoTitle: createOptionalBilingualField(100, 'SEO title'),
  seoDescription: createOptionalBilingualField(200, 'SEO description'),
  seoKeywords: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
ebookSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for file size in MB
ebookSchema.virtual('fileSizeMB').get(function() {
  return this.fileSize ? (this.fileSize / (1024 * 1024)).toFixed(2) : 0;
});

// Index for search functionality
ebookSchema.index({
    'title.en': 'text',
    'title.ta': 'text',
    'author.en': 'text',
    'author.ta': 'text',
    'description.en': 'text',
    'description.ta': 'text'
});

// Index for category and price filtering
ebookSchema.index({ category: 1, price: 1 });
ebookSchema.index({ featured: 1, newArrival: 1 });
ebookSchema.index({ bookLanguage: 1 });
ebookSchema.index({ tags: 1 });
ebookSchema.index({ publishedDate: -1 });
ebookSchema.index({ status: 1 });
ebookSchema.index({ 'ratings.average': -1 });
ebookSchema.index({ downloadCount: -1 });
ebookSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate original price if not provided
ebookSchema.pre('save', function(next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

export default mongoose.models.Ebook || mongoose.model('Ebook', ebookSchema);