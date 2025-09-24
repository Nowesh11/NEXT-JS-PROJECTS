'use client'

import { useState, useEffect } from 'react'

const AVAILABLE_PAGES = [
  { value: 'home', label: 'Home Page', icon: '🏠' },
  { value: 'about', label: 'About Page', icon: 'ℹ️' },
  { value: 'books', label: 'Books Page', icon: '📚' },
  { value: 'ebooks', label: 'E-books Page', icon: '📱' },
  { value: 'projects', label: 'Projects Page', icon: '🚀' },
  { value: 'contact', label: 'Contact Page', icon: '📞' },
  { value: 'events', label: 'Events Page', icon: '📅' },
  { value: 'news', label: 'News Page', icon: '📰' }
]

export default function SlideshowManager({
  slideshows,
  slides,
  selectedSlideshow,
  activeTab,
  onSelectSlideshow,
  onCreateSlideshow,
  onUpdateSlideshow,
  onDeleteSlideshow,
  onCreateSlide,
  onUpdateSlide,
  onDeleteSlide,
  onReorderSlides
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('') // 'slideshow' or 'slide'
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [draggedSlide, setDraggedSlide] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  useEffect(() => {
    if (previewMode && slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % slides.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [previewMode, slides.length])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pages: [],
      isActive: true,
      autoPlay: true,
      interval: 5000,
      showControls: true,
      showIndicators: true,
      // Slide fields
      title: { en: '', ta: '' },
      subtitle: { en: '', ta: '' },
      content: { en: '', ta: '' },
      imageUrl: '',
      buttonText: { en: '', ta: '' },
      buttonUrl: '',
      order: 0,
      isVisible: true
    })
  }

  const handleCreateSlideshow = () => {
    resetForm()
    setModalType('slideshow')
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditSlideshow = (slideshow) => {
    setFormData({
      name: slideshow.name || '',
      description: slideshow.description || '',
      pages: slideshow.pages || [],
      isActive: slideshow.isActive !== false,
      autoPlay: slideshow.autoPlay !== false,
      interval: slideshow.interval || 5000,
      showControls: slideshow.showControls !== false,
      showIndicators: slideshow.showIndicators !== false
    })
    setModalType('slideshow')
    setEditingItem(slideshow)
    setIsModalOpen(true)
  }

  const handleCreateSlide = () => {
    if (!selectedSlideshow) return
    resetForm()
    setFormData(prev => ({ ...prev, order: slides.length }))
    setModalType('slide')
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditSlide = (slide) => {
    setFormData({
      title: slide.title || { en: '', ta: '' },
      subtitle: slide.subtitle || { en: '', ta: '' },
      content: slide.content || { en: '', ta: '' },
      imageUrl: slide.imageUrl || '',
      buttonText: slide.buttonText || { en: '', ta: '' },
      buttonUrl: slide.buttonUrl || '',
      order: slide.order || 0,
      isVisible: slide.isVisible !== false
    })
    setModalType('slide')
    setEditingItem(slide)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (modalType === 'slideshow') {
      if (editingItem) {
        await onUpdateSlideshow(editingItem._id, formData)
      } else {
        await onCreateSlideshow(formData)
      }
    } else if (modalType === 'slide') {
      if (editingItem) {
        await onUpdateSlide(editingItem._id, formData)
      } else {
        await onCreateSlide(formData)
      }
    }
    
    setIsModalOpen(false)
    resetForm()
  }

  const handleInputChange = (field, value, language = null) => {
    if (language) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleDragStart = (e, slide) => {
    setDraggedSlide(slide)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetSlide) => {
    e.preventDefault()
    if (!draggedSlide || draggedSlide._id === targetSlide._id) return

    const reorderedSlides = [...slides]
    const draggedIndex = reorderedSlides.findIndex(s => s._id === draggedSlide._id)
    const targetIndex = reorderedSlides.findIndex(s => s._id === targetSlide._id)

    reorderedSlides.splice(draggedIndex, 1)
    reorderedSlides.splice(targetIndex, 0, draggedSlide)

    // Update order values
    const updatedSlides = reorderedSlides.map((slide, index) => ({
      ...slide,
      order: index
    }))

    onReorderSlides(updatedSlides)
    setDraggedSlide(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {activeTab === 'slideshows' && (
        <div className="admin-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Slideshows</h3>
            <button onClick={handleCreateSlideshow} className="btn-primary">
              🎬 Create Slideshow
            </button>
          </div>
          
          {slideshows.length > 0 ? (
            <div className="grid gap-4">
              {slideshows.map((slideshow) => (
                <div
                  key={slideshow._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSlideshow?._id === slideshow._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectSlideshow(slideshow)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{slideshow.name}</h4>
                        {!slideshow.isActive && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                        {slideshow.autoPlay && (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                            Auto-play
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{slideshow.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📄 Pages: {slideshow.pages?.length || 0}</span>
                        <span>🖼️ Slides: {slideshow.slideCount || 0}</span>
                        <span>📅 {formatDate(slideshow.createdAt)}</span>
                      </div>
                      {slideshow.pages && slideshow.pages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {slideshow.pages.map((page) => {
                            const pageInfo = AVAILABLE_PAGES.find(p => p.value === page)
                            return (
                              <span
                                key={page}
                                className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                              >
                                {pageInfo?.icon} {pageInfo?.label || page}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSlideshow(slideshow)
                        }}
                        className="btn-secondary text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSlideshow(slideshow._id)
                        }}
                        className="btn-danger text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎬</div>
              <p>No slideshows found. Create your first slideshow!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'slides' && (
        <div className="admin-card">
          {selectedSlideshow ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Slides for "{selectedSlideshow.name}"
                  </h3>
                  <p className="text-sm text-gray-600">{selectedSlideshow.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`btn-secondary text-sm ${
                      previewMode ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    👁️ {previewMode ? 'Exit Preview' : 'Preview'}
                  </button>
                  <button onClick={handleCreateSlide} className="btn-primary text-sm">
                    🖼️ Add Slide
                  </button>
                </div>
              </div>

              {previewMode && slides.length > 0 && (
                <div className="mb-6 border rounded-lg overflow-hidden">
                  <div className="slideshow-container relative h-64 bg-gray-100">
                    {slides.map((slide, index) => (
                      <div
                        key={slide._id}
                        className={`slide absolute inset-0 flex items-center justify-center p-8 ${
                          index === currentSlideIndex ? 'active' : ''
                        }`}
                        style={{
                          backgroundImage: slide.imageUrl ? `url(${slide.imageUrl})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="text-center text-white bg-black bg-opacity-50 p-6 rounded">
                          <h3 className="text-2xl font-bold mb-2">
                            {slide.title?.en || 'No Title'}
                          </h3>
                          {slide.subtitle?.en && (
                            <p className="text-lg mb-2">{slide.subtitle.en}</p>
                          )}
                          {slide.content?.en && (
                            <p className="mb-4">{slide.content.en}</p>
                          )}
                          {slide.buttonText?.en && (
                            <button className="btn-primary">
                              {slide.buttonText.en}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="slide-controls p-2 bg-gray-50">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`slide-dot ${
                          index === currentSlideIndex ? 'active' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {slides.length > 0 ? (
                <div className="space-y-4">
                  {slides
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((slide) => (
                      <div
                        key={slide._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, slide)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slide)}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-move"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            {slide.imageUrl && (
                              <img
                                src={slide.imageUrl}
                                alt={slide.title?.en || 'Slide'}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-500">#{slide.order + 1}</span>
                                <h4 className="font-semibold">
                                  {slide.title?.en || 'No Title'}
                                </h4>
                                {slide.title?.ta && (
                                  <span className="text-sm text-gray-600">({slide.title.ta})</span>
                                )}
                                {!slide.isVisible && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              {slide.subtitle?.en && (
                                <p className="text-gray-600 mb-1">{slide.subtitle.en}</p>
                              )}
                              {slide.content?.en && (
                                <p className="text-sm text-gray-500 line-clamp-2">{slide.content.en}</p>
                              )}
                              {slide.buttonText?.en && slide.buttonUrl && (
                                <div className="mt-2">
                                  <span className="text-xs text-blue-600">
                                    Button: {slide.buttonText.en} → {slide.buttonUrl}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditSlide(slide)}
                              className="btn-secondary text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => onDeleteSlide(slide._id)}
                              className="btn-danger text-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>No slides found. Add your first slide!</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎬</div>
              <p>Select a slideshow to manage its slides</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingItem ? 'Edit' : 'Create'} {modalType === 'slideshow' ? 'Slideshow' : 'Slide'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'slideshow' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="form-input"
                      required
                      placeholder="Enter slideshow name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="form-input h-20"
                      placeholder="Enter slideshow description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Pages to Display On</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                      {AVAILABLE_PAGES.map((page) => (
                        <label key={page.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.pages?.includes(page.value) || false}
                            onChange={(e) => {
                              const pages = formData.pages || []
                              if (e.target.checked) {
                                handleInputChange('pages', [...pages, page.value])
                              } else {
                                handleInputChange('pages', pages.filter(p => p !== page.value))
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {page.icon} {page.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Auto-play Interval (ms)</label>
                      <input
                        type="number"
                        value={formData.interval || 5000}
                        onChange={(e) => handleInputChange('interval', parseInt(e.target.value))}
                        className="form-input"
                        min="1000"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive !== false}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.autoPlay !== false}
                        onChange={(e) => handleInputChange('autoPlay', e.target.checked)}
                        className="mr-2"
                      />
                      Auto-play
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showControls !== false}
                        onChange={(e) => handleInputChange('showControls', e.target.checked)}
                        className="mr-2"
                      />
                      Show Controls
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showIndicators !== false}
                        onChange={(e) => handleInputChange('showIndicators', e.target.checked)}
                        className="mr-2"
                      />
                      Show Indicators
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Slide Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title (English) *</label>
                      <input
                        type="text"
                        value={formData.title?.en || ''}
                        onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                        className="form-input"
                        required
                        placeholder="Enter slide title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                      <input
                        type="text"
                        value={formData.title?.ta || ''}
                        onChange={(e) => handleInputChange('title', e.target.value, 'ta')}
                        className="form-input"
                        placeholder="தலைப்பை உள்ளிடவும்"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Subtitle (English)</label>
                      <input
                        type="text"
                        value={formData.subtitle?.en || ''}
                        onChange={(e) => handleInputChange('subtitle', e.target.value, 'en')}
                        className="form-input"
                        placeholder="Enter subtitle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subtitle (Tamil)</label>
                      <input
                        type="text"
                        value={formData.subtitle?.ta || ''}
                        onChange={(e) => handleInputChange('subtitle', e.target.value, 'ta')}
                        className="form-input"
                        placeholder="துணைத்தலைப்பை உள்ளிடவும்"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Content (English)</label>
                      <textarea
                        value={formData.content?.en || ''}
                        onChange={(e) => handleInputChange('content', e.target.value, 'en')}
                        className="form-input h-20"
                        placeholder="Enter slide content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Content (Tamil)</label>
                      <textarea
                        value={formData.content?.ta || ''}
                        onChange={(e) => handleInputChange('content', e.target.value, 'ta')}
                        className="form-input h-20"
                        placeholder="உள்ளடக்கத்தை உள்ளிடவும்"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Button Text (English)</label>
                      <input
                        type="text"
                        value={formData.buttonText?.en || ''}
                        onChange={(e) => handleInputChange('buttonText', e.target.value, 'en')}
                        className="form-input"
                        placeholder="Learn More"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Button Text (Tamil)</label>
                      <input
                        type="text"
                        value={formData.buttonText?.ta || ''}
                        onChange={(e) => handleInputChange('buttonText', e.target.value, 'ta')}
                        className="form-input"
                        placeholder="மேலும் அறிக"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Button URL</label>
                      <input
                        type="url"
                        value={formData.buttonUrl || ''}
                        onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                        className="form-input"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Order</label>
                      <input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                        className="form-input"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isVisible !== false}
                        onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                        className="mr-2"
                      />
                      Visible
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Create'} {modalType === 'slideshow' ? 'Slideshow' : 'Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}