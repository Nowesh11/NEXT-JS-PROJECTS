import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import WebsiteContent from '../../models/WebsiteContent';

// Define available section types and their configurations
const SECTION_TYPES = {
  hero: {
    name: 'Hero Section',
    description: 'Main banner section with large image and call-to-action',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      content: { type: 'bilingual', required: false, maxLength: 500 },
      buttonText: { type: 'bilingual', required: false, maxLength: 50 },
      buttonUrl: { type: 'string', required: false, maxLength: 200 },
      images: { type: 'array', required: true, maxItems: 1, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      backgroundVideo: { type: 'string', required: false },
      overlayOpacity: { type: 'number', required: false, min: 0, max: 1 }
    },
    layout: 'full-width',
    maxPerPage: 1,
    allowedPages: ['home', 'about', 'services']
  },
  about: {
    name: 'About Section',
    description: 'Information section with text and optional images',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      content: { type: 'bilingual', required: true, maxLength: 2000 },
      images: { type: 'array', required: false, maxItems: 3, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
      layout: { type: 'enum', required: false, options: ['text-left', 'text-right', 'text-center'], default: 'text-left' }
    },
    layout: 'container',
    maxPerPage: 5,
    allowedPages: ['home', 'about', 'services', 'contact']
  },
  services: {
    name: 'Services Section',
    description: 'Services or features showcase with icons and descriptions',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      content: { type: 'bilingual', required: false, maxLength: 1000 },
      services: { 
        type: 'array', 
        required: true, 
        maxItems: 6,
        itemSchema: {
          title: { type: 'bilingual', required: true, maxLength: 100 },
          description: { type: 'bilingual', required: true, maxLength: 300 },
          icon: { type: 'string', required: false },
          image: { type: 'string', required: false },
          url: { type: 'string', required: false }
        }
      }
    },
    layout: 'container',
    maxPerPage: 3,
    allowedPages: ['home', 'services']
  },
  gallery: {
    name: 'Image Gallery',
    description: 'Photo gallery with multiple images',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      images: { 
        type: 'array', 
        required: true, 
        maxItems: 20, 
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        itemSchema: {
          alt: { type: 'bilingual', required: true, maxLength: 100 },
          caption: { type: 'bilingual', required: false, maxLength: 200 }
        }
      },
      layout: { type: 'enum', required: false, options: ['grid', 'masonry', 'carousel'], default: 'grid' },
      columns: { type: 'number', required: false, min: 2, max: 6, default: 3 }
    },
    layout: 'container',
    maxPerPage: 3,
    allowedPages: ['home', 'gallery', 'about']
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Customer testimonials and reviews',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      testimonials: {
        type: 'array',
        required: true,
        maxItems: 10,
        itemSchema: {
          name: { type: 'string', required: true, maxLength: 100 },
          position: { type: 'string', required: false, maxLength: 100 },
          company: { type: 'string', required: false, maxLength: 100 },
          content: { type: 'bilingual', required: true, maxLength: 500 },
          rating: { type: 'number', required: false, min: 1, max: 5 },
          avatar: { type: 'string', required: false }
        }
      }
    },
    layout: 'container',
    maxPerPage: 2,
    allowedPages: ['home', 'about', 'services']
  },
  contact: {
    name: 'Contact Information',
    description: 'Contact details and information',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      content: { type: 'bilingual', required: false, maxLength: 1000 },
      contactInfo: {
        type: 'object',
        required: true,
        schema: {
          address: { type: 'bilingual', required: false, maxLength: 200 },
          phone: { type: 'string', required: false, maxLength: 50 },
          email: { type: 'string', required: false, maxLength: 100 },
          hours: { type: 'bilingual', required: false, maxLength: 200 },
          socialMedia: {
            type: 'object',
            required: false,
            schema: {
              facebook: { type: 'string', required: false },
              twitter: { type: 'string', required: false },
              instagram: { type: 'string', required: false },
              linkedin: { type: 'string', required: false }
            }
          }
        }
      },
      showMap: { type: 'boolean', required: false, default: false },
      mapCoordinates: {
        type: 'object',
        required: false,
        schema: {
          lat: { type: 'number', required: true },
          lng: { type: 'number', required: true }
        }
      }
    },
    layout: 'container',
    maxPerPage: 2,
    allowedPages: ['contact', 'home']
  },
  cta: {
    name: 'Call to Action',
    description: 'Call-to-action section with button',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      content: { type: 'bilingual', required: false, maxLength: 300 },
      buttonText: { type: 'bilingual', required: true, maxLength: 50 },
      buttonUrl: { type: 'string', required: true, maxLength: 200 },
      backgroundColor: { type: 'string', required: false, pattern: '^#[0-9A-Fa-f]{6}$' },
      textColor: { type: 'string', required: false, pattern: '^#[0-9A-Fa-f]{6}$' }
    },
    layout: 'full-width',
    maxPerPage: 3,
    allowedPages: ['home', 'about', 'services', 'contact']
  },
  faq: {
    name: 'FAQ Section',
    description: 'Frequently asked questions',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      faqs: {
        type: 'array',
        required: true,
        maxItems: 20,
        itemSchema: {
          question: { type: 'bilingual', required: true, maxLength: 200 },
          answer: { type: 'bilingual', required: true, maxLength: 1000 },
          category: { type: 'string', required: false, maxLength: 50 }
        }
      }
    },
    layout: 'container',
    maxPerPage: 2,
    allowedPages: ['home', 'faq', 'support']
  },
  team: {
    name: 'Team Section',
    description: 'Team members showcase',
    fields: {
      title: { type: 'bilingual', required: true, maxLength: 100 },
      subtitle: { type: 'bilingual', required: false, maxLength: 200 },
      members: {
        type: 'array',
        required: true,
        maxItems: 12,
        itemSchema: {
          name: { type: 'string', required: true, maxLength: 100 },
          position: { type: 'bilingual', required: true, maxLength: 100 },
          bio: { type: 'bilingual', required: false, maxLength: 500 },
          image: { type: 'string', required: false },
          socialMedia: {
            type: 'object',
            required: false,
            schema: {
              linkedin: { type: 'string', required: false },
              twitter: { type: 'string', required: false },
              email: { type: 'string', required: false }
            }
          }
        }
      }
    },
    layout: 'container',
    maxPerPage: 2,
    allowedPages: ['about', 'team']
  },
  custom: {
    name: 'Custom Section',
    description: 'Custom HTML/content section',
    fields: {
      title: { type: 'bilingual', required: false, maxLength: 100 },
      content: { type: 'bilingual', required: true, maxLength: 5000 },
      customCSS: { type: 'string', required: false, maxLength: 2000 },
      customJS: { type: 'string', required: false, maxLength: 2000 }
    },
    layout: 'custom',
    maxPerPage: 10,
    allowedPages: ['home', 'about', 'services', 'contact', 'custom']
  }
};

