import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify admin token
function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Mock content data - in a real app, this would come from a database
let contentData = {
  home: {
    en: {
      hero: {
        title: "Tamil Language Society",
        subtitle: "Preserving and Promoting Tamil Heritage",
        description: "Join us in our mission to preserve, promote, and celebrate the rich heritage of Tamil language and culture through education, literature, and community engagement."
      },
      about: {
        title: "About Us",
        content: "The Tamil Language Society is dedicated to preserving and promoting Tamil language, literature, and culture. We organize events, publish books, and provide educational resources."
      },
      features: [
        {
          title: "Educational Resources",
          description: "Comprehensive learning materials for Tamil language and literature"
        },
        {
          title: "Cultural Events",
          description: "Regular workshops, seminars, and cultural programs"
        },
        {
          title: "Digital Library",
          description: "Access to a vast collection of Tamil books and e-books"
        }
      ]
    },
    ta: {
      hero: {
        title: "தமிழ் மொழி சங்கம்",
        subtitle: "தமிழ் பாரம்பரியத்தை பாதுகாத்து மேம்படுத்துதல்",
        description: "கல்வி, இலக்கியம் மற்றும் சமூக ஈடுபாட்டின் மூலம் தமிழ் மொழி மற்றும் கலாச்சாரத்தின் வளமான பாரம்பரியத்தை பாதுகாக்க, மேம்படுத்த மற்றும் கொண்டாட எங்கள் பணியில் எங்களுடன் சேருங்கள்."
      },
      about: {
        title: "எங்களைப் பற்றி",
        content: "தமிழ் மொழி சங்கம் தமிழ் மொழி, இலக்கியம் மற்றும் கலாச்சாரத்தை பாதுகாக்க மற்றும் மேம்படுத்துவதற்கு அர்பணிக்கப்பட்டுள்ளது. நாங்கள் நிகழ்வுகளை ஏற்பாடு செய்கிறோம், புத்தகங்களை வெளியிடுகிறோம் மற்றும் கல்வி வளங்களை வழங்குகிறோம்."
      },
      features: [
        {
          title: "கல்வி வளங்கள்",
          description: "தமிழ் மொழி மற்றும் இலக்கியத்திற்கான விரிவான கற்றல் பொருட்கள்"
        },
        {
          title: "கலாச்சார நிகழ்வுகள்",
          description: "வழக்கமான பட்டறைகள், கருத்தரங்குகள் மற்றும் கலாச்சார நிகழ்ச்சிகள்"
        },
        {
          title: "டிஜிட்டல் நூலகம்",
          description: "தமிழ் புத்தகங்கள் மற்றும் மின்-புத்தகங்களின் பரந்த தொகுப்பிற்கான அணுகல்"
        }
      ]
    }
  },
  about: {
    en: {
      hero: {
        title: "About Tamil Language Society",
        subtitle: "Our Mission and Vision"
      },
      history: {
        title: "Our History",
        content: "Founded in 1995, the Tamil Language Society has been at the forefront of Tamil language preservation and promotion for over two decades. Our journey began with a small group of passionate individuals who recognized the need to create a platform for Tamil language enthusiasts."
      },
      mission: {
        title: "Our Mission",
        content: "To preserve, promote, and celebrate Tamil language, literature, and culture through education, research, and community engagement."
      },
      vision: {
        title: "Our Vision",
        content: "To be the leading organization in Tamil language preservation and promotion, fostering a global community of Tamil language enthusiasts."
      }
    },
    ta: {
      hero: {
        title: "தமிழ் மொழி சங்கத்தைப் பற்றி",
        subtitle: "எங்கள் நோக்கம் மற்றும் தொலைநோக்கு"
      },
      history: {
        title: "எங்கள் வரலாறு",
        content: "1995 இல் நிறுவப்பட்ட தமிழ் மொழி சங்கம் இரண்டு தசாப்தங்களுக்கும் மேலாக தமிழ் மொழி பாதுகாப்பு மற்றும் மேம்பாட்டில் முன்னணியில் உள்ளது. தமிழ் மொழி ஆர்வலர்களுக்கான ஒரு தளத்தை உருவாக்க வேண்டியதன் அவசியத்தை உணர்ந்த ஆர்வமுள்ள நபர்களின் சிறிய குழுவுடன் எங்கள் பயணம் தொடங்கியது."
      },
      mission: {
        title: "எங்கள் நோக்கம்",
        content: "கல்வி, ஆராய்ச்சி மற்றும் சமூக ஈடுபாட்டின் மூலம் தமிழ் மொழி, இலக்கியம் மற்றும் கலாச்சாரத்தை பாதுகாக்க, மேம்படுத்த மற்றும் கொண்டாடுவது."
      },
      vision: {
        title: "எங்கள் தொலைநோக்கு",
        content: "தமிழ் மொழி பாதுகாப்பு மற்றும் மேம்பாட்டில் முன்னணி அமைப்பாக இருப்பது, தமிழ் மொழி ஆர்வலர்களின் உலகளாவிய சமூகத்தை வளர்ப்பது."
      }
    }
  },
  books: {
    en: {
      hero: {
        title: "Tamil Books Collection",
        subtitle: "Discover Our Extensive Library"
      },
      description: "Explore our comprehensive collection of Tamil books covering literature, poetry, grammar, history, and more. From classical works to contemporary publications, find the perfect book for your Tamil learning journey."
    },
    ta: {
      hero: {
        title: "தமிழ் புத்தக தொகுப்பு",
        subtitle: "எங்கள் விரிவான நூலகத்தை கண்டறியுங்கள்"
      },
      description: "இலக்கியம், கவிதை, இலக்கணம், வரலாறு மற்றும் பலவற்றை உள்ளடக்கிய எங்கள் விரிவான தமிழ் புத்தக தொகுப்பை ஆராயுங்கள். பாரம்பரிய படைப்புகள் முதல் சமகால வெளியீடுகள் வரை, உங்கள் தமிழ் கற்றல் பயணத்திற்கான சரியான புத்தகத்தைக் கண்டறியுங்கள்."
    }
  }
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}

function handleGet(req, res) {
  try {
    const { page, language } = req.query;

    if (!page) {
      // Return all content structure
      return res.status(200).json({
        content: contentData,
        pages: Object.keys(contentData),
        languages: ['en', 'ta']
      });
    }

    if (!contentData[page]) {
      return res.status(404).json({ message: 'Page not found' });
    }

    if (language) {
      if (!contentData[page][language]) {
        return res.status(404).json({ message: 'Language not found for this page' });
      }
      return res.status(200).json({
        content: contentData[page][language],
        page,
        language
      });
    }

    // Return all languages for the page
    res.status(200).json({
      content: contentData[page],
      page,
      languages: Object.keys(contentData[page])
    });

  } catch (error) {
    console.error('Content GET error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function handlePut(req, res) {
  try {
    // Verify admin authentication
    verifyAdminToken(req);

    const { page, language, content } = req.body;

    if (!page || !language || !content) {
      return res.status(400).json({ 
        message: 'Page, language, and content are required' 
      });
    }

    // Initialize page if it doesn't exist
    if (!contentData[page]) {
      contentData[page] = {};
    }

    // Update the content
    contentData[page][language] = {
      ...contentData[page][language],
      ...content,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      message: 'Content updated successfully',
      content: contentData[page][language],
      page,
      language
    });

  } catch (error) {
    console.error('Content PUT error:', error);
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (error.message === 'Insufficient permissions') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
}