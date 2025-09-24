import dbConnect from '../../../lib/dbConnect';
import Ebook from '../../../models/Ebook';
import { requireAuth } from '../../../lib/auth';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public/uploads/ebooks');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

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
          bookLanguage,
          search,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          featured,
          isFree
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = { status: 'active' };

        if (category) {
          query.category = category;
        }

        if (bookLanguage) {
          query.bookLanguage = bookLanguage;
        }

        if (featured === 'true') {
          query.featured = true;
        }

        if (isFree === 'true') {
          query.isFree = true;
        } else if (isFree === 'false') {
          query.isFree = false;
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

        // Build sort object
        let sortObj = {};
        if (sortBy === 'ratings') {
          sortObj['ratings.average'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'downloadCount') {
          sortObj.downloadCount = sortOrder === 'desc' ? -1 : 1;
        } else {
          sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const [ebooks, totalEbooks] = await Promise.all([
          Ebook.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean(),
          Ebook.countDocuments(query)
        ]);

        res.status(200).json({
          success: true,
          ebooks,
          totalEbooks,
          currentPage: pageNum,
          totalPages: Math.ceil(totalEbooks / limitNum),
          hasNextPage: pageNum < Math.ceil(totalEbooks / limitNum),
          hasPrevPage: pageNum > 1
        });
      } catch (error) {
        console.error('Error fetching ebooks:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch ebooks',
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
          maxFileSize: 50 * 1024 * 1024, // 50MB
        });

        const [fields, files] = await form.parse(req);

        // Extract and validate required fields
        const ebookData = {
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
          bookLanguage: fields.bookLanguage?.[0] || 'Tamil',
          isbn: fields.isbn?.[0],
          pages: parseInt(fields.pages?.[0] || 0),
          publisher: {
            en: fields.publisherEn?.[0] || 'TLS Publications',
            ta: fields.publisherTa?.[0] || 'டி.எல்.எஸ் பதிப்பகம்'
          },
          publishedDate: fields.publishedDate?.[0] ? new Date(fields.publishedDate[0]) : new Date(),
          featured: fields.featured?.[0] === 'true',
          newArrival: fields.newArrival?.[0] === 'true',
          isFree: fields.isFree?.[0] === 'true',
          status: fields.status?.[0] || 'active',
          createdBy: authResult.user.id
        };

        // Handle cover image upload
        if (files.coverImage && files.coverImage[0]) {
          const file = files.coverImage[0];
          const fileName = `ebook-cover-${Date.now()}-${file.originalFilename}`;
          const newPath = path.join(uploadDir, fileName);
          
          fs.renameSync(file.filepath, newPath);
          ebookData.coverImage = `/uploads/ebooks/${fileName}`;
        }

        // Handle ebook file upload
        if (files.ebookFile && files.ebookFile[0]) {
          const file = files.ebookFile[0];
          const fileName = `ebook-${Date.now()}-${file.originalFilename}`;
          const newPath = path.join(uploadDir, fileName);
          
          fs.renameSync(file.filepath, newPath);
          ebookData.fileUrl = `/uploads/ebooks/${fileName}`;
          ebookData.fileSize = file.size;
          
          // Determine file format
          const ext = path.extname(file.originalFilename).toLowerCase();
          ebookData.fileFormat = ext === '.pdf' ? 'PDF' : ext === '.epub' ? 'EPUB' : 'TXT';
        }

        // Handle tags
        if (fields.tags?.[0]) {
          ebookData.tags = fields.tags[0].split(',').map(tag => tag.trim());
        }

        // Check for duplicate ISBN
        if (ebookData.isbn) {
          const existingEbook = await Ebook.findOne({ isbn: ebookData.isbn });
          if (existingEbook) {
            return res.status(400).json({
              success: false,
              message: 'An ebook with this ISBN already exists'
            });
          }
        }

        const ebook = new Ebook(ebookData);
        await ebook.save();

        res.status(201).json({
          success: true,
          message: 'Ebook created successfully',
          ebook
        });
      } catch (error) {
        console.error('Error creating ebook:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create ebook',
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