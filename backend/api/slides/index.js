import { getServerSession } from 'next-auth/next';
import dbConnect from '../../lib/mongodb';
import Slide from '../../models/Slide';
import Slideshow from '../../models/Slideshow';

export default async function handler(req, res) {
    await dbConnect();
    
    const { method } = req;
    
    switch (method) {
        case 'GET':
            return await getSlides(req, res);
        case 'POST':
            return await createSlide(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
}

// Get slides with filtering
async function getSlides(req, res) {
    try {
        const {
            slideshow,
            isActive,
            page = 1,
            limit = 20
        } = req.query;
        
        const query = {};
        
        // Apply filters
        if (slideshow) {
            if (!slideshow.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid slideshow ID'
                });
            }
            query.slideshow = slideshow;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [slides, total] = await Promise.all([
            Slide.find(query)
                .populate('slideshow', 'name pages')
                .sort({ slideshow: 1, order: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Slide.countDocuments(query)
        ]);
        
        const pages = Math.ceil(total / parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: slides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
            }
        });
    } catch (error) {
        console.error('Error fetching slides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slides'
        });
    }
}

// Create new slide
async function createSlide(req, res) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const {
            title,
            content,
            imageUrl,
            buttonText,
            buttonLink,
            slideshow,
            isActive = true,
            order,
            backgroundColor = '#ffffff',
            textColor = '#000000',
            animation = 'fade',
            duration = 5000
        } = req.body;
        
        // Validation
        if (!title || (!title.en && !title.ta)) {
            return res.status(400).json({
                success: false,
                error: 'Title is required in at least one language'
            });
        }
        
        if (!slideshow || !slideshow.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Valid slideshow ID is required'
            });
        }
        
        // Verify slideshow exists
        const existingSlideshow = await Slideshow.findById(slideshow);
        if (!existingSlideshow) {
            return res.status(404).json({
                success: false,
                error: 'Slideshow not found'
            });
        }
        
        if (duration < 1000 || duration > 30000) {
            return res.status(400).json({
                success: false,
                error: 'Duration must be between 1000ms and 30000ms'
            });
        }
        
        // Determine order if not provided
        let slideOrder = order;
        if (!slideOrder) {
            const maxOrderSlide = await Slide.findOne(
                { slideshow },
                { order: 1 }
            ).sort({ order: -1 });
            slideOrder = maxOrderSlide ? maxOrderSlide.order + 1 : 1;
        }
        
        const slide = new Slide({
            title,
            content,
            imageUrl,
            buttonText,
            buttonLink,
            slideshow,
            isActive,
            order: slideOrder,
            backgroundColor,
            textColor,
            animation,
            duration
        });
        
        await slide.save();
        
        // Populate slideshow info for response
        await slide.populate('slideshow', 'name pages');
        
        res.status(201).json({
            success: true,
            data: slide,
            message: 'Slide created successfully'
        });
    } catch (error) {
        console.error('Error creating slide:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to create slide'
        });
    }
}