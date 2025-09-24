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

let nextId = 2;

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { method, query } = req;

    switch (method) {
      case 'GET':
        return handleGet(req, res, query);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Slides API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req, res, query) {
  try {
    const {
      slideshow,
      page = 1,
      limit = 20,
      isActive,
      sortBy = 'order',
      sortOrder = 'asc'
    } = query;

    let filteredSlides = [...slides];

    // Filter by slideshow
    if (slideshow) {
      filteredSlides = filteredSlides.filter(slide => slide.slideshow === slideshow);
    }

    // Filter by active status
    if (isActive !== undefined) {
      filteredSlides = filteredSlides.filter(slide =>
        slide.isActive === (isActive === 'true')
      );
    }

    // Sort slides
    filteredSlides.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSlides = filteredSlides.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredSlides.length / parseInt(limit));

    return res.status(200).json({
      success: true,
      data: paginatedSlides,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: filteredSlides.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get slides error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch slides' });
  }
}

async function handlePost(req, res) {
  try {
    const {
      slideshow,
      title,
      content,
      imageUrl,
      buttonText,
      buttonLink,
      isActive = true,
      order,
      backgroundColor = '#ffffff',
      textColor = '#000000',
      animation = 'fade',
      duration = 5000
    } = req.body;

    // Validation
    if (!slideshow || !title || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Slideshow ID, title, and image URL are required'
      });
    }

    // Validate title and content structure
    if (!title.en || !title.ta) {
      return res.status(400).json({
        success: false,
        error: 'Title must include both English and Tamil versions'
      });
    }

    // Auto-generate order if not provided
    let slideOrder = order;
    if (!slideOrder) {
      const slideshowSlides = slides.filter(s => s.slideshow === slideshow);
      slideOrder = slideshowSlides.length > 0 ? Math.max(...slideshowSlides.map(s => s.order)) + 1 : 1;
    }

    const newSlide = {
      _id: nextId.toString(),
      slideshow,
      title,
      content: content || { en: '', ta: '' },
      imageUrl,
      buttonText: buttonText || { en: '', ta: '' },
      buttonLink: buttonLink || '',
      isActive,
      order: slideOrder,
      backgroundColor,
      textColor,
      animation,
      duration: Math.max(2000, Math.min(30000, duration)),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    slides.push(newSlide);
    nextId++;

    return res.status(201).json({
      success: true,
      data: newSlide,
      message: 'Slide created successfully'
    });
  } catch (error) {
    console.error('Create slide error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create slide' });
  }
}