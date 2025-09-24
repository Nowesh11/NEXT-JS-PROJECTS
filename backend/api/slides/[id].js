import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/mongodb';
import Slide from '../../../models/Slide';
import Slideshow from '../../../models/Slideshow';

export default async function handler(req, res) {
    await dbConnect();
    
    const { method, query: { id } } = req;
    
    // Validate ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid slide ID'
        });
    }
    
    switch (method) {
        case 'GET':
            return await getSlide(req, res, id);
        case 'PUT':
            return await updateSlide(req, res, id);
        case 'DELETE':
            return await deleteSlide(req, res, id);
        case 'PATCH':
            return await patchSlide(req, res, id);
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
            return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
}

// Get single slide
async function getSlide(req, res, id) {
    try {
        const slide = await Slide.findById(id)
            .populate('slideshow', 'name pages isActive')
            .lean();
        
        if (!slide) {
            return res.status(404).json({
                success: false,
                error: 'Slide not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: slide
        });
    } catch (error) {
        console.error('Error fetching slide:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slide'
        });
    }
}

// Update slide
async function updateSlide(req, res, id) {
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
            isActive,
            order,
            backgroundColor,
            textColor,
            animation,
            duration
        } = req.body;
        
        // Find existing slide
        const existingSlide = await Slide.findById(id);
        if (!existingSlide) {
            return res.status(404).json({
                success: false,
                error: 'Slide not found'
            });
        }
        
        // Validation
        if (title && !title.en && !title.ta) {
            return res.status(400).json({
                success: false,
                error: 'Title must have content in at least one language'
            });
        }
        
        if (slideshow && !slideshow.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid slideshow ID'
            });
        }
        
        if (slideshow && slideshow !== existingSlide.slideshow.toString()) {
            // Verify new slideshow exists
            const newSlideshow = await Slideshow.findById(slideshow);
            if (!newSlideshow) {
                return res.status(404).json({
                    success: false,
                    error: 'Target slideshow not found'
                });
            }
        }
        
        if (duration && (duration < 1000 || duration > 30000)) {
            return res.status(400).json({
                success: false,
                error: 'Duration must be between 1000ms and 30000ms'
            });
        }
        
        // Handle order changes
        if (order !== undefined && order !== existingSlide.order) {
            const targetSlideshow = slideshow || existingSlide.slideshow;
            
            // Check if order is already taken
            const conflictSlide = await Slide.findOne({
                slideshow: targetSlideshow,
                order,
                _id: { $ne: id }
            });
            
            if (conflictSlide) {
                // Shift other slides to make room
                if (order > existingSlide.order) {
                    // Moving down - shift slides up
                    await Slide.updateMany(
                        {
                            slideshow: targetSlideshow,
                            order: { $gt: existingSlide.order, $lte: order },
                            _id: { $ne: id }
                        },
                        { $inc: { order: -1 } }
                    );
                } else {
                    // Moving up - shift slides down
                    await Slide.updateMany(
                        {
                            slideshow: targetSlideshow,
                            order: { $gte: order, $lt: existingSlide.order },
                            _id: { $ne: id }
                        },
                        { $inc: { order: 1 } }
                    );
                }
            }
        }
        
        // Update slide
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (buttonText !== undefined) updateData.buttonText = buttonText;
        if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
        if (slideshow !== undefined) updateData.slideshow = slideshow;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (order !== undefined) updateData.order = order;
        if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
        if (textColor !== undefined) updateData.textColor = textColor;
        if (animation !== undefined) updateData.animation = animation;
        if (duration !== undefined) updateData.duration = duration;
        
        const slide = await Slide.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('slideshow', 'name pages isActive');
        
        res.status(200).json({
            success: true,
            data: slide,
            message: 'Slide updated successfully'
        });
    } catch (error) {
        console.error('Error updating slide:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to update slide'
        });
    }
}

