import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !validateMockToken(token)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      multiples: true
    });

    // Ensure upload directory exists
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    
    const uploadedFiles = [];
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    
    for (const file of fileArray) {
      if (!file) continue;
      
      // Validate file type
      const allowedTypes = {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'ebook': ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook']
      };
      
      const fileType = fields.type?.[0] || 'document';
      const validTypes = allowedTypes[fileType] || allowedTypes.document;
      
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${validTypes.join(', ')}`
        });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = path.extname(file.originalFilename || file.newFilename);
      const newFilename = `${timestamp}_${randomString}${extension}`;
      const newPath = path.join(uploadDir, newFilename);
      
      // Move file to final location
      fs.renameSync(file.filepath, newPath);
      
      uploadedFiles.push({
        originalName: file.originalFilename,
        filename: newFilename,
        path: `/uploads/${newFilename}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      });
    }
    
    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
}

// Helper function to validate token (same as in auth routes)
function validateMockToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return tokenAge < maxAge && payload.email;
  } catch (error) {
    return false;
  }
}