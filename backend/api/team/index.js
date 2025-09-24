import dbConnect from '../../../lib/mongodb';
import Team from '../../../models/Team';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to ensure upload directory exists
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Helper function to validate file types
const validateFileType = (file, allowedTypes) => {
  const fileExtension = path.extname(file.originalFilename).toLowerCase();
  return allowedTypes.includes(fileExtension);
};

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 10,
          search = '',
          position = '',
          department = '',
          is_active = '',
          sortBy = 'order',
          sortOrder = 'asc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = {};

        // Search functionality
        if (search) {
          query.$or = [
            { 'name.en': { $regex: search, $options: 'i' } },
            { 'name.ta': { $regex: search, $options: 'i' } },
            { 'role.en': { $regex: search, $options: 'i' } },
            { 'role.ta': { $regex: search, $options: 'i' } },
            { 'bio.en': { $regex: search, $options: 'i' } },
            { 'bio.ta': { $regex: search, $options: 'i' } },
            { 'contact.email': { $regex: search, $options: 'i' } }
          ];
        }

        // Filter by position
        if (position) {
          query.position = position;
        }

        // Filter by department
        if (department) {
          query.department = department;
        }

        // Filter by active status
        if (is_active !== '') {
          query.is_active = is_active === 'true';
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const teamMembers = await Team.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        const total = await Team.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        // Get filter options
        const positions = await Team.distinct('position');
        const departments = await Team.distinct('department');

        res.status(200).json({
          success: true,
          data: teamMembers,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          },
          filters: {
            positions,
            departments
          }
        });
      } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching team members',
          error: error.message
        });
      }
      break;

    case 'POST':
      try {
        const session = await getServerSession(req, res, authOptions);
        
        // Check if user is authenticated and is admin
        if (!session || !session.user || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Admin access required'
          });
        }

        const form = formidable({
          uploadDir: './public/uploads/temp',
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB for images
          multiples: false
        });

        const [fields, files] = await form.parse(req);

        // Extract form data
        const teamData = {
          name: {
            en: Array.isArray(fields['name.en']) ? fields['name.en'][0] : fields['name.en'],
            ta: Array.isArray(fields['name.ta']) ? fields['name.ta'][0] : fields['name.ta']
          },
          role: {
            en: Array.isArray(fields['role.en']) ? fields['role.en'][0] : fields['role.en'],
            ta: Array.isArray(fields['role.ta']) ? fields['role.ta'][0] : fields['role.ta']
          },
          bio: {
            en: Array.isArray(fields['bio.en']) ? fields['bio.en'][0] : fields['bio.en'],
            ta: Array.isArray(fields['bio.ta']) ? fields['bio.ta'][0] : fields['bio.ta']
          },
          position: Array.isArray(fields.position) ? fields.position[0] : fields.position,
          department: Array.isArray(fields.department) ? fields.department[0] : fields.department,
          contact: {
            email: Array.isArray(fields['contact.email']) ? fields['contact.email'][0] : fields['contact.email'],
            phone: Array.isArray(fields['contact.phone']) ? fields['contact.phone'][0] : fields['contact.phone']
          },
          email: Array.isArray(fields.email) ? fields.email[0] : fields.email,
          phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone,
          socialMedia: {
            linkedin: Array.isArray(fields['socialMedia.linkedin']) ? fields['socialMedia.linkedin'][0] : fields['socialMedia.linkedin'],
            twitter: Array.isArray(fields['socialMedia.twitter']) ? fields['socialMedia.twitter'][0] : fields['socialMedia.twitter'],
            facebook: Array.isArray(fields['socialMedia.facebook']) ? fields['socialMedia.facebook'][0] : fields['socialMedia.facebook'],
            instagram: Array.isArray(fields['socialMedia.instagram']) ? fields['socialMedia.instagram'][0] : fields['socialMedia.instagram']
          },
          expertise: fields.expertise ? (Array.isArray(fields.expertise) ? fields.expertise : fields.expertise.split(',').map(exp => exp.trim())) : [],
          achievements: fields.achievements ? (Array.isArray(fields.achievements) ? fields.achievements : fields.achievements.split(',').map(ach => ach.trim())) : [],
          education: Array.isArray(fields.education) ? fields.education[0] : fields.education,
          experience: fields.experience ? parseInt(Array.isArray(fields.experience) ? fields.experience[0] : fields.experience) : 0,
          joinDate: fields.joinDate ? new Date(Array.isArray(fields.joinDate) ? fields.joinDate[0] : fields.joinDate) : new Date(),
          order: fields.order ? parseInt(Array.isArray(fields.order) ? fields.order[0] : fields.order) : 0,
          is_active: fields.is_active !== 'false'
        };

        // Create team member first to get ID for file paths
        const teamMember = new Team(teamData);
        await teamMember.save();

        const memberId = teamMember._id.toString();
        const uploadDir = path.join('./public/uploads/team', memberId);
        ensureUploadDir(uploadDir);

        // Handle image upload
        if (files.image) {
          const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
          
          if (!validateFileType(imageFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            await Team.findByIdAndDelete(memberId);
            return res.status(400).json({
              success: false,
              message: 'Invalid image file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          const imageFileName = `${memberId}_profile${path.extname(imageFile.originalFilename)}`;
          const imagePath = path.join(uploadDir, imageFileName);
          
          await fs.promises.copyFile(imageFile.filepath, imagePath);
          await fs.promises.unlink(imageFile.filepath);
          
          teamMember.image = `/uploads/team/${memberId}/${imageFileName}`;
        }

        // Handle profile picture upload (alternative field)
        if (files.profilePicture) {
          const profileFile = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture;
          
          if (!validateFileType(profileFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid profile picture file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          const profileFileName = `${memberId}_profile_pic${path.extname(profileFile.originalFilename)}`;
          const profilePath = path.join(uploadDir, profileFileName);
          
          await fs.promises.copyFile(profileFile.filepath, profilePath);
          await fs.promises.unlink(profileFile.filepath);
          
          teamMember.profilePicture = `/uploads/team/${memberId}/${profileFileName}`;
        }

        // Handle photo upload (alternative field)
        if (files.photo) {
          const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
          
          if (!validateFileType(photoFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid photo file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          const photoFileName = `${memberId}_photo${path.extname(photoFile.originalFilename)}`;
          const photoPath = path.join(uploadDir, photoFileName);
          
          await fs.promises.copyFile(photoFile.filepath, photoPath);
          await fs.promises.unlink(photoFile.filepath);
          
          teamMember.photo = `/uploads/team/${memberId}/${photoFileName}`;
        }

        await teamMember.save();

        res.status(201).json({
          success: true,
          message: 'Team member created successfully',
          data: teamMember
        });
      } catch (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({
          success: false,
          message: 'Error creating team member',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}