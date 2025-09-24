import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import WebsiteContent from '../../models/WebsiteContent';

// Validation rules and constraints
const VALIDATION_RULES = {
  required_fields: ['page', 'section', 'sectionKey', 'sectionType'],
  bilingual_fields: ['title', 'content', 'subtitle', 'description', 'buttonText', 'altText'],
  max_lengths: {
    sectionKey: 100,
    page: 50,
    section: 50,
    sectionType: 50,
    buttonUrl: 500,
    customCSS: 5000,
    customJS: 5000
  },
  bilingual_max_lengths: {
    title: 200,
    subtitle: 300,
    description: 1000,
    content: 10000,
    buttonText: 100,
    altText: 200
  },
  allowed_pages: ['home', 'about', 'services', 'contact', 'gallery', 'team', 'faq', 'custom'],
  allowed_section_types: ['hero', 'about', 'services', 'gallery', 'testimonials', 'contact', 'cta', 'faq', 'team', 'custom'],
  image_constraints: {
    max_size: 10 * 1024 * 1024, // 10MB
    allowed_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    max_images: 20
  },
  position_constraints: {
    min: 0,
    max: 999
  }
};

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
    const { data, validationType = 'full', contentId = null } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data is required for validation' },
        { status: 400 }
      );
    }

    // Perform validation based on type
    let validationResult;
    switch (validationType) {
      case 'quick':
        validationResult = await performQuickValidation(data);
        break;
      case 'full':
        validationResult = await performFullValidation(data, contentId);
        break;
      case 'schema':
        validationResult = await performSchemaValidation(data);
        break;
      case 'duplicate':
        validationResult = await performDuplicateValidation(data, contentId);
        break;
      case 'images':
        validationResult = await performImageValidation(data);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid validation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        suggestions: validationResult.suggestions,
        validationType,
        validatedData: validationResult.validatedData,
        metadata: {
          validatedAt: new Date().toISOString(),
          validatedBy: session.user.id,
          contentId
        }
      }
    });

  } catch (error) {
    console.error('Error validating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate content' },
      { status: 500 }
    );
  }
}

