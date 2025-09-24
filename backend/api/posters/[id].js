import Poster from '../../../models/Poster';
import dbConnect from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  // Validate MongoDB ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid poster ID format'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const poster = await Poster.findById(id).lean();
        
        if (!poster) {
          return res.status(404).json({
            success: false,
            error: 'Poster not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: poster
        });
      } catch (error) {
        console.error('Error fetching poster:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch poster'
        });
      }
      break;

    case 'PUT':
      try {
        const posterData = req.body;
        
        // Validate required fields
        if (posterData.title && (!posterData.title.en || !posterData.title.ta)) {
          return res.status(400).json({
            success: false,
            error: 'Title must include both English and Tamil versions'
          });
        }
        
        if (posterData.description && (!posterData.description.en || !posterData.description.ta)) {
          return res.status(400).json({
            success: false,
            error: 'Description must include both English and Tamil versions'
          });
        }
        
        const updatedPoster = await Poster.findByIdAndUpdate(
          id,
          posterData,
          { new: true, runValidators: true }
        );
        
        if (!updatedPoster) {
          return res.status(404).json({
            success: false,
            error: 'Poster not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: updatedPoster,
          message: 'Poster updated successfully'
        });
      } catch (error) {
        console.error('Error updating poster:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to update poster'
        });
      }
      break;

    case 'DELETE':
      try {
        const deletedPoster = await Poster.findByIdAndDelete(id);
        
        if (!deletedPoster) {
          return res.status(404).json({
            success: false,
            error: 'Poster not found'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Poster deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting poster:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete poster'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
      break;
  }
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
  const { method, query: { id } } = req;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Poster ID is required'
    });
  }

  try {
    await connectToDatabase();

    switch (method) {
      case 'GET':
        return handleGet(req, res, id);
      case 'PUT':
        return handlePut(req, res, id);
      case 'DELETE':
        return handleDelete(req, res, id);
      case 'PATCH':
        return handlePatch(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Poster API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get single poster
async function handleGet(req, res, id) {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // For development, try to find in mock data
      if (process.env.NODE_ENV === 'development') {
        const mockPoster = mockPosters.find(p => p.id === id);
        if (mockPoster) {
          // Increment view count
          mockPoster.stats.views += 1;
          
          // Calculate computed fields
          const discountedPrice = mockPoster.pricing.discount > 0 
            ? mockPoster.pricing.basePrice * (1 - mockPoster.pricing.discount / 100)
            : mockPoster.pricing.basePrice;

          const popularityScore = (mockPoster.stats.views * 0.1) + 
                                (mockPoster.stats.downloads * 2) + 
                                (mockPoster.stats.likes * 1.5) + 
                                (mockPoster.stats.sales * 5);

          const posterWithComputedFields = {
            ...mockPoster,
            discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            fileSizeMB: (mockPoster.file.size / (1024 * 1024)).toFixed(2),
            aspectRatio: (mockPoster.dimensions.width / mockPoster.dimensions.height).toFixed(2),
            popularityScore: parseFloat(popularityScore.toFixed(1)),
            savings: mockPoster.pricing.basePrice - discountedPrice,
            totalPrice: discountedPrice + mockPoster.pricing.printPrice
          };

          return res.status(200).json({
            success: true,
            data: posterWithComputedFields
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    // Find poster in MongoDB
    const poster = await Poster.findById(id);

    if (!poster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    // Increment view count
    poster.stats.viewCount += 1;
    await poster.save();

    // Get the language preference from query or default to English
    const lang = req.query.lang || 'en';

    // Format response with language preference
    const formattedPoster = {
      id: poster._id,
      title: poster.title[lang] || poster.title.en,
      description: poster.description[lang] || poster.description.en,
      artist: poster.artist,
      category: poster.category,
      tags: poster.tags,
      dimensions: poster.dimensions,
      image: poster.image,
      pricing: poster.pricing,
      availability: poster.availability,
      printOptions: poster.printOptions,
      stats: poster.stats,
      seo: {
        metaTitle: poster.seo.metaTitle[lang] || poster.seo.metaTitle.en,
        metaDescription: poster.seo.metaDescription[lang] || poster.seo.metaDescription.en,
        keywords: poster.seo.keywords
      },
      createdAt: poster.createdAt,
      updatedAt: poster.updatedAt,
      // Include computed fields
      discountedPrice: poster.discountedPrice,
      aspectRatio: poster.aspectRatio
    };

    return res.status(200).json({
      success: true,
      data: formattedPoster
    });
  } catch (error) {
    console.error('Get poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch poster'
    });
  }
}

// Update poster (full update)
async function handlePut(req, res, id) {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // For development, try to update in mock data
      if (process.env.NODE_ENV === 'development') {
        const posterIndex = mockPosters.findIndex(p => p.id === id);
        if (posterIndex !== -1) {
          // Update mock poster
          // Implementation for mock data update
          return res.status(200).json({
            success: true,
            message: 'Poster updated successfully (mock data)',
            data: mockPosters[posterIndex]
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    // Find poster in MongoDB
    const poster = await Poster.findById(id);

    if (!poster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    const {
      title,
      description,
      artist,
      category,
      tags,
      dimensions,
      pricing,
      availability,
      printOptions,
      seo
    } = req.body;

    // Validation
    if (pricing?.basePrice !== undefined && pricing.basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    if (pricing?.discount !== undefined && (pricing.discount < 0 || pricing.discount > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100'
      });
    }

    // Update poster fields
    if (title) {
      poster.title = {
        en: title.en || title,
        ta: title.ta || poster.title.ta || ''
      };
    }
    
    if (description) {
      poster.description = {
        en: description.en || description,
        ta: description.ta || poster.description.ta || ''
      };
    }
    
    if (artist) poster.artist = artist;
    if (category) poster.category = category.toLowerCase();
    if (tags) poster.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    if (dimensions) {
      poster.dimensions = {
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        unit: dimensions.unit || 'inches'
      };
    }
    
    if (pricing) {
      poster.pricing = {
        ...poster.pricing,
        basePrice: parseFloat(pricing.basePrice) || poster.pricing.basePrice,
        printPrice: parseFloat(pricing.printPrice) || poster.pricing.printPrice,
        discount: parseFloat(pricing.discount) || poster.pricing.discount,
        currency: pricing.currency || poster.pricing.currency
      };
    }
    
    if (availability) {
      poster.availability = {
        ...poster.availability,
        isActive: availability.isActive !== undefined ? availability.isActive : poster.availability.isActive,
        inStock: availability.inStock !== undefined ? availability.inStock : poster.availability.inStock,
        limitedEdition: availability.limitedEdition !== undefined ? availability.limitedEdition : poster.availability.limitedEdition,
        maxCopies: availability.maxCopies !== undefined ? availability.maxCopies : poster.availability.maxCopies
      };
    }
    
    if (printOptions) {
      poster.printOptions = {
        ...poster.printOptions,
        papers: printOptions.papers || poster.printOptions.papers,
        sizes: printOptions.sizes || poster.printOptions.sizes,
        frames: printOptions.frames || poster.printOptions.frames
      };
    }
    
    if (seo) {
      poster.seo = {
        ...poster.seo,
        metaTitle: {
          en: seo.metaTitle?.en || poster.seo.metaTitle.en,
          ta: seo.metaTitle?.ta || poster.seo.metaTitle.ta
        },
        metaDescription: {
          en: seo.metaDescription?.en || poster.seo.metaDescription.en,
          ta: seo.metaDescription?.ta || poster.seo.metaDescription.ta
        },
        keywords: seo.keywords || poster.seo.keywords
      };
    }
    
    // Save the updated poster
    await poster.save();

    return res.status(200).json({
      success: true,
      data: poster,
      message: 'Poster updated successfully'
    });
  } catch (error) {
    console.error('Update poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update poster'
    });
  }
}

// Partial update poster (PATCH)
async function handlePatch(req, res, id) {
  try {
    const posterIndex = mockPosters.findIndex(p => p.id === id);

    if (posterIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    const { action, ...updateData } = req.body;

    let updatedPoster = { ...mockPosters[posterIndex] };

    // Handle specific actions
    switch (action) {
      case 'like':
        updatedPoster.stats.likes += 1;
        break;
      case 'unlike':
        updatedPoster.stats.likes = Math.max(0, updatedPoster.stats.likes - 1);
        break;
      case 'download':
        updatedPoster.stats.downloads += 1;
        break;
      case 'purchase':
        updatedPoster.stats.sales += 1;
        break;
      case 'toggle_active':
        updatedPoster.availability.isActive = !updatedPoster.availability.isActive;
        break;
      default:
        // Regular partial update
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined) {
            if (typeof updatedPoster[key] === 'object' && !Array.isArray(updatedPoster[key])) {
              updatedPoster[key] = { ...updatedPoster[key], ...updateData[key] };
            } else {
              updatedPoster[key] = updateData[key];
            }
          }
        });
        break;
    }

    updatedPoster.updatedAt = new Date().toISOString();
    mockPosters[posterIndex] = updatedPoster;

    return res.status(200).json({
      success: true,
      data: updatedPoster,
      message: action ? `Action '${action}' completed successfully` : 'Poster updated successfully'
    });
  } catch (error) {
    console.error('Patch poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update poster'
    });
  }
}

// Delete poster
async function handleDelete(req, res, id) {
  try {
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // For development, try to delete from mock data
      if (process.env.NODE_ENV === 'development') {
        const posterIndex = mockPosters.findIndex(p => p.id === id);
        if (posterIndex !== -1) {
          // Remove poster from mock array
          const deletedPoster = mockPosters.splice(posterIndex, 1)[0];
          return res.status(200).json({
            success: true,
            data: deletedPoster,
            message: 'Poster deleted successfully (mock data)'
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    // Find and delete poster from MongoDB
    const deletedPoster = await Poster.findByIdAndDelete(id);

    if (!deletedPoster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedPoster,
      message: 'Poster deleted successfully'
    });
  } catch (error) {
    console.error('Delete poster error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete poster'
    });
  }
}