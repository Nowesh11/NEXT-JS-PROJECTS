import Ebook from '../../models/Ebook';
import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 10,
          category,
          status = 'active',
          search,
          featured,
          newArrival,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Filter by status
        if (status) {
          query.status = status;
        }
        
        // Filter by category
        if (category) {
          query.category = category;
        }
        
        // Filter by flags
        if (featured === 'true') query.featured = true;
        if (newArrival === 'true') query.newArrival = true;
        
        // Search functionality
        if (search) {
          query.$text = { $search: search };
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [ebooks, total] = await Promise.all([
          Ebook.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Ebook.countDocuments(query)
        ]);
        
        res.status(200).json({
          success: true,
          data: ebooks,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching ebooks:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch ebooks'
        });
      }
      break;

    case 'POST':
      try {
        const ebookData = req.body;
        
        // Validate required fields
        if (!ebookData.title?.en || !ebookData.title?.ta) {
          return res.status(400).json({
            success: false,
            error: 'Title in both English and Tamil is required'
          });
        }
        
        if (!ebookData.author?.en || !ebookData.author?.ta) {
          return res.status(400).json({
            success: false,
            error: 'Author in both English and Tamil is required'
          });
        }
        
        if (!ebookData.description?.en || !ebookData.description?.ta) {
          return res.status(400).json({
            success: false,
            error: 'Description in both English and Tamil is required'
          });
        }
        
        if (!ebookData.fileUrl) {
          return res.status(400).json({
            success: false,
            error: 'PDF file URL is required'
          });
        }
        
        const ebook = new Ebook(ebookData);
        await ebook.save();
        
        res.status(201).json({
          success: true,
          data: ebook,
          message: 'Ebook created successfully'
        });
      } catch (error) {
        console.error('Error creating ebook:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            error: 'Ebook with this ISBN already exists'
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create ebook'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
      break;
  }
}