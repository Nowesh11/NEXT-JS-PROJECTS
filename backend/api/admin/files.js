import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import path from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

// Get all files across all modules
export async function GET(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');
        const recordId = searchParams.get('recordId');

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        if (!existsSync(uploadsDir)) {
            return NextResponse.json({
                files: [],
                message: 'No uploads directory found'
            });
        }

        const allFiles = [];
        const modules = ['books', 'ebooks', 'posters', 'projects', 'activities', 'initiatives', 'slideshow', 'content'];

        // Scan each module directory
        for (const moduleDir of modules) {
            // Skip if filtering by specific module
            if (module && module !== moduleDir) continue;
            
            const modulePath = path.join(uploadsDir, moduleDir);
            
            if (!existsSync(modulePath)) continue;
            
            const recordDirs = readdirSync(modulePath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            
            for (const recordDir of recordDirs) {
                // Skip if filtering by specific record
                if (recordId && recordId !== recordDir) continue;
                
                const recordPath = path.join(modulePath, recordDir);
                
                if (!existsSync(recordPath)) continue;
                
                const files = readdirSync(recordPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);
                
                for (const filename of files) {
                    const filePath = path.join(recordPath, filename);
                    const stats = statSync(filePath);
                    
                    allFiles.push({
                        filename: filename,
                        originalName: filename.includes('_') ? filename.substring(filename.indexOf('_') + 1) : filename,
                        path: `uploads/${moduleDir}/${recordDir}/${filename}`,
                        module: moduleDir,
                        recordId: recordDir,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime,
                        type: path.extname(filename).toLowerCase()
                    });
                }
            }
        }

        // Sort by creation date (newest first)
        allFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({
            files: allFiles,
            count: allFiles.length,
            modules: modules.filter(m => allFiles.some(f => f.module === m))
        });

    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Delete multiple files
export async function DELETE(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { files } = await request.json();
        
        if (!files || !Array.isArray(files)) {
            return NextResponse.json(
                { error: 'Files array required' },
                { status: 400 }
            );
        }

        const results = [];
        const fs = require('fs');

        for (const file of files) {
            try {
                const filePath = path.join(
                    process.cwd(), 
                    'public', 
                    'uploads', 
                    file.module, 
                    file.recordId, 
                    file.filename
                );
                
                if (existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    results.push({
                        filename: file.filename,
                        success: true
                    });
                } else {
                    results.push({
                        filename: file.filename,
                        success: false,
                        error: 'File not found'
                    });
                }
            } catch (error) {
                results.push({
                    filename: file.filename,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: successCount > 0,
            message: `${successCount} files deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
            results: results
        });

    } catch (error) {
        console.error('Error deleting files:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}