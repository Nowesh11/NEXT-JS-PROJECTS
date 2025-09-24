const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/tls_database';

// Sample data for different collections
const sampleData = {
  posters: [
    {
      title: { en: "Tamil Heritage Festival 2024", ta: "தமிழ் பாரம்பரிய திருவிழா 2024" },
      description: { en: "Join us for a celebration of Tamil culture and heritage", ta: "தமிழ் கலாச்சாரம் மற்றும் பாரம்பரியத்தின் கொண்டாட்டத்தில் எங்களுடன் சேருங்கள்" },
      category: "event",
      featured: true,
      is_active: true,
      imageUrl: "/images/posters/heritage-festival.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: { en: "Tamil Literature Workshop", ta: "தமிழ் இலக்கிய பட்டறை" },
      description: { en: "Learn about classical Tamil literature", ta: "பாரம்பரிய தமிழ் இலக்கியத்தைப் பற்றி அறிந்து கொள்ளுங்கள்" },
      category: "education",
      featured: false,
      is_active: true,
      imageUrl: "/images/posters/literature-workshop.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: { en: "Tamil Language Classes", ta: "தமிழ் மொழி வகுப்புகள்" },
      description: { en: "Learn Tamil language from basics to advanced", ta: "அடிப்படையிலிருந்து மேம்பட்ட நிலை வரை தமிழ் மொழியைக் கற்றுக்கொள்ளுங்கள்" },
      category: "education",
      featured: true,
      is_active: true,
      imageUrl: "/images/posters/language-classes.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  projects: [
    {
      title: { en: "Digital Tamil Archive", ta: "டிஜிட்டல் தமிழ் காப்பகம்" },
      description: { en: "Digitizing ancient Tamil manuscripts and texts", ta: "பண்டைய தமிழ் கையெழுத்துப் பிரதிகள் மற்றும் நூல்களை டிஜிட்டல் மயமாக்குதல்" },
      category: "preservation",
      status: "active",
      featured: true,
      imageUrl: "/images/projects/digital-archive.jpg",
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: { en: "Tamil Cultural Center", ta: "தமிழ் கலாச்சார மையம்" },
      description: { en: "Building a community center for Tamil cultural activities", ta: "தமிழ் கலாச்சார நடவடிக்கைகளுக்கான சமூக மையம் கட்டுதல்" },
      category: "infrastructure",
      status: "planning",
      featured: true,
      imageUrl: "/images/projects/cultural-center.jpg",
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  ebooks: [
    {
      title: { en: "Introduction to Tamil Literature", ta: "தமிழ் இலக்கிய அறிமுகம்" },
      author: { en: "Dr. Tamil Scholar", ta: "டாக்டர் தமிழ் அறிஞர்" },
      description: { en: "A comprehensive guide to Tamil literature", ta: "தமிழ் இலக்கியத்திற்கான விரிவான வழிகாட்டி" },
      category: "literature",
      language: "bilingual",
      fileUrl: "/ebooks/tamil-literature-intro.pdf",
      coverImage: "/images/ebooks/literature-intro.jpg",
      downloadCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  team: [
    {
      name: { en: "Dr. Rajesh Kumar", ta: "டாக்டர் ராஜேஷ் குமார்" },
      position: { en: "President", ta: "தலைவர்" },
      bio: { en: "Leading Tamil scholar and cultural advocate", ta: "முன்னணி தமிழ் அறிஞர் மற்றும் கலாச்சார வக்கீல்" },
      email: "president@tamilsociety.org",
      phone: "+1-555-0101",
      imageUrl: "/images/team/president.jpg",
      socialLinks: {
        linkedin: "https://linkedin.com/in/rajeshkumar",
        twitter: "https://twitter.com/rajeshkumar"
      },
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: { en: "Prof. Meera Devi", ta: "பேராசிரியர் மீரா தேவி" },
      position: { en: "Vice President", ta: "துணைத் தலைவர்" },
      bio: { en: "Expert in Tamil linguistics and literature", ta: "தமிழ் மொழியியல் மற்றும் இலக்கிய நிபுணர்" },
      email: "vicepresident@tamilsociety.org",
      phone: "+1-555-0102",
      imageUrl: "/images/team/vicepresident.jpg",
      socialLinks: {
        linkedin: "https://linkedin.com/in/meeradevi"
      },
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  announcements: [
    {
      title: { en: "Annual Tamil Conference 2024", ta: "வருடாந்திர தமிழ் மாநாடு 2024" },
      content: { en: "We are pleased to announce our annual Tamil conference", ta: "எங்கள் வருடாந்திர தமிழ் மாநாட்டை அறிவிப்பதில் மகிழ்ச்சி அடைகிறோம்" },
      type: "event",
      priority: "high",
      isActive: true,
      publishDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('tls_database');
    
    // Clear existing data
    console.log('Clearing existing data...');
    for (const collection of Object.keys(sampleData)) {
      await db.collection(collection).deleteMany({});
      console.log(`Cleared ${collection} collection`);
    }
    
    // Insert sample data
    console.log('Inserting sample data...');
    for (const [collectionName, data] of Object.entries(sampleData)) {
      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data);
        console.log(`Inserted ${data.length} documents into ${collectionName}`);
      }
    }
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();