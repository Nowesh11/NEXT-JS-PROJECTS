import mongoose from 'mongoose'

const SlideshowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pages: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000,
    min: 1000,
    max: 30000
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showIndicators: {
    type: Boolean,
    default: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for better performance
SlideshowSchema.index({ isActive: 1, createdAt: -1 })
SlideshowSchema.index({ pages: 1 })
SlideshowSchema.index({ author: 1 })

// Virtual for slide count
SlideshowSchema.virtual('slideCount', {
  ref: 'Slide',
  localField: '_id',
  foreignField: 'slideshow',
  count: true
})

// Method to increment views
SlideshowSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Static method to get active slideshows for specific pages
SlideshowSchema.statics.getActiveForPages = function(pages) {
  return this.find({
    isActive: true,
    pages: { $in: pages }
  }).populate('author', 'name email')
}

export default mongoose.models.Slideshow || mongoose.model('Slideshow', SlideshowSchema)