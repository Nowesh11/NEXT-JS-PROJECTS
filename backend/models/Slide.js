import mongoose from 'mongoose'

const SlideSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    ta: {
      type: String,
      trim: true
    }
  },
  content: {
    en: {
      type: String,
      trim: true
    },
    ta: {
      type: String,
      trim: true
    }
  },
  imageUrl: {
    type: String,
    trim: true
  },
  buttonText: {
    en: {
      type: String,
      trim: true
    },
    ta: {
      type: String,
      trim: true
    }
  },
  buttonLink: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  slideshow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slideshow',
    required: true
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  animation: {
    type: String,
    enum: ['fade', 'slide', 'zoom', 'none'],
    default: 'fade'
  },
  duration: {
    type: Number,
    default: 5000,
    min: 1000,
    max: 30000
  }
}, {
  timestamps: true
})

// Indexes for better performance
SlideSchema.index({ slideshow: 1, order: 1 })
SlideSchema.index({ slideshow: 1, isActive: 1 })
SlideSchema.index({ order: 1 })

// Compound index for slideshow queries
SlideSchema.index({ slideshow: 1, isActive: 1, order: 1 })

// Pre-save middleware to ensure unique order within slideshow
SlideSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingSlide = await this.constructor.findOne({
      slideshow: this.slideshow,
      order: this.order,
      _id: { $ne: this._id }
    })
    
    if (existingSlide) {
      // Find the next available order
      const maxOrder = await this.constructor.findOne(
        { slideshow: this.slideshow },
        { order: 1 }
      ).sort({ order: -1 })
      
      this.order = maxOrder ? maxOrder.order + 1 : 1
    }
  }
  next()
})

// Static method to get active slides for a slideshow
SlideSchema.statics.getActiveForSlideshow = function(slideshowId) {
  return this.find({
    slideshow: slideshowId,
    isActive: true
  }).sort({ order: 1 })
}

// Static method to reorder slides
SlideSchema.statics.reorderSlides = async function(slideUpdates) {
  const bulkOps = slideUpdates.map((update, index) => ({
    updateOne: {
      filter: { _id: update.id },
      update: { order: index + 1 }
    }
  }))
  
  return this.bulkWrite(bulkOps)
}

export default mongoose.models.Slide || mongoose.model('Slide', SlideSchema)