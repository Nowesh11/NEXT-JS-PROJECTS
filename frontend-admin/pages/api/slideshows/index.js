import { connectDB } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Mock database operations (replace with actual database integration)
let slideshows = [
  {
    _id: '1',
    name: 'Home Hero Slideshow',
    description: 'Main slideshow for homepage hero section',
    pages: ['home'],
    section: 'hero',
    isActive: true,
    autoPlay: true,
    interval: 5000,
    showControls: true,
    showIndicators: true,
    slides: [],
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
    console.error('Slideshow API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req, res, query) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      pageFilter,
      includeStats
    } = query;

    let filteredSlideshows = [...slideshows];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSlideshows = filteredSlideshows.filter(slideshow =>
        slideshow.name.toLowerCase().includes(searchLower) ||
        slideshow.description.toLowerCase().includes(searchLower)
      );
    }

    if (isActive !== undefined) {
      filteredSlideshows = filteredSlideshows.filter(slideshow =>
        slideshow.isActive === (isActive === 'true')
      );
    }

    if (pageFilter && pageFilter !== 'all') {
      filteredSlideshows = filteredSlideshows.filter(slideshow =>
        slideshow.pages.includes(pageFilter)
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSlideshows = filteredSlideshows.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredSlideshows.length / parseInt(limit));

    let stats = null;
    if (includeStats === 'true') {
      stats = {
        total: slideshows.length,
        active: slideshows.filter(s => s.isActive).length,
        inactive: slideshows.filter(s => !s.isActive).length,
        totalSlides: slideshows.reduce((acc, s) => acc + (s.slides?.length || 0), 0)
      };
    }

    return res.status(200).json({
      success: true,
      data: paginatedSlideshows,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: filteredSlideshows.length,
        limit: parseInt(limit)
      },
      stats
    });
  } catch (error) {
    console.error('Get slideshows error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch slideshows' });
  }
}

async function handlePost(req, res) {
  try {
    const {
      name,
      description,
      pages,
      section = 'hero',
      isActive = true,
      autoPlay = true,
      interval = 5000,
      showControls = true,
      showIndicators = true
    } = req.body;

    // Validation
    if (!name || !pages || pages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name and pages are required'
      });
    }

    // Check for duplicate slideshow on same page/section
    const existingSlideshow = slideshows.find(s =>
      s.pages.some(p => pages.includes(p)) && s.section === section
    );

    if (existingSlideshow) {
      return res.status(400).json({
        success: false,
        error: `A slideshow already exists for ${pages.join(', ')} - ${section} section`
      });
    }

    const newSlideshow = {
      _id: nextId.toString(),
      name,
      description: description || '',
      pages,
      section,
      isActive,
      autoPlay,
      interval: Math.max(2000, Math.min(30000, interval)), // Clamp between 2-30 seconds
      showControls,
      showIndicators,
      slides: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    slideshows.push(newSlideshow);
    nextId++;

    return res.status(201).json({
      success: true,
      data: newSlideshow,
      message: 'Slideshow created successfully'
    });
  } catch (error) {
    console.error('Create slideshow error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create slideshow' });
  }
}