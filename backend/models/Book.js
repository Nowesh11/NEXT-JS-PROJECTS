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

const bookSchema = new mongoose.Schema({
    title: createBilingualField(200, "title"),
    author: createBilingualField(100, "author"),
    description: createBilingualField(2000, "description"),
    category: {
        type: String,
        required: [true, "Book category is required"],
        enum: ["poetry", "literature", "history", "culture", "language", "children", "academic", "fiction", "non-fiction", "biography", "education", "other"]
    },
    price: {
        type: Number,
        required: [true, "Book price is required"],
        min: [0, "Price cannot be negative"]
    },
    originalPrice: {
        type: Number,
        min: [0, "Original price cannot be negative"]
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock cannot be negative"],
        default: 0
    },
    isbn: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    publisher: createOptionalBilingualField(100, "publisher"),
    publicationDate: {
        type: Date
    },
    pages: {
        type: Number,
        min: [1, "Pages must be at least 1"]
    },
    language: {
        type: String,
        enum: ["tamil", "english", "bilingual"],
        default: "tamil"
    },
    coverImage: {
        type: String,
        default: "/assets/default-book-cover.svg"
    },
    images: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    bestseller: {
        type: Boolean,
        default: false
    },
    newArrival: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"],
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
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
            maxlength: [500, "Review comment cannot exceed 500 characters"]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ["active", "inactive", "out-of-stock", "discontinued"],
        default: "active"
    },
    weight: {
        type: Number,
        min: [0, "Weight cannot be negative"]
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    shippingInfo: createOptionalBilingualField(500, "shipping info"),
    seoTitle: createOptionalBilingualField(100, "SEO title"),
    seoDescription: createOptionalBilingualField(200, "SEO description"),
    seoKeywords: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for discounted price
bookSchema.virtual('discountedPrice').get(function() {
    if (this.discount > 0) {
        return this.price * (1 - this.discount / 100);
    }
    return this.price;
});

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function() {
    return this.status === 'active' && this.stock > 0;
});

// Index for search functionality
bookSchema.index({
    'title.en': 'text',
    'title.ta': 'text',
    'author.en': 'text',
    'author.ta': 'text',
    'description.en': 'text',
    'description.ta': 'text'
});

// Index for category and price filtering
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ featured: 1, bestseller: 1, newArrival: 1 });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);