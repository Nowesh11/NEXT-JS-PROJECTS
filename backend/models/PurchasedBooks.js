import mongoose from 'mongoose';

// Counter schema for generating order IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// Function to generate next order ID
async function getNextOrderId() {
  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ORD-${String(counter.seq).padStart(5, '0')}`;
}

const PurchasedBooksSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[\+]?[0-9\s\-\(\)]{10,20}$/, 'Please provide a valid phone number']
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
      min: [1, 'Quantity must be at least 1'],
      max: [100, 'Quantity cannot exceed 100']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: true
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
      required: true
    },
    file: {
      type: String,
      validate: {
        validator: function(value) {
          if (!value) return true; // Optional field
          return /^uploads\/orders\/[^/]+\/.+\.(pdf|jpg|jpeg|png)$/i.test(value);
        },
        message: 'Payment file must be a valid PDF or image file path'
      }
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolder: String
    },
    epayumLink: String,
    transactionId: {
      type: String,
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String
  },
  shipping: {
    enabled: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      required: function() {
        return this.shipping && this.shipping.enabled;
      },
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    shippingStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippedAt: Date,
    deliveredAt: Date
  },
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['buy_now', 'cart_checkout'],
    required: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PurchasedBooksSchema.index({ orderId: 1 }, { unique: true });
PurchasedBooksSchema.index({ 'user.email': 1 });
PurchasedBooksSchema.index({ status: 1, createdAt: -1 });
PurchasedBooksSchema.index({ 'payment.method': 1 });
PurchasedBooksSchema.index({ 'shipping.enabled': 1 });
PurchasedBooksSchema.index({ orderType: 1 });
PurchasedBooksSchema.index({ createdAt: -1 });

// Virtual for formatted order ID display
PurchasedBooksSchema.virtual('displayOrderId').get(function() {
  return this.orderId;
});

// Virtual for total items count
PurchasedBooksSchema.virtual('totalItems').get(function() {
  return this.books.reduce((total, book) => total + book.quantity, 0);
});

// Virtual for order summary
PurchasedBooksSchema.virtual('orderSummary').get(function() {
  const itemCount = this.totalItems;
  const bookTitles = this.books.map(book => book.title).join(', ');
  return `${itemCount} item(s): ${bookTitles}`;
});

// Pre-save middleware to generate order ID and calculate totals
PurchasedBooksSchema.pre('save', async function(next) {
  // Generate order ID if new document
  if (this.isNew && !this.orderId) {
    this.orderId = await getNextOrderId();
  }
  
  // Calculate subtotals for each book
  this.books.forEach(book => {
    book.subtotal = book.quantity * book.price;
  });
  
  // Calculate totals
  this.totals.subtotal = this.books.reduce((total, book) => total + book.subtotal, 0);
  this.totals.shippingCost = this.shipping.enabled ? (this.shipping.cost || 10) : 0;
  this.totals.total = this.totals.subtotal + this.totals.shippingCost;
  
  // Add to status history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  
  next();
});

// Static method to find orders by status
PurchasedBooksSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find orders by payment method
PurchasedBooksSchema.statics.findByPaymentMethod = function(method) {
  return this.find({ 'payment.method': method }).sort({ createdAt: -1 });
};

// Static method to find orders requiring shipping
PurchasedBooksSchema.statics.findShippingOrders = function() {
  return this.find({ 'shipping.enabled': true }).sort({ createdAt: -1 });
};

// Static method to get order statistics
PurchasedBooksSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totals.total' }
      }
    }
  ]);
  
  const totalOrders = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$totals.total' } } }
  ]);
  
  return {
    byStatus: stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0
  };
};

// Method to update status with history
PurchasedBooksSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes
  });
  return this.save();
};

// Method to verify payment
PurchasedBooksSchema.methods.verifyPayment = function(verifiedBy, transactionId) {
  this.payment.verificationStatus = 'verified';
  this.payment.verifiedBy = verifiedBy;
  this.payment.verifiedAt = new Date();
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  this.status = 'confirmed';
  return this.save();
};

// Method to reject payment
PurchasedBooksSchema.methods.rejectPayment = function(verifiedBy, reason) {
  this.payment.verificationStatus = 'rejected';
  this.payment.verifiedBy = verifiedBy;
  this.payment.verifiedAt = new Date();
  this.payment.rejectionReason = reason;
  this.status = 'cancelled';
  return this.save();
};

export default mongoose.models.PurchasedBooks || mongoose.model('PurchasedBooks', PurchasedBooksSchema);