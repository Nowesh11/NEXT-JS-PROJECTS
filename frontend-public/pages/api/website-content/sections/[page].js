// API endpoint for fetching website content sections by page
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

  const { page } = req.query;
  
  try {
    // Try to connect to database first
    let transformedContent = {};
    
    try {
      const { db } = await connectToDatabase();
      const contentCollection = db.collection(COLLECTIONS.WEBSITE_CONTENT);

      const { language = 'en' } = req.query;

      // Build filter query for page content
      const filter = { 
        page: page,
        isActive: true,
        isVisible: true
      };

      // Check if content is currently published
      const now = new Date();
      filter.$or = [
        { publishDate: { $lte: now } },
        { publishDate: { $exists: false } }
      ];

      // Fetch content from database
      const content = await contentCollection.find(filter).toArray();

      // Transform content for frontend consumption
      content.forEach(item => {
        const key = item.sectionKey || item.key;
        if (key) {
          transformedContent[key] = {
            id: item._id,
            content: item.content,
            metadata: {
              lastUpdated: item.updatedAt,
              version: item.version || 1,
              author: item.author,
              status: item.status || 'published'
            }
          };
        }
      });

    } catch (dbError) {
      console.warn('Database connection failed, using fallback content:', dbError.message);
      
      // Fallback content for the requested page
      transformedContent = getFallbackContent(page, req.query.language);
    }

    // Return the content
    res.status(200).json({
      success: true,
      page: page,
      content: transformedContent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Return fallback content on error
    const fallbackContent = getFallbackContent(page, req.query.language);
    
    res.status(200).json({
      success: true,
      page: page,
      content: fallbackContent,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

function getFallbackContent(page, language = 'en') {
  const fallbackData = {
    home: {
      hero: {
        content: {
          title: {
            en: 'Welcome to Tamil Language Society',
            ta: 'தமிழ் மொழி சங்கத்திற்கு வரவேற்கிறோம்'
          },
          subtitle: {
            en: 'Preserving and promoting Tamil language and culture worldwide',
            ta: 'உலகம் முழுவதும் தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துதல்'
          }
        }
      }
    },
    about: {
      mission: {
        content: {
          title: {
            en: 'Our Mission',
            ta: 'எங்கள் நோக்கம்'
          },
          description: {
            en: 'To preserve and promote Tamil language and culture',
            ta: 'தமிழ் மொழி மற்றும் கலாச்சாரத்தை பாதுகாத்து மேம்படுத்துதல்'
          }
        }
      }
    }
  };

  return fallbackData[page] || {};
}