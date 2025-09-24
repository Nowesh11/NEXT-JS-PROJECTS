const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls_platform';
const DB_NAME = 'tls_platform';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BOOKS: 'books',
  EBOOKS: 'ebooks',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  ACTIVITIES: 'activities',
  PROJECTS: 'projects',
  TEAM: 'team',
  ANNOUNCEMENTS: 'announcements',
  WEBSITE_CONTENT: 'websitecontent'
};

// Setup database indexes and initial data
async function setupDatabase() {
  let client;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    console.log(`✅ Connected to database: ${DB_NAME}`);
    
    // Create collections and indexes
    await createIndexes(db);
    
    // Insert initial data
    await insertInitialData(db);
    
    // Seed sample data
    await seedSampleData(db);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Seed sample data for all models
async function seedSampleData(db) {
  console.log('🔄 Seeding sample data...');
  
  // Books data
  const booksData = [
    {
      title: {
        en: "Tamil Literature Classics",
        ta: "தமிழ் இலக்கிய சிறப்புகள்"
      },
      slug: "tamil-literature-classics",
      author: {
        en: "Dr. Kamil Zvelebil",
        ta: "டாக்டர் காமில் ஸ்வெலெபில்"
      },
      description: {
        en: "A comprehensive collection of Tamil literary works spanning centuries of rich cultural heritage.",
        ta: "பல நூற்றாண்டுகளின் வளமான கலாச்சார பாரம்பரியத்தை உள்ளடக்கிய தமிழ் இலக்கிய படைப்புகளின் விரிவான தொகுப்பு."
      },
      category: "literature",
      price: 599,
      originalPrice: 799,
      stock: 50,
      isbn: "978-81-234-5678-9",
      publisher: {
        en: "Tamil Heritage Publications",
        ta: "தமிழ் பாரம்பரிய வெளியீடுகள்"
      },
      language: "en",
      pages: 450,
      format: "hardcover",
      weight: 0.8,
      dimensions: "23x15x3 cm",
      status: "active",
      featured: true,
      tags: ["literature", "classics", "tamil", "heritage"],
      coverImage: "/uploads/books/tamil-literature-classics/cover.jpg",
      images: [
        "/uploads/books/tamil-literature-classics/image1.jpg",
        "/uploads/books/tamil-literature-classics/image2.jpg"
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: {
        en: "Modern Tamil Poetry",
        ta: "நவீன தமிழ் கவிதைகள்"
      },
      slug: "modern-tamil-poetry",
      author: {
        en: "Bharathidasan",
        ta: "பாரதிதாசன்"
      },
      description: {
        en: "A collection of contemporary Tamil poems that reflect modern themes and social consciousness.",
        ta: "நவீன கருப்பொருள்கள் மற்றும் சமூக உணர்வை பிரதிபலிக்கும் சமகால தமிழ் கவிதைகளின் தொகுப்பு."
      },
      category: "poetry",
      price: 399,
      originalPrice: 499,
      stock: 75,
      isbn: "978-81-234-5679-6",
      publisher: {
        en: "Modern Tamil Press",
        ta: "நவீன தமிழ் அச்சகம்"
      },
      language: "en",
      pages: 280,
      format: "paperback",
      weight: 0.4,
      dimensions: "20x13x2 cm",
      status: "active",
      featured: false,
      tags: ["poetry", "modern", "tamil", "social"],
      coverImage: "/uploads/books/modern-tamil-poetry/cover.jpg",
      images: ["/uploads/books/modern-tamil-poetry/image1.jpg"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Ebooks data
  const ebooksData = [
    {
      title: {
        en: "Digital Tamil Learning",
        ta: "டிஜிட்டல் தமிழ் கற்றல்"
      },
      slug: "digital-tamil-learning",
      author: {
        en: "Dr. A. K. Ramanujan",
        ta: "டாக்டர் ஏ. கே. ராமானுஜன்"
      },
      description: {
        en: "An interactive digital guide for learning Tamil language and literature in the modern age.",
        ta: "நவீன காலத்தில் தமிழ் மொழி மற்றும் இலக்கியத்தை கற்றுக்கொள்வதற்கான ஊடாடும் டிஜிட்டல் வழிகாட்டி."
      },
      category: "education",
      price: 199,
      originalPrice: 299,
      fileUrl: "/uploads/ebooks/digital-tamil-learning/book.pdf",
      coverImage: "/uploads/ebooks/digital-tamil-learning/cover.jpg",
      bookLanguage: "en",
      format: "PDF",
      fileSize: 15.5,
      pages: 200,
      downloadCount: 0,
      status: "active",
      featured: true,
      tags: ["education", "digital", "tamil", "learning"],
      previewUrl: "/uploads/ebooks/digital-tamil-learning/preview.pdf",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Projects data
  const projectsData = [
    {
      title: {
        en: "Tamil Digital Library Initiative",
        ta: "தமிழ் டிஜிட்டல் நூலக முன்முயற்சி"
      },
      slug: "tamil-digital-library-initiative",
      type: "project",
      bureau: "education-intellectual",
      description: {
        en: "A comprehensive digital library project to preserve and digitize Tamil literary works for future generations.",
        ta: "எதிர்கால சந்ததியினருக்காக தமிழ் இலக்கிய படைப்புகளை பாதுகாக்கவும் டிஜிட்டல்மயமாக்கவும் ஒரு விரிவான டிஜிட்டல் நூலக திட்டம்."
      },
      director: {
        en: "Dr. Rajesh Kumar",
        ta: "டாக்டர் ராஜேஷ் குமார்"
      },
      director_name: "Dr. Rajesh Kumar",
      director_email: "rajesh.kumar@tls.org",
      director_phone: "+91 98765 43210",
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      budget: 5000000,
      status: "active",
      priority: "high",
      progress: 45,
      objectives: {
        en: [
          "Digitize 10,000 Tamil literary works",
          "Create searchable database",
          "Develop mobile application",
          "Establish preservation protocols"
        ],
        ta: [
          "10,000 தமிழ் இலக்கிய படைப்புகளை டிஜிட்டல்மயமாக்குதல்",
          "தேடக்கூடிய தரவுத்தளத்தை உருவாக்குதல்",
          "மொபைல் பயன்பாட்டை உருவாக்குதல்",
          "பாதுகாப்பு நெறிமுறைகளை நிறுவுதல்"
        ]
      },
      teamMembers: [
        {
          name: "Priya Sharma",
          role: "Technical Lead",
          email: "priya.sharma@tls.org"
        }
      ],
      tags: ["digital", "library", "preservation", "technology"],
      images: ["/uploads/projects/tamil-digital-library/image1.jpg"],
      documents: ["/uploads/projects/tamil-digital-library/proposal.pdf"],
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Activities data
  const activitiesData = [
    {
      title: {
        en: "Tamil Poetry Competition 2024",
        ta: "தமிழ் கவிதை போட்டி 2024"
      },
      slug: "tamil-poetry-competition-2024",
      bureau: "arts-culture",
      description: {
        en: "Annual poetry competition celebrating Tamil literary excellence and encouraging new talent.",
        ta: "தமிழ் இலக்கிய சிறப்பை கொண்டாடும் மற்றும் புதிய திறமைகளை ஊக்குவிக்கும் வருடாந்திர கவிதை போட்டி."
      },
      director: {
        en: "Ms. Lakshmi Narayan",
        ta: "திருமதி லட்சுமி நாராயணன்"
      },
      director_name: "Ms. Lakshmi Narayan",
      director_email: "lakshmi.narayan@tls.org",
      director_phone: "+91 98765 43212",
      eventDate: new Date('2024-04-15'),
      registrationDeadline: new Date('2024-03-31'),
      venue: {
        en: "TLS Cultural Center, Chennai",
        ta: "TLS கலாச்சார மையம், சென்னை"
      },
      maxParticipants: 200,
      registrationFee: 100,
      prizes: {
        en: [
          "First Prize: ₹25,000 + Trophy",
          "Second Prize: ₹15,000 + Certificate",
          "Third Prize: ₹10,000 + Certificate"
        ],
        ta: [
          "முதல் பரிசு: ₹25,000 + கோப்பை",
          "இரண்டாம் பரிசு: ₹15,000 + சான்றிதழ்",
          "மூன்றாம் பரிசு: ₹10,000 + சான்றிதழ்"
        ]
      },
      rules: {
        en: [
          "Original Tamil poetry only",
          "Maximum 20 lines per poem",
          "Submit up to 3 poems",
          "Age limit: 16-35 years"
        ],
        ta: [
          "அசல் தமிழ் கவிதைகள் மட்டுமே",
          "ஒரு கவிதைக்கு அதிகபட்சம் 20 வரிகள்",
          "3 கவிதைகள் வரை சமர்ப்பிக்கலாம்",
          "வயது வரம்பு: 16-35 வருடங்கள்"
        ]
      },
      status: "active",
      featured: true,
      tags: ["poetry", "competition", "culture", "arts"],
      images: ["/uploads/activities/poetry-competition-2024/poster.jpg"],
      documents: ["/uploads/activities/poetry-competition-2024/rules.pdf"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Team data
  const teamData = [
    {
      name: {
        en: "Dr. Anand Krishnan",
        ta: "டாக்டர் ஆனந்த் கிருஷ்ணன்"
      },
      slug: "dr-anand-krishnan",
      role: {
        en: "President",
        ta: "தலைவர்"
      },
      position: "President",
      email: "anand.krishnan@tls.org",
      phone: "+91 98765 43200",
      bio: {
        en: "Dr. Anand Krishnan is a renowned Tamil scholar with over 20 years of experience in Tamil literature and cultural preservation.",
        ta: "டாக்டர் ஆனந்த் கிருஷ்ணன் தமிழ் இலக்கியம் மற்றும் கலாச்சார பாதுகாப்பில் 20 ஆண்டுகளுக்கும் மேலான அனுபவம் கொண்ட புகழ்பெற்ற தமிழ் அறிஞர்."
      },
      expertise: {
        en: ["Tamil Literature", "Cultural Studies", "Academic Research", "Heritage Preservation"],
        ta: ["தமிழ் இலக்கியம்", "கலாச்சார ஆய்வுகள்", "கல்வி ஆராய்ச்சி", "பாரம்பரிய பாதுகாப்பு"]
      },
      education: {
        en: "Ph.D. in Tamil Literature, University of Madras",
        ta: "தமிழ் இலக்கியத்தில் முனைவர் பட்டம், மதராஸ் பல்கலைக்கழகம்"
      },
      experience: "20+ years",
      joinDate: new Date('2020-01-01'),
      socialMedia: {
        linkedin: "https://linkedin.com/in/anandkrishnan",
        twitter: "https://twitter.com/anandkrishnan"
      },
      status: "active",
      featured: true,
      profileImage: "/uploads/team/anand-krishnan/profile.jpg",
      achievements: {
        en: [
          "Tamil Literary Excellence Award 2022",
          "Cultural Heritage Preservation Award 2021",
          "Published 15 research papers on Tamil literature"
        ],
        ta: [
          "தமிழ் இலக்கிய சிறப்பு விருது 2022",
          "கலாச்சார பாரம்பரிய பாதுகாப்பு விருது 2021",
          "தமிழ் இலக்கியம் குறித்து 15 ஆராய்ச்சி கட்டுரைகள் வெளியிட்டுள்ளார்"
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Announcements data
  const announcementsData = [
    {
      title: {
        en: "New Tamil Literature Course Launch",
        ta: "புதிய தமிழ் இலக்கிய பாடநெறி தொடக்கம்"
      },
      slug: "new-tamil-literature-course-launch",
      description: {
        en: "We are excited to announce the launch of our comprehensive Tamil Literature course for beginners and advanced learners.",
        ta: "தொடக்க மற்றும் மேம்பட்ட கற்றவர்களுக்கான எங்கள் விரிவான தமிழ் இலக்கிய பாடநெறியின் தொடக்கத்தை அறிவிப்பதில் மகிழ்ச்சி அடைகிறோம்."
      },
      content: {
        en: "Our new Tamil Literature course covers classical and modern works, poetry analysis, and cultural context. The course is designed for both beginners and advanced students with flexible scheduling options.",
        ta: "எங்கள் புதிய தமிழ் இலக்கிய பாடநெறி பாரம்பரிய மற்றும் நவீன படைப்புகள், கவிதை பகுப்பாய்வு மற்றும் கலாச்சார சூழலை உள்ளடக்கியது. இந்த பாடநெறி தொடக்க மற்றும் மேம்பட்ட மாணவர்கள் இருவருக்கும் நெகிழ்வான அட்டவணை விருப்பங்களுடன் வடிவமைக்கப்பட்டுள்ளது."
      },
      type: "academic",
      priority: "high",
      status: "published",
      publishDate: new Date('2024-01-20'),
      expiryDate: new Date('2024-03-20'),
      targetAudience: ["students", "educators", "general"],
      tags: ["course", "literature", "education", "tamil"],
      author: "Dr. Anand Krishnan",
      authorEmail: "anand.krishnan@tls.org",
      featured: true,
      images: ["/uploads/announcements/tamil-literature-course/banner.jpg"],
      attachments: ["/uploads/announcements/tamil-literature-course/syllabus.pdf"],
      notificationSent: false,
      emailSent: false,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Website Content data
  const websiteContentData = [
    {
      section: "hero",
      key: "main_title",
      content: {
        en: "Tamil Literature Society",
        ta: "தமிழ் இலக்கிய சங்கம்"
      },
      type: "text",
      status: "active",
      order: 1,
      metadata: {
        fontSize: "3xl",
        fontWeight: "bold",
        color: "primary"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      section: "hero",
      key: "subtitle",
      content: {
        en: "Preserving and Promoting Tamil Literary Heritage",
        ta: "தமிழ் இலக்கிய பாரம்பரியத்தை பாதுகாத்து மேம்படுத்துதல்"
      },
      type: "text",
      status: "active",
      order: 2,
      metadata: {
        fontSize: "lg",
        color: "secondary"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      section: "about",
      key: "title",
      content: {
        en: "About Tamil Literature Society",
        ta: "தமிழ் இலக்கிய சங்கம் பற்றி"
      },
      type: "text",
      status: "active",
      order: 1,
      metadata: {
        fontSize: "2xl",
        fontWeight: "bold"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert sample data
  const booksCollection = db.collection(COLLECTIONS.BOOKS);
  const ebooksCollection = db.collection(COLLECTIONS.EBOOKS);
  const projectsCollection = db.collection(COLLECTIONS.PROJECTS);
  const activitiesCollection = db.collection(COLLECTIONS.ACTIVITIES);
  const teamCollection = db.collection(COLLECTIONS.TEAM);
  const announcementsCollection = db.collection(COLLECTIONS.ANNOUNCEMENTS);
  const websiteContentCollection = db.collection(COLLECTIONS.WEBSITE_CONTENT);

  // Clear existing sample data
  await Promise.all([
    booksCollection.deleteMany({}),
    ebooksCollection.deleteMany({}),
    projectsCollection.deleteMany({}),
    activitiesCollection.deleteMany({}),
    teamCollection.deleteMany({}),
    announcementsCollection.deleteMany({}),
    websiteContentCollection.deleteMany({})
  ]);

  // Insert new sample data
  if (booksData.length > 0) {
    await booksCollection.insertMany(booksData);
    console.log(`  ✅ ${booksData.length} books seeded`);
  }

  if (ebooksData.length > 0) {
    await ebooksCollection.insertMany(ebooksData);
    console.log(`  ✅ ${ebooksData.length} ebooks seeded`);
  }

  if (projectsData.length > 0) {
    await projectsCollection.insertMany(projectsData);
    console.log(`  ✅ ${projectsData.length} projects seeded`);
  }

  if (activitiesData.length > 0) {
    await activitiesCollection.insertMany(activitiesData);
    console.log(`  ✅ ${activitiesData.length} activities seeded`);
  }

  if (teamData.length > 0) {
    await teamCollection.insertMany(teamData);
    console.log(`  ✅ ${teamData.length} team members seeded`);
  }

  if (announcementsData.length > 0) {
    await announcementsCollection.insertMany(announcementsData);
    console.log(`  ✅ ${announcementsData.length} announcements seeded`);
  }

  if (websiteContentData.length > 0) {
    await websiteContentCollection.insertMany(websiteContentData);
    console.log(`  ✅ ${websiteContentData.length} website content items seeded`);
  }

  console.log('✅ Sample data seeding completed');
}

// Create database indexes
async function createIndexes(db) {
  console.log('🔄 Creating database indexes...');
  
  try {
    // Users collection indexes
    await db.collection(COLLECTIONS.USERS).createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { role: 1 }, name: 'role_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { lastLoginAt: -1 }, name: 'last_login_desc' }
    ]);
    console.log('  ✅ Users indexes created');
    
    // Books collection indexes
    await db.collection(COLLECTIONS.BOOKS).createIndexes([
      { key: { title: 'text', author: 'text', description: 'text' }, name: 'text_search' },
      { key: { isbn: 1 }, unique: true, sparse: true, name: 'isbn_unique' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { price: 1 }, name: 'price_index' },
      { key: { stock: 1 }, name: 'stock_index' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { slug: 1 }, unique: true, name: 'slug_unique' }
    ]);
    console.log('  ✅ Books indexes created');
    
    // E-books collection indexes
    await db.collection(COLLECTIONS.EBOOKS).createIndexes([
      { key: { title: 'text', author: 'text', description: 'text' }, name: 'text_search' },
      { key: { title: 1, author: 1 }, unique: true, name: 'title_author_unique' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { format: 1 }, name: 'format_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { price: 1 }, name: 'price_index' },
      { key: { downloadCount: -1 }, name: 'download_count_desc' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { slug: 1 }, unique: true, name: 'slug_unique' }
    ]);
    console.log('  ✅ E-books indexes created');
    
    // Categories collection indexes
    await db.collection(COLLECTIONS.CATEGORIES).createIndexes([
      { key: { name: 1 }, unique: true, name: 'name_unique' },
      { key: { slug: 1 }, unique: true, name: 'slug_unique' },
      { key: { type: 1 }, name: 'type_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { order: 1 }, name: 'order_index' }
    ]);
    console.log('  ✅ Categories indexes created');
    
    // Orders collection indexes
    await db.collection(COLLECTIONS.ORDERS).createIndexes([
      { key: { userId: 1 }, name: 'user_index' },
      { key: { orderNumber: 1 }, unique: true, name: 'order_number_unique' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { totalAmount: 1 }, name: 'total_amount_index' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { paymentStatus: 1 }, name: 'payment_status_index' }
    ]);
    console.log('  ✅ Orders indexes created');
    
    // Payments collection indexes
    await db.collection(COLLECTIONS.PAYMENTS).createIndexes([
      { key: { transactionId: 1 }, unique: true, name: 'transaction_id_unique' },
      { key: { orderId: 1 }, name: 'order_index' },
      { key: { userId: 1 }, name: 'user_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { amount: 1 }, name: 'amount_index' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { paymentMethod: 1 }, name: 'payment_method_index' }
    ]);
    console.log('  ✅ Payments indexes created');
    
    // Analytics collection indexes
    await db.collection(COLLECTIONS.ANALYTICS).createIndexes([
      { key: { date: -1 }, name: 'date_desc' },
      { key: { type: 1 }, name: 'type_index' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { createdAt: -1 }, name: 'created_desc' }
    ]);
    console.log('  ✅ Analytics indexes created');
    
    // Activities collection indexes
    await db.collection(COLLECTIONS.ACTIVITIES).createIndexes([
      { key: { userId: 1 }, name: 'user_index' },
      { key: { type: 1 }, name: 'type_index' },
      { key: { entityType: 1 }, name: 'entity_type_index' },
      { key: { entityId: 1 }, name: 'entity_id_index' },
      { key: { createdAt: -1 }, name: 'created_desc' }
    ]);
    console.log('  ✅ Activities indexes created');
    
    console.log('✅ All database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
    throw error;
  }
}

// Insert initial data
async function insertInitialData(db) {
  console.log('🔄 Inserting initial data...');
  
  try {
    // Create admin user
    await createAdminUser(db);
    
    // Create default categories
    await createDefaultCategories(db);
    
    // Create system settings
    await createSystemSettings(db);
    
    console.log('✅ Initial data inserted successfully');
    
  } catch (error) {
    console.error('❌ Failed to insert initial data:', error);
    throw error;
  }
}

// Create admin user
async function createAdminUser(db) {
  const usersCollection = db.collection(COLLECTIONS.USERS);
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tls-platform.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'TLS Admin';
  
  // Check if admin user already exists
  const existingAdmin = await usersCollection.findOne({ email: adminEmail });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'books.read', 'books.write', 'books.delete',
        'ebooks.read', 'ebooks.write', 'ebooks.delete',
        'orders.read', 'orders.write', 'orders.delete',
        'analytics.read', 'settings.read', 'settings.write'
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      emailVerified: true,
      profile: {
        avatar: null,
        bio: 'System Administrator',
        phone: null,
        address: null
      }
    };
    
    await usersCollection.insertOne(adminUser);
    console.log(`  ✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`  ℹ️  Admin user already exists: ${adminEmail}`);
  }
}

// Create default categories
async function createDefaultCategories(db) {
  const categoriesCollection = db.collection(COLLECTIONS.CATEGORIES);
  
  const defaultCategories = [
    // Book categories
    { name: 'Fiction', slug: 'fiction', type: 'book', status: 'active', order: 1, description: 'Fiction books and novels' },
    { name: 'Non-Fiction', slug: 'non-fiction', type: 'book', status: 'active', order: 2, description: 'Non-fiction books' },
    { name: 'Science & Technology', slug: 'science-technology', type: 'book', status: 'active', order: 3, description: 'Science and technology books' },
    { name: 'History', slug: 'history', type: 'book', status: 'active', order: 4, description: 'Historical books' },
    { name: 'Biography', slug: 'biography', type: 'book', status: 'active', order: 5, description: 'Biographical books' },
    
    // E-book categories
    { name: 'Programming', slug: 'programming', type: 'ebook', status: 'active', order: 1, description: 'Programming and development e-books' },
    { name: 'Business', slug: 'business', type: 'ebook', status: 'active', order: 2, description: 'Business and entrepreneurship e-books' },
    { name: 'Self-Help', slug: 'self-help', type: 'ebook', status: 'active', order: 3, description: 'Self-help and personal development e-books' },
    { name: 'Education', slug: 'education', type: 'ebook', status: 'active', order: 4, description: 'Educational e-books' },
    { name: 'Reference', slug: 'reference', type: 'ebook', status: 'active', order: 5, description: 'Reference materials and guides' }
  ];
  
  for (const category of defaultCategories) {
    const existing = await categoriesCollection.findOne({ slug: category.slug, type: category.type });
    
    if (!existing) {
      await categoriesCollection.insertOne({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`  ✅ Category created: ${category.name} (${category.type})`);
    } else {
      console.log(`  ℹ️  Category already exists: ${category.name} (${category.type})`);
    }
  }
}

// Create system settings
async function createSystemSettings(db) {
  const settingsCollection = db.collection(COLLECTIONS.SETTINGS);
  
  const defaultSettings = {
    _id: 'system',
    general: {
      siteName: 'TLS Platform',
      siteDescription: 'Tamil Literature and Learning Platform',
      siteUrl: 'https://tls-platform.com',
      adminEmail: 'admin@tls-platform.com',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      logoUrl: null,
      faviconUrl: null
    },
    features: {
      enableRegistration: true,
      enableEmailVerification: true,
      enableSocialLogin: false,
      enableNotifications: true,
      enableAnalytics: true,
      enableCache: true,
      enableCompression: true
    },
    limits: {
      maxFileSize: 52428800, // 50MB
      maxFilesPerUpload: 10,
      maxUsersPerPage: 50,
      maxBooksPerPage: 20,
      maxEbooksPerPage: 20
    },
    email: {
      provider: 'sendgrid',
      fromEmail: 'noreply@tls-platform.com',
      fromName: 'TLS Platform',
      templates: {
        welcome: 'welcome-template',
        resetPassword: 'reset-password-template',
        orderConfirmation: 'order-confirmation-template'
      }
    },
    payment: {
      currency: 'INR',
      taxRate: 18, // GST 18%
      enableStripe: false,
      enablePayPal: false,
      enableRazorpay: true
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 86400, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 900, // 15 minutes
      enableCaptcha: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const existing = await settingsCollection.findOne({ _id: 'system' });
  
  if (!existing) {
    await settingsCollection.insertOne(defaultSettings);
    console.log('  ✅ System settings created');
  } else {
    console.log('  ℹ️  System settings already exist');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  setupDatabase,
  createIndexes,
  insertInitialData,
  COLLECTIONS
};