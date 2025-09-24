const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls_database';
const COLLECTIONS = {
  WEBSITE_CONTENT: 'websiteContent'
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// GET /api/website-content - Get content with filters
router.get('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { page, section, sectionKey, search, status, limit = 50, skip = 0 } = req.query;
    
    let query = {};
    
    if (page) query.page = page;
    if (section) query.section = section;
    if (sectionKey) query.sectionKey = sectionKey;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { sectionKey: { $regex: search, $options: 'i' } },
        { 'content.english': { $regex: search, $options: 'i' } },
        { 'content.tamil': { $regex: search, $options: 'i' } }
      ];
    }
    
    const content = await db.collection(COLLECTIONS.WEBSITE_CONTENT)
      .find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ updatedAt: -1 })
      .toArray();
    
    const total = await db.collection(COLLECTIONS.WEBSITE_CONTENT).countDocuments(query);
    
    res.json({
      success: true,
      data: content,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
      message: error.message
    });
  }
});

// POST /api/website-content - Create new content
router.post('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const contentData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: req.body.status || 'active'
    };
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).insertOne(contentData);
    
    res.json({
      success: true,
      data: { _id: result.insertedId, ...contentData },
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create content',
      message: error.message
    });
  }
});

// PUT /api/website-content/:id - Update content
router.put('/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update content',
      message: error.message
    });
  }
});

// DELETE /api/website-content/:id - Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID'
      });
    }
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete content',
      message: error.message
    });
  }
});

// GET /api/website-content/overview - Get content overview
router.get('/overview', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const pipeline = [
      {
        $group: {
          _id: '$page',
          totalSections: { $sum: 1 },
          activeSections: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          lastUpdated: { $max: '$updatedAt' }
        }
      },
      { $sort: { _id: 1 } }
    ];
    
    const overview = await db.collection(COLLECTIONS.WEBSITE_CONTENT)
      .aggregate(pipeline)
      .toArray();
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview',
      message: error.message
    });
  }
});

// GET /api/website-content/activity - Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { limit = 20 } = req.query;
    
    const activity = await db.collection(COLLECTIONS.WEBSITE_CONTENT)
      .find({})
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .project({
        page: 1,
        section: 1,
        sectionKey: 1,
        status: 1,
        updatedAt: 1,
        createdAt: 1
      })
      .toArray();
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity',
      message: error.message
    });
  }
});

// GET /api/website-content/sections/:page - Get sections for a specific page
router.get('/sections/:page', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { page } = req.params;
    const { section, status } = req.query;
    
    let query = { page };
    if (section) query.section = section;
    if (status) query.status = status;
    
    const sections = await db.collection(COLLECTIONS.WEBSITE_CONTENT)
      .find(query)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching page sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page sections',
      message: error.message
    });
  }
});

// POST /api/website-content/sections/:page - Create section for a page
router.post('/sections/:page', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { page } = req.params;
    
    const sectionData = {
      ...req.body,
      page,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: req.body.status || 'active'
    };
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).insertOne(sectionData);
    
    res.json({
      success: true,
      data: { _id: result.insertedId, ...sectionData },
      message: 'Section created successfully'
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create section',
      message: error.message
    });
  }
});

// PUT /api/website-content/sections/:page/:sectionId - Update section
router.put('/sections/:page/:sectionId', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { page, sectionId } = req.params;
    
    if (!ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID'
      });
    }
    
    const updateData = {
      ...req.body,
      page,
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).updateOne(
      { _id: new ObjectId(sectionId), page },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update section',
      message: error.message
    });
  }
});

// DELETE /api/website-content/sections/:page/:sectionId - Delete section
router.delete('/sections/:page/:sectionId', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { page, sectionId } = req.params;
    
    if (!ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID'
      });
    }
    
    const result = await db.collection(COLLECTIONS.WEBSITE_CONTENT).deleteOne({
      _id: new ObjectId(sectionId),
      page
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete section',
      message: error.message
    });
  }
});

// GET /api/website-content/global - Get global content (navigation, footer, etc.)
router.get('/global', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { status } = req.query;
    
    let query = { page: 'global' };
    if (status) query.status = status;
    
    const globalContent = await db.collection(COLLECTIONS.WEBSITE_CONTENT)
      .find(query)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: globalContent
    });
  } catch (error) {
    console.error('Error fetching global content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global content',
      message: error.message
    });
  }
});

// GET /api/website-content/stats - Get content statistics
router.get('/stats', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const stats = await db.collection(COLLECTIONS.WEBSITE_CONTENT).aggregate([
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          activeContent: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveContent: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          totalPages: { $addToSet: '$page' }
        }
      },
      {
        $project: {
          _id: 0,
          totalContent: 1,
          activeContent: 1,
          inactiveContent: 1,
          totalPages: { $size: '$totalPages' }
        }
      }
    ]).toArray();
    
    res.json({
      success: true,
      data: stats[0] || {
        totalContent: 0,
        activeContent: 0,
        inactiveContent: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

module.exports = router;