// Public API endpoint for fetching slideshow data for frontend display
// No authentication required as this is for public website consumption

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
    const { method, query } = req;

    if (method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
    }

    const { page, section = 'hero' } = query;

    if (!page) {
      return res.status(400).json({ success: false, error: 'Page parameter is required' });
    }

    // Find active slideshow for the specified page and section
    const slideshow = slideshows.find(s => 
      s.isActive && 
      s.pages.includes(page) && 
      s.section === section
    );

    if (!slideshow) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active slideshow found for this page and section'
      });
    }

    // Get active slides for this slideshow, sorted by order
    const slideshowSlides = slides
      .filter(slide => slide.slideshow === slideshow._id && slide.isActive)
      .sort((a, b) => a.order - b.order);

    // Return slideshow with its slides
    const result = {
      ...slideshow,
      slides: slideshowSlides
    };

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Public slideshow API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}