// Quick validation - basic required fields and format
async function performQuickValidation(data) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Check required fields
  for (const field of VALIDATION_RULES.required_fields) {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`Required field '${field}' is missing or empty`);
    }
  }

  // Basic format validation
  if (data.page && !VALIDATION_RULES.allowed_pages.includes(data.page)) {
    errors.push(`Invalid page '${data.page}'. Allowed pages: ${VALIDATION_RULES.allowed_pages.join(', ')}`);
  }

  if (data.sectionType && !VALIDATION_RULES.allowed_section_types.includes(data.sectionType)) {
    errors.push(`Invalid section type '${data.sectionType}'. Allowed types: ${VALIDATION_RULES.allowed_section_types.join(', ')}`);
  }

  // Check position
  if (data.position !== undefined) {
    const pos = parseInt(data.position);
    if (isNaN(pos) || pos < VALIDATION_RULES.position_constraints.min || pos > VALIDATION_RULES.position_constraints.max) {
      errors.push(`Position must be a number between ${VALIDATION_RULES.position_constraints.min} and ${VALIDATION_RULES.position_constraints.max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    validatedData: data
  };
}

// Full validation - comprehensive validation including database checks
async function performFullValidation(data, contentId) {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  const validatedData = { ...data };

  // Start with quick validation
  const quickResult = await performQuickValidation(data);
  errors.push(...quickResult.errors);

  if (errors.length > 0) {
    return { isValid: false, errors, warnings, suggestions, validatedData };
  }

  // Schema validation
  const schemaResult = await performSchemaValidation(data);
  errors.push(...schemaResult.errors);
  warnings.push(...schemaResult.warnings);
  suggestions.push(...schemaResult.suggestions);

  // Duplicate validation
  const duplicateResult = await performDuplicateValidation(data, contentId);
  errors.push(...duplicateResult.errors);
  warnings.push(...duplicateResult.warnings);

  // Image validation
  if (data.images && data.images.length > 0) {
    const imageResult = await performImageValidation(data);
    errors.push(...imageResult.errors);
    warnings.push(...imageResult.warnings);
    suggestions.push(...imageResult.suggestions);
  }

  // Content quality checks
  const qualityResult = performContentQualityValidation(data);
  warnings.push(...qualityResult.warnings);
  suggestions.push(...qualityResult.suggestions);

  // SEO validation
  const seoResult = performSEOValidation(data);
  warnings.push(...seoResult.warnings);
  suggestions.push(...seoResult.suggestions);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    validatedData
  };
}

// Schema validation - field types, lengths, formats
async function performSchemaValidation(data) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Validate string field lengths
  for (const [field, maxLength] of Object.entries(VALIDATION_RULES.max_lengths)) {
    if (data[field] && typeof data[field] === 'string' && data[field].length > maxLength) {
      errors.push(`Field '${field}' exceeds maximum length of ${maxLength} characters`);
    }
  }

  // Validate bilingual field lengths
  for (const [field, maxLength] of Object.entries(VALIDATION_RULES.bilingual_max_lengths)) {
    if (data[field]) {
      if (typeof data[field] === 'string') {
        if (data[field].length > maxLength) {
          errors.push(`Field '${field}' exceeds maximum length of ${maxLength} characters`);
        }
      } else if (typeof data[field] === 'object') {
        if (data[field].en && data[field].en.length > maxLength) {
          errors.push(`Field '${field}' (English) exceeds maximum length of ${maxLength} characters`);
        }
        if (data[field].ar && data[field].ar.length > maxLength) {
          errors.push(`Field '${field}' (Arabic) exceeds maximum length of ${maxLength} characters`);
        }
        
        // Check if both languages are missing
        if (!data[field].en && !data[field].ar) {
          warnings.push(`Bilingual field '${field}' is missing content in both languages`);
        } else if (!data[field].en) {
          warnings.push(`Bilingual field '${field}' is missing English content`);
        } else if (!data[field].ar) {
          warnings.push(`Bilingual field '${field}' is missing Arabic content`);
        }
      }
    }
  }

  // Validate URLs
  if (data.buttonUrl) {
    try {
      new URL(data.buttonUrl);
    } catch {
      // Check if it's a relative URL
      if (!data.buttonUrl.startsWith('/') && !data.buttonUrl.startsWith('#')) {
        errors.push(`Field 'buttonUrl' must be a valid URL or relative path`);
      }
    }
  }

  // Validate boolean fields
  const booleanFields = ['isActive', 'isVisible', 'isFeatured'];
  for (const field of booleanFields) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      errors.push(`Field '${field}' must be a boolean value`);
    }
  }

  // Validate dates
  const dateFields = ['publishedAt', 'expiresAt'];
  for (const field of dateFields) {
    if (data[field] && isNaN(Date.parse(data[field]))) {
      errors.push(`Field '${field}' must be a valid date`);
    }
  }

  return { errors, warnings, suggestions };
}

// Duplicate validation - check for duplicate section keys
async function performDuplicateValidation(data, contentId) {
  const errors = [];
  const warnings = [];

  if (!data.page || !data.sectionKey) {
    return { errors, warnings };
  }

  // Check for duplicate section key on the same page
  const query = {
    page: data.page,
    sectionKey: data.sectionKey
  };

  // Exclude current content if updating
  if (contentId) {
    query._id = { $ne: contentId };
  }

  const existingContent = await WebsiteContent.findOne(query);
  if (existingContent) {
    errors.push(`Section key '${data.sectionKey}' already exists on page '${data.page}'`);
  }

  // Check for similar section keys (potential typos)
  const similarQuery = {
    page: data.page,
    sectionKey: { $regex: new RegExp(data.sectionKey.replace(/[^a-zA-Z0-9]/g, ''), 'i') }
  };
  
  if (contentId) {
    similarQuery._id = { $ne: contentId };
  }

  const similarContent = await WebsiteContent.find(similarQuery).limit(3);
  if (similarContent.length > 0) {
    const similarKeys = similarContent.map(c => c.sectionKey).join(', ');
    warnings.push(`Similar section keys found on this page: ${similarKeys}`);
  }

  return { errors, warnings };
}

// Image validation
async function performImageValidation(data) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  if (!data.images || !Array.isArray(data.images)) {
    return { errors, warnings, suggestions };
  }

  // Check image count
  if (data.images.length > VALIDATION_RULES.image_constraints.max_images) {
    errors.push(`Too many images. Maximum allowed: ${VALIDATION_RULES.image_constraints.max_images}`);
  }

  // Validate each image
  for (let i = 0; i < data.images.length; i++) {
    const image = data.images[i];
    
    if (!image.filename && !image.url) {
      errors.push(`Image ${i + 1}: Missing filename or URL`);
      continue;
    }

    // Check file type
    if (image.mimetype && !VALIDATION_RULES.image_constraints.allowed_types.includes(image.mimetype)) {
      errors.push(`Image ${i + 1}: Invalid file type '${image.mimetype}'. Allowed types: ${VALIDATION_RULES.image_constraints.allowed_types.join(', ')}`);
    }

    // Check file size
    if (image.size && image.size > VALIDATION_RULES.image_constraints.max_size) {
      errors.push(`Image ${i + 1}: File size exceeds maximum of ${VALIDATION_RULES.image_constraints.max_size / (1024 * 1024)}MB`);
    }

    // Check alt text
    if (!image.alt || (typeof image.alt === 'object' && !image.alt.en && !image.alt.ar)) {
      warnings.push(`Image ${i + 1}: Missing alt text for accessibility`);
    }

    // Suggest optimization for large images
    if (image.size && image.size > 1024 * 1024) {
      suggestions.push(`Image ${i + 1}: Consider optimizing image size for better performance`);
    }
  }

  return { errors, warnings, suggestions };
}

// Content quality validation
function performContentQualityValidation(data) {
  const warnings = [];
  const suggestions = [];

  // Check content length
  if (data.content) {
    const contentText = typeof data.content === 'object' ? 
      (data.content.en || data.content.ar || '') : data.content;
    
    if (contentText.length < 50) {
      warnings.push('Content is very short. Consider adding more descriptive text');
    }
    
    if (contentText.length > 5000) {
      suggestions.push('Content is quite long. Consider breaking it into multiple sections');
    }
  }

  // Check title length
  if (data.title) {
    const titleText = typeof data.title === 'object' ? 
      (data.title.en || data.title.ar || '') : data.title;
    
    if (titleText.length < 5) {
      warnings.push('Title is very short');
    }
    
    if (titleText.length > 100) {
      warnings.push('Title is quite long. Consider shortening for better readability');
    }
  }

  // Check for placeholder text
  const placeholderPatterns = [
    /lorem ipsum/i,
    /placeholder/i,
    /sample text/i,
    /dummy text/i,
    /test content/i
  ];

  const checkPlaceholder = (text) => {
    if (typeof text === 'string') {
      return placeholderPatterns.some(pattern => pattern.test(text));
    }
    if (typeof text === 'object' && text !== null) {
      return placeholderPatterns.some(pattern => 
        (text.en && pattern.test(text.en)) || (text.ar && pattern.test(text.ar))
      );
    }
    return false;
  };

  if (checkPlaceholder(data.title)) {
    warnings.push('Title appears to contain placeholder text');
  }
  
  if (checkPlaceholder(data.content)) {
    warnings.push('Content appears to contain placeholder text');
  }

  return { warnings, suggestions };
}

// SEO validation
function performSEOValidation(data) {
  const warnings = [];
  const suggestions = [];

  // Check meta description length
  if (data.description) {
    const descText = typeof data.description === 'object' ? 
      (data.description.en || data.description.ar || '') : data.description;
    
    if (descText.length < 120) {
      suggestions.push('Description is shorter than recommended for SEO (120-160 characters)');
    }
    
    if (descText.length > 160) {
      warnings.push('Description exceeds recommended SEO length (160 characters)');
    }
  } else if (data.sectionType === 'hero') {
    suggestions.push('Consider adding a description for better SEO');
  }

  // Check title length for SEO
  if (data.title) {
    const titleText = typeof data.title === 'object' ? 
      (data.title.en || data.title.ar || '') : data.title;
    
    if (titleText.length > 60) {
      warnings.push('Title exceeds recommended SEO length (60 characters)');
    }
  }

  // Check for missing alt text on images
  if (data.images && data.images.length > 0) {
    const missingAlt = data.images.filter(img => 
      !img.alt || (typeof img.alt === 'object' && !img.alt.en && !img.alt.ar)
    );
    
    if (missingAlt.length > 0) {
      warnings.push(`${missingAlt.length} image(s) missing alt text for SEO and accessibility`);
    }
  }

  return { warnings, suggestions };
}

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return validation rules and constraints
    return NextResponse.json({
      success: true,
      data: {
        validationRules: VALIDATION_RULES,
        validationTypes: [
          {
            type: 'quick',
            description: 'Basic validation of required fields and formats',
            speed: 'fast'
          },
          {
            type: 'full',
            description: 'Comprehensive validation including database checks',
            speed: 'slow'
          },
          {
            type: 'schema',
            description: 'Field types, lengths, and format validation',
            speed: 'medium'
          },
          {
            type: 'duplicate',
            description: 'Check for duplicate section keys',
            speed: 'medium'
          },
          {
            type: 'images',
            description: 'Image file validation and optimization suggestions',
            speed: 'fast'
          }
        ],
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching validation rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch validation rules' },
      { status: 500 }
    );
  }
}