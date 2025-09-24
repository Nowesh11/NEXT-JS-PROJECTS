import { getServerSession } from 'next-auth/next';
import dbConnect from '../../lib/mongodb';
import Slideshow from '../../models/Slideshow';
import Slide from '../../models/Slide';

export default async function handler(req, res) {
    await dbConnect();
    
    const { method } = req;
    
    switch (method) {
        case 'GET':
            return await getSlideshows(req, res);
        case 'POST':
            return await createSlideshow(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
}

// Get slideshows with filtering and pagination
async function getSlideshows(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            pages: pageFilter,
            isActive,
            search
        } = req.query;
        
        const query = {};
        
        // Apply filters
        if (pageFilter && pageFilter !== 'all') {
            query.pages = { $in: [pageFilter] };
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [slideshows, total] = await Promise.all([
            Slideshow.find(query)
                .populate('author', 'name email')
                .populate({
                    path: 'slideCount',
                    match: { isActive: true }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Slideshow.countDocuments(query)
        ]);
        
        // Get slide counts for each slideshow
        const slideshowsWithCounts = await Promise.all(
            slideshows.map(async (slideshow) => {
                const slideCount = await Slide.countDocuments({
                    slideshow: slideshow._id,
                    isActive: true
                });
                
                return {
                    ...slideshow,
                    slideCount
                };
            })
        );
        
        const pages = Math.ceil(total / parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: slideshowsWithCounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
            }
        });
    } catch (error) {
        console.error('Error fetching slideshows:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slideshows'
        });
    }
}

// Create new slideshow
async function createSlideshow(req, res) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const {
            name,
            description,
            pages,
            isActive = true,
            autoPlay = true,
            interval = 5000,
            showControls = true,
            showIndicators = true
        } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Slideshow name is required'
            });
        }
        
        if (!pages || !Array.isArray(pages) || pages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one page must be specified'
            });
        }
        
        if (interval < 1000 || interval > 30000) {
            return res.status(400).json({
                success: false,
                error: 'Interval must be between 1000ms and 30000ms'
            });
        }
        
        // Check for duplicate slideshow name
        const existingSlideshow = await Slideshow.findOne({ name: name.trim() });
        if (existingSlideshow) {
            return res.status(400).json({
                success: false,
                error: 'A slideshow with this name already exists'
            });
        }
        
        const slideshow = new Slideshow({
            name: name.trim(),
            description: description?.trim() || '',
            pages,
            isActive,
            autoPlay,
            interval,
            showControls,
            showIndicators,
            author: session.user.id,
            views: 0
        });
        
        await slideshow.save();
        
        // Populate author info for response
        await slideshow.populate('author', 'name email');
        
        res.status(201).json({
            success: true,
            data: slideshow,
            message: 'Slideshow created successfully'
        });
    } catch (error) {
        console.error('Error creating slideshow:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to create slideshow'
        });
    }
}