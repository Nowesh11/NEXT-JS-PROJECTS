import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Import all models
import Book from '../models/Book.js';
import Ebook from '../models/Ebook.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
// const Initiative = require('../models/Initiative'); // Not needed for current seed data
import Team from '../models/Team.js';
import Announcement from '../models/Announcement.js';
import Poster from '../models/Poster.js';
import User from '../models/User.js';
import Form from '../models/Form.js';
import FormField from '../models/FormField.js';
import Slideshow from '../models/Slideshow.js';
import Slide from '../models/Slide.js';
import WebsiteContent from '../models/WebsiteContent.js';

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tls_platform';

// Helper function to generate slug
const generateSlug = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Seed data for Books
const booksData = [
  {
    title: {
      en: "Tamil Literature Classics",
      ta: "தமிழ் இலக்கிய சிறப்புகள்"
    },
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
    language: "tamil",
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
    ]
  },
  {
    title: {
      en: "Modern Tamil Poetry",
      ta: "நவீன தமிழ் கவிதைகள்"
    },
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
    language: "tamil",
    pages: 280,
    format: "paperback",
    weight: 0.4,
    dimensions: "20x13x2 cm",
    status: "active",
    featured: false,
    tags: ["poetry", "modern", "tamil", "social"],
    coverImage: "/uploads/books/modern-tamil-poetry/cover.jpg",
    images: ["/uploads/books/modern-tamil-poetry/image1.jpg"]
  },
  {
    title: {
      en: "Tamil Grammar Essentials",
      ta: "தமிழ் இலக்கண அடிப்படைகள்"
    },
    author: {
      en: "Prof. S. Vaiyapuri Pillai",
      ta: "பேராசிரியர் எஸ். வையாபுரி பிள்ளை"
    },
    description: {
      en: "A comprehensive guide to Tamil grammar for students and language enthusiasts.",
      ta: "மாணவர்கள் மற்றும் மொழி ஆர்வலர்களுக்கான தமிழ் இலக்கணத்தின் விரிவான வழிகாட்டி."
    },
    category: "language",
    price: 299,
    originalPrice: 399,
    stock: 100,
    isbn: "978-81-234-5680-2",
    publisher: {
      en: "Educational Publishers",
      ta: "கல்வி வெளியீட்டாளர்கள்"
    },
    language: "tamil",
    pages: 350,
    format: "paperback",
    weight: 0.5,
    dimensions: "22x14x2.5 cm",
    status: "active",
    featured: true,
    tags: ["grammar", "education", "tamil", "language"],
    coverImage: "/uploads/books/tamil-grammar-essentials/cover.jpg",
    images: []
  }
];

// Seed data for Ebooks
const ebooksData = [
  {
    title: {
      en: "Digital Tamil Learning",
      ta: "டிஜிட்டல் தமிழ் கற்றல்"
    },
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
    bookLanguage: "tamil",
    format: "PDF",
    fileSize: 15.5,
    pages: 200,
    downloadCount: 0,
    status: "active",
    featured: true,
    tags: ["education", "digital", "tamil", "learning"],
    previewUrl: "/uploads/ebooks/digital-tamil-learning/preview.pdf"
  },
  {
    title: {
      en: "Tamil Cultural Heritage",
      ta: "தமிழ் கலாச்சார பாரம்பரியம்"
    },
    author: {
      en: "Dr. M. Varadarajan",
      ta: "டாக்டர் எம். வரதராஜன்"
    },
    description: {
      en: "Explore the rich cultural heritage and traditions of Tamil civilization through this comprehensive ebook.",
      ta: "இந்த விரிவான மின்னூல் மூலம் தமிழ் நாகரிகத்தின் வளமான கலாச்சார பாரம்பரியம் மற்றும் பாரம்பரியங்களை ஆராயுங்கள்."
    },
    category: "culture",
    price: 149,
    originalPrice: 199,
    fileUrl: "/uploads/ebooks/tamil-cultural-heritage/book.pdf",
    coverImage: "/uploads/ebooks/tamil-cultural-heritage/cover.jpg",
    bookLanguage: "tamil",
    format: "PDF",
    fileSize: 12.3,
    pages: 180,
    downloadCount: 0,
    status: "active",
    featured: false,
    tags: ["culture", "heritage", "tamil", "tradition"],
    previewUrl: "/uploads/ebooks/tamil-cultural-heritage/preview.pdf"
  }
];

