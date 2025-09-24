import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Supported modules and their configurations
const MODULE_CONFIG = {
    books: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 20 * 1024 * 1024, // 20MB
        fields: ['cover', 'images', 'proof']
    },
    ebooks: {
        allowedTypes: ['.pdf', '.epub'],
        maxSize: 50 * 1024 * 1024, // 50MB
        fields: ['file', 'cover']
    },
    posters: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 20 * 1024 * 1024, // 20MB
        fields: ['image', 'file']
    },
    projects: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 20 * 1024 * 1024, // 20MB
        fields: ['primary', 'gallery', 'poster', 'flyer', 'images']
    },
    activities: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 20 * 1024 * 1024, // 20MB
        fields: ['primary', 'gallery', 'poster', 'flyer', 'images']
    },
    initiatives: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 20 * 1024 * 1024, // 20MB
        fields: ['primary', 'gallery', 'poster', 'flyer', 'images']
    },
    slideshow: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.mp4'],
        maxSize: 100 * 1024 * 1024, // 100MB for videos
        fields: ['images', 'videos']
    },
    content: {
        allowedTypes: ['.jpg', '.jpeg', '.png', '.svg', '.pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        fields: ['logo', 'hero', 'background', 'images']
    }
};

// Normalize filename for safe storage
function normalizeFilename(filename) {
    // Remove special characters and replace spaces with underscores
    const name = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const normalized = name
        .replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s-_]/g, '') // Allow Tamil characters
        .replace(/\s+/g, '_')
        .toLowerCase();
    return `${normalized}${ext}`;
}

// Validate file type and size
function validateFile(file, moduleConfig) {
    const ext = path.extname(file.name).toLowerCase();
    
    if (!moduleConfig.allowedTypes.includes(ext)) {
        throw new Error(`File type ${ext} not allowed for this module`);
    }
    
    if (file.size > moduleConfig.maxSize) {
        throw new Error(`File size exceeds limit of ${moduleConfig.maxSize / (1024 * 1024)}MB`);
    }
    
    return true;
}

// Create directory if it doesn't exist
async function ensureDirectory(dirPath) {
    if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
    }
}

// Save file to disk
async function saveFile(file, uploadPath) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(uploadPath, buffer);
    return uploadPath;
}

export async function POST(request, { params }) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { module } = params;
        
        // Validate module
        if (!MODULE_CONFIG[module]) {
            return NextResponse.json(
                { error: `Unsupported module: ${module}` },
                { status: 400 }
            );
        }

        const moduleConfig = MODULE_CONFIG[module];
        
        // Parse form data
        const formData = await request.formData();
        const recordId = formData.get('recordId') || uuidv4();
        const fieldName = formData.get('fieldName') || 'file';
        
        // Validate field name
        if (!moduleConfig.fields.includes(fieldName)) {
            return NextResponse.json(
                { error: `Invalid field name: ${fieldName}` },
                { status: 400 }
            );
        }

        // Get files (support multiple files)
        const files = formData.getAll('files');
        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', module, recordId);
        await ensureDirectory(uploadDir);

        const uploadedFiles = [];
        const errors = [];

        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // Validate file
                validateFile(file, moduleConfig);
                
                // Generate safe filename
                const normalizedName = normalizeFilename(file.name);
                const timestamp = Date.now();
                const filename = `${timestamp}_${normalizedName}`;
                
                // Determine subdirectory based on fieldName
                let subDir = '';
                if (fieldName === 'primary') {
                    subDir = 'primary';
                } else if (fieldName === 'gallery') {
                    subDir = 'gallery';
                }
                
                // Create subdirectory if needed
                let finalUploadDir = uploadDir;
                if (subDir) {
                    finalUploadDir = path.join(uploadDir, subDir);
                    await ensureDirectory(finalUploadDir);
                }
                
                // Save file
                const uploadPath = path.join(finalUploadDir, filename);
                await saveFile(file, uploadPath);
                
                // Store relative path for database
                const relativePath = subDir 
                    ? `uploads/${module}/${recordId}/${subDir}/${filename}`
                    : `uploads/${module}/${recordId}/${filename}`;
                
                uploadedFiles.push({
                    originalName: file.name,
                    filename: filename,
                    path: relativePath,
                    size: file.size,
                    type: file.type,
                    fieldName: fieldName
                });
                
            } catch (error) {
                errors.push({
                    filename: file.name,
                    error: error.message
                });
            }
        }

        // Return results
        const response = {
            success: uploadedFiles.length > 0,
            recordId: recordId,
            module: module,
            uploadedFiles: uploadedFiles,
            errors: errors,
            message: `${uploadedFiles.length} files uploaded successfully`
        };

        if (errors.length > 0) {
            response.message += `, ${errors.length} files failed`;
        }

        return NextResponse.json(response, { 
            status: uploadedFiles.length > 0 ? 200 : 400 
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error during file upload' },
            { status: 500 }
        );
    }
}

// GET endpoint to list files for a record
export async function GET(request, { params }) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { module } = params;
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('recordId');

        if (!recordId) {
            return NextResponse.json(
                { error: 'recordId parameter required' },
                { status: 400 }
            );
        }

        // Validate module
        if (!MODULE_CONFIG[module]) {
            return NextResponse.json(
                { error: `Unsupported module: ${module}` },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', module, recordId);
        
        if (!existsSync(uploadDir)) {
            return NextResponse.json({
                files: [],
                message: 'No files found for this record'
            });
        }

        const fs = require('fs');
        const files = fs.readdirSync(uploadDir);
        
        const fileList = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            
            return {
                filename: filename,
                path: `uploads/${module}/${recordId}/${filename}`,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime
            };
        });

        return NextResponse.json({
            files: fileList,
            count: fileList.length,
            module: module,
            recordId: recordId
        });

    } catch (error) {
        console.error('File listing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to remove files
export async function DELETE(request, { params }) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { module } = params;
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('recordId');
        const filename = searchParams.get('filename');

        if (!recordId) {
            return NextResponse.json(
                { error: 'recordId parameter required' },
                { status: 400 }
            );
        }

        // Validate module
        if (!MODULE_CONFIG[module]) {
            return NextResponse.json(
                { error: `Unsupported module: ${module}` },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', module, recordId);
        
        if (filename) {
            // Delete specific file
            const filePath = path.join(uploadDir, filename);
            if (existsSync(filePath)) {
                const fs = require('fs');
                fs.unlinkSync(filePath);
                
                return NextResponse.json({
                    success: true,
                    message: `File ${filename} deleted successfully`
                });
            } else {
                return NextResponse.json(
                    { error: 'File not found' },
                    { status: 404 }
                );
            }
        } else {
            // Delete entire directory for record
            if (existsSync(uploadDir)) {
                const fs = require('fs');
                fs.rmSync(uploadDir, { recursive: true, force: true });
                
                return NextResponse.json({
                    success: true,
                    message: `All files for record ${recordId} deleted successfully`
                });
            } else {
                return NextResponse.json(
                    { error: 'Directory not found' },
                    { status: 404 }
                );
            }
        }

    } catch (error) {
        console.error('File deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error during file deletion' },
            { status: 500 }
        );
    }
}