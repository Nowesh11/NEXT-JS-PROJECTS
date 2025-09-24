import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/mongodb';
import Slide from '../../../models/Slide';
import Slideshow from '../../../models/Slideshow';

export default async function handler(req, res) {
    await dbConnect();
    
    const { method } = req;
    
    switch (method) {
        case 'GET':
            return await getAdminSlides(req, res);
        case 'POST':
            return await bulkSlideOperations(req, res);
        case 'DELETE':
            return await bulkDeleteSlides(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
}

// Get slides with admin features
async function getAdminSlides(req, res) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const {
            slideshow,
            isActive,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            includeStats = 'false'
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
        
        if (search) {
            query.$or = [
                { 'title.en': { $regex: search, $options: 'i' } },
                { 'title.ta': { $regex: search, $options: 'i' } },
                { 'content.en': { $regex: search, $options: 'i' } },
                { 'content.ta': { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sort = {};
        if (sortBy === 'slideshow') {
            sort['slideshow'] = sortOrder === 'desc' ? -1 : 1;
            sort['order'] = 1; // Secondary sort by order
        } else if (sortBy === 'order') {
            sort['slideshow'] = 1; // Group by slideshow first
            sort['order'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }
        
        const [slides, total] = await Promise.all([
            Slide.find(query)
                .populate('slideshow', 'name pages isActive')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Slide.countDocuments(query)
        ]);
        
        const pages = Math.ceil(total / parseInt(limit));
        
        let stats = null;
        if (includeStats === 'true') {
            stats = await getSlideStats();
        }
        
        res.status(200).json({
            success: true,
            data: slides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
            },
            stats
        });
    } catch (error) {
        console.error('Error fetching admin slides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slides'
        });
    }
}

// Bulk operations on slides
async function bulkSlideOperations(req, res) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const { action, slideIds, data } = req.body;
        
        if (!action || !slideIds || !Array.isArray(slideIds) || slideIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Action and slide IDs are required'
            });
        }
        
        // Validate slide IDs
        const invalidIds = slideIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid slide IDs provided'
            });
        }
        
        let result;
        let message;
        
        switch (action) {
            case 'activate':
                result = await Slide.updateMany(
                    { _id: { $in: slideIds } },
                    { isActive: true }
                );
                message = `${result.modifiedCount} slides activated`;
                break;
                
            case 'deactivate':
                result = await Slide.updateMany(
                    { _id: { $in: slideIds } },
                    { isActive: false }
                );
                message = `${result.modifiedCount} slides deactivated`;
                break;
                
            case 'move-to-slideshow':
                if (!data?.slideshowId || !data.slideshowId.match(/^[0-9a-fA-F]{24}$/)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Valid target slideshow ID is required'
                    });
                }
                
                // Verify target slideshow exists
                const targetSlideshow = await Slideshow.findById(data.slideshowId);
                if (!targetSlideshow) {
                    return res.status(404).json({
                        success: false,
                        error: 'Target slideshow not found'
                    });
                }
                
                // Get max order in target slideshow
                const maxOrderSlide = await Slide.findOne(
                    { slideshow: data.slideshowId },
                    { order: 1 }
                ).sort({ order: -1 });
                
                let nextOrder = maxOrderSlide ? maxOrderSlide.order + 1 : 1;
                
                // Update slides with new slideshow and orders
                const slides = await Slide.find({ _id: { $in: slideIds } });
                for (const slide of slides) {
                    await Slide.findByIdAndUpdate(slide._id, {
                        slideshow: data.slideshowId,
                        order: nextOrder++
                    });
                }
                
                message = `${slides.length} slides moved to ${targetSlideshow.name}`;
                break;
                
            case 'update-animation':
                if (!data?.animation) {
                    return res.status(400).json({
                        success: false,
                        error: 'Animation type is required'
                    });
                }
                
                result = await Slide.updateMany(
                    { _id: { $in: slideIds } },
                    { animation: data.animation }
                );
                message = `${result.modifiedCount} slides updated with ${data.animation} animation`;
                break;
                
            case 'update-duration':
                if (!data?.duration || data.duration < 1000 || data.duration > 30000) {
                    return res.status(400).json({
                        success: false,
                        error: 'Duration must be between 1000ms and 30000ms'
                    });
                }
                
                result = await Slide.updateMany(
                    { _id: { $in: slideIds } },
                    { duration: data.duration }
                );
                message = `${result.modifiedCount} slides updated with ${data.duration}ms duration`;
                break;
                
            case 'duplicate':
                const originalSlides = await Slide.find({ _id: { $in: slideIds } });
                const duplicatedSlides = [];
                
                for (const slide of originalSlides) {
                    // Get max order in the slideshow
                    const maxOrder = await Slide.findOne(
                        { slideshow: slide.slideshow },
                        { order: 1 }
                    ).sort({ order: -1 });
                    
                    const duplicatedSlide = new Slide({
                        title: {
                            en: slide.title.en ? `${slide.title.en} (Copy)` : '',
                            ta: slide.title.ta ? `${slide.title.ta} (நகல்)` : ''
                        },
                        content: slide.content,
                        imageUrl: slide.imageUrl,
                        buttonText: slide.buttonText,
                        buttonLink: slide.buttonLink,
                        slideshow: slide.slideshow,
                        isActive: false, // Duplicates start as inactive
                        order: maxOrder ? maxOrder.order + 1 : 1,
                        backgroundColor: slide.backgroundColor,
                        textColor: slide.textColor,
                        animation: slide.animation,
                        duration: slide.duration
                    });
                    
                    await duplicatedSlide.save();
                    duplicatedSlides.push(duplicatedSlide);
                }
                
                message = `${duplicatedSlides.length} slides duplicated`;
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }
        
        res.status(200).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error performing bulk slide operations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk operations'
        });
    }
}

