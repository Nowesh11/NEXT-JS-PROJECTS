import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'TLS-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.type'
    },
    type: {
      type: String,
      required: true,
      enum: ['Book', 'Ebook', 'Poster']
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Malaysia',
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    }
  },
  billingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Malaysia',
      trim: true
    }
  },
  paymentMethod: {
    type: {
      type: String,
      required: [true, 'Payment method type is required'],
      enum: ['epay', 'fbx']
    },
    name: {
      type: String,
      required: [true, 'Payment method name is required']
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required']
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required']
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required']
    }
  },
  transactionProof: {
    type: String,
    required: [true, 'Transaction proof is required']
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  status: {
    type: String,
    enum: [
      'pending_verification',
      'verified',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending_verification'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'refunded'],
    default: 'pending'
  },
  verificationDeadline: {
    type: Date,
    required: true
  },
  verificationNotes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  shippingInfo: {
    method: {
      type: String,
      enum: ['standard', 'express', 'pickup'],
      default: 'standard'
    },
    carrier: {
      type: String,
      default: ''
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    },
    shippedAt: {
      type: Date
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  refund: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: {
      type: Date
    },
    reason: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    processedAt: {
      type: Date
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for verification status
orderSchema.virtual('isVerificationExpired').get(function() {
  return this.verificationDeadline && new Date() > this.verificationDeadline;
});

// Virtual for days until verification deadline
orderSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.verificationDeadline) return null;
  const diff = this.verificationDeadline - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Calculate item subtotals
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  
  next();
});

// Instance methods
orderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  return this.addTimelineEntry(newStatus, note, updatedBy);
};

orderSchema.methods.verifyPayment = function(isApproved, notes, updatedBy) {
  this.paymentStatus = isApproved ? 'verified' : 'rejected';
  this.verificationNotes = notes || '';
  
  if (isApproved) {
    this.status = 'verified';
    return this.addTimelineEntry('verified', 'Payment verified and approved', updatedBy);
  } else {
    this.status = 'cancelled';
    return this.addTimelineEntry('cancelled', `Payment rejected: ${notes}`, updatedBy);
  }
};

orderSchema.methods.ship = function(shippingInfo, updatedBy) {
  this.status = 'shipped';
  this.shippingInfo = {
    ...this.shippingInfo,
    ...shippingInfo,
    shippedAt: new Date()
  };
  
  const note = shippingInfo.trackingNumber ? 
    `Order shipped with tracking number: ${shippingInfo.trackingNumber}` :
    'Order shipped';
    
  return this.addTimelineEntry('shipped', note, updatedBy);
};

orderSchema.methods.deliver = function(updatedBy) {
  this.status = 'delivered';
  this.shippingInfo.actualDelivery = new Date();
  return this.addTimelineEntry('delivered', 'Order delivered successfully', updatedBy);
};

orderSchema.methods.requestRefund = function(reason) {
  this.refund = {
    requested: true,
    requestedAt: new Date(),
    reason,
    status: 'pending'
  };
  return this.addTimelineEntry('refund_requested', `Refund requested: ${reason}`);
};

// Static methods
orderSchema.statics.getOrderStats = async function(userId = null) {
  const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending_verification'] }, 1, 0] }
        },
        verifiedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    verifiedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  };
};

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ verificationDeadline: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ archived: 1, createdAt: -1 });
orderSchema.index({ 'paymentMethod.type': 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);