// Seed data for Projects
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
      },
      {
        name: "Arjun Patel",
        role: "Content Curator",
        email: "arjun.patel@tls.org"
      }
    ],
    tags: ["digital", "library", "preservation", "technology"],
    images: ["/uploads/projects/tamil-digital-library/image1.jpg"],
    documents: ["/uploads/projects/tamil-digital-library/proposal.pdf"],
    featured: true
  },
  {
    title: {
      en: "Community Tamil Learning Program",
      ta: "சமூக தமிழ் கற்றல் திட்டம்"
    },
    slug: "community-tamil-learning-program",
    type: "project",
    bureau: "language-literature",
    description: {
      en: "A community-based program to teach Tamil language and literature to people of all ages.",
      ta: "எல்லா வயதினருக்கும் தமிழ் மொழி மற்றும் இலக்கியத்தை கற்பிக்கும் சமூக அடிப்படையிலான திட்டம்."
    },
    director: {
      en: "Prof. Meera Devi",
      ta: "பேராசிரியர் மீரா தேவி"
    },
    director_name: "Prof. Meera Devi",
    director_email: "meera.devi@tls.org",
    director_phone: "+91 98765 43211",
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    budget: 2500000,
    status: "active",
    priority: "medium",
    progress: 60,
    objectives: {
      en: [
        "Establish 50 learning centers",
        "Train 200 volunteer teachers",
        "Reach 5000 students",
        "Develop curriculum materials"
      ],
      ta: [
        "50 கற்றல் மையங்களை நிறுவுதல்",
        "200 தன்னார்வ ஆசிரியர்களுக்கு பயிற்சி அளித்தல்",
        "5000 மாணவர்களை அடைதல்",
        "பாடத்திட்ட பொருட்களை உருவாக்குதல்"
      ]
    },
    teamMembers: [
      {
        name: "Karthik Raj",
        role: "Program Coordinator",
        email: "karthik.raj@tls.org"
      }
    ],
    tags: ["education", "community", "language", "learning"],
    images: ["/uploads/projects/community-tamil-learning/image1.jpg"],
    documents: [],
    featured: false
  }
];

// Seed data for Activities
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
    documents: ["/uploads/activities/poetry-competition-2024/rules.pdf"]
  }
];

// Seed data for Team Members
const teamData = [
  {
    name: {
      en: "Dr. Anand Krishnan",
      ta: "டாக்டர் ஆனந்த் கிருஷ்ணன்"
    },
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
    }
  },
  {
    name: {
      en: "Ms. Priya Selvam",
      ta: "திருமதி பிரியா செல்வம்"
    },
    role: {
      en: "Vice President",
      ta: "துணைத் தலைவர்"
    },
    position: "Vice President",
    email: "priya.selvam@tls.org",
    phone: "+91 98765 43201",
    bio: {
      en: "Ms. Priya Selvam is an accomplished educator and cultural activist dedicated to promoting Tamil language and arts.",
      ta: "திருமதி பிரியா செல்வம் தமிழ் மொழி மற்றும் கலைகளை மேம்படுத்துவதில் அர்ப்பணிப்புடன் செயல்படும் திறமையான கல்வியாளர் மற்றும் கலாச்சார ஆர்வலர்."
    },
    expertise: {
      en: ["Education Management", "Cultural Programs", "Community Outreach", "Arts Promotion"],
      ta: ["கல்வி மேலாண்மை", "கலாச்சார நிகழ்ச்சிகள்", "சமூக அணுகல்", "கலை மேம்பாடு"]
    },
    education: {
      en: "M.A. in Tamil Literature, Annamalai University",
      ta: "தமிழ் இலக்கியத்தில் முதுகலை, அண்ணாமலை பல்கலைக்கழகம்"
    },
    experience: "15+ years",
    joinDate: new Date('2020-06-01'),
    socialMedia: {
      linkedin: "https://linkedin.com/in/priyaselvam"
    },
    status: "active",
    featured: true,
    profileImage: "/uploads/team/priya-selvam/profile.jpg",
    achievements: {
      en: [
        "Excellence in Education Award 2023",
        "Community Service Recognition 2022"
      ],
      ta: [
        "கல்வியில் சிறப்பு விருது 2023",
        "சமூக சேவை அங்கீகாரம் 2022"
      ]
    }
  }
];

