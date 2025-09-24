import Poster from '../../models/Poster';
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
          is_active,
          search,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Filter by active status
        if (is_active !== undefined) {
          query.is_active = is_active === 'true';
        }
        
        // Filter by category
        if (category) {
          query.category = category;
        }
        
        // Search functionality
        if (search) {
          query.$or = [
            { 'title.en': { $regex: search, $options: 'i' } },
            { 'title.ta': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ta': { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [posters, total] = await Promise.all([
          Poster.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Poster.countDocuments(query)
        ]);
        
        res.status(200).json({
          success: true,
          data: posters,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching posters:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch posters'
        });
      }
      break;

    case 'POST':
      try {
        const posterData = req.body;
        
        // Validate required fields
        if (!posterData.title?.en || !posterData.title?.ta) {
          return res.status(400).json({
            success: false,
            error: 'Title in both English and Tamil is required'
          });
        }
        
        if (!posterData.description?.en || !posterData.description?.ta) {
          return res.status(400).json({
            success: false,
            error: 'Description in both English and Tamil is required'
          });
        }
        
        if (!posterData.image) {
          return res.status(400).json({
            success: false,
            error: 'Image URL is required'
          });
        }
        
        if (!posterData.link_url) {
          return res.status(400).json({
            success: false,
            error: 'Link URL is required'
          });
        }
        
        const poster = new Poster(posterData);
        await poster.save();
        
        res.status(201).json({
          success: true,
          data: poster,
          message: 'Poster created successfully'
        });
      } catch (error) {
        console.error('Error creating poster:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create poster'
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