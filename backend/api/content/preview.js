import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import WebsiteContent from '../../models/WebsiteContent';

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
    const language = searchParams.get('language') || 'en';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const previewMode = searchParams.get('mode') || 'published'; // 'published', 'draft', 'all'

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page parameter is required' },
        { status: 400 }
      );
    }

    // Build query based on preview mode
    let query = { page };
    
    switch (previewMode) {
      case 'published':
        query.isActive = true;
        query.isVisible = true;
        query.$or = [
          { publishedAt: { $lte: new Date() } },
          { publishedAt: null }
        ];
        break;
      case 'draft':
        query.$or = [
          { isActive: false },
          { isVisible: false },
          { publishedAt: { $gt: new Date() } }
        ];
        break;
      case 'all':
        if (!includeInactive) {
          query.isActive = true;
        }
        break;
    }

    // Get content for preview
    const content = await WebsiteContent.find(query)
      .populate('createdBy updatedBy approvedBy', 'name email')
      .sort({ position: 1, createdAt: 1 })
      .lean();

    // Process content for localization and preview
    const processedContent = content.map(item => {
      const processed = { ...item };
      
      // Localize bilingual fields
      if (processed.title && typeof processed.title === 'object') {
        processed.title = processed.title[language] || processed.title.en || '';
      }
      if (processed.content && typeof processed.content === 'object') {
        processed.content = processed.content[language] || processed.content.en || '';
      }
      if (processed.subtitle && typeof processed.subtitle === 'object') {
        processed.subtitle = processed.subtitle[language] || processed.subtitle.en || '';
      }
      if (processed.description && typeof processed.description === 'object') {
        processed.description = processed.description[language] || processed.description.en || '';
      }
      if (processed.buttonText && typeof processed.buttonText === 'object') {
        processed.buttonText = processed.buttonText[language] || processed.buttonText.en || '';
      }
      if (processed.altText && typeof processed.altText === 'object') {
        processed.altText = processed.altText[language] || processed.altText.en || '';
      }
      
      // Process images for preview
      if (processed.images && processed.images.length > 0) {
        processed.images = processed.images.map(img => ({
          ...img,
          url: img.url || `/uploads/content/${processed.page}/${img.filename}`,
          alt: typeof img.alt === 'object' ? 
            (img.alt[language] || img.alt.en || '') : 
            (img.alt || '')
        }));
      }
      
      // Add preview metadata
      processed.previewMetadata = {
        status: getContentStatus(processed),
        lastModified: processed.updatedAt || processed.createdAt,
        modifiedBy: processed.updatedBy || processed.createdBy,
        version: processed.version || 1,
        language: language,
        previewMode: previewMode
      };
      
      return processed;
    });

    // Group content by section for better preview organization
    const contentBySections = processedContent.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});

    // Get page metadata
    const pageStats = {
      totalSections: Object.keys(contentBySections).length,
      totalContent: processedContent.length,
      publishedContent: processedContent.filter(item => 
        item.previewMetadata.status === 'published'
      ).length,
      draftContent: processedContent.filter(item => 
        item.previewMetadata.status === 'draft'
      ).length,
      scheduledContent: processedContent.filter(item => 
        item.previewMetadata.status === 'scheduled'
      ).length
    };

    return NextResponse.json({
      success: true,
      data: {
        page,
        language,
        previewMode,
        content: processedContent,
        contentBySections,
        pageStats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating content preview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate content preview' },
      { status: 500 }
    );
  }
}

// Helper function to determine content status
function getContentStatus(content) {
  if (!content.isActive) return 'inactive';
  if (!content.isVisible) return 'hidden';
  
  const now = new Date();
  if (content.publishedAt && content.publishedAt > now) {
    return 'scheduled';
  }
  
  if (content.publishedAt && content.publishedAt <= now) {
    return 'published';
  }
  
  return 'draft';
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
    const { contentId, changes, language = 'en' } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Get original content
    const originalContent = await WebsiteContent.findById(contentId).lean();
    if (!originalContent) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    // Apply changes for preview (without saving)
    const previewContent = { ...originalContent };
    
    if (changes) {
      Object.keys(changes).forEach(key => {
        if (changes[key] !== undefined) {
          // Handle bilingual fields
          if (['title', 'content', 'subtitle', 'description', 'buttonText', 'altText'].includes(key)) {
            if (typeof previewContent[key] === 'object') {
              previewContent[key] = {
                ...previewContent[key],
                [language]: changes[key]
              };
            } else {
              previewContent[key] = changes[key];
            }
          } else {
            previewContent[key] = changes[key];
          }
        }
      });
    }

    // Process for localization
    const processedContent = { ...previewContent };
    
    // Localize bilingual fields
    ['title', 'content', 'subtitle', 'description', 'buttonText', 'altText'].forEach(field => {
      if (processedContent[field] && typeof processedContent[field] === 'object') {
        processedContent[field] = processedContent[field][language] || processedContent[field].en || '';
      }
    });

    // Add preview metadata
    processedContent.previewMetadata = {
      isPreview: true,
      originalId: contentId,
      hasChanges: Object.keys(changes || {}).length > 0,
      changedFields: Object.keys(changes || {}),
      language: language,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        preview: processedContent,
        original: originalContent,
        changes: changes || {},
        language
      }
    });

  } catch (error) {
    console.error('Error generating content preview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate content preview' },
      { status: 500 }
    );
  }
}