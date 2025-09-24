import dbConnect from '../../lib/dbConnect';
import Activity from '../../models/Activity';
import ActivityImage from '../../models/ActivityImage';

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

        let query = Activity.find(queryObj);

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
        const total = await Activity.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        // Execute query
        const activities = await query;

        // Language filtering
        let processedActivities = activities;
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          processedActivities = activities.map(activity => {
            const activityObj = activity.toObject();
            
            // Transform bilingual fields to single language
            if (activityObj.title && typeof activityObj.title === 'object') {
              activityObj.title = activityObj.title[req.query.lang] || activityObj.title.en;
            }
            if (activityObj.description && typeof activityObj.description === 'object') {
              activityObj.description = activityObj.description[req.query.lang] || activityObj.description.en;
            }
            if (activityObj.shortDescription && typeof activityObj.shortDescription === 'object') {
              activityObj.shortDescription = activityObj.shortDescription[req.query.lang] || activityObj.shortDescription.en;
            }
            if (activityObj.goals && typeof activityObj.goals === 'object') {
              activityObj.goals = activityObj.goals[req.query.lang] || activityObj.goals.en;
            }
            if (activityObj.achievements && typeof activityObj.achievements === 'object') {
              activityObj.achievements = activityObj.achievements[req.query.lang] || activityObj.achievements.en;
            }
            
            return activityObj;
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
          count: processedActivities.length,
          pagination,
          data: processedActivities
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