// Seed data for Announcements
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
    likes: 0
  },
  {
    title: {
      en: "Annual Cultural Festival 2024",
      ta: "வருடாந்திர கலாச்சார விழா 2024"
    },
    slug: "annual-cultural-festival-2024",
    description: {
      en: "Join us for our grand annual cultural festival celebrating Tamil arts, literature, and traditions.",
      ta: "தமிழ் கலைகள், இலக்கியம் மற்றும் பாரம்பரியங்களை கொண்டாடும் எங்கள் பிரமாண்டமான வருடாந்திர கலாச்சார விழாவில் எங்களுடன் சேருங்கள்."
    },
    content: {
      en: "Our annual cultural festival will feature traditional dance performances, poetry recitations, art exhibitions, and food stalls. The event will be held over three days with various competitions and workshops.",
      ta: "எங்கள் வருடாந்திர கலாச்சார விழாவில் பாரம்பரிய நடன நிகழ்ச்சிகள், கவிதை பாராயணம், கலை கண்காட்சிகள் மற்றும் உணவு கடைகள் இடம்பெறும். இந்த நிகழ்வு மூன்று நாட்களுக்கு பல்வேறு போட்டிகள் மற்றும் பட்டறைகளுடன் நடைபெறும்."
    },
    type: "event",
    priority: "high",
    status: "published",
    publishDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-04-30'),
    targetAudience: ["general", "students", "families"],
    tags: ["festival", "culture", "arts", "event"],
    author: "Ms. Priya Selvam",
    authorEmail: "priya.selvam@tls.org",
    featured: true,
    images: ["/uploads/announcements/cultural-festival-2024/poster.jpg"],
    attachments: [],
    notificationSent: false,
    emailSent: false,
    views: 0,
    likes: 0
  }
];

