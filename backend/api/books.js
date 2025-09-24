import dbConnect from '../../lib/dbConnect';
import Book from '../../models/Book';
import { ObjectId } from 'mongodb';

// Database connection helper
async function connectDB() {
    try {
        await dbConnect();
    } catch (error) {
        console.error('Database connection failed:', error);
        throw new Error('Database connection failed');
    }
}

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        await connectDB();
        const { category, status, search, page = 1, limit = 10 } = req.query;
        
        // Build query object
        let query = {};
        
        // Filter by category
        if (category && category !== 'all') {
          query.category = category;
        }
        
        // Filter by status (inStock)
        if (status === 'in-stock') {
          query.inStock = true;
        } else if (status === 'out-of-stock') {
          query.inStock = false;
        }
        
        // Search functionality
        if (search) {
          query.$or = [
            { 'title.en': { $regex: search, $options: 'i' } },
            { 'title.ta': { $regex: search, $options: 'i' } },
            { 'author.en': { $regex: search, $options: 'i' } },
            { 'author.ta': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ta': { $regex: search, $options: 'i' } },
            { isbn: { $regex: search, $options: 'i' } },
            { publisher: { $regex: search, $options: 'i' } }
          ];
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query with pagination
        const books = await Book.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        // Get total count for pagination
        const total = await Book.countDocuments(query);
        
        res.status(200).json({
          success: true,
          data: books,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit))
        });
      } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch books',
          error: error.message 
        });
      }
      break;

    case 'POST':
      try {
        await connectDB();
        const bookData = req.body;
        
        // Basic validation
        if (!bookData.title || !bookData.title.en || !bookData.title.ta) {
          return res.status(400).json({ 
            success: false, 
            message: 'Title in both English and Tamil is required' 
          });
        }
        
        if (!bookData.author || !bookData.author.en || !bookData.author.ta) {
          return res.status(400).json({ 
            success: false, 
            message: 'Author in both English and Tamil is required' 
          });
        }
        
        if (!bookData.category) {
          return res.status(400).json({ 
            success: false, 
            message: 'Category is required' 
          });
        }
        
        if (!bookData.price || bookData.price < 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Valid price is required' 
          });
        }
        
        // Create new book using Mongoose model
        const newBook = new Book(bookData);
        const savedBook = await newBook.save();
        
        res.status(201).json({
          success: true,
          data: savedBook,
          message: 'Book created successfully'
        });
      } catch (error) {
        console.error('Error creating book:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: validationErrors
          });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
          return res.status(400).json({ 
            success: false, 
            message: 'Book with this ISBN already exists'
          });
        }
        
        res.status(500).json({ 
          success: false, 
          message: 'Failed to create book',
          error: error.message 
        });
      }
      break;

    case 'PUT':
      try {
        await connectDB();
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Book ID is required' 
          });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid book ID format' 
          });
        }
        
        // Find and update book
        const updatedBook = await Book.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        
        if (!updatedBook) {
          return res.status(404).json({ 
            success: false, 
            message: 'Book not found' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: updatedBook,
          message: 'Book updated successfully'
        });
      } catch (error) {
        console.error('Error updating book:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: validationErrors
          });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
          return res.status(400).json({ 
            success: false, 
            message: 'Book with this ISBN already exists'
          });
        }
        
        res.status(500).json({ 
          success: false, 
          message: 'Failed to update book',
          error: error.message 
        });
      }
      break;

    case 'DELETE':
      try {
        await connectDB();
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Book ID is required' 
          });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid book ID format' 
          });
        }
        
        // Find and delete book
        const deletedBook = await Book.findByIdAndDelete(id);
        
        if (!deletedBook) {
          return res.status(404).json({ 
            success: false, 
            message: 'Book not found' 
          });
        }
        
        res.status(200).json({
          success: true,
          data: deletedBook,
          message: 'Book deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to delete book',
          error: error.message 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Helper functions
export const getBookById = async (id) => {
  try {
    await connectDB();
    const book = await Book.findById(id).lean();
    return book;
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    return null;
  }
};

export const getBooksByCategory = async (category) => {
  try {
    await connectDB();
    const books = await Book.find({ category }).sort({ updatedAt: -1 }).lean();
    return books;
  } catch (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }
};