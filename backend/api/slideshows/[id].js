import { getServerSession } from 'next-auth/next';
import dbConnect from '../../lib/mongodb';
import Slideshow from '../../models/Slideshow';
import Slide from '../../models/Slide';

export default async function handler(req, res) {
    await dbConnect();
    
    const { method } = req;
    const { id } = req.query;
    
    // Validate slideshow ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid slideshow ID'
        });
    }
    
    switch (method) {
        case 'GET':
            return await getSlideshow(req, res, id);
        case 'PUT':
            return await updateSlideshow(req, res, id);
        case 'DELETE':
            return await deleteSlideshow(req, res, id);
        case 'PATCH':
            return await patchSlideshow(req, res, id);
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
            return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
}

// Get single slideshow with slides
async function getSlideshow(req, res, id) {
    try {
        const { includeSlides = 'true' } = req.query;
        
        const slideshow = await Slideshow.findById(id)
            .populate('author', 'name email')
            .lean();
        
        if (!slideshow) {
            return res.status(404).json({
                success: false,
                error: 'Slideshow not found'
            });
        }
        
        let slides = [];
        if (includeSlides === 'true') {
            slides = await Slide.find({ slideshow: id })
                .sort({ order: 1 })
                .lean();
        }
        
        // Increment views for public access
        if (!req.query.admin) {
            await Slideshow.findByIdAndUpdate(id, { $inc: { views: 1 } });
        }
        
        res.status(200).json({
            success: true,
            data: {
                ...slideshow,
                slides
            }
        });
    } catch (error) {
        console.error('Error fetching slideshow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slideshow'
        });
    }
}

// Update slideshow
async function updateSlideshow(req, res, id) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const slideshow = await Slideshow.findById(id);
        
        if (!slideshow) {
            return res.status(404).json({
                success: false,
                error: 'Slideshow not found'
            });
        }
        
        const {
            name,
            description,
            pages,
            isActive,
            autoPlay,
            interval,
            showControls,
            showIndicators
        } = req.body;
        
        // Validation
        if (name !== undefined) {
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Slideshow name is required'
                });
            }
            
            // Check for duplicate name (excluding current slideshow)
            const existingSlideshow = await Slideshow.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });
            
            if (existingSlideshow) {
                return res.status(400).json({
                    success: false,
                    error: 'A slideshow with this name already exists'
                });
            }
            
            slideshow.name = name.trim();
        }
        
        if (description !== undefined) {
            slideshow.description = description?.trim() || '';
        }
        
        if (pages !== undefined) {
            if (!Array.isArray(pages) || pages.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one page must be specified'
                });
            }
            slideshow.pages = pages;
        }
        
        if (isActive !== undefined) {
            slideshow.isActive = Boolean(isActive);
        }
        
        if (autoPlay !== undefined) {
            slideshow.autoPlay = Boolean(autoPlay);
        }
        
        if (interval !== undefined) {
            if (interval < 1000 || interval > 30000) {
                return res.status(400).json({
                    success: false,
                    error: 'Interval must be between 1000ms and 30000ms'
                });
            }
            slideshow.interval = interval;
        }
        
        if (showControls !== undefined) {
            slideshow.showControls = Boolean(showControls);
        }
        
        if (showIndicators !== undefined) {
            slideshow.showIndicators = Boolean(showIndicators);
        }
        
        await slideshow.save();
        
        // Populate author info for response
        await slideshow.populate('author', 'name email');
        
        res.status(200).json({
            success: true,
            data: slideshow,
            message: 'Slideshow updated successfully'
        });
    } catch (error) {
        console.error('Error updating slideshow:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to update slideshow'
        });
    }
}

// Delete slideshow
async function deleteSlideshow(req, res, id) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const slideshow = await Slideshow.findById(id);
        
        if (!slideshow) {
            return res.status(404).json({
                success: false,
                error: 'Slideshow not found'
            });
        }
        
        // Delete all associated slides first
        await Slide.deleteMany({ slideshow: id });
        
        // Delete the slideshow
        await Slideshow.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Slideshow and associated slides deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting slideshow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete slideshow'
        });
    }
}

// Patch slideshow (for quick actions)
async function patchSlideshow(req, res, id) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const slideshow = await Slideshow.findById(id);
        
        if (!slideshow) {
            return res.status(404).json({
                success: false,
                error: 'Slideshow not found'
            });
        }
        
        const { action } = req.body;
        
        switch (action) {
            case 'toggle_active':
                slideshow.isActive = !slideshow.isActive;
                break;
            case 'toggle_autoplay':
                slideshow.autoPlay = !slideshow.autoPlay;
                break;
            case 'increment_views':
                slideshow.views += 1;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }
        
        await slideshow.save();
        
        res.status(200).json({
            success: true,
            data: slideshow,
            message: `Slideshow ${action.replace('_', ' ')} successfully`
        });
    } catch (error) {
        console.error('Error patching slideshow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update slideshow'
        });
    }
}