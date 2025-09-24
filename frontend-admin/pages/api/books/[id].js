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

export default async function handler(req, res) {
  // Validate authentication
  if (!validateAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const booksCollection = db.collection(COLLECTIONS.BOOKS);

    switch (req.method) {
      case 'GET':
        return await handleGetBook(req, res, booksCollection, id);
      case 'PUT':
        return await handleUpdateBook(req, res, booksCollection, id);
      case 'DELETE':
        return await handleDeleteBook(req, res, booksCollection, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Book API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle GET /api/books/[id] - Get single book
async function handleGetBook(req, res, booksCollection, id) {
  try {
    const book = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    return res.status(200).json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    return res.status(500).json({ error: 'Failed to fetch book' });
  }
}

// Handle PUT /api/books/[id] - Update book
async function handleUpdateBook(req, res, booksCollection, id) {
  try {
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, ...allowedUpdates } = updateData;

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
    
    if (allowedUpdates.stock && typeof allowedUpdates.stock !== 'number') {
      validationErrors.push('Stock must be a number');
    }
    
    if (allowedUpdates.status && !['active', 'inactive', 'out_of_stock'].includes(allowedUpdates.status)) {
      validationErrors.push('Status must be one of: active, inactive, out_of_stock');
    }
    
    if (allowedUpdates.images && !Array.isArray(allowedUpdates.images)) {
      validationErrors.push('Images must be an array');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if book exists
    const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check for ISBN uniqueness if ISBN is being updated
    if (allowedUpdates.isbn && allowedUpdates.isbn !== existingBook.isbn) {
      const isbnExists = await booksCollection.findOne({ 
        isbn: allowedUpdates.isbn,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (isbnExists) {
        return res.status(409).json({ error: 'ISBN already exists' });
      }
    }

    // Update slug if title is being updated
    if (allowedUpdates.title) {
      allowedUpdates.slug = allowedUpdates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Prepare update data
    const updatePayload = {
      ...allowedUpdates,
      updatedAt: new Date()
    };

    // Update book
    const result = await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get updated book
    const updatedBook = await booksCollection.findOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'ISBN already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to update book' });
  }
}

// Handle DELETE /api/books/[id] - Delete book
async function handleDeleteBook(req, res, booksCollection, id) {
  try {
    // Check if book exists
    const existingBook = await booksCollection.findOne({ _id: new ObjectId(id) });
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book has active orders (in a real app, you'd check orders collection)
    // For now, we'll just prevent deletion of books with stock > 0
    if (existingBook.stock > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete book with stock. Please set stock to 0 first.' 
      });
    }

    // Soft delete by updating status instead of hard delete
    const result = await booksCollection.updateOne(
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
      return res.status(404).json({ error: 'Book not found' });
    }

    return res.status(200).json({
      message: 'Book deleted successfully',
      deletedBookId: id
    });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ error: 'Failed to delete book' });
  }
}

// Export helper functions for testing
export { validateAdminToken, handleGetBook, handleUpdateBook, handleDeleteBook };