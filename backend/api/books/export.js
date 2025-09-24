import dbConnect from '../../../lib/dbConnect';
import Book from '../../../models/Book';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Require admin authentication
    const authResult = await requireAuth(req, ['admin', 'super_admin']);
    if (!authResult.success) {
      return res.status(401).json(authResult);
    }

    await dbConnect();

    const { format = 'csv', fields, category, status } = req.query;

    // Build query filters
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    // Fetch books data
    const books = await Book.find(query).lean();

    if (format === 'csv') {
      // Define CSV headers
      const defaultFields = [
        'title.en', 'title.ta', 'author.en', 'author.ta', 
        'category', 'price', 'originalPrice', 'stock', 'isbn',
        'pages', 'language', 'publisher.en', 'publisher.ta',
        'featured', 'bestseller', 'newArrival', 'discount',
        'ratings.average', 'ratings.count', 'status', 'createdAt'
      ];

      const selectedFields = fields ? fields.split(',') : defaultFields;

      // Generate CSV headers
      const csvHeaders = selectedFields.map(field => {
        switch (field) {
          case 'title.en': return 'Title (English)';
          case 'title.ta': return 'Title (Tamil)';
          case 'author.en': return 'Author (English)';
          case 'author.ta': return 'Author (Tamil)';
          case 'publisher.en': return 'Publisher (English)';
          case 'publisher.ta': return 'Publisher (Tamil)';
          case 'originalPrice': return 'Original Price';
          case 'ratings.average': return 'Average Rating';
          case 'ratings.count': return 'Total Reviews';
          case 'createdAt': return 'Created Date';
          case 'updatedAt': return 'Updated Date';
          default: return field.charAt(0).toUpperCase() + field.slice(1);
        }
      });

      // Helper function to get nested property value
      const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
          return current && current[key] !== undefined ? current[key] : '';
        }, obj);
      };

      // Helper function to escape CSV values
      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Generate CSV rows
      const csvRows = books.map(book => {
        return selectedFields.map(field => {
          let value = getNestedValue(book, field);
          
          // Format specific fields
          if (field === 'createdAt' || field === 'updatedAt') {
            value = value ? new Date(value).toLocaleDateString() : '';
          } else if (field === 'featured' || field === 'bestseller' || field === 'newArrival') {
            value = value ? 'Yes' : 'No';
          } else if (field === 'tags' && Array.isArray(value)) {
            value = value.join('; ');
          } else if (field === 'ratings.average') {
            value = value ? Math.round(value * 10) / 10 : 0;
          }
          
          return escapeCsvValue(value);
        }).join(',');
      });

      // Combine headers and rows
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      // Set response headers for CSV download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `books-export-${timestamp}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Add BOM for proper UTF-8 encoding in Excel
      res.write('\uFEFF');
      res.end(csvContent);

    } else if (format === 'json') {
      // JSON export
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `books-export-${timestamp}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      res.status(200).json({
        success: true,
        exportDate: new Date().toISOString(),
        totalRecords: books.length,
        filters: { category, status },
        data: books
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported export format. Use csv or json.'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting books data',
      error: error.message
    });
  }
}