// Bulk delete slides
async function bulkDeleteSlides(req, res) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const { slideIds } = req.body;
        
        if (!slideIds || !Array.isArray(slideIds) || slideIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Slide IDs are required'
            });
        }
        
        // Validate slide IDs
        const invalidIds = slideIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid slide IDs provided'
            });
        }
        
        // Get slides to be deleted (for reordering)
        const slidesToDelete = await Slide.find({ _id: { $in: slideIds } });
        
        // Group by slideshow for reordering
        const slideshowGroups = {};
        slidesToDelete.forEach(slide => {
            const slideshowId = slide.slideshow.toString();
            if (!slideshowGroups[slideshowId]) {
                slideshowGroups[slideshowId] = [];
            }
            slideshowGroups[slideshowId].push(slide.order);
        });
        
        // Delete slides
        const result = await Slide.deleteMany({ _id: { $in: slideIds } });
        
        // Reorder remaining slides in each affected slideshow
        for (const [slideshowId, deletedOrders] of Object.entries(slideshowGroups)) {
            for (const deletedOrder of deletedOrders.sort((a, b) => a - b)) {
                await Slide.updateMany(
                    {
                        slideshow: slideshowId,
                        order: { $gt: deletedOrder }
                    },
                    { $inc: { order: -1 } }
                );
            }
        }
        
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} slides deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting slides:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete slides'
        });
    }
}

// Helper function to get slide statistics
async function getSlideStats() {
    try {
        const [totalSlides, activeSlides, slideshowStats, animationStats] = await Promise.all([
            Slide.countDocuments(),
            Slide.countDocuments({ isActive: true }),
            Slide.aggregate([
                {
                    $group: {
                        _id: '$slideshow',
                        count: { $sum: 1 },
                        activeCount: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'slideshows',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'slideshow'
                    }
                },
                {
                    $unwind: '$slideshow'
                },
                {
                    $project: {
                        name: '$slideshow.name',
                        totalSlides: '$count',
                        activeSlides: '$activeCount',
                        inactiveSlides: { $subtract: ['$count', '$activeCount'] }
                    }
                },
                { $sort: { totalSlides: -1 } },
                { $limit: 10 }
            ]),
            Slide.aggregate([
                {
                    $group: {
                        _id: '$animation',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);
        
        return {
            total: totalSlides,
            active: activeSlides,
            inactive: totalSlides - activeSlides,
            slideshowBreakdown: slideshowStats,
            animationBreakdown: animationStats
        };
    } catch (error) {
        console.error('Error getting slide stats:', error);
        return null;
    }
}