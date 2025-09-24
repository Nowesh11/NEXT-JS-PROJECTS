import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';
import ProjectImage from '../../../models/ProjectImage';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const project = await Project.findById(id);

        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Get associated images
        const images = await ProjectImage.find({ projectId: id }).sort({ isPrimary: -1, createdAt: 1 });
        
        let processedProject = project.toObject();
        processedProject.images = images;

        // Language filtering
        if (req.query.lang && (req.query.lang === 'en' || req.query.lang === 'ta')) {
          // Transform bilingual fields to single language
          if (processedProject.title && typeof processedProject.title === 'object') {
            processedProject.title = processedProject.title[req.query.lang] || processedProject.title.en;
          }
          if (processedProject.description && typeof processedProject.description === 'object') {
            processedProject.description = processedProject.description[req.query.lang] || processedProject.description.en;
          }
          if (processedProject.shortDescription && typeof processedProject.shortDescription === 'object') {
            processedProject.shortDescription = processedProject.shortDescription[req.query.lang] || processedProject.shortDescription.en;
          }
          if (processedProject.goals && typeof processedProject.goals === 'object') {
            processedProject.goals = processedProject.goals[req.query.lang] || processedProject.goals.en;
          }
          if (processedProject.requirements && typeof processedProject.requirements === 'object') {
            processedProject.requirements = processedProject.requirements[req.query.lang] || processedProject.requirements.en;
          }
          if (processedProject.benefits && typeof processedProject.benefits === 'object') {
            processedProject.benefits = processedProject.benefits[req.query.lang] || processedProject.benefits.en;
          }
          if (processedProject.director && typeof processedProject.director === 'object') {
            processedProject.director = processedProject.director[req.query.lang] || processedProject.director.en;
          }
        }

        res.status(200).json({ success: true, data: processedProject });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const project = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });

        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Delete associated images
        await ProjectImage.deleteMany({ projectId: id });

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}