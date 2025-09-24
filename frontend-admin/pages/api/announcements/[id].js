// API route for individual announcement operations (GET, PUT, DELETE)
import announcements from './index.js';

// Import the announcements array from the main file
// Note: In a real application, this would use a database
let announcementsData = [
  {
    _id: '1',
    title: 'Welcome to Tamil Language Society',
    description: 'Join us in preserving and promoting Tamil language and culture',
    content: '<p>We are excited to welcome you to the Tamil Language Society. Our mission is to preserve, promote, and celebrate the rich heritage of Tamil language and culture.</p>',
    priority: 'high',
    status: 'active',
    cost: 0,
    tags: ['welcome', 'introduction'],
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    scheduledFor: null,
    targetAudience: 'all',
    visibility: 'public',
    links: [],
    emailSent: false,
    emailSentAt: null,
    emailRecipients: 0
  },
  {
    _id: '2',
    title: 'New Tamil Literature Collection Available',
    description: 'Explore our latest collection of classical and modern Tamil literature',
    content: '<p>We have added over 50 new books to our digital library, including works by renowned Tamil authors and poets.</p>',
    priority: 'medium',
    status: 'active',
    cost: 25.00,
    tags: ['books', 'literature', 'collection'],
    isPinned: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    scheduledFor: null,
    targetAudience: 'members',
    visibility: 'public',
    links: [{ url: 'https://library.tls.org', text: 'Visit Library' }],
    emailSent: true,
    emailSentAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    emailRecipients: 1250
  },
  {
    _id: '3',
    title: 'Tamil Cultural Festival 2024',
    description: 'Join us for our annual Tamil cultural festival celebrating art, music, and dance',
    content: '<p>Mark your calendars for our biggest event of the year! The Tamil Cultural Festival will feature traditional performances, food stalls, and cultural exhibitions.</p>',
    priority: 'high',
    status: 'active',
    cost: 15.00,
    tags: ['festival', 'culture', 'event'],
    isPinned: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'all',
    visibility: 'public',
    links: [{ url: 'https://festival.tls.org', text: 'Register Now' }],
    emailSent: false,
    emailSentAt: null,
    emailRecipients: 0
  },
  {
    _id: '4',
    title: 'Tamil Language Learning Workshop',
    description: 'Free workshop for beginners to learn Tamil language basics',
    content: '<p>Perfect for those who want to start their Tamil language journey. Our experienced instructors will guide you through the fundamentals.</p>',
    priority: 'medium',
    status: 'active',
    cost: 0,
    tags: ['workshop', 'learning', 'education'],
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'all',
    visibility: 'public',
    links: [],
    emailSent: false,
    emailSentAt: null,
    emailRecipients: 0
  },
  {
    _id: '5',
    title: 'Digital Library Maintenance',
    description: 'Scheduled maintenance for our digital library system',
    content: '<p>Our digital library will be temporarily unavailable for maintenance. We apologize for any inconvenience.</p>',
    priority: 'low',
    status: 'inactive',
    cost: 0,
    tags: ['maintenance', 'system', 'library'],
    isPinned: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'all',
    visibility: 'public',
    links: [],
    emailSent: false,
    emailSentAt: null,
    emailRecipients: 0
  }
];

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  try {
    switch (method) {
      case 'GET':
        // Get single announcement
        const announcement = announcementsData.find(a => a._id === id);
        
        if (!announcement) {
          return res.status(404).json({
            success: false,
            message: 'Announcement not found'
          });
        }
        
        res.status(200).json({
          success: true,
          announcement
        });
        break;
        
      case 'PUT':
        // Update announcement
        const announcementIndex = announcementsData.findIndex(a => a._id === id);
        
        if (announcementIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Announcement not found'
          });
        }
        
        const updatedAnnouncement = {
          ...announcementsData[announcementIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        announcementsData[announcementIndex] = updatedAnnouncement;
        
        res.status(200).json({
          success: true,
          announcement: updatedAnnouncement,
          message: 'Announcement updated successfully'
        });
        break;
        
      case 'DELETE':
        // Delete announcement
        const deleteIndex = announcementsData.findIndex(a => a._id === id);
        
        if (deleteIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Announcement not found'
          });
        }
        
        const deletedAnnouncement = announcementsData.splice(deleteIndex, 1)[0];
        
        res.status(200).json({
          success: true,
          announcement: deletedAnnouncement,
          message: 'Announcement deleted successfully'
        });
        break;
        
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}