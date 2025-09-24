import dbConnect from '../../../lib/dbConnect';
import Book from '../../../models/Book';
import { requireAuth } from '../../../lib/auth';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads/books');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Legacy mock data for reference
let booksData = [
  {
    id: 1,
    title: {
      en: "Tamil Literature Classics",
      ta: "தமிழ் இலக்கிய சிறப்பு நூல்கள்"
    },
    author: {
      en: "Dr. Tamil Scholar",
      ta: "டாக்டர் தமிழ் அறிஞர்"
    },
    description: {
      en: "A comprehensive collection of classical Tamil literature works",
      ta: "பாரம்பரிய தமிழ் இலக்கிய படைப்புகளின் விரிவான தொகுப்பு"
    },
    price: 299,
    originalPrice: 399,
    category: "literature",
    image: "/images/books/tamil-classics.jpg",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
    isbn: "978-81-123-4567-8",
    pages: 450,
    language: "Tamil",
    publisher: "TLS Publications",
    publishedDate: "2023-01-15",
    tags: ["classics", "literature", "tamil"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: {
      en: "Modern Tamil Poetry",
      ta: "நவீன தமிழ் கவிதைகள்"
    },
    author: {
      en: "Contemporary Poets Collective",
      ta: "சமகால கவிஞர்கள் குழு"
    },
    description: {
      en: "A collection of contemporary Tamil poetry from modern poets",
      ta: "நவீன கவிஞர்களின் சமகால தமிழ் கவிதைகளின் தொகுப்பு"
    },
    price: 199,
    originalPrice: 249,
    category: "poetry",
    image: "/images/books/modern-poetry.jpg",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    featured: false,
    isbn: "978-81-123-4567-9",
    pages: 280,
    language: "Tamil",
    publisher: "TLS Publications",
    publishedDate: "2023-03-20",
    tags: ["poetry", "modern", "tamil"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: {
      en: "Tamil Grammar Simplified",
      ta: "எளிய தமிழ் இலக்கணம்"
    },
    author: {
      en: "Prof. Grammar Expert",
      ta: "பேராசிரியர் இலக்கண வல்லுநர்"
    },
    description: {
      en: "Learn Tamil grammar with easy-to-understand explanations",
      ta: "எளிதாக புரிந்துகொள்ளக்கூடிய விளக்கங்களுடன் தமிழ் இலக்கணம் கற்றுக்கொள்ளுங்கள்"
    },
    price: 149,
    originalPrice: 199,
    category: "education",
    image: "/images/books/grammar.jpg",
    rating: 4.7,
    reviews: 234,
    inStock: true,
    featured: true,
    isbn: "978-81-123-4567-0",
    pages: 320,
    language: "Tamil",
    publisher: "TLS Publications",
    publishedDate: "2023-02-10",
    tags: ["grammar", "education", "learning"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;

  // Validate ObjectId
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid book ID'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const book = await Book.findById(id).populate('reviews.user', 'name email');
        
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        res.status(200).json({
          success: true,
          data: book
        });
      } catch (error) {
        console.error('Book fetch error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching book',
          error: error.message
        });
      }
      break;

    case 'PUT':
      try {
        const authResult = await requireAuth(req, ['admin', 'super_admin']);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        const form = formidable({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          multiples: true
        });

        const [fields, files] = await form.parse(req);

        const book = await Book.findById(id);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        // Process form data
        const updateData = {};

        if (fields.titleEn?.[0] || fields.titleTa?.[0]) {
          updateData.title = {
            en: fields.titleEn?.[0] || book.title.en,
            ta: fields.titleTa?.[0] || book.title.ta
          };
        }

        if (fields.authorEn?.[0] || fields.authorTa?.[0]) {
          updateData.author = {
            en: fields.authorEn?.[0] || book.author.en,
            ta: fields.authorTa?.[0] || book.author.ta
          };
        }

        if (fields.descriptionEn?.[0] || fields.descriptionTa?.[0]) {
          updateData.description = {
            en: fields.descriptionEn?.[0] || book.description.en,
            ta: fields.descriptionTa?.[0] || book.description.ta
          };
        }

        if (fields.publisherEn?.[0] || fields.publisherTa?.[0]) {
          updateData.publisher = {
            en: fields.publisherEn?.[0] || book.publisher?.en || '',
            ta: fields.publisherTa?.[0] || book.publisher?.ta || ''
          };
        }

        // Update other fields
        const simpleFields = [
          'category', 'price', 'originalPrice', 'stock', 'isbn', 
          'pages', 'language', 'featured', 'bestseller', 'newArrival', 'discount', 'status'
        ];

        simpleFields.forEach(field => {
          if (fields[field]?.[0] !== undefined) {
            if (['price', 'originalPrice', 'discount'].includes(field)) {
              updateData[field] = parseFloat(fields[field][0]);
            } else if (['stock', 'pages'].includes(field)) {
              updateData[field] = parseInt(fields[field][0]);
            } else if (['featured', 'bestseller', 'newArrival'].includes(field)) {
              updateData[field] = fields[field][0] === 'true';
            } else {
              updateData[field] = fields[field][0];
            }
          }
        });

        // Handle tags
        if (fields.tags?.[0]) {
          updateData.tags = fields.tags[0].split(',').map(tag => tag.trim());
        }

        // Handle file uploads
        if (files.coverImage) {
          // Delete old cover image if it exists and is not default
          if (book.coverImage && !book.coverImage.includes('default-book-cover')) {
            const oldImagePath = path.join(process.cwd(), 'public', book.coverImage);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          const file = Array.isArray(files.coverImage) ? files.coverImage[0] : files.coverImage;
          const filename = `cover-${Date.now()}-${file.originalFilename}`;
          const newPath = path.join(uploadDir, filename);
          fs.renameSync(file.filepath, newPath);
          updateData.coverImage = `/uploads/books/${filename}`;
        }

        if (files.images) {
          // Delete old images
          if (book.images && book.images.length > 0) {
            book.images.forEach(imagePath => {
              const oldImagePath = path.join(process.cwd(), 'public', imagePath);
              if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
              }
            });
          }

          const images = [];
          const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
          for (const file of imageFiles) {
            const filename = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalFilename}`;
            const newPath = path.join(uploadDir, filename);
            fs.renameSync(file.filepath, newPath);
            images.push(`/uploads/books/${filename}`);
          }
          updateData.images = images;
        }

        const updatedBook = await Book.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );

        res.status(200).json({
          success: true,
          message: 'Book updated successfully',
          data: updatedBook
        });
      } catch (error) {
        console.error('Book update error:', error);
        res.status(400).json({
          success: false,
          message: 'Error updating book',
          error: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const authResult = await requireAuth(req, ['admin', 'super_admin']);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        const book = await Book.findById(id);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found'
          });
        }

        // Delete associated images
        if (book.coverImage && !book.coverImage.includes('default-book-cover')) {
          const coverImagePath = path.join(process.cwd(), 'public', book.coverImage);
          if (fs.existsSync(coverImagePath)) {
            fs.unlinkSync(coverImagePath);
          }
        }

        if (book.images && book.images.length > 0) {
          book.images.forEach(imagePath => {
            const fullImagePath = path.join(process.cwd(), 'public', imagePath);
            if (fs.existsSync(fullImagePath)) {
              fs.unlinkSync(fullImagePath);
            }
          });
        }

        await Book.findByIdAndDelete(id);

        res.status(200).json({
          success: true,
          message: 'Book deleted successfully'
        });
      } catch (error) {
        console.error('Book deletion error:', error);
        res.status(500).json({
          success: false,
          message: 'Error deleting book',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}