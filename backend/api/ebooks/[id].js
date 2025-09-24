import dbConnect from '../../../lib/dbConnect';
import Ebook from '../../../models/Ebook';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../../lib/auth';

// Upload directory setup
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ebooks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// API configuration
export const config = {
  api: {
    bodyParser: false,
  },
};

// Mock data (same as in index.js for consistency)
const mockEbooks = [
  {
    id: '1',
    title: {
      en: 'Tamil Literature Classics',
      ta: 'தமிழ் இலக்கிய சிறப்புகள்'
    },
    author: {
      en: 'Dr. Kamala Subramaniam',
      ta: 'டாக்டர் கமலா சுப்ரமணியம்'
    },
    description: {
      en: 'A comprehensive collection of Tamil literary masterpieces spanning centuries of rich cultural heritage.',
      ta: 'பல நூற்றாண்டுகளின் வளமான கலாச்சார பாரம்பரியத்தை உள்ளடக்கிய தமிழ் இலக்கிய தலைசிறந்த படைப்புகளின் விரிவான தொகுப்பு.'
    },
    content: 'This ebook contains selected works from various periods of Tamil literature including Sangam poetry, medieval devotional literature, and modern prose. Each piece is carefully selected to represent the evolution of Tamil literary expression through the ages.',
    coverImage: '/images/ebooks/tamil-classics.jpg',
    category: 'fiction',
    language: 'tamil',
    tags: ['classics', 'literature', 'tamil'],
    price: 15.99,
    originalPrice: 19.99,
    discount: 20,
    format: 'pdf',
    pageCount: 250,
    fileSize: 5242880,
    downloadUrl: '/downloads/tamil-classics.pdf',
    previewUrl: '/previews/tamil-classics-preview.pdf',
    isActive: true,
    isFeatured: true,
    downloadCount: 1250,
    viewCount: 3500,
    rating: {
      average: 4.5,
      count: 89
    },
    reviews: [
      {
        user: 'user1',
        rating: 5,
        comment: 'Excellent collection of Tamil classics. Well curated and beautifully presented.',
        createdAt: '2023-11-15T10:30:00Z'
      },
      {
        user: 'user2',
        rating: 4,
        comment: 'Great resource for Tamil literature enthusiasts.',
        createdAt: '2023-11-10T14:20:00Z'
      }
    ],
    publishedDate: '2023-01-15',
    publisher: 'Tamil Literary Society',
    isbn: '978-0-123456-78-9',
    metadata: {
      keywords: ['Tamil', 'literature', 'classics', 'poetry'],
      subject: 'Tamil Literature',
      creator: 'Dr. Kamala Subramaniam'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: {
      en: 'Modern Tamil Poetry',
      ta: 'நவீன தமிழ் கவிதைகள்'
    },
    author: {
      en: 'Bharathiyar Collective',
      ta: 'பாரதியார் கூட்டமைப்பு'
    },
    description: {
      en: 'Contemporary Tamil poetry that reflects modern themes while honoring traditional forms.',
      ta: 'பாரம்பரிய வடிவங்களை மதிக்கும் அதே வேளையில் நவீன கருப்பொருள்களை பிரதிபலிக்கும் சமகால தமிழ் கவிதைகள்.'
    },
    content: 'A curated selection of modern Tamil poems that explore contemporary themes such as urbanization, technology, and social change while maintaining the rich poetic traditions of Tamil literature.',
    coverImage: '/images/ebooks/modern-poetry.jpg',
    category: 'poetry',
    language: 'tamil',
    tags: ['poetry', 'modern', 'contemporary'],
    price: 12.99,
    originalPrice: 12.99,
    discount: 0,
    format: 'epub',
    pageCount: 180,
    fileSize: 3145728,
    downloadUrl: '/downloads/modern-poetry.epub',
    previewUrl: '/previews/modern-poetry-preview.pdf',
    isActive: true,
    isFeatured: false,
    downloadCount: 850,
    viewCount: 2100,
    rating: {
      average: 4.2,
      count: 45
    },
    reviews: [],
    publishedDate: '2023-03-20',
    publisher: 'Modern Tamil Publishers',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: {
      en: 'Tamil Grammar Guide',
      ta: 'தமிழ் இலக்கண வழிகாட்டி'
    },
    author: {
      en: 'Prof. Meenakshi Sundaram',
      ta: 'பேராசிரியர் மீனாக்ஷி சுந்தரம்'
    },
    description: {
      en: 'Complete guide to Tamil grammar for students and enthusiasts.',
      ta: 'மாணவர்கள் மற்றும் ஆர்வலர்களுக்கான தமிழ் இலக்கணத்திற்கான முழுமையான வழிகாட்டி.'
    },
    content: 'Comprehensive coverage of Tamil grammar rules, syntax, and usage patterns. Includes exercises, examples, and practical applications for learners at all levels.',
    coverImage: '/images/ebooks/grammar-guide.jpg',
    category: 'academic',
    language: 'bilingual',
    tags: ['grammar', 'education', 'reference'],
    price: 18.99,
    originalPrice: 22.99,
    discount: 17,
    format: 'pdf',
    pageCount: 320,
    fileSize: 7340032,
    downloadUrl: '/downloads/grammar-guide.pdf',
    previewUrl: '/previews/grammar-guide-preview.pdf',
    isActive: true,
    isFeatured: true,
    downloadCount: 2100,
    viewCount: 4800,
    rating: {
      average: 4.8,
      count: 156
    },
    reviews: [
      {
        user: 'user3',
        rating: 5,
        comment: 'The most comprehensive Tamil grammar guide I have ever used.',
        createdAt: '2023-12-01T09:15:00Z'
      }
    ],
    publishedDate: '2023-02-10',
    publisher: 'Academic Press Tamil',
    isbn: '978-0-987654-32-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Ebook ID is required'
    });
  }

  try {
    await dbConnect();

    switch (method) {
      case 'GET':
        return handleGet(req, res, id);
      case 'PUT':
        return handlePut(req, res, id);
      case 'DELETE':
        return handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req, res, id) {
  try {
    // For development, use mock data
    const ebook = mockEbooks.find(book => book.id === id);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'Ebook not found'
      });
    }

    // Increment view count (in a real app, you might want to track this differently)
    ebook.viewCount += 1;

    // Calculate discounted price
    const discountedPrice = ebook.discount > 0 
      ? ebook.price * (1 - ebook.discount / 100)
      : ebook.price;

    // Add computed fields
    const ebookWithComputedFields = {
      ...ebook,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      fileSizeMB: (ebook.fileSize / (1024 * 1024)).toFixed(2),
      savings: ebook.originalPrice - discountedPrice,
      savingsPercentage: ebook.originalPrice > 0 
        ? (((ebook.originalPrice - discountedPrice) / ebook.originalPrice) * 100).toFixed(1)
        : 0
    };

    return res.status(200).json({
      success: true,
      data: ebookWithComputedFields
    });
  } catch (error) {
    console.error('Get ebook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ebook'
    });
  }
}

