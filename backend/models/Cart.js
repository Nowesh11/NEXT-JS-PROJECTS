import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'productType'
  },
  productType: {
    type: String,
    required: true,
    enum: ['Book', 'Ebook', 'Poster']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
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
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative']
  },
  totalOriginalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total original price cannot be negative']
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD']
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  sessionId: {
    type: String,
    sparse: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total savings
cartSchema.virtual('totalSavings').get(function() {
  return this.totalOriginalPrice - this.totalPrice;
});

// Virtual for savings percentage
cartSchema.virtual('savingsPercentage').get(function() {
  if (this.totalOriginalPrice > 0) {
    return ((this.totalSavings / this.totalOriginalPrice) * 100).toFixed(2);
  }
  return 0;
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => {
    const itemPrice = item.price * (1 - item.discount / 100);
    return total + (itemPrice * item.quantity);
  }, 0);
  this.totalOriginalPrice = this.items.reduce((total, item) => {
    const originalPrice = item.originalPrice || item.price;
    return total + (originalPrice * item.quantity);
  }, 0);
  this.totalDiscount = this.totalOriginalPrice - this.totalPrice;
  
  next();
});

// Instance methods
cartSchema.methods.addItem = function(productId, productType, quantity = 1, price, originalPrice, discount = 0) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString() && item.productType === productType
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price;
    this.items[existingItemIndex].originalPrice = originalPrice || price;
    this.items[existingItemIndex].discount = discount;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      productType,
      quantity,
      price,
      originalPrice: originalPrice || price,
      discount
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function(productId, productType) {
  this.items = this.items.filter(
    item => !(item.product.toString() === productId.toString() && item.productType === productType)
  );
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(productId, productType, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString() && item.productType === productType
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, productType);
    }
    item.quantity = quantity;
    return this.save();
  }

  throw new Error('Item not found in cart');
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.getItemCount = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Static methods
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'title author price coverImage isActive'
  });
};

cartSchema.statics.createOrUpdate = async function(userId, productId, productType, quantity, price, originalPrice, discount) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId });
  }
  
  return cart.addItem(productId, productType, quantity, price, originalPrice, discount);
};

// Indexes for better performance
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ createdAt: -1 });
cartSchema.index({ expiresAt: 1 });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);