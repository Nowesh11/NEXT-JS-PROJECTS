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

// Helper function to delete file if exists
const deleteFileIfExists = async (filePath) => {
  try {
    const fullPath = path.join('./public', filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;

  switch (method) {
    case 'GET':
      try {
        const teamMember = await Team.findById(id).lean();

        if (!teamMember) {
          return res.status(404).json({
            success: false,
            message: 'Team member not found'
          });
        }

        res.status(200).json({
          success: true,
          data: teamMember
        });
      } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching team member',
          error: error.message
        });
      }
      break;

    case 'PUT':
      try {
        const session = await getServerSession(req, res, authOptions);
        
        // Check if user is authenticated and is admin
        if (!session || !session.user || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Admin access required'
          });
        }

        const teamMember = await Team.findById(id);
        if (!teamMember) {
          return res.status(404).json({
            success: false,
            message: 'Team member not found'
          });
        }

        const form = formidable({
          uploadDir: './public/uploads/temp',
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB for images
          multiples: false
        });

        const [fields, files] = await form.parse(req);

        // Update team member data
        const updateData = {
          name: {
            en: Array.isArray(fields['name.en']) ? fields['name.en'][0] : fields['name.en'] || teamMember.name.en,
            ta: Array.isArray(fields['name.ta']) ? fields['name.ta'][0] : fields['name.ta'] || teamMember.name.ta
          },
          role: {
            en: Array.isArray(fields['role.en']) ? fields['role.en'][0] : fields['role.en'] || teamMember.role.en,
            ta: Array.isArray(fields['role.ta']) ? fields['role.ta'][0] : fields['role.ta'] || teamMember.role.ta
          },
          bio: {
            en: Array.isArray(fields['bio.en']) ? fields['bio.en'][0] : fields['bio.en'] || teamMember.bio.en,
            ta: Array.isArray(fields['bio.ta']) ? fields['bio.ta'][0] : fields['bio.ta'] || teamMember.bio.ta
          },
          position: Array.isArray(fields.position) ? fields.position[0] : fields.position || teamMember.position,
          department: Array.isArray(fields.department) ? fields.department[0] : fields.department || teamMember.department,
          contact: {
            email: Array.isArray(fields['contact.email']) ? fields['contact.email'][0] : fields['contact.email'] || teamMember.contact.email,
            phone: Array.isArray(fields['contact.phone']) ? fields['contact.phone'][0] : fields['contact.phone'] || teamMember.contact.phone
          },
          email: Array.isArray(fields.email) ? fields.email[0] : fields.email || teamMember.email,
          phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone || teamMember.phone,
          socialMedia: {
            linkedin: Array.isArray(fields['socialMedia.linkedin']) ? fields['socialMedia.linkedin'][0] : fields['socialMedia.linkedin'] || teamMember.socialMedia?.linkedin,
            twitter: Array.isArray(fields['socialMedia.twitter']) ? fields['socialMedia.twitter'][0] : fields['socialMedia.twitter'] || teamMember.socialMedia?.twitter,
            facebook: Array.isArray(fields['socialMedia.facebook']) ? fields['socialMedia.facebook'][0] : fields['socialMedia.facebook'] || teamMember.socialMedia?.facebook,
            instagram: Array.isArray(fields['socialMedia.instagram']) ? fields['socialMedia.instagram'][0] : fields['socialMedia.instagram'] || teamMember.socialMedia?.instagram
          },
          expertise: fields.expertise ? (Array.isArray(fields.expertise) ? fields.expertise : fields.expertise.split(',').map(exp => exp.trim())) : teamMember.expertise,
          achievements: fields.achievements ? (Array.isArray(fields.achievements) ? fields.achievements : fields.achievements.split(',').map(ach => ach.trim())) : teamMember.achievements,
          education: Array.isArray(fields.education) ? fields.education[0] : fields.education || teamMember.education,
          experience: fields.experience ? parseInt(Array.isArray(fields.experience) ? fields.experience[0] : fields.experience) : teamMember.experience,
          joinDate: fields.joinDate ? new Date(Array.isArray(fields.joinDate) ? fields.joinDate[0] : fields.joinDate) : teamMember.joinDate,
          order: fields.order ? parseInt(Array.isArray(fields.order) ? fields.order[0] : fields.order) : teamMember.order,
          is_active: fields.is_active !== undefined ? fields.is_active !== 'false' : teamMember.is_active
        };

        const uploadDir = path.join('./public/uploads/team', id);
        ensureUploadDir(uploadDir);

        // Handle image upload
        if (files.image) {
          const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
          
          if (!validateFileType(imageFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid image file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          // Delete old image
          if (teamMember.image) {
            await deleteFileIfExists(teamMember.image);
          }

          const imageFileName = `${id}_profile${path.extname(imageFile.originalFilename)}`;
          const imagePath = path.join(uploadDir, imageFileName);
          
          await fs.promises.copyFile(imageFile.filepath, imagePath);
          await fs.promises.unlink(imageFile.filepath);
          
          updateData.image = `/uploads/team/${id}/${imageFileName}`;
        }

        // Handle profile picture upload
        if (files.profilePicture) {
          const profileFile = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture;
          
          if (!validateFileType(profileFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid profile picture file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          // Delete old profile picture
          if (teamMember.profilePicture) {
            await deleteFileIfExists(teamMember.profilePicture);
          }

          const profileFileName = `${id}_profile_pic${path.extname(profileFile.originalFilename)}`;
          const profilePath = path.join(uploadDir, profileFileName);
          
          await fs.promises.copyFile(profileFile.filepath, profilePath);
          await fs.promises.unlink(profileFile.filepath);
          
          updateData.profilePicture = `/uploads/team/${id}/${profileFileName}`;
        }

        // Handle photo upload
        if (files.photo) {
          const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
          
          if (!validateFileType(photoFile, ['.jpg', '.jpeg', '.png', '.webp'])) {
            return res.status(400).json({
              success: false,
              message: 'Invalid photo file type. Only JPG, PNG, and WebP are allowed.'
            });
          }

          // Delete old photo
          if (teamMember.photo) {
            await deleteFileIfExists(teamMember.photo);
          }

          const photoFileName = `${id}_photo${path.extname(photoFile.originalFilename)}`;
          const photoPath = path.join(uploadDir, photoFileName);
          
          await fs.promises.copyFile(photoFile.filepath, photoPath);
          await fs.promises.unlink(photoFile.filepath);
          
          updateData.photo = `/uploads/team/${id}/${photoFileName}`;
        }

        const updatedTeamMember = await Team.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true
        });

        res.status(200).json({
          success: true,
          message: 'Team member updated successfully',
          data: updatedTeamMember
        });
      } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({
          success: false,
          message: 'Error updating team member',
          error: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const session = await getServerSession(req, res, authOptions);
        
        // Check if user is authenticated and is admin
        if (!session || !session.user || session.user.role !== 'admin') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Admin access required'
          });
        }

        const teamMember = await Team.findById(id);
        if (!teamMember) {
          return res.status(404).json({
            success: false,
            message: 'Team member not found'
          });
        }

        // Delete associated files
        if (teamMember.image) {
          await deleteFileIfExists(teamMember.image);
        }
        if (teamMember.profilePicture) {
          await deleteFileIfExists(teamMember.profilePicture);
        }
        if (teamMember.photo) {
          await deleteFileIfExists(teamMember.photo);
        }

        // Delete the team member directory if it exists
        const memberDir = path.join('./public/uploads/team', id);
        if (fs.existsSync(memberDir)) {
          await fs.promises.rmdir(memberDir, { recursive: true });
        }

        await Team.findByIdAndDelete(id);

        res.status(200).json({
          success: true,
          message: 'Team member deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({
          success: false,
          message: 'Error deleting team member',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}