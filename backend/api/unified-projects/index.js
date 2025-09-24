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

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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

const handleGet = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      bureau,
      status,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (bureau) {
      query.bureau = bureau;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ta': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ta': { $regex: search, $options: 'i' } },
        { bureau: { $regex: search, $options: 'i' } },
        { 'director.en': { $regex: search, $options: 'i' } },
        { 'director.ta': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [projects, totalCount, bureaus, statuses] = await Promise.all([
      UnifiedProject.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      UnifiedProject.countDocuments(query),
      UnifiedProject.distinct('bureau'),
      UnifiedProject.distinct('status')
    ]);

    // Get stats by type
    const stats = await UnifiedProject.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        bureaus: bureaus.filter(b => b),
        statuses: statuses.filter(s => s),
        types: ['project', 'initiative', 'activity']
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.total,
          active: stat.active,
          completed: stat.completed,
          avgProgress: Math.round(stat.avgProgress || 0)
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

const handlePost = async (req, res) => {
  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Create temporary project to get ID for file uploads
    const tempProject = new UnifiedProject({
      title: { en: 'Temporary', ta: 'தற்காலிக' },
      type: 'project',
      bureau: 'temp',
      description: { en: 'temp', ta: 'temp' },
      director: { en: 'temp', ta: 'temp' },
      director_name: 'temp',
      director_email: 'temp@temp.com',
      goals: { en: 'temp', ta: 'temp' }
    });
    
    const savedTempProject = await tempProject.save();
    const projectId = savedTempProject._id.toString();

    try {
      // Handle file upload
      const { fields, files } = await handleFileUpload(req, projectId, fields.type || 'project');

      // Validate required fields
      const requiredFields = [
        'title', 'type', 'bureau', 'description', 'director', 
        'director_name', 'director_email', 'goals'
      ];

      for (const field of requiredFields) {
        if (!fields[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Prepare project data
      const projectData = {
        title: fields.title,
        type: fields.type,
        bureau: fields.bureau,
        description: fields.description,
        director: fields.director,
        director_name: fields.director_name,
        director_email: fields.director_email,
        director_phone: fields.director_phone || '',
        goals: fields.goals,
        status: fields.status || 'draft',
        progress: parseInt(fields.progress) || 0,
        priority: fields.priority || 'medium',
        featured: fields.featured === 'true' || fields.featured === true,
        tags: fields.tags || [],
        start_date: fields.start_date ? new Date(fields.start_date) : null,
        end_date: fields.end_date ? new Date(fields.end_date) : null,
        budget: parseFloat(fields.budget) || 0,
        participants_count: parseInt(fields.participants_count) || 0
      };

      // Handle file uploads
      if (files.primary_image) {
        projectData.primary_image = files.primary_image;
      }

      if (files.images) {
        projectData.images = Array.isArray(files.images) ? files.images : [files.images];
      } else if (fields.existing_images) {
        projectData.images = Array.isArray(fields.existing_images) 
          ? fields.existing_images 
          : [fields.existing_images];
      }

      // Update the temporary project with real data
      Object.assign(savedTempProject, projectData);
      const project = await savedTempProject.save();

      return res.status(201).json({
        success: true,
        message: `${project.type.charAt(0).toUpperCase() + project.type.slice(1)} created successfully`,
        data: project
      });

    } catch (uploadError) {
      // Clean up temporary project if upload fails
      await UnifiedProject.findByIdAndDelete(projectId);
      throw uploadError;
    }

  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create project'
    });
  }
};