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

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 12,
          category,
          search,
          featured,
          bestseller,
          newArrival,
          minPrice,
          maxPrice,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          status = 'active',
          inStock
        } = req.query;

        const query = {};
        const sort = {};

        // Build query filters
        if (status) {
          query.status = status;
        }

        if (inStock === 'true') {
          query.inStock = true;
        }

        if (category && category !== 'all') {
          query.category = category;
        }

        if (search) {
          query.$or = [
            { 'title.en': { $regex: search, $options: 'i' } },
            { 'title.ta': { $regex: search, $options: 'i' } },
            { 'author.en': { $regex: search, $options: 'i' } },
            { 'author.ta': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ta': { $regex: search, $options: 'i' } }
          ];
        }

        if (featured === 'true') {
          query.featured = true;
        }

        if (bestseller === 'true') {
          query.bestseller = true;
        }

        if (newArrival === 'true') {
          query.newRelease = true;
        }

        if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = parseFloat(minPrice);
          if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Build sort object
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [books, totalBooks] = await Promise.all([
          Book.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(),
          Book.countDocuments(query)
        ]);

        res.status(200).json({
          success: true,
          books,
          totalBooks,
          currentPage: pageNum,
          totalPages: Math.ceil(totalBooks / limitNum),
          hasNextPage: pageNum < Math.ceil(totalBooks / limitNum),
          hasPrevPage: pageNum > 1
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
        const authResult = await requireAuth(req, res, ['admin']);
        if (!authResult.success) {
          return res.status(401).json(authResult);
        }

        const form = formidable({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        const [fields, files] = await form.parse(req);

        // Extract and validate required fields
        const bookData = {
          title: {
            en: fields.titleEn?.[0] || '',
            ta: fields.titleTa?.[0] || ''
          },
          author: {
            en: fields.authorEn?.[0] || '',
            ta: fields.authorTa?.[0] || ''
          },
          description: {
            en: fields.descriptionEn?.[0] || '',
            ta: fields.descriptionTa?.[0] || ''
          },
          category: fields.category?.[0],
          price: parseFloat(fields.price?.[0] || 0),
          originalPrice: parseFloat(fields.originalPrice?.[0] || 0),
          stockQuantity: parseInt(fields.stockQuantity?.[0] || 0),
          isbn: fields.isbn?.[0],
          pages: parseInt(fields.pages?.[0] || 0),
          language: fields.language?.[0] || 'Tamil',
          publisher: fields.publisher?.[0] || 'TLS Publications',
          publishedDate: fields.publishedDate?.[0] ? new Date(fields.publishedDate[0]) : new Date(),
          featured: fields.featured?.[0] === 'true',
          bestseller: fields.bestseller?.[0] === 'true',
          newRelease: fields.newRelease?.[0] === 'true',
          status: fields.status?.[0] || 'active',
          inStock: parseInt(fields.stockQuantity?.[0] || 0) > 0,
          createdBy: authResult.user.id
        };

        // Handle cover image upload
        if (files.coverImage && files.coverImage[0]) {
          const file = files.coverImage[0];
          const fileName = `book-${Date.now()}-${file.originalFilename}`;
          const newPath = path.join(uploadDir, fileName);
          
          fs.renameSync(file.filepath, newPath);
          bookData.coverImage = `/uploads/books/${fileName}`;
        }

        // Validate required bilingual fields
        const validation = Book.validateBilingualFields(bookData);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          });
        }

        // Check for duplicate ISBN
        if (bookData.isbn) {
          const existingBook = await Book.findOne({ isbn: bookData.isbn });
          if (existingBook) {
            return res.status(400).json({
              success: false,
              message: 'A book with this ISBN already exists'
            });
          }
        }

        const book = new Book(bookData);
        await book.save();

        res.status(201).json({
          success: true,
          message: 'Book created successfully',
          book
        });
      } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create book',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}

// Mock book data for fallback (keeping for reference)
const mockBooks = [
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

// Keeping mock data for reference only
let nextId = 4;