async function handlePut(req, res, id) {
  try {
    // Check authentication
    const user = await requireAuth(req, res);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Parse form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filename: (name, ext, part) => {
        return `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      }
    });

    const [fields, files] = await form.parse(req);

    // Extract bilingual fields
    const titleEn = Array.isArray(fields.titleEn) ? fields.titleEn[0] : fields.titleEn;
    const titleTa = Array.isArray(fields.titleTa) ? fields.titleTa[0] : fields.titleTa;
    const authorEn = Array.isArray(fields.authorEn) ? fields.authorEn[0] : fields.authorEn;
    const authorTa = Array.isArray(fields.authorTa) ? fields.authorTa[0] : fields.authorTa;
    const descriptionEn = Array.isArray(fields.descriptionEn) ? fields.descriptionEn[0] : fields.descriptionEn;
    const descriptionTa = Array.isArray(fields.descriptionTa) ? fields.descriptionTa[0] : fields.descriptionTa;

    // Extract other fields
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const bookLanguage = Array.isArray(fields.bookLanguage) ? fields.bookLanguage[0] : fields.bookLanguage;
    const tags = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags;
    const pages = Array.isArray(fields.pages) ? fields.pages[0] : fields.pages;
    const isbn = Array.isArray(fields.isbn) ? fields.isbn[0] : fields.isbn;
    const isFree = Array.isArray(fields.isFree) ? fields.isFree[0] : fields.isFree;
    const featured = Array.isArray(fields.featured) ? fields.featured[0] : fields.featured;

    try {
      // Try to find and update in database
      const ebook = await Ebook.findById(id);
      if (!ebook) {
        return res.status(404).json({
          success: false,
          message: 'Ebook not found'
        });
      }

      // Handle file uploads
      let coverImagePath = ebook.coverImage;
      let ebookFilePath = ebook.fileUrl;
      let fileSize = ebook.fileSize;
      let fileFormat = ebook.fileFormat;

      // Handle cover image upload
      if (files.coverImage) {
        const coverFile = Array.isArray(files.coverImage) ? files.coverImage[0] : files.coverImage;
        
        // Delete old cover image if it exists and is not default
        if (ebook.coverImage && !ebook.coverImage.includes('default')) {
          const oldCoverPath = path.join(process.cwd(), 'public', ebook.coverImage);
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
          }
        }
        
        coverImagePath = `/uploads/ebooks/${path.basename(coverFile.filepath)}`;
      }

      // Handle ebook file upload
      if (files.ebookFile) {
        const ebookFile = Array.isArray(files.ebookFile) ? files.ebookFile[0] : files.ebookFile;
        
        // Delete old ebook file if it exists
        if (ebook.fileUrl) {
          const oldFilePath = path.join(process.cwd(), 'public', ebook.fileUrl);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        
        ebookFilePath = `/uploads/ebooks/${path.basename(ebookFile.filepath)}`;
        fileSize = `${(ebookFile.size / (1024 * 1024)).toFixed(2)} MB`;
        fileFormat = ebookFile.originalFilename?.split('.').pop()?.toUpperCase() || 'PDF';
      }

      // Update ebook data
      const updateData = {
        title: {
          en: titleEn || ebook.title.en,
          ta: titleTa || ebook.title.ta
        },
        author: {
          en: authorEn || ebook.author.en,
          ta: authorTa || ebook.author.ta
        },
        description: {
          en: descriptionEn || ebook.description.en,
          ta: descriptionTa || ebook.description.ta
        },
        category: category || ebook.category,
        bookLanguage: bookLanguage || ebook.bookLanguage,
        isbn: isbn || ebook.isbn,
        coverImage: coverImagePath,
        fileUrl: ebookFilePath,
        fileSize,
        fileFormat,
        pages: pages ? parseInt(pages) : ebook.pages,
        isFree: isFree !== undefined ? isFree === 'true' : ebook.isFree,
        featured: featured !== undefined ? featured === 'true' : ebook.featured,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : ebook.tags,
        updatedAt: new Date()
      };

      const updatedEbook = await Ebook.findByIdAndUpdate(id, updateData, { new: true });

      // Transform response
      const responseData = {
        id: updatedEbook._id,
        title: updatedEbook.title,
        author: updatedEbook.author,
        description: updatedEbook.description,
        category: updatedEbook.category,
        bookLanguage: updatedEbook.bookLanguage,
        isbn: updatedEbook.isbn,
        coverImage: updatedEbook.coverImage,
        fileUrl: updatedEbook.fileUrl,
        fileSize: updatedEbook.fileSize,
        fileFormat: updatedEbook.fileFormat,
        pages: updatedEbook.pages,
        isFree: updatedEbook.isFree,
        featured: updatedEbook.featured,
        tags: updatedEbook.tags,
        downloadCount: updatedEbook.downloadCount,
        rating: updatedEbook.rating,
        reviewCount: updatedEbook.reviewCount,
        createdAt: updatedEbook.createdAt,
        updatedAt: updatedEbook.updatedAt
      };

      return res.status(200).json({
        success: true,
        message: 'Ebook updated successfully',
        data: responseData
      });

    } catch (dbError) {
      console.log('Database error, using mock update:', dbError.message);
      
      // Fallback: update mock data
      const ebookIndex = mockEbooks.findIndex(book => book.id === id);
      if (ebookIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ebook not found'
        });
      }

      const updatedEbook = {
        ...mockEbooks[ebookIndex],
        title: {
          en: titleEn || mockEbooks[ebookIndex].title.en,
          ta: titleTa || mockEbooks[ebookIndex].title.ta
        },
        author: {
          en: authorEn || mockEbooks[ebookIndex].author.en,
          ta: authorTa || mockEbooks[ebookIndex].author.ta
        },
        description: {
          en: descriptionEn || mockEbooks[ebookIndex].description.en,
          ta: descriptionTa || mockEbooks[ebookIndex].description.ta
        },
        category: category || mockEbooks[ebookIndex].category,
        bookLanguage: bookLanguage || mockEbooks[ebookIndex].language,
        isbn: isbn || mockEbooks[ebookIndex].isbn,
        pages: pages ? parseInt(pages) : mockEbooks[ebookIndex].pageCount,
        isFree: isFree !== undefined ? isFree === 'true' : mockEbooks[ebookIndex].isFree,
        featured: featured !== undefined ? featured === 'true' : mockEbooks[ebookIndex].isFeatured,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : mockEbooks[ebookIndex].tags,
        updatedAt: new Date().toISOString()
      };

      mockEbooks[ebookIndex] = updatedEbook;

      return res.status(200).json({
        success: true,
        data: updatedEbook,
        message: 'Ebook updated successfully (mock mode)'
      });
    }
  } catch (error) {
    console.error('Update ebook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ebook'
    });
  }
}

async function handleDelete(req, res) {
  try {
    // Check authentication
    const authResult = await requireAuth(req, res, ['admin']);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }

    const { id } = req.query;
    await dbConnect();

    try {
      // Try to find and delete from database
      const ebook = await Ebook.findById(id);
      
      if (!ebook) {
        // Fallback to mock data
         const ebookIndex = mockEbooks.findIndex(ebook => ebook._id === id);
        
        if (ebookIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Ebook not found'
          });
        }

        // Remove the ebook from mock data
        const deletedEbook = mockEbooks.splice(ebookIndex, 1)[0];

        return res.status(200).json({
          success: true,
          data: deletedEbook,
          message: 'Ebook deleted successfully (mock mode)'
        });
      }

      // Delete associated files
      if (ebook.coverImage && !ebook.coverImage.includes('default')) {
        const coverImagePath = path.join(process.cwd(), 'public', ebook.coverImage);
        if (fs.existsSync(coverImagePath)) {
          fs.unlinkSync(coverImagePath);
        }
      }

      if (ebook.fileUrl) {
        const ebookFilePath = path.join(process.cwd(), 'public', ebook.fileUrl);
        if (fs.existsSync(ebookFilePath)) {
          fs.unlinkSync(ebookFilePath);
        }
      }

      // Delete from database
      await Ebook.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        data: ebook,
        message: 'Ebook deleted successfully'
      });
    } catch (dbError) {
      console.log('Database error, using mock delete:', dbError.message);
      
      // Fallback to mock data
       const ebookIndex = mockEbooks.findIndex(ebook => ebook._id === id);
      
      if (ebookIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ebook not found'
        });
      }

      // Remove the ebook from mock data
      const deletedEbook = mockEbooks.splice(ebookIndex, 1)[0];

      return res.status(200).json({
        success: true,
        data: deletedEbook,
        message: 'Ebook deleted successfully (mock mode)'
      });
    }
  } catch (error) {
    console.error('Delete ebook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete ebook'
    });
  }
}