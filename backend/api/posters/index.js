import { connectToDatabase } from '../../../utils/mongodb';
import Poster from '../../../models/Poster';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { promisify } from 'util';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const posterId = req.body.id || 'temp';
    const uploadDir = path.join(process.cwd(), 'uploads', posterId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'poster-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Promisify multer upload
const uploadFile = promisify(upload);

// Mock poster data for development
const mockPosters = [
  {
    id: '1',
    title: 'Tamil Heritage Mandala',
    description: 'Beautiful mandala design inspired by traditional Tamil art and architecture.',
    artist: 'Priya Krishnamurthy',
    category: 'traditional',
    tags: ['mandala', 'tamil', 'heritage', 'spiritual'],
    dimensions: {
      width: 24,
      height: 36,
      unit: 'inches'
    },
    file: {
      url: '/images/posters/tamil-mandala.jpg',
      format: 'jpg',
      resolution: '300dpi',
      size: 15728640,
      colorSpace: 'CMYK'
    },
    pricing: {
      basePrice: 25.99,
      printPrice: 15.00,
      discount: 10,
      currency: 'USD'
    },
    availability: {
      isActive: true,
      inStock: true,
      limitedEdition: false,
      maxCopies: null
    },
    printOptions: {
      papers: ['matte', 'glossy', 'canvas'],
      sizes: ['12x18', '18x24', '24x36'],
      frames: ['none', 'black', 'white', 'wood']
    },
    stats: {
      views: 2500,
      downloads: 150,
      likes: 89,
      sales: 45
    },
    seo: {
      metaTitle: 'Tamil Heritage Mandala Poster - Traditional Art Print',
      metaDescription: 'Beautiful mandala design inspired by Tamil heritage. High-quality art print available in multiple sizes.',
      keywords: ['tamil art', 'mandala poster', 'traditional design', 'heritage art']
    },
    createdAt: '2023-10-15T08:30:00Z',
    updatedAt: '2023-12-01T14:20:00Z'
  },
  {
    id: '2',
    title: 'Modern Tamil Typography',
    description: 'Contemporary typography design featuring beautiful Tamil script in modern styling.',
    artist: 'Arun Selvam',
    category: 'modern',
    tags: ['typography', 'modern', 'tamil script', 'minimalist'],
    dimensions: {
      width: 18,
      height: 24,
      unit: 'inches'
    },
    file: {
      url: '/images/posters/tamil-typography.jpg',
      format: 'jpg',
      resolution: '300dpi',
      size: 12582912,
      colorSpace: 'RGB'
    },
    pricing: {
      basePrice: 19.99,
      printPrice: 12.00,
      discount: 0,
      currency: 'USD'
    },
    availability: {
      isActive: true,
      inStock: true,
      limitedEdition: true,
      maxCopies: 100
    },
    printOptions: {
      papers: ['matte', 'glossy'],
      sizes: ['12x16', '18x24'],
      frames: ['none', 'black', 'white']
    },
    stats: {
      views: 1800,
      downloads: 95,
      likes: 67,
      sales: 28
    },
    seo: {
      metaTitle: 'Modern Tamil Typography Poster - Contemporary Design',
      metaDescription: 'Modern typography featuring Tamil script. Perfect for contemporary home decor.',
      keywords: ['tamil typography', 'modern design', 'script art', 'contemporary poster']
    },
    createdAt: '2023-11-01T10:15:00Z',
    updatedAt: '2023-12-01T16:45:00Z'
  },
  {
    id: '3',
    title: 'Bharathiyar Quotes Collection',
    description: 'Inspirational quotes from the great Tamil poet Bharathiyar in elegant design.',
    artist: 'Meera Rajesh',
    category: 'inspirational',
    tags: ['bharathiyar', 'quotes', 'poetry', 'inspiration'],
    dimensions: {
      width: 16,
      height: 20,
      unit: 'inches'
    },
    file: {
      url: '/images/posters/bharathiyar-quotes.jpg',
      format: 'jpg',
      resolution: '300dpi',
      size: 10485760,
      colorSpace: 'RGB'
    },
    pricing: {
      basePrice: 22.99,
      printPrice: 14.00,
      discount: 15,
      currency: 'USD'
    },
    availability: {
      isActive: true,
      inStock: true,
      limitedEdition: false,
      maxCopies: null
    },
    printOptions: {
      papers: ['matte', 'glossy', 'canvas'],
      sizes: ['11x14', '16x20', '20x24'],
      frames: ['none', 'black', 'white', 'gold']
    },
    stats: {
      views: 3200,
      downloads: 220,
      likes: 156,
      sales: 78
    },
    seo: {
      metaTitle: 'Bharathiyar Quotes Poster - Tamil Poetry Art',
      metaDescription: 'Beautiful collection of Bharathiyar quotes in elegant poster design. Perfect for Tamil literature lovers.',
      keywords: ['bharathiyar quotes', 'tamil poetry', 'inspirational poster', 'literature art']
    },
    createdAt: '2023-09-20T12:00:00Z',
    updatedAt: '2023-11-28T09:30:00Z'
  }
];

export default async function handler(req, res) {
  const { method } = req;

  try {
    await connectToDatabase();

    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Posters API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get posters with filtering, sorting, and pagination
async function handleGet(req, res) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      artist,
      minPrice,
      maxPrice,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      featured,
      language = 'en'
    } = req.query;

    // Build MongoDB query
    const query = {};
    
    // Apply filters
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (artist) {
      query.artist = { $regex: new RegExp(artist, 'i') };
    }
    
    if (minPrice || maxPrice) {
      query.pricing = query.pricing || {};
      
      if (minPrice) {
        // For discounted prices, we need to use aggregation later
        query['pricing.basePrice'] = { $gte: parseFloat(minPrice) };
      }
      
      if (maxPrice) {
        query['pricing.basePrice'] = query['pricing.basePrice'] || {};
        query['pricing.basePrice'].$lte = parseFloat(maxPrice);
      }
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }
    
    if (search) {
      // Search in title and description based on language
      query.$or = [
        { [`title.${language}`]: { $regex: new RegExp(search, 'i') } },
        { [`description.${language}`]: { $regex: new RegExp(search, 'i') } },
        { artist: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (featured === 'true') {
      query.availability = query.availability || {};
      query['availability.isFeatured'] = true;
    }
    
    // Only show active posters by default
    if (req.query.showInactive !== 'true') {
      query['availability.isActive'] = true;
    }
    
    // Determine sort order
    const sort = {};
    
    switch (sortBy) {
      case 'price':
        // For price sorting, we'll handle in memory after fetching
        sort['pricing.basePrice'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        // For popularity, we'll use views as a proxy and refine later
        sort['stats.views'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'title':
        sort[`title.${language}`] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'artist':
        sort.artist = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
      default:
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch posters from MongoDB
    let posters;
    
    // Use mock data for development if MongoDB is not available
    if (process.env.NODE_ENV === 'development' && (!mongoose.connection.readyState || process.env.USE_MOCK_DATA === 'true')) {
      console.log('Using mock data for posters');
      posters = mockPosters;
      
      // Apply filters to mock data
      if (category) {
        posters = posters.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      if (artist) {
        posters = posters.filter(p => p.artist.toLowerCase().includes(artist.toLowerCase()));
      }
      
      // Apply sorting to mock data
      posters.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'price':
            aValue = a.pricing.discount > 0 ? a.pricing.basePrice * (1 - a.pricing.discount / 100) : a.pricing.basePrice;
            bValue = b.pricing.discount > 0 ? b.pricing.basePrice * (1 - b.pricing.discount / 100) : b.pricing.basePrice;
            break;
          case 'popularity':
            aValue = (a.stats.views * 0.1) + (a.stats.downloads * 2) + (a.stats.likes * 1.5) + (a.stats.sales * 5);
            bValue = (b.stats.views * 0.1) + (b.stats.downloads * 2) + (b.stats.likes * 1.5) + (b.stats.sales * 5);
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'artist':
            aValue = a.artist.toLowerCase();
            bValue = b.artist.toLowerCase();
            break;
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
        }
        
        return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
      });
      
      // Apply pagination to mock data
      const totalPosters = posters.length;
      posters = posters.slice(skip, skip + parseInt(limit));
      
      // Calculate pagination info for mock data
      const totalPages = Math.ceil(totalPosters / parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: posters,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalPosters,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        filters: {
          categories: [...new Set(mockPosters.map(p => p.category))],
          artists: [...new Set(mockPosters.map(p => p.artist))],
          priceRange: {
            min: Math.min(...mockPosters.map(p => p.pricing.basePrice)),
            max: Math.max(...mockPosters.map(p => p.pricing.basePrice))
          }
        }
      });
    } else {
      // Use MongoDB
      posters = await Poster.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      // Get total count for pagination
      const totalPosters = await Poster.countDocuments(query);
      
      // Add computed fields
      const postersWithComputedFields = posters.map(poster => {
        const discountedPrice = poster.pricing.discount > 0 
          ? poster.pricing.basePrice * (1 - poster.pricing.discount / 100)
          : poster.pricing.basePrice;
        
        return {
          ...poster,
          id: poster._id.toString(),
          discountedPrice: parseFloat(discountedPrice.toFixed(2)),
          savings: parseFloat((poster.pricing.basePrice - discountedPrice).toFixed(2))
        };
      });
      
      // Get unique categories and artists for filters
      const categories = await Poster.distinct('category');
      const artists = await Poster.distinct('artist');
      
      // Get price range
      const priceStats = await Poster.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$pricing.basePrice' },
            max: { $max: '$pricing.basePrice' }
          }
        }
      ]);
      
      const priceRange = priceStats.length > 0 
        ? { min: priceStats[0].min, max: priceStats[0].max }
        : { min: 0, max: 100 };
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalPosters / parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: postersWithComputedFields,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalPosters,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        filters: {
          categories,
          artists,
          priceRange
        }
      });
    }
  } catch (error) {
    console.error('Get posters error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posters',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
  } catch (error) {
    console.error('Get posters error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posters'
    });
  }
}

