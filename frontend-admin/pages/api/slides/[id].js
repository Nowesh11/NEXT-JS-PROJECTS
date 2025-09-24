import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Mock database operations (replace with actual database integration)
let slides = [
  {
    _id: '1',
    slideshow: '1',
    title: { en: 'Welcome to Tamil Language Society', ta: 'தமிழ் மொழி சங்கத்திற்கு வரவேற்கிறோம்' },
    content: { en: 'Preserving and promoting Tamil language and culture', ta: 'தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துதல்' },
    imageUrl: '/images/slides/slide1.jpg',
    buttonText: { en: 'Learn More', ta: 'மேலும் அறிய' },
    buttonLink: '/about',
    isActive: true,
    order: 1,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    animation: 'fade',
    duration: 5000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { method, query } = req;
    const { id } = query;

    // Find slide
    const slideIndex = slides.findIndex(s => s._id === id);
    if (slideIndex === -1) {
      return res.status(404).json({ success: false, error: 'Slide not found' });
    }

    switch (method) {
      case 'GET':
        return handleGet(req, res, slides[slideIndex]);
      case 'PUT':
        return handlePut(req, res, slideIndex);
      case 'PATCH':
        return handlePatch(req, res, slideIndex);
      case 'DELETE':
        return handleDelete(req, res, slideIndex);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Slide API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req, res, slide) {
  try {
    return res.status(200).json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('Get slide error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch slide' });
  }
}

async function handlePut(req, res, slideIndex) {
  try {
    const {
      title,
      content,
      imageUrl,
      buttonText,
      buttonLink,
      isActive,
      order,
      backgroundColor,
      textColor,
      animation,
      duration
    } = req.body;

    // Validation
    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Title and image URL are required'
      });
    }

    // Validate title structure
    if (!title.en || !title.ta) {
      return res.status(400).json({
        success: false,
        error: 'Title must include both English and Tamil versions'
      });
    }

    // Update slide
    const updatedSlide = {
      ...slides[slideIndex],
      title,
      content: content || slides[slideIndex].content,
      imageUrl,
      buttonText: buttonText || slides[slideIndex].buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : slides[slideIndex].buttonLink,
      isActive: isActive !== undefined ? isActive : slides[slideIndex].isActive,
      order: order !== undefined ? order : slides[slideIndex].order,
      backgroundColor: backgroundColor || slides[slideIndex].backgroundColor,
      textColor: textColor || slides[slideIndex].textColor,
      animation: animation || slides[slideIndex].animation,
      duration: duration ? Math.max(2000, Math.min(30000, duration)) : slides[slideIndex].duration,
      updatedAt: new Date()
    };

    slides[slideIndex] = updatedSlide;

    return res.status(200).json({
      success: true,
      data: updatedSlide,
      message: 'Slide updated successfully'
    });
  } catch (error) {
    console.error('Update slide error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slide' });
  }
}

async function handlePatch(req, res, slideIndex) {
  try {
    const { action, newOrder } = req.body;

    switch (action) {
      case 'toggle-active':
        slides[slideIndex].isActive = !slides[slideIndex].isActive;
        slides[slideIndex].updatedAt = new Date();
        break;
      
      case 'reorder':
        if (newOrder === undefined) {
          return res.status(400).json({ success: false, error: 'New order is required for reorder action' });
        }
        
        const currentSlide = slides[slideIndex];
        const slideshowSlides = slides.filter(s => s.slideshow === currentSlide.slideshow);
        
        // Update orders
        slideshowSlides.forEach(slide => {
          if (slide._id === currentSlide._id) {
            slide.order = newOrder;
          } else if (slide.order >= newOrder && slide.order < currentSlide.order) {
            slide.order += 1;
          } else if (slide.order <= newOrder && slide.order > currentSlide.order) {
            slide.order -= 1;
          }
          slide.updatedAt = new Date();
        });
        break;
      
      case 'duplicate':
        const originalSlide = slides[slideIndex];
        const slideshowSlides2 = slides.filter(s => s.slideshow === originalSlide.slideshow);
        const maxOrder = slideshowSlides2.length > 0 ? Math.max(...slideshowSlides2.map(s => s.order)) : 0;
        
        const duplicatedSlide = {
          ...originalSlide,
          _id: Date.now().toString(),
          title: {
            en: `${originalSlide.title.en} (Copy)`,
            ta: `${originalSlide.title.ta} (நகல்)`
          },
          order: maxOrder + 1,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        slides.push(duplicatedSlide);
        
        return res.status(200).json({
          success: true,
          data: duplicatedSlide,
          message: 'Slide duplicated successfully'
        });
      
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(200).json({
      success: true,
      data: slides[slideIndex],
      message: 'Slide updated successfully'
    });
  } catch (error) {
    console.error('Patch slide error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slide' });
  }
}

async function handleDelete(req, res, slideIndex) {
  try {
    const deletedSlide = slides[slideIndex];
    const slideshowId = deletedSlide.slideshow;
    const deletedOrder = deletedSlide.order;
    
    // Remove slide
    slides.splice(slideIndex, 1);
    
    // Reorder remaining slides in the same slideshow
    const remainingSlides = slides.filter(s => s.slideshow === slideshowId);
    remainingSlides.forEach(slide => {
      if (slide.order > deletedOrder) {
        slide.order -= 1;
        slide.updatedAt = new Date();
      }
    });

    return res.status(200).json({
      success: true,
      data: deletedSlide,
      message: 'Slide deleted successfully'
    });
  } catch (error) {
    console.error('Delete slide error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete slide' });
  }
}