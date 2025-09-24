import dbConnect from '../../lib/dbConnect';
import Initiative from '../../models/Initiative';
import InitiativeImage from '../../models/InitiativeImage';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        let queryObj = {};

        // Search functionality
        if (req.query.q) {
          queryObj.$text = { $search: req.query.q };
        }

        // Filter by bureau
        if (req.query.bureau) {
          queryObj.bureau = req.query.bureau;
        }

        // Filter by status
        if (req.query.status) {
          queryObj.status = req.query.status;
        }

        let query = Initiative.find(queryObj);

        // Sort
        if (req.query.sort) {
          const sortBy = req.query.sort.split(",").join(" ");
          query = query.sort(sortBy);
        } else {
          query = query.sort("-createdAt");
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Initiative.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        // Execute query
        const initiatives = await query;

        // Language filtering
        let processedInitiatives = initiatives;
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          processedInitiatives = initiatives.map(initiative => {
            const initiativeObj = initiative.toObject();
            
            // Transform bilingual fields to single language
            if (initiativeObj.title && typeof initiativeObj.title === 'object') {
              initiativeObj.title = initiativeObj.title[req.query.lang] || initiativeObj.title.en;
            }
            if (initiativeObj.description && typeof initiativeObj.description === 'object') {
              initiativeObj.description = initiativeObj.description[req.query.lang] || initiativeObj.description.en;
            }
            if (initiativeObj.shortDescription && typeof initiativeObj.shortDescription === 'object') {
              initiativeObj.shortDescription = initiativeObj.shortDescription[req.query.lang] || initiativeObj.shortDescription.en;
            }
            if (initiativeObj.goals && typeof initiativeObj.goals === 'object') {
              initiativeObj.goals = initiativeObj.goals[req.query.lang] || initiativeObj.goals.en;
            }
            if (initiativeObj.achievements && typeof initiativeObj.achievements === 'object') {
              initiativeObj.achievements = initiativeObj.achievements[req.query.lang] || initiativeObj.achievements.en;
            }
            
            return initiativeObj;
          });
        }

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
          pagination.next = {
            page: page + 1,
            limit
          };
        }

        if (startIndex > 0) {
          pagination.prev = {
            page: page - 1,
            limit
          };
        }

        res.status(200).json({
          success: true,
          count: processedInitiatives.length,
          pagination,
          data: processedInitiatives
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}