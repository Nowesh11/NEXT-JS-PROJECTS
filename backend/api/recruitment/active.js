import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { type, linkedId, language = 'en' } = req.query;

    if (!type || !linkedId) {
      return res.status(400).json({ error: 'Type and linkedId are required' });
    }

    // Find active recruitment forms for the specified entity
    const currentDate = new Date();
    const query = {
      linkedEntity: {
        type: type,
        id: new ObjectId(linkedId)
      },
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    };

    const forms = await db.collection('recruitmentForms')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Filter and format forms for frontend
    const activeForms = forms.map(form => ({
      _id: form._id,
      title: form.title,
      description: form.description,
      role: form.role,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      requirements: form.requirements,
      responseLimit: form.responseLimit,
      responseCount: form.responseCount || 0
    }));

    res.status(200).json({ 
      success: true, 
      forms: activeForms,
      count: activeForms.length
    });

  } catch (error) {
    console.error('Error fetching active recruitment forms:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recruitment forms',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}