import dbConnect from '../../../lib/dbConnect';
import WebsiteContent from '../../../models/WebsiteContent';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  const { id } = req.query;

  // Check authentication for all methods
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  let user;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../../../models/User');
    user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const content = await WebsiteContent.findById(id)
          .populate("createdBy", "name email")
          .populate("updatedBy", "name email")
          .populate("approvedBy", "name email");

        if (!content) {
          return res.status(404).json({
            success: false,
            error: `Content not found with id of ${id}`
          });
        }

        res.status(200).json({
          success: true,
          data: content
        });
      } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
      break;

    case 'PUT':
      try {
        // Add updatedBy field
        req.body.updatedBy = user._id;
        req.body.updatedAt = new Date();

        // If updating section key, check for duplicates
        if (req.body.sectionKey) {
          const existingContent = await WebsiteContent.findOne({
            _id: { $ne: id },
            page: req.body.page,
            sectionKey: req.body.sectionKey
          });

          if (existingContent) {
            return res.status(400).json({
              success: false,
              error: "Section key already exists for this page"
            });
          }
        }

        const content = await WebsiteContent.findByIdAndUpdate(
          id,
          req.body,
          {
            new: true,
            runValidators: true
          }
        ).populate("createdBy", "name email")
         .populate("updatedBy", "name email")
         .populate("approvedBy", "name email");

        if (!content) {
          return res.status(404).json({
            success: false,
            error: `Content not found with id of ${id}`
          });
        }

        res.status(200).json({
          success: true,
          data: content
        });
      } catch (error) {
        console.error('Error updating content:', error);
        
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({
            success: false,
            error: messages.join(', ')
          });
        }
        
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            error: 'Duplicate field value entered'
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
      break;

    case 'DELETE':
      try {
        const content = await WebsiteContent.findById(id);

        if (!content) {
          return res.status(404).json({
            success: false,
            error: `Content not found with id of ${id}`
          });
        }

        // Check if content is required (cannot be deleted)
        if (content.isRequired) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete required content'
          });
        }

        await WebsiteContent.findByIdAndDelete(id);

        res.status(200).json({
          success: true,
          data: {}
        });
      } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
      break;

    default:
      res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
      break;
  }
}