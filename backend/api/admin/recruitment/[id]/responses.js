import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { id } = req.query;
    const { export: exportFormat } = req.query;

    // Validate form ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    // Get the recruitment form
    const form = await db.collection('recruitmentForms').findOne({
      _id: new ObjectId(id)
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get all responses for this form
    const responses = await db.collection('recruitmentResponses')
      .find({ formId: new ObjectId(id) })
      .sort({ submittedAt: -1 })
      .toArray();

    // Handle CSV export
    if (exportFormat === 'csv') {
      const csvData = generateCSV(form, responses);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${form.title?.en || 'recruitment-responses'}.csv"`);
      return res.status(200).send(csvData);
    }

    // Generate analytics
    const analytics = generateAnalytics(form, responses);

    res.status(200).json({
      success: true,
      form: {
        _id: form._id,
        title: form.title,
        type: form.type,
        role: form.role,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        fields: form.fields
      },
      responses,
      analytics
    });

  } catch (error) {
    console.error('Error fetching form responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateAnalytics(form, responses) {
  const analytics = {
    totalSubmissions: responses.length,
    fieldAnalytics: [],
    submissionsByDate: {},
    deviceBreakdown: {},
    averageCompletionTime: null,
    completionRate: 100 // Assuming all submitted forms are complete
  };

  // Group submissions by date
  responses.forEach(response => {
    const date = new Date(response.submittedAt).toISOString().split('T')[0];
    analytics.submissionsByDate[date] = (analytics.submissionsByDate[date] || 0) + 1;
  });

  // Device breakdown (mock data for now)
  responses.forEach(response => {
    const device = response.userAgent ? detectDevice(response.userAgent) : 'Unknown';
    analytics.deviceBreakdown[device] = (analytics.deviceBreakdown[device] || 0) + 1;
  });

  // Field analytics
  if (form.fields) {
    form.fields.forEach(field => {
      if (field.type === 'section-break') return;

      const fieldAnalytics = {
        fieldId: field.id,
        totalResponses: 0,
        values: {},
        responses: []
      };

      responses.forEach(response => {
        const answer = response.answers?.find(a => a.fieldId === field.id);
        if (answer && answer.value) {
          fieldAnalytics.totalResponses++;

          if (['dropdown', 'multiple-choice', 'checkboxes'].includes(field.type)) {
            // For choice fields, count occurrences
            if (Array.isArray(answer.value)) {
              answer.value.forEach(val => {
                fieldAnalytics.values[val] = (fieldAnalytics.values[val] || 0) + 1;
              });
            } else {
              fieldAnalytics.values[answer.value] = (fieldAnalytics.values[answer.value] || 0) + 1;
            }
          } else if (field.type === 'date') {
            // For date fields, group by month
            const date = new Date(answer.value);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            fieldAnalytics.values[monthYear] = (fieldAnalytics.values[monthYear] || 0) + 1;
          } else if (['short-text', 'long-text', 'email', 'phone'].includes(field.type)) {
            // For text fields, collect responses
            fieldAnalytics.responses.push(answer.value);
            if (field.type === 'long-text') {
              fieldAnalytics.averageLength = fieldAnalytics.responses.reduce((sum, resp) => sum + resp.length, 0) / fieldAnalytics.responses.length;
            }
          }
        }
      });

      analytics.fieldAnalytics.push(fieldAnalytics);
    });
  }

  return analytics;
}

function generateCSV(form, responses) {
  if (responses.length === 0) {
    return 'No responses available';
  }

  // Create headers
  const headers = ['Submission ID', 'Submitted At', 'User Name', 'User Email'];
  
  // Add field headers
  if (form.fields) {
    form.fields.forEach(field => {
      if (field.type !== 'section-break') {
        headers.push(field.label?.en || field.label || `Field ${field.id}`);
      }
    });
  }

  // Create rows
  const rows = [headers];
  
  responses.forEach(response => {
    const row = [
      response._id.toString(),
      new Date(response.submittedAt).toISOString(),
      response.userName || '',
      response.userEmail || ''
    ];

    // Add field values
    if (form.fields) {
      form.fields.forEach(field => {
        if (field.type !== 'section-break') {
          const answer = response.answers?.find(a => a.fieldId === field.id);
          if (answer) {
            if (answer.file) {
              row.push(answer.file);
            } else if (Array.isArray(answer.value)) {
              row.push(answer.value.join(', '));
            } else {
              row.push(answer.value || '');
            }
          } else {
            row.push('');
          }
        }
      });
    }

    rows.push(row);
  });

  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
        ? `"${cell.replace(/"/g, '""')}"`
        : cell
    ).join(',')
  ).join('\n');
}

function detectDevice(userAgent) {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'Mobile';
  } else if (/Tablet/.test(userAgent)) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}