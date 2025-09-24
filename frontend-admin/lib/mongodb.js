import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Database helper functions
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('tls_platform');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BOOKS: 'books',
  EBOOKS: 'ebooks',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  ACTIVITIES: 'activities'
};

// Database indexes setup
export async function setupIndexes() {
  try {
    const { db } = await connectToDatabase();
    
    // Users collection indexes
    await db.collection(COLLECTIONS.USERS).createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    // Books collection indexes
    await db.collection(COLLECTIONS.BOOKS).createIndexes([
      { key: { title: 'text', author: 'text', description: 'text' } },
      { key: { category: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { price: 1 } }
    ]);
    
    // E-books collection indexes
    await db.collection(COLLECTIONS.EBOOKS).createIndexes([
      { key: { title: 'text', author: 'text', description: 'text' } },
      { key: { category: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { price: 1 } }
    ]);
    
    // Orders collection indexes
    await db.collection(COLLECTIONS.ORDERS).createIndexes([
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { totalAmount: 1 } }
    ]);
    
    // Payments collection indexes
    await db.collection(COLLECTIONS.PAYMENTS).createIndexes([
      { key: { transactionId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    // Analytics collection indexes
    await db.collection(COLLECTIONS.ANALYTICS).createIndexes([
      { key: { date: -1 } },
      { key: { type: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Failed to setup database indexes:', error);
  }
}

// Data validation schemas
export const SCHEMAS = {
  USER: {
    email: { type: 'string', required: true },
    name: { type: 'string', required: true },
    role: { type: 'string', enum: ['admin', 'moderator', 'editor', 'user'], default: 'user' },
    status: { type: 'string', enum: ['active', 'inactive', 'suspended'], default: 'active' },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() }
  },
  
  BOOK: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    isbn: { type: 'string' },
    category: { type: 'string', required: true },
    description: { type: 'string' },
    price: { type: 'number', required: true },
    stock: { type: 'number', default: 0 },
    images: { type: 'array', default: [] },
    status: { type: 'string', enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() }
  },
  
  EBOOK: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    category: { type: 'string', required: true },
    description: { type: 'string' },
    price: { type: 'number', required: true },
    fileUrl: { type: 'string', required: true },
    fileSize: { type: 'number' },
    format: { type: 'string', enum: ['pdf', 'epub', 'mobi'], required: true },
    coverImage: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() }
  }
};

// Utility function to validate data against schema
export function validateData(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    
    if (rules.type === 'array' && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }
  
  return errors;
}