// Delete slide
async function deleteSlide(req, res, id) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const slide = await Slide.findById(id);
        if (!slide) {
            return res.status(404).json({
                success: false,
                error: 'Slide not found'
            });
        }
        
        const slideshowId = slide.slideshow;
        const slideOrder = slide.order;
        
        // Delete the slide
        await Slide.findByIdAndDelete(id);
        
        // Reorder remaining slides
        await Slide.updateMany(
            {
                slideshow: slideshowId,
                order: { $gt: slideOrder }
            },
            { $inc: { order: -1 } }
        );
        
        res.status(200).json({
            success: true,
            message: 'Slide deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting slide:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete slide'
        });
    }
}

// Patch slide (toggle status, reorder, etc.)
async function patchSlide(req, res, id) {
    try {
        const session = await getServerSession(req, res);
        
        if (!session || session.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Admin access required'
            });
        }
        
        const { action, value } = req.body;
        
        const slide = await Slide.findById(id);
        if (!slide) {
            return res.status(404).json({
                success: false,
                error: 'Slide not found'
            });
        }
        
        let updateData = {};
        let message = '';
        
        switch (action) {
            case 'toggle-active':
                updateData.isActive = !slide.isActive;
                message = `Slide ${updateData.isActive ? 'activated' : 'deactivated'} successfully`;
                break;
                
            case 'move-up':
                if (slide.order > 1) {
                    // Find slide with order - 1
                    const prevSlide = await Slide.findOne({
                        slideshow: slide.slideshow,
                        order: slide.order - 1
                    });
                    
                    if (prevSlide) {
                        // Swap orders
                        await Slide.findByIdAndUpdate(prevSlide._id, { order: slide.order });
                        updateData.order = slide.order - 1;
                        message = 'Slide moved up successfully';
                    } else {
                        return res.status(400).json({
                            success: false,
                            error: 'Cannot move slide up'
                        });
                    }
                } else {
                    return res.status(400).json({
                        success: false,
                        error: 'Slide is already at the top'
                    });
                }
                break;
                
            case 'move-down':
                // Find slide with order + 1
                const nextSlide = await Slide.findOne({
                    slideshow: slide.slideshow,
                    order: slide.order + 1
                });
                
                if (nextSlide) {
                    // Swap orders
                    await Slide.findByIdAndUpdate(nextSlide._id, { order: slide.order });
                    updateData.order = slide.order + 1;
                    message = 'Slide moved down successfully';
                } else {
                    return res.status(400).json({
                        success: false,
                        error: 'Slide is already at the bottom'
                    });
                }
                break;
                
            case 'set-order':
                if (!value || value < 1) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid order value'
                    });
                }
                
                const targetOrder = parseInt(value);
                if (targetOrder !== slide.order) {
                    // Handle reordering logic (similar to update function)
                    const conflictSlide = await Slide.findOne({
                        slideshow: slide.slideshow,
                        order: targetOrder,
                        _id: { $ne: id }
                    });
                    
                    if (conflictSlide) {
                        if (targetOrder > slide.order) {
                            await Slide.updateMany(
                                {
                                    slideshow: slide.slideshow,
                                    order: { $gt: slide.order, $lte: targetOrder },
                                    _id: { $ne: id }
                                },
                                { $inc: { order: -1 } }
                            );
                        } else {
                            await Slide.updateMany(
                                {
                                    slideshow: slide.slideshow,
                                    order: { $gte: targetOrder, $lt: slide.order },
                                    _id: { $ne: id }
                                },
                                { $inc: { order: 1 } }
                            );
                        }
                    }
                    
                    updateData.order = targetOrder;
                    message = 'Slide order updated successfully';
                }
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }
        
        const updatedSlide = await Slide.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('slideshow', 'name pages isActive');
        
        res.status(200).json({
            success: true,
            data: updatedSlide,
            message
        });
    } catch (error) {
        console.error('Error patching slide:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update slide'
        });
    }
}