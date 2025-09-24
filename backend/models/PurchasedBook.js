import mongoose from 'mongoose';

const purchasedBookSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    default: function() {
      return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
  },
  user: {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'User phone is required'],
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'] // Changed to required for user authentication
    }
  },
  books: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required']
    },
    title: {
      type: String,
      required: [true, 'Book title is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Book price is required'],
      min: [0, 'Price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    }
  }],
  payment: {
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['epayum', 'fbx']
    },
    instructions: {
      type: String,
      required: [true, 'Payment instructions are required']
    },
    file: {
      type: String, // Path to uploaded transaction file
      required: [true, 'Transaction file is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  shipping: {
    enabled: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      required: function() {
        return this.shipping.enabled;
      },
      trim: true
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered'],
      default: 'pending'
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  totals: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['individual', 'bulk'],
    required: [true, 'Order type is required']
  },
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order summary
purchasedBookSchema.virtual('orderSummary').get(function() {
  return {
    orderId: this.orderId,
    totalBooks: this.books.reduce((sum, book) => sum + book.quantity, 0),
    totalAmount: this.totals.total,
    status: this.status
  };
});

// Method to calculate totals
purchasedBookSchema.methods.calculateTotals = function() {
  this.totals.subtotal = this.books.reduce((sum, book) => sum + book.subtotal, 0);
  this.totals.shippingCost = this.shipping.enabled ? this.shipping.cost : 0;
  this.totals.total = this.totals.subtotal + this.totals.shippingCost + this.totals.tax;
  return this.totals;
};

// Method to update status
purchasedBookSchema.methods.updateStatus = function(newStatus, adminId = null) {
  this.status = newStatus;
  
  if (newStatus === 'shipped' && this.shipping.enabled) {
    this.shipping.status = 'shipped';
    this.shipping.shippedAt = new Date();
  }
  
  if (newStatus === 'delivered' && this.shipping.enabled) {
    this.shipping.status = 'delivered';
    this.shipping.deliveredAt = new Date();
  }
  
  return this.save();
};

// Static method to find orders by user email
purchasedBookSchema.statics.findByUserEmail = function(email) {
  return this.find({ 'user.email': email }).sort({ createdAt: -1 });
};

// Static method to find orders by user ID
purchasedBookSchema.statics.findByUserId = function(userId) {
  return this.find({ 'user.userId': userId }).sort({ createdAt: -1 });
};

// Pre-save middleware to calculate totals
purchasedBookSchema.pre('save', function(next) {
  if (this.isModified('books') || this.isModified('shipping')) {
    this.calculateTotals();
  }
  next();
});

// Indexes for better query performance
purchasedBookSchema.index({ orderId: 1 });
purchasedBookSchema.index({ 'user.email': 1 });
purchasedBookSchema.index({ 'user.userId': 1 });
purchasedBookSchema.index({ status: 1 });
purchasedBookSchema.index({ createdAt: -1 });
purchasedBookSchema.index({ 'payment.status': 1 });
purchasedBookSchema.index({ 'shipping.status': 1 });

export default mongoose.models.PurchasedBook || mongoose.model('PurchasedBook', purchasedBookSchema);