export async function GET(request) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const type = searchParams.get('type');
    const includeUsage = searchParams.get('includeUsage') === 'true';

    let sectionTypes = { ...SECTION_TYPES };

    // Filter by page if specified
    if (page) {
      sectionTypes = Object.fromEntries(
        Object.entries(sectionTypes).filter(([key, config]) => 
          config.allowedPages.includes(page)
        )
      );
    }

    // Filter by type if specified
    if (type && sectionTypes[type]) {
      sectionTypes = { [type]: sectionTypes[type] };
    }

    // Include usage statistics if requested
    if (includeUsage) {
      for (const [typeKey, config] of Object.entries(sectionTypes)) {
        const usage = await WebsiteContent.aggregate([
          { $match: { sectionType: typeKey } },
          {
            $group: {
              _id: '$page',
              count: { $sum: 1 },
              active: { $sum: { $cond: ['$isActive', 1, 0] } }
            }
          }
        ]);

        const totalUsage = await WebsiteContent.countDocuments({ sectionType: typeKey });
        const activeUsage = await WebsiteContent.countDocuments({ 
          sectionType: typeKey, 
          isActive: true 
        });

        config.usage = {
          total: totalUsage,
          active: activeUsage,
          byPage: usage,
          percentageUsed: config.maxPerPage ? 
            Math.round((totalUsage / config.maxPerPage) * 100) : 0
        };
      }
    }

    // Get available pages
    const availablePages = [...new Set(
      Object.values(sectionTypes)
        .flatMap(config => config.allowedPages)
    )].sort();

    return NextResponse.json({
      success: true,
      data: {
        sectionTypes,
        availablePages,
        totalTypes: Object.keys(sectionTypes).length,
        metadata: {
          includeUsage,
          filteredByPage: !!page,
          filteredByType: !!type,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching section types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section types' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sectionType, page, data } = body;

    if (!sectionType || !page || !data) {
      return NextResponse.json(
        { success: false, error: 'Section type, page, and data are required' },
        { status: 400 }
      );
    }

    // Validate section type
    const typeConfig = SECTION_TYPES[sectionType];
    if (!typeConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid section type' },
        { status: 400 }
      );
    }

    // Validate page is allowed for this section type
    if (!typeConfig.allowedPages.includes(page)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Section type '${sectionType}' is not allowed on page '${page}'`,
          allowedPages: typeConfig.allowedPages
        },
        { status: 400 }
      );
    }

    // Check max per page limit
    const existingCount = await WebsiteContent.countDocuments({
      page,
      sectionType,
      isActive: true
    });

    if (existingCount >= typeConfig.maxPerPage) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${typeConfig.maxPerPage} ${sectionType} sections allowed per page`,
          currentCount: existingCount,
          maxAllowed: typeConfig.maxPerPage
        },
        { status: 400 }
      );
    }

    // Validate data against field schema
    const validationResult = validateSectionData(data, typeConfig.fields);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data validation failed',
          validationErrors: validationResult.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        sectionType,
        page,
        typeConfig,
        validatedData: validationResult.data,
        canCreate: true,
        remainingSlots: typeConfig.maxPerPage - existingCount
      }
    });

  } catch (error) {
    console.error('Error validating section type:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate section type' },
      { status: 500 }
    );
  }
}

