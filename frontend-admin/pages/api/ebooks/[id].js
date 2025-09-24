import { connectToDatabase, COLLECTIONS, SCHEMAS, validateData } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Validate admin token (mock implementation)
function validateAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  // Mock validation - in production, verify JWT token
  return token && token.length > 10;
}

// Helper function to get MIME type from format
function getMimeTypeFromFormat(format) {
  const mimeTypes = {
    pdf: 'application/pdf',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook'
  };
  return mimeTypes[format] || 'application/octet-stream';
}

export default async function handler(req, res) {
  // Validate authentication
  if (!validateAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid e-book ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);

    switch (req.method) {
      case 'GET':
        return await handleGetEbook(req, res, ebooksCollection, id);
      case 'PUT':
        return await handleUpdateEbook(req, res, ebooksCollection, id);
      case 'DELETE':
        return await handleDeleteEbook(req, res, ebooksCollection, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('E-book API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/ebooks/[id] - Get single e-book
async function handleGetEbook(req, res, ebooksCollection, id) {
  try {
    const ebook = await ebooksCollection.findOne({ _id: new ObjectId(id) });

    if (!ebook) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    return res.status(200).json({ ebook });
  } catch (error) {
    console.error('Get e-book error:', error);
    return res.status(500).json({ error: 'Failed to fetch e-book' });
  }
}

// Handle PUT /api/ebooks/[id] - Update e-book
async function handleUpdateEbook(req, res, ebooksCollection, id) {
  try {
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, downloadCount, fileMetadata, ...allowedUpdates } = updateData;

    // Validate update data
    const validationErrors = [];
    
    // Validate individual fields if provided
    if (allowedUpdates.title && typeof allowedUpdates.title !== 'string') {
      validationErrors.push('Title must be a string');
    }
    
    if (allowedUpdates.author && typeof allowedUpdates.author !== 'string') {
      validationErrors.push('Author must be a string');
    }
    
    if (allowedUpdates.price && typeof allowedUpdates.price !== 'number') {
      validationErrors.push('Price must be a number');
    }
    
    if (allowedUpdates.fileSize && typeof allowedUpdates.fileSize !== 'number') {
      validationErrors.push('File size must be a number');
    }
    
    if (allowedUpdates.format && !['pdf', 'epub', 'mobi'].includes(allowedUpdates.format)) {
      validationErrors.push('Format must be one of: pdf, epub, mobi');
    }
    
    if (allowedUpdates.status && !['active', 'inactive'].includes(allowedUpdates.status)) {
      validationErrors.push('Status must be one of: active, inactive');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if e-book exists
    const existingEbook = await ebooksCollection.findOne({ _id: new ObjectId(id) });
    if (!existingEbook) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    // Check for title/author uniqueness if being updated
    if ((allowedUpdates.title || allowedUpdates.author)) {
      const titleToCheck = allowedUpdates.title || existingEbook.title;
      const authorToCheck = allowedUpdates.author || existingEbook.author;
      
      const duplicateExists = await ebooksCollection.findOne({ 
        title: titleToCheck,
        author: authorToCheck,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (duplicateExists) {
        return res.status(409).json({ 
          error: 'E-book with this title and author already exists' 
        });
      }
    }

    // Update slug if title is being updated
    if (allowedUpdates.title) {
      allowedUpdates.slug = allowedUpdates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Update file metadata if format is being updated
    const updatePayload = {
      ...allowedUpdates,
      updatedAt: new Date()
    };

    if (allowedUpdates.format) {
      updatePayload['fileMetadata.mimeType'] = getMimeTypeFromFormat(allowedUpdates.format);
    }

    // Update e-book
    const result = await ebooksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    // Get updated e-book
    const updatedEbook = await ebooksCollection.findOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      message: 'E-book updated successfully',
      ebook: updatedEbook
    });
  } catch (error) {
    console.error('Update e-book error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'E-book with this title and author already exists' 
      });
    }
    
    return res.status(500).json({ error: 'Failed to update e-book' });
  }
}

// Handle DELETE /api/ebooks/[id] - Delete e-book
async function handleDeleteEbook(req, res, ebooksCollection, id) {
  try {
    // Check if e-book exists
    const existingEbook = await ebooksCollection.findOne({ _id: new ObjectId(id) });
    if (!existingEbook) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    // Check if e-book has active downloads (in a real app, you'd check orders/downloads collection)
    // For now, we'll allow deletion but mark as deleted
    
    // Soft delete by updating status instead of hard delete
    const result = await ebooksCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'deleted',
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    return res.status(200).json({
      message: 'E-book deleted successfully',
      deletedEbookId: id
    });
  } catch (error) {
    console.error('Delete e-book error:', error);
    return res.status(500).json({ error: 'Failed to delete e-book' });
  }
}

// Handle download tracking
export async function trackDownload(req, res) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid e-book ID' });
    }

    const { db } = await connectToDatabase();
    const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);

    // Increment download count
    const result = await ebooksCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { downloadCount: 1 },
        $set: { lastDownloadedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'E-book not found' });
    }

    return res.status(200).json({ message: 'Download tracked successfully' });
  } catch (error) {
    console.error('Track download error:', error);
    return res.status(500).json({ error: 'Failed to track download' });
  }
}

// Export helper functions for testing
export { validateAdminToken, handleGetEbook, handleUpdateEbook, handleDeleteEbook, getMimeTypeFromFormat };