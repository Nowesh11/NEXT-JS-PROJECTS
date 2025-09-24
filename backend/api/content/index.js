import dbConnect from '../../../lib/dbConnect';
import WebsiteContent from '../../../models/WebsiteContent';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to ensure upload directory exists
const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Helper function to handle file uploads
const handleFileUpload = async (req, page, section, contentId) => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', page, section, contentId || 'temp');
    ensureUploadDir(uploadDir);

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const uploadedFiles = [];
      const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
      
      fileArray.forEach(file => {
        if (file) {
          const relativePath = `uploads/${page}/${section}/${contentId || 'temp'}/${file.newFilename}`;
          uploadedFiles.push(relativePath);
        }
      });

      resolve({ fields, uploadedFiles });
    });
  });
};

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Build query object
        let queryObj = {};

        // Filter by page
        if (req.query.page) {
          queryObj.page = req.query.page;
        }

        // Filter by section
        if (req.query.section) {
          queryObj.section = req.query.section;
        }

        // Check if user is authenticated as admin
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;
        
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('../../../models/User');
            const user = await User.findById(decoded.id);
            isAdmin = user && user.role === 'admin';
          } catch (error) {
            // Token invalid, continue as public user
          }
        }
        
        // Filter by active status
        if (req.query.active !== undefined) {
          queryObj.isActive = req.query.active === "true";
        } else if (!isAdmin) {
          // Default to active content for public access only
          queryObj.isActive = true;
        }

        // Filter by visible status
        if (req.query.visible !== undefined) {
          queryObj.isVisible = req.query.visible === "true";
        } else if (!isAdmin) {
          // Default to visible content for public access only
          queryObj.isVisible = true;
        }

        // Filter by published content
        if (!isAdmin) {
          const now = new Date();
          queryObj.$and = [
            {
              $or: [
                { publishedAt: { $lte: now } },
                { publishedAt: null }
              ]
            },
            {
              $or: [
                { expiresAt: { $gt: now } },
                { expiresAt: null }
              ]
            }
          ];
        }

        // Create query with filters
        let query = WebsiteContent.find(queryObj);

        // Sort by position and creation date
        query = query.sort("position createdAt");

        // Populate references
        query = query.populate("createdBy", "name email")
                     .populate("updatedBy", "name email")
                     .populate("approvedBy", "name email");

        const content = await query;

        // Language filtering
        let processedContent = content;
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          processedContent = content.map(item => {
            const contentObj = item.toObject();
            
            // Transform bilingual fields to single language
            if (contentObj.title && typeof contentObj.title === 'object') {
              contentObj.title = contentObj.title[req.query.lang] || contentObj.title.en;
            }
            if (contentObj.content && typeof contentObj.content === 'object') {
              contentObj.content = contentObj.content[req.query.lang] || contentObj.content.en;
            }
            if (contentObj.description && typeof contentObj.description === 'object') {
              contentObj.description = contentObj.description[req.query.lang] || contentObj.description.en;
            }
            if (contentObj.subtitle && typeof contentObj.subtitle === 'object') {
              contentObj.subtitle = contentObj.subtitle[req.query.lang] || contentObj.subtitle.en;
            }
            if (contentObj.buttonText && typeof contentObj.buttonText === 'object') {
              contentObj.buttonText = contentObj.buttonText[req.query.lang] || contentObj.buttonText.en;
            }
            
            return contentObj;
          });
        }

        res.status(200).json({
          success: true,
          count: processedContent.length,
          data: processedContent
        });
      } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
      break;

    case 'POST':
      try {
        // Check authentication and authorization
        const session = await getServerSession(req, res, authOptions);
        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            error: 'Access denied. Admin role required.'
          });
        }

        let contentData;
        let uploadedFiles = [];

        // Check if request contains files
        const contentType = req.headers['content-type'];
        if (contentType && contentType.includes('multipart/form-data')) {
          // Handle file upload
          const tempId = Date.now().toString();
          const { fields, uploadedFiles: files } = await handleFileUpload(req, 'temp', 'temp', tempId);
          
          contentData = JSON.parse(fields.data[0]);
          uploadedFiles = files;
        } else {
          // Handle JSON data
          const body = await new Promise((resolve) => {
            let data = '';
            req.on('data', chunk => {
              data += chunk;
            });
            req.on('end', () => {
              resolve(data);
            });
          });
          contentData = JSON.parse(body);
        }

        // Validate required fields
        if (!contentData.page || !contentData.section || !contentData.title) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: page, section, title' 
          });
        }

        // Ensure required fields are present
        if (!contentData.page) {
          return res.status(400).json({
            success: false,
            error: "Page is required"
          });
        }

        if (!contentData.section) {
          return res.status(400).json({
            success: false,
            error: "Section is required"
          });
        }

        if (!contentData.sectionKey) {
          return res.status(400).json({
            success: false,
            error: "Section key is required"
          });
        }

        // Check for duplicate section key within the same page
        const existingContent = await WebsiteContent.findOne({
          page: contentData.page,
          sectionKey: contentData.sectionKey
        });

        if (existingContent) {
          return res.status(400).json({
            success: false,
            error: "Section key already exists for this page"
          });
        }

        // Set default values
        if (contentData.publishedAt === undefined) {
          contentData.publishedAt = new Date();
        }

        // Create new content
        const newContent = new WebsiteContent({
          ...contentData,
          images: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({ url: file, alt: { en: '', ta: '' } })) : (contentData.images || []),
          createdBy: session.user.id
        });

        await newContent.save();

        // Move uploaded files to correct directory if needed
        if (uploadedFiles.length > 0) {
          const correctDir = path.join(process.cwd(), 'public', 'uploads', newContent.page, newContent.section, newContent._id.toString());
          ensureUploadDir(correctDir);
          
          const updatedImages = [];
          for (const filePath of uploadedFiles) {
            const oldPath = path.join(process.cwd(), 'public', filePath);
            const fileName = path.basename(filePath);
            const newPath = path.join(correctDir, fileName);
            const newRelativePath = `uploads/${newContent.page}/${newContent.section}/${newContent._id}/${fileName}`;
            
            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath);
              updatedImages.push({ url: newRelativePath, alt: { en: '', ta: '' } });
            }
          }
          
          newContent.images = updatedImages;
          await newContent.save();
        }

        // Populate the created content
        await newContent.populate("createdBy", "name email");

        res.status(201).json({
          success: true,
          data: newContent
        });
      } catch (error) {
        console.error('Error creating content:', error);
        
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

    case 'PUT':
      try {
        // Check authentication and authorization
        const session = await getServerSession(req, res, authOptions);
        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            error: 'Access denied. Admin role required.'
          });
        }

        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Content ID is required for update'
          });
        }

        let contentData;
        let uploadedFiles = [];

        // Check if request contains files
        const contentType = req.headers['content-type'];
        if (contentType && contentType.includes('multipart/form-data')) {
          // Handle file upload
          const { fields, uploadedFiles: files } = await handleFileUpload(req, 'temp', 'temp', id);
          
          contentData = JSON.parse(fields.data[0]);
          uploadedFiles = files;
        } else {
          // Handle JSON data
          const body = await new Promise((resolve) => {
            let data = '';
            req.on('data', chunk => {
              data += chunk;
            });
            req.on('end', () => {
              resolve(data);
            });
          });
          contentData = JSON.parse(body);
        }

        // Find existing content
        const existingContent = await WebsiteContent.findById(id);
        if (!existingContent) {
          return res.status(404).json({
            success: false,
            error: 'Content not found'
          });
        }

        // Handle file uploads if any
        if (uploadedFiles.length > 0) {
          const correctDir = path.join(process.cwd(), 'public', 'uploads', contentData.page || existingContent.page, contentData.section || existingContent.section, id);
          ensureUploadDir(correctDir);
          
          const updatedImages = [...(existingContent.images || [])];
          for (const filePath of uploadedFiles) {
            const oldPath = path.join(process.cwd(), 'public', filePath);
            const fileName = path.basename(filePath);
            const newPath = path.join(correctDir, fileName);
            const newRelativePath = `uploads/${contentData.page || existingContent.page}/${contentData.section || existingContent.section}/${id}/${fileName}`;
            
            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath);
              updatedImages.push({ url: newRelativePath, alt: { en: '', ta: '' } });
            }
          }
          
          contentData.images = updatedImages;
        }

        // Update content
        contentData.updatedBy = session.user.id;
        const updatedContent = await WebsiteContent.findByIdAndUpdate(id, contentData, { new: true })
          .populate("createdBy", "name email")
          .populate("updatedBy", "name email")
          .populate("approvedBy", "name email");

        res.status(200).json({
          success: true,
          data: updatedContent
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
        
        res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
      break;

    case 'DELETE':
      try {
        // Check authentication and authorization
        const session = await getServerSession(req, res, authOptions);
        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            error: 'Access denied. Admin role required.'
          });
        }

        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Content ID is required for deletion'
          });
        }

        // Find existing content
        const content = await WebsiteContent.findById(id);
        if (!content) {
          return res.status(404).json({
            success: false,
            error: 'Content not found'
          });
        }

        // Delete associated files
        if (content.images && content.images.length > 0) {
          for (const image of content.images) {
            const imagePath = typeof image === 'string' ? image : image.url;
            const fullPath = path.join(process.cwd(), 'public', imagePath);
            try {
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            } catch (err) {
              console.warn('Failed to delete file:', fullPath, err.message);
            }
          }
        }

        // Delete the content
        await WebsiteContent.findByIdAndDelete(id);

        res.status(200).json({
          success: true,
          message: 'Content deleted successfully'
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