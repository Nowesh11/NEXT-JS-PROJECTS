import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
  epay: {
    enabled: {
      type: Boolean,
      default: true
    },
    accountNumber: {
      type: String,
      required: function() { return this.epay?.enabled; },
      default: '157223402785'
    },
    accountName: {
      type: String,
      required: function() { return this.epay?.enabled; },
      default: 'Tamil Literature Society'
    },
    bankName: {
      type: String,
      required: function() { return this.epay?.enabled; },
      default: 'University Malaya ePay'
    },
    qrCode: {
      type: String, // Base64 encoded image or file path
      default: ''
    },
    instructions: {
      type: String,
      default: 'Transfer the amount to the ePay account and upload the transaction proof.'
    }
  },
  fbx: {
    enabled: {
      type: Boolean,
      default: true
    },
    accountNumber: {
      type: String,
      required: function() { return this.fbx?.enabled; },
      default: '157223402785'
    },
    accountName: {
      type: String,
      required: function() { return this.fbx?.enabled; },
      default: 'Tamil Literature Society'
    },
    bankName: {
      type: String,
      required: function() { return this.fbx?.enabled; },
      default: 'Maybank'
    },
    qrCode: {
      type: String, // Base64 encoded image or file path
      default: ''
    },
    instructions: {
      type: String,
      default: 'Transfer the amount to the FBX account and upload the transaction proof.'
    }
  },
  general: {
    currency: {
      type: String,
      enum: ['MYR', 'USD', 'SGD'],
      default: 'MYR'
    },
    taxRate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 6
    },
    shippingCost: {
      type: Number,
      min: [0, 'Shipping cost cannot be negative'],
      default: 10
    },
    verificationTimeout: {
      type: Number, // Hours
      min: [1, 'Verification timeout must be at least 1 hour'],
      max: [168, 'Verification timeout cannot exceed 168 hours (7 days)'],
      default: 24
    },
    maxFileSize: {
      type: Number, // MB
      min: [1, 'Max file size must be at least 1 MB'],
      max: [10, 'Max file size cannot exceed 10 MB'],
      default: 5
    },
    allowedFileTypes: {
      type: [String],
      default: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    },
    autoApproval: {
      type: Boolean,
      default: false
    },
    notificationEmail: {
      type: String,
      default: 'admin@tamilliteraturesociety.com'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one payment settings document exists
paymentSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Method to update settings
paymentSettingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    // Deep merge for nested objects
    if (updates.epay) {
      settings.epay = { ...settings.epay.toObject(), ...updates.epay };
    }
    if (updates.fbx) {
      settings.fbx = { ...settings.fbx.toObject(), ...updates.fbx };
    }
    if (updates.general) {
      settings.general = { ...settings.general.toObject(), ...updates.general };
    }
    if (updates.isActive !== undefined) {
      settings.isActive = updates.isActive;
    }
    await settings.save();
  }
  return settings;
};

// Method to get active payment methods
paymentSettingsSchema.methods.getActivePaymentMethods = function() {
  const methods = [];
  if (this.epay?.enabled) {
    methods.push({
      type: 'epay',
      name: 'ePay UM',
      accountNumber: this.epay.accountNumber,
      accountName: this.epay.accountName,
      bankName: this.epay.bankName,
      qrCode: this.epay.qrCode,
      instructions: this.epay.instructions
    });
  }
  if (this.fbx?.enabled) {
    methods.push({
      type: 'fbx',
      name: 'FBX Bank Transfer',
      accountNumber: this.fbx.accountNumber,
      accountName: this.fbx.accountName,
      bankName: this.fbx.bankName,
      qrCode: this.fbx.qrCode,
      instructions: this.fbx.instructions
    });
  }
  return methods;
};

export default mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', paymentSettingsSchema);