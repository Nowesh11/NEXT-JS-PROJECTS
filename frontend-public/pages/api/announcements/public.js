// API route for public announcements
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Mock data for now - in a real app, this would fetch from a database
    const mockAnnouncements = [
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
        scheduledFor: null,
        targetAudience: 'all',
        visibility: 'public'
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
        scheduledFor: null,
        targetAudience: 'members',
        visibility: 'public'
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
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        visibility: 'public'
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
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        visibility: 'public'
      },
      {
        _id: '5',
        title: 'Digital Library Maintenance',
        description: 'Scheduled maintenance for our digital library system',
        content: '<p>Our digital library will be temporarily unavailable for maintenance. We apologize for any inconvenience.</p>',
        priority: 'low',
        status: 'active',
        cost: 0,
        tags: ['maintenance', 'system', 'library'],
        isPinned: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        visibility: 'public'
      }
    ];

    // Filter only active and public announcements
    const publicAnnouncements = mockAnnouncements.filter(
      announcement => announcement.status === 'active' && announcement.visibility === 'public'
    );

    // Sort by priority (high first) and then by creation date (newest first)
    const sortedAnnouncements = publicAnnouncements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      announcements: sortedAnnouncements,
      total: sortedAnnouncements.length
    });

  } catch (error) {
    console.error('Error fetching public announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
