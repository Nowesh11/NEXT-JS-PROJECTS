import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import PaymentSettings from '../../models/PaymentSettings';
import dbConnect from '../../lib/mongodb';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'));
    }
  },
});

// Disable body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    await dbConnect();
    
    // Get payment settings to check file size limits
    const settings = await PaymentSettings.getSettings();
    const maxFileSize = (settings.general?.maxFileSize || 5) * 1024 * 1024; // Convert MB to bytes
    
    // Update multer limits based on settings
    upload.options.limits.fileSize = maxFileSize;
    
    // Run multer middleware
    await runMiddleware(req, res, upload.single('transactionProof'));
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Validate file type against settings
    const allowedTypes = settings.general?.allowedFileTypes || ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'transactions');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(req.file.originalname);
    const filename = `transaction_${timestamp}_${randomString}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save file to disk
    await writeFile(filepath, req.file.buffer);
    
    // Return file information
    const fileUrl = `/uploads/transactions/${filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      },
      message: 'Transaction proof uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading transaction proof:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large'
      });
    }
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload transaction proof'
    });
  }
}