// Create new poster (admin only)
async function handlePost(req, res) {
  try {
    // Handle file upload if present
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      await uploadFile(req, res);
    }
    
    const {
      title,
      description,
      artist,
      category,
      tags,
      dimensions,
      file,
      pricing,
      printOptions,
      seo
    } = req.body;

    // Validation
    if (!title || !description || !artist || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, artist, and category are required'
      });
    }

    if (!dimensions || !dimensions.width || !dimensions.height) {
      return res.status(400).json({
        success: false,
        message: 'Dimensions (width and height) are required'
      });
    }

    if (!pricing || !pricing.basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Base price is required'
      });
    }
    
    // Handle uploaded file
    let fileData = file;
    if (req.file) {
      fileData = {
        url: `/uploads/${req.file.filename}`,
        format: path.extname(req.file.originalname).substring(1),
        resolution: '300dpi',
        size: req.file.size,
        colorSpace: 'RGB'
      };
    }
    
    // Create a new Poster document in MongoDB
    const posterDoc = new Poster({
      title: {
        en: title.en || title,
        ta: title.ta || ''
      },
      description: {
        en: description.en || description,
        ta: description.ta || ''
      },
      artist,
      category: category.toLowerCase(),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      dimensions: {
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        unit: dimensions.unit || 'inches'
      },
      image: file?.url || '',
      pricing: {
        basePrice: parseFloat(pricing.basePrice),
        printPrice: parseFloat(pricing.printPrice) || 10.00,
        discount: parseFloat(pricing.discount) || 0,
        currency: pricing.currency || 'USD'
      },
      availability: {
        isActive: true,
        isFeatured: false,
        isLimitedEdition: false,
        stock: 100,
        unlimitedStock: true
      },
      printOptions: {
        availableSizes: printOptions?.sizes || ['12x16', '18x24'],
        paperTypes: printOptions?.papers || ['matte', 'glossy'],
        finishOptions: printOptions?.frames || ['none', 'black', 'white']
      },
      seo: {
        metaTitle: {
          en: seo?.metaTitle?.en || `${title.en || title} - Art Poster`,
          ta: seo?.metaTitle?.ta || ''
        },
        metaDescription: {
          en: seo?.metaDescription?.en || (description.en || description),
          ta: seo?.metaDescription?.ta || ''
        },
        keywords: seo?.keywords || tags
      },
      createdBy: req.user?._id || 'system'
    });

    await posterDoc.save();

    // Use the saved document for response
    const newPoster = {
      id: posterDoc._id.toString(),
      title,
      description,
      artist,
      category: category.toLowerCase(),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      dimensions: {
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        unit: dimensions.unit || 'inches'
      },
      file: {
        url: file?.url || `/images/posters/poster-${posterDoc._id}.jpg`,
        format: file?.format || 'jpg',
        resolution: file?.resolution || '300dpi',
        size: file?.size || 10485760,
        colorSpace: file?.colorSpace || 'RGB'
      },
      pricing: {
        basePrice: parseFloat(pricing.basePrice),
        printPrice: parseFloat(pricing.printPrice) || 10.00,
        discount: parseFloat(pricing.discount) || 0,
        currency: pricing.currency || 'USD'
      },
      availability: {
        isActive: true,
        inStock: true,
        limitedEdition: false,
        maxCopies: null
      },
      printOptions: {
        papers: printOptions?.papers || ['matte', 'glossy'],
        sizes: printOptions?.sizes || ['12x16', '18x24'],
        frames: printOptions?.frames || ['none', 'black', 'white']
      },
      stats: {
        views: 0,
        downloads: 0,
        likes: 0,
        sales: 0
      },
      seo: {
        metaTitle: seo?.metaTitle || `${title} - Art Poster`,
        metaDescription: seo?.metaDescription || description,
        keywords: seo?.keywords || tags
      },
      createdAt: posterDoc.createdAt,
      updatedAt: posterDoc.updatedAt
    };

    // For development, also add to mock data
    if (process.env.NODE_ENV === 'development') {
      mockPosters.push(newPoster);
    }

    return res.status(201).json({
      success: true,
      data: newPoster,
      message: 'Poster created successfully'
    });
  } catch (error) {
    console.error('Create poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create poster',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update existing poster (admin only)
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Poster ID is required'
      });
    }
    
    // Handle file upload if present
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      await uploadFile(req, res);
    }
    
    const updateData = req.body;
    
    // Find and update the poster in MongoDB
    const updatedPoster = await Poster.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedPoster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }
    
    // For development, update mock data
    if (process.env.NODE_ENV === 'development') {
      const posterIndex = mockPosters.findIndex(p => p.id === id);
      if (posterIndex !== -1) {
        mockPosters[posterIndex] = {
          ...mockPosters[posterIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    return res.status(200).json({
      success: true,
      data: updatedPoster,
      message: 'Poster updated successfully'
    });
  } catch (error) {
    console.error('Update poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update poster',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete poster (admin only)
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Poster ID is required'
      });
    }
    
    // Delete the poster from MongoDB
    const deletedPoster = await Poster.findByIdAndDelete(id);
    
    if (!deletedPoster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }
    
    // For development, remove from mock data
    if (process.env.NODE_ENV === 'development') {
      const posterIndex = mockPosters.findIndex(p => p.id === id);
      if (posterIndex !== -1) {
        mockPosters.splice(posterIndex, 1);
      }
    }
    
    // Delete associated files if they exist
    const uploadDir = path.join(process.cwd(), 'uploads', id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Poster deleted successfully'
    });
  } catch (error) {
    console.error('Delete poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete poster',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}