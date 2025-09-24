import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';
import ProjectImage from '../../../models/ProjectImage';

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

        // Filter by type
        if (req.query.type) {
          queryObj.type = req.query.type;
        }

        let query = Project.find(queryObj);

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
        const total = await Project.countDocuments(queryObj);

        query = query.skip(startIndex).limit(limit);

        // Execute query
        const projects = await query;

        // Language filtering
        let processedProjects = projects;
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          processedProjects = projects.map(project => {
            const projectObj = project.toObject();
            
            // Transform bilingual fields to single language
            if (projectObj.title && typeof projectObj.title === 'object') {
              projectObj.title = projectObj.title[req.query.lang] || projectObj.title.en;
            }
            if (projectObj.description && typeof projectObj.description === 'object') {
              projectObj.description = projectObj.description[req.query.lang] || projectObj.description.en;
            }
            if (projectObj.shortDescription && typeof projectObj.shortDescription === 'object') {
              projectObj.shortDescription = projectObj.shortDescription[req.query.lang] || projectObj.shortDescription.en;
            }
            if (projectObj.goals && typeof projectObj.goals === 'object') {
              projectObj.goals = projectObj.goals[req.query.lang] || projectObj.goals.en;
            }
            if (projectObj.requirements && typeof projectObj.requirements === 'object') {
              projectObj.requirements = projectObj.requirements[req.query.lang] || projectObj.requirements.en;
            }
            if (projectObj.benefits && typeof projectObj.benefits === 'object') {
              projectObj.benefits = projectObj.benefits[req.query.lang] || projectObj.benefits.en;
            }
            if (projectObj.director && typeof projectObj.director === 'object') {
              projectObj.director = projectObj.director[req.query.lang] || projectObj.director.en;
            }
            
            return projectObj;
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
          count: processedProjects.length,
          pagination,
          data: processedProjects
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const project = await Project.create(req.body);

        res.status(201).json({
          success: true,
          data: project
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}