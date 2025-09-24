import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import path from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

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

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        if (!existsSync(uploadsDir)) {
            return NextResponse.json({
                totalFiles: 0,
                totalSize: 0,
                moduleCount: 0,
                recordCount: 0,
                moduleStats: {},
                typeStats: {}
            });
        }

        let totalFiles = 0;
        let totalSize = 0;
        let recordCount = 0;
        const moduleStats = {};
        const typeStats = {};
        const modules = ['books', 'ebooks', 'posters', 'projects', 'activities', 'initiatives', 'slideshow', 'content'];

        // Scan each module directory
        for (const moduleDir of modules) {
            const modulePath = path.join(uploadsDir, moduleDir);
            
            if (!existsSync(modulePath)) {
                moduleStats[moduleDir] = {
                    files: 0,
                    size: 0,
                    records: 0
                };
                continue;
            }
            
            const recordDirs = readdirSync(modulePath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            
            let moduleFiles = 0;
            let moduleSize = 0;
            
            for (const recordDir of recordDirs) {
                const recordPath = path.join(modulePath, recordDir);
                
                if (!existsSync(recordPath)) continue;
                
                const files = readdirSync(recordPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);
                
                if (files.length > 0) {
                    recordCount++;
                }
                
                for (const filename of files) {
                    const filePath = path.join(recordPath, filename);
                    const stats = statSync(filePath);
                    const fileType = path.extname(filename).toLowerCase();
                    
                    totalFiles++;
                    moduleFiles++;
                    totalSize += stats.size;
                    moduleSize += stats.size;
                    
                    // Track file types
                    if (typeStats[fileType]) {
                        typeStats[fileType].count++;
                        typeStats[fileType].size += stats.size;
                    } else {
                        typeStats[fileType] = {
                            count: 1,
                            size: stats.size
                        };
                    }
                }
            }
            
            moduleStats[moduleDir] = {
                files: moduleFiles,
                size: moduleSize,
                records: recordDirs.length
            };
        }

        // Calculate additional metrics
        const activeModules = Object.values(moduleStats).filter(stat => stat.files > 0).length;
        const averageFileSize = totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;
        
        // Get top file types
        const topFileTypes = Object.entries(typeStats)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 5)
            .map(([type, stats]) => ({
                type: type || 'no extension',
                count: stats.count,
                size: stats.size,
                percentage: Math.round((stats.count / totalFiles) * 100)
            }));

        return NextResponse.json({
            totalFiles,
            totalSize,
            moduleCount: activeModules,
            recordCount,
            averageFileSize,
            moduleStats,
            typeStats: topFileTypes,
            summary: {
                largestModule: Object.entries(moduleStats)
                    .reduce((max, [name, stats]) => 
                        stats.size > (moduleStats[max]?.size || 0) ? name : max, 
                        Object.keys(moduleStats)[0]
                    ),
                mostActiveModule: Object.entries(moduleStats)
                    .reduce((max, [name, stats]) => 
                        stats.files > (moduleStats[max]?.files || 0) ? name : max, 
                        Object.keys(moduleStats)[0]
                    )
            }
        });

    } catch (error) {
        console.error('Error fetching file stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}