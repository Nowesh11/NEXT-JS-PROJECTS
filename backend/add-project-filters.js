const { MongoClient, ObjectId } = require('mongodb');

async function addProjectFiltersToDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('tls_database');
    const collection = db.collection('websitecontents');
    
    // Delete existing project filter content
    await collection.deleteMany({ sectionKey: { $regex: /^projects\.filter/ } });
    
    const filterContent = [
      {
        _id: new ObjectId(),
        sectionKey: 'projects.filter.all',
        content: {
          en: 'All Projects',
          ta: 'அனைத்து திட்டங்கள்'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        sectionKey: 'projects.filter.digital',
        content: {
          en: 'Technology',
          ta: 'தொழில்நுட்பம்'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        sectionKey: 'projects.filter.education',
        content: {
          en: 'Education',
          ta: 'கல்வி'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        sectionKey: 'projects.filter.community',
        content: {
          en: 'Cultural',
          ta: 'கலாச்சாரம்'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        sectionKey: 'projects.filter.research',
        content: {
          en: 'Research',
          ta: 'ஆராய்ச்சி'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await collection.insertMany(filterContent);
    console.log('Project filter content added successfully:', result.insertedCount);
    
  } catch (error) {
    console.error('Error adding project filter content:', error);
  } finally {
    await client.close();
  }
}

addProjectFiltersToDatabase();