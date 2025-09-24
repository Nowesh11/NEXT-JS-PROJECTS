// API endpoint for fetching slideshow data
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
const COLLECTIONS = {
  SLIDESHOWS: 'slideshows',
  SLIDES: 'slides'
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const slideshowsCollection = db.collection(COLLECTIONS.SLIDESHOWS);
    const slidesCollection = db.collection(COLLECTIONS.SLIDES);

    const { 
      page = 'home', 
      section = 'hero',
      language = 'en',
      slideshowId = ''
    } = req.query;

    // Build filter query for slideshow
    const slideshowFilter = { 
      isActive: true
    };

    if (slideshowId) {
      slideshowFilter._id = new ObjectId(slideshowId);
    } else {
      slideshowFilter.pages = { $in: [page] };
      if (section) {
        slideshowFilter.section = section;
      }
    }

    // Get slideshow
    const slideshow = await slideshowsCollection.findOne(slideshowFilter);

    if (!slideshow) {
      return res.status(404).json({
        success: false,
        message: 'Slideshow not found'
      });
    }

    // Get slides for this slideshow
    const slides = await slidesCollection
      .find({ 
        slideshow: slideshow._id.toString(),
        isActive: true 
      })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    // Localize bilingual fields based on requested language
    const localizeField = (field) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object') {
        return field[language] || field.en || field.ta || '';
      }
      return '';
    };

    // Transform slides for frontend consumption
    const transformedSlides = slides.map(slide => ({
      _id: slide._id,
      id: slide._id,
      slideshow: slide.slideshow,
      title: localizeField(slide.title),
      content: localizeField(slide.content),
      subtitle: localizeField(slide.subtitle),
      buttonText: localizeField(slide.buttonText),
      buttonLink: slide.buttonLink,
      imageUrl: slide.imageUrl,
      backgroundImage: slide.backgroundImage || slide.imageUrl,
      isActive: slide.isActive,
      order: slide.order || 0,
      backgroundColor: slide.backgroundColor || '#ffffff',
      textColor: slide.textColor || '#000000',
      animation: slide.animation || 'fade',
      duration: slide.duration || 5000,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt
    }));

    // Transform slideshow data
    const transformedSlideshow = {
      _id: slideshow._id,
      id: slideshow._id,
      name: slideshow.name,
      description: slideshow.description,
      pages: slideshow.pages || [],
      section: slideshow.section,
      isActive: slideshow.isActive,
      autoPlay: slideshow.autoPlay !== false, // Default to true
      interval: slideshow.interval || 5000,
      showControls: slideshow.showControls !== false, // Default to true
      showIndicators: slideshow.showIndicators !== false, // Default to true
      slides: transformedSlides,
      totalSlides: transformedSlides.length,
      createdAt: slideshow.createdAt,
      updatedAt: slideshow.updatedAt
    };

    res.status(200).json({
      success: true,
      data: {
        slideshow: transformedSlideshow,
        language,
        page,
        section
      }
    });

  } catch (error) {
    console.error('Error fetching slideshow:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
