import dbConnect from '../../../lib/dbConnect';
import Initiative from '../../../models/Initiative';
import InitiativeImage from '../../../models/InitiativeImage';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const initiative = await Initiative.findById(id);

        if (!initiative) {
          return res.status(404).json({ success: false, error: 'Initiative not found' });
        }

        // Get associated images
        const images = await InitiativeImage.find({ initiativeId: id }).sort({ isPrimary: -1, createdAt: 1 });
        
        let processedInitiative = initiative.toObject();
        processedInitiative.images = images;

        // Language filtering
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          // Transform bilingual fields to single language
          if (processedInitiative.title && typeof processedInitiative.title === 'object') {
            processedInitiative.title = processedInitiative.title[req.query.lang] || processedInitiative.title.en;
          }
          if (processedInitiative.description && typeof processedInitiative.description === 'object') {
            processedInitiative.description = processedInitiative.description[req.query.lang] || processedInitiative.description.en;
          }
          if (processedInitiative.shortDescription && typeof processedInitiative.shortDescription === 'object') {
            processedInitiative.shortDescription = processedInitiative.shortDescription[req.query.lang] || processedInitiative.shortDescription.en;
          }
          if (processedInitiative.goals && typeof processedInitiative.goals === 'object') {
            processedInitiative.goals = processedInitiative.goals[req.query.lang] || processedInitiative.goals.en;
          }
          if (processedInitiative.achievements && typeof processedInitiative.achievements === 'object') {
            processedInitiative.achievements = processedInitiative.achievements[req.query.lang] || processedInitiative.achievements.en;
          }
        }

        res.status(200).json({ success: true, data: processedInitiative });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}