// Helper function to validate section data
function validateSectionData(data, fieldSchema) {
  const errors = [];
  const validatedData = { ...data };

  for (const [fieldName, fieldConfig] of Object.entries(fieldSchema)) {
    const value = data[fieldName];

    // Check required fields
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Validate based on field type
    switch (fieldConfig.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field '${fieldName}' must be a string`);
        } else if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
          errors.push(`Field '${fieldName}' exceeds maximum length of ${fieldConfig.maxLength}`);
        } else if (fieldConfig.pattern && !new RegExp(fieldConfig.pattern).test(value)) {
          errors.push(`Field '${fieldName}' does not match required pattern`);
        }
        break;

      case 'bilingual':
        if (typeof value === 'string') {
          // Convert string to bilingual object
          validatedData[fieldName] = { en: value, ar: value };
        } else if (typeof value === 'object' && value !== null) {
          if (!value.en && !value.ar) {
            errors.push(`Field '${fieldName}' must have at least one language (en or ar)`);
          }
          if (fieldConfig.maxLength) {
            if (value.en && value.en.length > fieldConfig.maxLength) {
              errors.push(`Field '${fieldName}' (English) exceeds maximum length of ${fieldConfig.maxLength}`);
            }
            if (value.ar && value.ar.length > fieldConfig.maxLength) {
              errors.push(`Field '${fieldName}' (Arabic) exceeds maximum length of ${fieldConfig.maxLength}`);
            }
          }
        } else {
          errors.push(`Field '${fieldName}' must be a string or bilingual object`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Field '${fieldName}' must be a number`);
        } else {
          if (fieldConfig.min !== undefined && value < fieldConfig.min) {
            errors.push(`Field '${fieldName}' must be at least ${fieldConfig.min}`);
          }
          if (fieldConfig.max !== undefined && value > fieldConfig.max) {
            errors.push(`Field '${fieldName}' must be at most ${fieldConfig.max}`);
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Field '${fieldName}' must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field '${fieldName}' must be an array`);
        } else {
          if (fieldConfig.maxItems && value.length > fieldConfig.maxItems) {
            errors.push(`Field '${fieldName}' exceeds maximum items of ${fieldConfig.maxItems}`);
          }
        }
        break;

      case 'enum':
        if (!fieldConfig.options.includes(value)) {
          errors.push(`Field '${fieldName}' must be one of: ${fieldConfig.options.join(', ')}`);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
}