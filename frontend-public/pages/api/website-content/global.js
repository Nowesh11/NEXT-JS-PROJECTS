// API endpoint for fetching global website content
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls-database';
const COLLECTIONS = {
  WEBSITE_CONTENT: 'websiteContent'
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
    // Try to connect to database first
    let transformedContent = {};
    
    try {
      const { db } = await connectToDatabase();
      const contentCollection = db.collection(COLLECTIONS.WEBSITE_CONTENT);

      const { language = 'en' } = req.query;

      // Build filter query for global content
      const filter = { 
        page: 'global',
        isActive: true,
        isVisible: true
      };

      // Check if content is currently published
      const now = new Date();
      filter.$or = [
        { publishedAt: { $exists: false } },
        { publishedAt: { $lte: now } }
      ];
      filter.$and = [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } }
          ]
        }
      ];

      // Get global content sections
      const globalContent = await contentCollection
        .find(filter)
        .sort({ order: 1, createdAt: 1 })
        .toArray();

      // Transform content for frontend consumption with localization
      globalContent.forEach(content => {
        const sectionKey = content.sectionKey || content.section;
        
        // Localize bilingual fields based on requested language
        const localizeField = (field) => {
          if (!field) return '';
          if (typeof field === 'string') return field;
          if (typeof field === 'object') {
            return field[language] || field.en || field.ta || '';
          }
          return '';
        };

        transformedContent[sectionKey] = {
          _id: content._id,
          id: content._id,
          page: content.page,
          section: content.section,
          sectionKey: sectionKey,
          type: content.type,
          title: localizeField(content.title),
          content: localizeField(content.content),
          subtitle: localizeField(content.subtitle),
          description: localizeField(content.description),
          buttonText: localizeField(content.buttonText),
          altText: localizeField(content.altText),
          order: content.order || 0,
          isActive: content.isActive,
          isVisible: content.isVisible,
          stylePreset: content.stylePreset || 'default',
          customCSS: content.customCSS,
          backgroundColor: content.backgroundColor,
          textColor: content.textColor,
          metadata: content.metadata || {},
          createdAt: content.createdAt,
          updatedAt: content.updatedAt
        };

        // Handle images
        if (content.images && content.images.length > 0) {
          transformedContent[sectionKey].images = content.images.map(img => ({
            ...img,
            url: img.url || `/uploads/content/global/${img.filename}`,
            alt: localizeField(img.alt) || transformedContent[sectionKey].altText,
            caption: localizeField(img.caption)
          }));
        } else {
          transformedContent[sectionKey].images = [];
        }

        // Handle videos
        if (content.videos && content.videos.length > 0) {
          transformedContent[sectionKey].videos = content.videos.map(video => ({
            ...video,
            title: localizeField(video.title),
            description: localizeField(video.description)
          }));
        } else {
          transformedContent[sectionKey].videos = [];
        }

        // Handle links
        if (content.links && content.links.length > 0) {
          transformedContent[sectionKey].links = content.links.map(link => ({
            ...link,
            text: localizeField(link.text),
            title: localizeField(link.title)
          }));
        } else {
          transformedContent[sectionKey].links = [];
        }
      });
    } catch (dbError) {
      console.warn('Database connection failed, using fallback content:', dbError.message);
      
      // Fallback content when database is not available
      transformedContent = {
        navigation: {
          title: 'Tamil Language Society',
          logo: '/images/logo.png',
          menu: [
            { label: 'Home', href: '/', active: true },
            { label: 'About', href: '/about' },
            { label: 'Books', href: '/books' },
            { label: 'E-Books', href: '/ebooks' },
            { label: 'Projects', href: '/projects' },
            { label: 'Contact', href: '/contact' }
          ]
        },
        footer: {
          description: 'Tamil Language Society is dedicated to preserving and promoting Tamil language and culture.',
          contact: {
            address: '123 Tamil Street, Chennai, Tamil Nadu, India',
            phone: '+91 44 1234 5678',
            email: 'info@tamillanguagesociety.org'
          },
          copyright: '© 2024 Tamil Language Society. All rights reserved.'
        }
      };
    }

    res.status(200).json({
      success: true,
      data: {
        page: 'global',
        language: req.query.language || 'en',
        content: transformedContent,
        totalSections: Object.keys(transformedContent).length
      }
    });

  } catch (error) {
    console.error('Error fetching global website content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
