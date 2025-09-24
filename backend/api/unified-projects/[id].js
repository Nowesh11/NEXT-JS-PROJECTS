import dbConnect from '../../../lib/dbConnect';
import UnifiedProject from '../../../models/UnifiedProject';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to ensure upload directory exists
const ensureUploadDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

// Helper function to handle file uploads
const handleFileUpload = async (req, projectId, projectType) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', `${projectType}s`, projectId);
  ensureUploadDir(uploadDir);

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name, ext, part) => {
      const timestamp = Date.now();
      const originalName = part.originalFilename || 'file';
      const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `${timestamp}_${cleanName}`;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Process uploaded files
      const processedFiles = {};
      Object.keys(files).forEach(fieldName => {
        const file = Array.isArray(files[fieldName]) ? files[fieldName][0] : files[fieldName];
        if (file && file.filepath) {
          const relativePath = path.relative(
            path.join(process.cwd(), 'public'),
            file.filepath
          ).replace(/\\/g, '/');
          processedFiles[fieldName] = `/${relativePath}`;
        }
      });

      // Process form fields
      const processedFields = {};
      Object.keys(fields).forEach(key => {
        const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
        try {
          // Try to parse JSON fields
          processedFields[key] = JSON.parse(value);
        } catch {
          processedFields[key] = value;
        }
      });

      resolve({ fields: processedFields, files: processedFiles });
    });
  });
};

// Helper function to delete files
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;

  // Validate ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

const handleGet = async (req, res, id) => {
  try {
    const project = await UnifiedProject.findById(id).lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment views count
    await UnifiedProject.findByIdAndUpdate(id, { $inc: { views_count: 1 } });

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

const handlePut = async (req, res, id) => {
  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Find existing project
    const existingProject = await UnifiedProject.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle file upload
    const { fields, files } = await handleFileUpload(req, id, existingProject.type);

    // Prepare update data
    const updateData = {};
    
    // Update fields if provided
    const allowedFields = [
      'title', 'bureau', 'description', 'director', 'director_name', 
      'director_email', 'director_phone', 'goals', 'status', 'progress',
      'priority', 'featured', 'tags', 'start_date', 'end_date', 
      'budget', 'participants_count'
    ];

    allowedFields.forEach(field => {
      if (fields[field] !== undefined) {
        if (field === 'progress') {
          updateData[field] = parseInt(fields[field]) || 0;
        } else if (field === 'budget') {
          updateData[field] = parseFloat(fields[field]) || 0;
        } else if (field === 'participants_count') {
          updateData[field] = parseInt(fields[field]) || 0;
        } else if (field === 'featured') {
          updateData[field] = fields[field] === 'true' || fields[field] === true;
        } else if (field === 'start_date' || field === 'end_date') {
          updateData[field] = fields[field] ? new Date(fields[field]) : null;
        } else {
          updateData[field] = fields[field];
        }
      }
    });

    // Handle file updates
    if (files.primary_image) {
      // Delete old primary image if exists
      if (existingProject.primary_image) {
        deleteFile(existingProject.primary_image);
      }
      updateData.primary_image = files.primary_image;
    }

    // Handle additional images
    if (files.images) {
      const newImages = Array.isArray(files.images) ? files.images : [files.images];
      
      // Keep existing images if specified
      let existingImages = [];
      if (fields.existing_images) {
        existingImages = Array.isArray(fields.existing_images) 
          ? fields.existing_images 
          : [fields.existing_images];
      }
      
      // Delete removed images
      if (existingProject.images) {
        existingProject.images.forEach(imagePath => {
          if (!existingImages.includes(imagePath)) {
            deleteFile(imagePath);
          }
        });
      }
      
      updateData.images = [...existingImages, ...newImages];
    } else if (fields.existing_images !== undefined) {
      // Only update with existing images (no new uploads)
      const existingImages = Array.isArray(fields.existing_images) 
        ? fields.existing_images 
        : [fields.existing_images];
      
      // Delete removed images
      if (existingProject.images) {
        existingProject.images.forEach(imagePath => {
          if (!existingImages.includes(imagePath)) {
            deleteFile(imagePath);
          }
        });
      }
      
      updateData.images = existingImages;
    }

    // Update project
    const project = await UnifiedProject.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `${project.type.charAt(0).toUpperCase() + project.type.slice(1)} updated successfully`,
      data: project
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update project'
    });
  }
};

const handleDelete = async (req, res, id) => {
  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Find and delete project
    const project = await UnifiedProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete associated files
    if (project.primary_image) {
      deleteFile(project.primary_image);
    }
    
    if (project.images && project.images.length > 0) {
      project.images.forEach(imagePath => {
        deleteFile(imagePath);
      });
    }

    // Delete project directory if empty
    try {
      const projectDir = path.join(
        process.cwd(), 
        'public', 
        'uploads', 
        `${project.type}s`, 
        id
      );
      if (fs.existsSync(projectDir)) {
        const files = fs.readdirSync(projectDir);
        if (files.length === 0) {
          fs.rmdirSync(projectDir);
        }
      }
    } catch (dirError) {
      console.error('Error cleaning up directory:', dirError);
    }

    await UnifiedProject.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `${project.type.charAt(0).toUpperCase() + project.type.slice(1)} deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};