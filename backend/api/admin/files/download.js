import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import path from 'path';
import { existsSync, createReadStream } from 'fs';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function POST(request) {
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
        
        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json(
                { error: 'Files array required' },
                { status: 400 }
            );
        }

        // Create a zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        const chunks = [];
        
        // Collect archive data
        archive.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        // Add files to archive
        let addedFiles = 0;
        const publicDir = path.join(process.cwd(), 'public');
        
        for (const filePath of files) {
            try {
                const fullPath = path.join(publicDir, filePath);
                
                if (existsSync(fullPath)) {
                    const filename = path.basename(filePath);
                    const moduleDir = filePath.split('/')[1]; // Extract module from path
                    const recordId = filePath.split('/')[2]; // Extract record ID from path
                    
                    // Create organized folder structure in zip
                    const zipPath = `${moduleDir}/${recordId}/${filename}`;
                    
                    archive.file(fullPath, { name: zipPath });
                    addedFiles++;
                } else {
                    console.warn(`File not found: ${fullPath}`);
                }
            } catch (error) {
                console.error(`Error adding file ${filePath}:`, error);
            }
        }

        if (addedFiles === 0) {
            return NextResponse.json(
                { error: 'No valid files found to download' },
                { status: 404 }
            );
        }

        // Finalize the archive
        archive.finalize();

        // Wait for archive to complete
        await new Promise((resolve, reject) => {
            archive.on('end', resolve);
            archive.on('error', reject);
        });

        // Combine all chunks
        const buffer = Buffer.concat(chunks);
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tls-files-${timestamp}.zip`;

        // Return the zip file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.length.toString()
            }
        });

    } catch (error) {
        console.error('Error creating download:', error);
        return NextResponse.json(
            { error: 'Internal server error during download creation' },
            { status: 500 }
        );
    }
}

// Alternative implementation using streaming for large files
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
        const filePath = searchParams.get('file');
        
        if (!filePath) {
            return NextResponse.json(
                { error: 'File path required' },
                { status: 400 }
            );
        }

        const fullPath = path.join(process.cwd(), 'public', filePath);
        
        if (!existsSync(fullPath)) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Get file stats
        const fs = require('fs');
        const stats = fs.statSync(fullPath);
        const filename = path.basename(filePath);
        
        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.mp4': 'video/mp4',
            '.epub': 'application/epub+zip'
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        // Create readable stream
        const fileStream = createReadStream(fullPath);
        
        // Convert to web stream
        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => {
                    controller.enqueue(new Uint8Array(chunk));
                });
                
                fileStream.on('end', () => {
                    controller.close();
                });
                
                fileStream.on('error', (error) => {
                    controller.error(error);
                });
            }
        });

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': stats.size.toString()
            }
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json(
            { error: 'Internal server error during file download' },
            { status: 500 }
        );
    }
}