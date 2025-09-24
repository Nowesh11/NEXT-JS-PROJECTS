import dbConnect from '../../../lib/dbConnect';
import Activity from '../../../models/Activity';
import ActivityImage from '../../../models/ActivityImage';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const activity = await Activity.findById(id);

        if (!activity) {
          return res.status(404).json({ success: false, error: 'Activity not found' });
        }

        // Get associated images
        const images = await ActivityImage.find({ activityId: id }).sort({ isPrimary: -1, createdAt: 1 });
        
        let processedActivity = activity.toObject();
        processedActivity.images = images;

        // Language filtering
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          // Transform bilingual fields to single language
          if (processedActivity.title && typeof processedActivity.title === 'object') {
            processedActivity.title = processedActivity.title[req.query.lang] || processedActivity.title.en;
          }
          if (processedActivity.description && typeof processedActivity.description === 'object') {
            processedActivity.description = processedActivity.description[req.query.lang] || processedActivity.description.en;
          }
          if (processedActivity.shortDescription && typeof processedActivity.shortDescription === 'object') {
            processedActivity.shortDescription = processedActivity.shortDescription[req.query.lang] || processedActivity.shortDescription.en;
          }
          if (processedActivity.goals && typeof processedActivity.goals === 'object') {
            processedActivity.goals = processedActivity.goals[req.query.lang] || processedActivity.goals.en;
          }
          if (processedActivity.achievements && typeof processedActivity.achievements === 'object') {
            processedActivity.achievements = processedActivity.achievements[req.query.lang] || processedActivity.achievements.en;
          }
        }

        res.status(200).json({ success: true, data: processedActivity });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}