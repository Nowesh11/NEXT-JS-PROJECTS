import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid form ID' });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Get form details
      const form = await db.collection('recruitmentForms')
        .findOne({ _id: new ObjectId(id) });

      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }

      // Check if form is still active
      const currentDate = new Date();
      const isActive = form.status === 'active' && 
                      form.startDate <= currentDate && 
                      form.endDate >= currentDate;

      res.status(200).json({ 
        success: true, 
        form: {
          ...form,
          isActive
        }
      });

    } else if (req.method === 'POST') {
      // Submit form response
      const form = new formidable.IncomingForm();
      form.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'recruitment');
      form.keepExtensions = true;
      form.maxFileSize = 10 * 1024 * 1024; // 10MB limit

      // Ensure upload directory exists
      if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, { recursive: true });
      }

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          return res.status(400).json({ error: 'Failed to parse form data' });
        }

        try {
          // Get the recruitment form
          const recruitmentForm = await db.collection('recruitmentForms')
            .findOne({ _id: new ObjectId(id) });

          if (!recruitmentForm) {
            return res.status(404).json({ error: 'Form not found' });
          }

          // Check if form is still accepting responses
          const currentDate = new Date();
          const isActive = recruitmentForm.status === 'active' && 
                          recruitmentForm.startDate <= currentDate && 
                          recruitmentForm.endDate >= currentDate;

          if (!isActive) {
            return res.status(400).json({ error: 'Form is no longer accepting responses' });
          }

          // Check response limit
          if (recruitmentForm.responseLimit) {
            const responseCount = await db.collection('recruitmentResponses')
              .countDocuments({ formId: new ObjectId(id) });
            
            if (responseCount >= recruitmentForm.responseLimit) {
              return res.status(400).json({ error: 'Response limit reached' });
            }
          }

          // Parse answers
          const answers = JSON.parse(fields.answers[0] || '[]');
          
          // Process file uploads
          const fileUploads = {};
          Object.keys(files).forEach(key => {
            if (key.startsWith('file_')) {
              const fieldId = key.replace('file_', '');
              const file = files[key];
              const fileName = `${Date.now()}_${file.originalFilename}`;
              const newPath = path.join(form.uploadDir, fileName);
              
              // Move file to permanent location
              fs.renameSync(file.filepath, newPath);
              
              fileUploads[fieldId] = {
                originalName: file.originalFilename,
                fileName: fileName,
                filePath: `/uploads/recruitment/${fileName}`,
                size: file.size,
                type: file.mimetype
              };
            }
          });

          // Create response document
          const response = {
            formId: new ObjectId(id),
            formTitle: recruitmentForm.title,
            entityType: recruitmentForm.linkedEntity.type,
            entityId: recruitmentForm.linkedEntity.id,
            role: recruitmentForm.role,
            answers: answers.map(answer => ({
              ...answer,
              fileUpload: fileUploads[answer.fieldId] || null
            })),
            submittedAt: new Date(),
            status: 'pending',
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          };

          // Insert response
          const result = await db.collection('recruitmentResponses')
            .insertOne(response);

          // Update form response count
          await db.collection('recruitmentForms')
            .updateOne(
              { _id: new ObjectId(id) },
              { $inc: { responseCount: 1 } }
            );

          res.status(200).json({ 
            success: true, 
            responseId: result.insertedId,
            message: 'Application submitted successfully'
          });

        } catch (error) {
          console.error('Error submitting form response:', error);
          res.status(500).json({ 
            error: 'Failed to submit response',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}