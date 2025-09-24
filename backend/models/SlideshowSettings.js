import mongoose from 'mongoose'

const slideshowSettingsSchema = new mongoose.Schema({
  general: {
    defaultInterval: {
      type: Number,
      default: 5000,
      min: 1000,
      max: 30000,
      required: true
    },
    defaultAutoPlay: {
      type: Boolean,
      default: true,
      required: true
    },
    defaultShowControls: {
      type: Boolean,
      default: true,
      required: true
    },
    defaultShowIndicators: {
      type: Boolean,
      default: true,
      required: true
    },
    maxSlidesPerShow: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
      required: true
    }
  },
  animations: {
    enabled: {
      type: Boolean,
      default: true,
      required: true
    },
    defaultAnimation: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'none'],
      default: 'fade',
      required: true
    },
    defaultDuration: {
      type: Number,
      default: 500,
      min: 100,
      max: 2000,
      required: true
    }
  },
  permissions: {
    allowPublicSubmissions: {
      type: Boolean,
      default: false,
      required: true
    },
    requireApproval: {
      type: Boolean,
      default: true,
      required: true
    },
    allowedRoles: {
      type: [String],
      default: ['admin', 'editor'],
      required: true
    }
  }
}, {
  timestamps: true
})

export default mongoose.models.SlideshowSettings || mongoose.model('SlideshowSettings', slideshowSettingsSchema)