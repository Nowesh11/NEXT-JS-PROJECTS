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

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { method, query } = req;
    const { id } = query;

    // Find slideshow
    const slideshowIndex = slideshows.findIndex(s => s._id === id);
    if (slideshowIndex === -1) {
      return res.status(404).json({ success: false, error: 'Slideshow not found' });
    }

    switch (method) {
      case 'GET':
        return handleGet(req, res, slideshows[slideshowIndex]);
      case 'PUT':
        return handlePut(req, res, slideshowIndex);
      case 'PATCH':
        return handlePatch(req, res, slideshowIndex);
      case 'DELETE':
        return handleDelete(req, res, slideshowIndex);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Slideshow API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req, res, slideshow) {
  try {
    return res.status(200).json({
      success: true,
      data: slideshow
    });
  } catch (error) {
    console.error('Get slideshow error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch slideshow' });
  }
}

async function handlePut(req, res, slideshowIndex) {
  try {
    const {
      name,
      description,
      pages,
      section,
      isActive,
      autoPlay,
      interval,
      showControls,
      showIndicators
    } = req.body;

    // Validation
    if (!name || !pages || pages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name and pages are required'
      });
    }

    // Check for duplicate slideshow on same page/section (excluding current)
    const existingSlideshow = slideshows.find((s, index) =>
      index !== slideshowIndex &&
      s.pages.some(p => pages.includes(p)) &&
      s.section === section
    );

    if (existingSlideshow) {
      return res.status(400).json({
        success: false,
        error: `A slideshow already exists for ${pages.join(', ')} - ${section} section`
      });
    }

    // Update slideshow
    const updatedSlideshow = {
      ...slideshows[slideshowIndex],
      name,
      description: description || '',
      pages,
      section: section || 'hero',
      isActive: isActive !== undefined ? isActive : slideshows[slideshowIndex].isActive,
      autoPlay: autoPlay !== undefined ? autoPlay : slideshows[slideshowIndex].autoPlay,
      interval: interval ? Math.max(2000, Math.min(30000, interval)) : slideshows[slideshowIndex].interval,
      showControls: showControls !== undefined ? showControls : slideshows[slideshowIndex].showControls,
      showIndicators: showIndicators !== undefined ? showIndicators : slideshows[slideshowIndex].showIndicators,
      updatedAt: new Date()
    };

    slideshows[slideshowIndex] = updatedSlideshow;

    return res.status(200).json({
      success: true,
      data: updatedSlideshow,
      message: 'Slideshow updated successfully'
    });
  } catch (error) {
    console.error('Update slideshow error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slideshow' });
  }
}

async function handlePatch(req, res, slideshowIndex) {
  try {
    const { action } = req.body;

    switch (action) {
      case 'toggle-active':
        slideshows[slideshowIndex].isActive = !slideshows[slideshowIndex].isActive;
        slideshows[slideshowIndex].updatedAt = new Date();
        break;
      
      case 'duplicate':
        const originalSlideshow = slideshows[slideshowIndex];
        const duplicatedSlideshow = {
          ...originalSlideshow,
          _id: Date.now().toString(),
          name: `${originalSlideshow.name} (Copy)`,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        slideshows.push(duplicatedSlideshow);
        
        return res.status(200).json({
          success: true,
          data: duplicatedSlideshow,
          message: 'Slideshow duplicated successfully'
        });
      
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(200).json({
      success: true,
      data: slideshows[slideshowIndex],
      message: 'Slideshow updated successfully'
    });
  } catch (error) {
    console.error('Patch slideshow error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update slideshow' });
  }
}

async function handleDelete(req, res, slideshowIndex) {
  try {
    const deletedSlideshow = slideshows[slideshowIndex];
    slideshows.splice(slideshowIndex, 1);

    return res.status(200).json({
      success: true,
      data: deletedSlideshow,
      message: 'Slideshow deleted successfully'
    });
  } catch (error) {
    console.error('Delete slideshow error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete slideshow' });
  }
}