// Seed data for Website Content
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
    }
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
    }
  },
  {
    section: "hero",
    key: "description",
    content: {
      en: "Join us in our mission to preserve, promote, and celebrate the rich heritage of Tamil literature and culture for future generations.",
      ta: "எதிர்கால சந்ததியினருக்காக தமிழ் இலக்கியம் மற்றும் கலாச்சாரத்தின் வளமான பாரம்பரியத்தை பாதுகாக்க, மேம்படுத்த மற்றும் கொண்டாட எங்கள் நோக்கத்தில் எங்களுடன் சேருங்கள்."
    },
    type: "text",
    status: "active",
    order: 3,
    metadata: {
      fontSize: "base"
    }
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
    }
  },
  {
    section: "about",
    key: "content",
    content: {
      en: "The Tamil Literature Society is a non-profit organization dedicated to preserving, promoting, and celebrating Tamil literary heritage. Founded with the vision of keeping Tamil literature alive for future generations, we organize cultural events, educational programs, and literary competitions.",
      ta: "தமிழ் இலக்கிய சங்கம் தமிழ் இலக்கிய பாரம்பரியத்தை பாதுகாக்க, மேம்படுத்த மற்றும் கொண்டாட அர்ப்பணிக்கப்பட்ட ஒரு இலாப நோக்கமற்ற அமைப்பாகும். எதிர்கால சந்ததியினருக்காக தமிழ் இலக்கியத்தை உயிருடன் வைத்திருக்கும் நோக்கத்துடன் நிறுவப்பட்ட நாங்கள் கலாச்சார நிகழ்வுகள், கல்வி திட்டங்கள் மற்றும் இலக்கிய போட்டிகளை ஏற்பாடு செய்கிறோம்."
    },
    type: "text",
    status: "active",
    order: 2,
    metadata: {}
  },
  {
    section: "features",
    key: "feature_1_title",
    content: {
      en: "Digital Library",
      ta: "டிஜிட்டல் நூலகம்"
    },
    type: "text",
    status: "active",
    order: 1,
    metadata: {
      icon: "library"
    }
  },
  {
    section: "features",
    key: "feature_1_description",
    content: {
      en: "Access thousands of Tamil books and manuscripts in our comprehensive digital library.",
      ta: "எங்கள் விரிவான டிஜிட்டல் நூலகத்தில் ஆயிரக்கணக்கான தமிழ் புத்தகங்கள் மற்றும் கையெழுத்துப் பிரதிகளை அணுகவும்."
    },
    type: "text",
    status: "active",
    order: 2,
    metadata: {}
  },
  {
    section: "features",
    key: "feature_2_title",
    content: {
      en: "Cultural Events",
      ta: "கலாச்சார நிகழ்வுகள்"
    },
    type: "text",
    status: "active",
    order: 3,
    metadata: {
      icon: "calendar"
    }
  },
  {
    section: "features",
    key: "feature_2_description",
    content: {
      en: "Participate in poetry competitions, literary discussions, and cultural festivals.",
      ta: "கவிதை போட்டிகள், இலக்கிய விவாதங்கள் மற்றும் கலாச்சார விழாக்களில் பங்கேற்கவும்."
    },
    type: "text",
    status: "active",
    order: 4,
    metadata: {}
  },
  {
    section: "features",
    key: "feature_3_title",
    content: {
      en: "Educational Programs",
      ta: "கல்வி திட்டங்கள்"
    },
    type: "text",
    status: "active",
    order: 5,
    metadata: {
      icon: "education"
    }
  },
  {
    section: "features",
    key: "feature_3_description",
    content: {
      en: "Learn Tamil language and literature through our structured courses and workshops.",
      ta: "எங்கள் கட்டமைக்கப்பட்ட பாடநெறிகள் மற்றும் பட்டறைகள் மூலம் தமிழ் மொழி மற்றும் இலக்கியத்தை கற்றுக்கொள்ளுங்கள்."
    },
    type: "text",
    status: "active",
    order: 6,
    metadata: {}
  }
];

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🔄 Clearing existing data...');
    await Promise.all([
      Book.deleteMany({}),
      Ebook.deleteMany({}),
      Project.deleteMany({}),
      Activity.deleteMany({}),
      Team.deleteMany({}),
      Announcement.deleteMany({}),
      WebsiteContent.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Seed Books
    console.log('🔄 Seeding Books...');
    for (const bookData of booksData) {
      bookData.slug = generateSlug(bookData.title.en);
      const book = new Book(bookData);
      await book.save();
      console.log(`  ✅ Book created: ${bookData.title.en}`);
    }

    // Seed Ebooks
    console.log('🔄 Seeding Ebooks...');
    for (const ebookData of ebooksData) {
      ebookData.slug = generateSlug(ebookData.title.en);
      const ebook = new Ebook(ebookData);
      await ebook.save();
      console.log(`  ✅ Ebook created: ${ebookData.title.en}`);
    }

    // Seed Projects
    console.log('🔄 Seeding Projects...');
    for (const projectData of projectsData) {
      const project = new Project(projectData);
      await project.save();
      console.log(`  ✅ Project created: ${projectData.title.en}`);
    }

    // Seed Activities
    console.log('🔄 Seeding Activities...');
    for (const activityData of activitiesData) {
      const activity = new Activity(activityData);
      await activity.save();
      console.log(`  ✅ Activity created: ${activityData.title.en}`);
    }

    // Seed Team Members
    console.log('🔄 Seeding Team Members...');
    for (const teamMemberData of teamData) {
      teamMemberData.slug = generateSlug(teamMemberData.name.en);
      const teamMember = new Team(teamMemberData);
      await teamMember.save();
      console.log(`  ✅ Team member created: ${teamMemberData.name.en}`);
    }

    // Seed Announcements
    console.log('🔄 Seeding Announcements...');
    for (const announcementData of announcementsData) {
      const announcement = new Announcement(announcementData);
      await announcement.save();
      console.log(`  ✅ Announcement created: ${announcementData.title.en}`);
    }

    // Seed Website Content
    console.log('🔄 Seeding Website Content...');
    for (const contentData of websiteContentData) {
      const content = new WebsiteContent(contentData);
      await content.save();
      console.log(`  ✅ Website content created: ${contentData.section}/${contentData.key}`);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedDatabase();