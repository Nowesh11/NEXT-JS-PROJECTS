import dbConnect from '../../../lib/mongodb';
import PurchasedBooks from '../../../models/PurchasedBooks';
import PaymentSettings from '../../../models/PaymentSettings';
import Book from '../../../models/Book';
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

// Helper function to handle file upload
const handleFileUpload = async (req) => {
  const uploadDir = path.join(process.cwd(), 'public/uploads/orders');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ name, originalFilename, mimetype }) => {
      // Allow PDF and image files for payment proof
      return mimetype && (mimetype.includes('pdf') || mimetype.includes('image'));
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  const session = await getServerSession(req, res, authOptions);

  switch (method) {
    case 'GET':
      // Admin only - get all orders
      if (!session || !session.user || session.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Admin access required'
        });
      }

      try {
        const {
          page = 1,
          limit = 10,
          status,
          paymentMethod,
          orderType,
          search,
          sort = '-createdAt'
        } = req.query;

        const query = {};
        
        // Build search query
        if (search) {
          query.$or = [
            { orderId: { $regex: search, $options: 'i' } },
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { 'user.phone': { $regex: search, $options: 'i' } }
          ];
        }
        
        if (status) query.status = status;
        if (paymentMethod) query['payment.method'] = paymentMethod;
        if (orderType) query.orderType = orderType;

        const options = {
          page: parseInt(page),
          limit: parseInt(limit),
          sort,
          populate: [
            { path: 'books.bookId', select: 'title author coverImage' },
            { path: 'payment.verifiedBy', select: 'name email' }
          ]
        };

        const orders = await PurchasedBooks.paginate ? 
          await PurchasedBooks.paginate(query, options) :
          {
            docs: await PurchasedBooks.find(query)
              .populate('books.bookId', 'title author coverImage')
              .populate('payment.verifiedBy', 'name email')
              .sort(sort)
              .limit(parseInt(limit))
              .skip((parseInt(page) - 1) * parseInt(limit)),
            totalDocs: await PurchasedBooks.countDocuments(query),
            page: parseInt(page),
            limit: parseInt(limit)
          };

        // Get order statistics
        const stats = await PurchasedBooks.getOrderStats();

        res.status(200).json({
          success: true,
          data: {
            orders,
            stats
          }
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching orders',
          error: error.message
        });
      }
      break;

    case 'POST':
      try {
        const { fields, files } = await handleFileUpload(req);
        
        // Parse form data
        const orderData = {
          user: {
            name: fields.userName[0],
            email: fields.userEmail[0],
            phone: fields.userPhone[0]
          },
          books: JSON.parse(fields.books[0]),
          payment: {
            method: fields.paymentMethod[0]
          },
          shipping: {
            enabled: fields.shippingEnabled ? fields.shippingEnabled[0] === 'true' : false,
            address: fields.shippingAddress ? fields.shippingAddress[0] : ''
          },
          orderType: fields.orderType[0], // 'buy_now' or 'cart_checkout'
          notes: fields.notes ? fields.notes[0] : ''
        };

        // Validate required fields
        if (!orderData.user.name || !orderData.user.email || !orderData.user.phone) {
          return res.status(400).json({
            success: false,
            message: 'User name, email, and phone are required'
          });
        }

        if (!orderData.books || orderData.books.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'At least one book is required'
          });
        }

        // Validate books and get current prices
        const bookIds = orderData.books.map(book => book.bookId);
        const booksFromDB = await Book.find({ _id: { $in: bookIds }, status: 'active' });
        
        if (booksFromDB.length !== orderData.books.length) {
          return res.status(400).json({
            success: false,
            message: 'Some books are not available'
          });
        }

        // Update book data with current prices and titles
        orderData.books = orderData.books.map(orderBook => {
          const dbBook = booksFromDB.find(book => book._id.toString() === orderBook.bookId);
          return {
            ...orderBook,
            title: dbBook.title.en, // Use English title for order
            price: dbBook.discountedPrice || dbBook.price // Use current price
          };
        });

        // Get payment settings for instructions
        const paymentSettings = await PaymentSettings.getCurrentSettings();
        const paymentInstructions = paymentSettings.getPaymentInstructions(orderData.payment.method);
        
        orderData.payment.instructions = paymentInstructions.instructions;
        
        if (orderData.payment.method === 'fbx') {
          orderData.payment.bankDetails = {
            bankName: paymentInstructions.bankName,
            accountNumber: paymentInstructions.accountNumber,
            accountHolder: paymentInstructions.accountHolder
          };
        } else if (orderData.payment.method === 'epayum') {
          orderData.payment.epayumLink = paymentInstructions.link;
        }

        // Handle payment file upload
        if (files.paymentFile) {
          const paymentFile = Array.isArray(files.paymentFile) ? files.paymentFile[0] : files.paymentFile;
          
          // Create order-specific directory
          const orderDir = path.join(process.cwd(), 'public/uploads/orders', `temp_${Date.now()}`);
          if (!fs.existsSync(orderDir)) {
            fs.mkdirSync(orderDir, { recursive: true });
          }
          
          const fileName = `payment_${Date.now()}_${paymentFile.originalFilename}`;
          const newPath = path.join(orderDir, fileName);
          
          fs.renameSync(paymentFile.filepath, newPath);
          orderData.payment.file = `uploads/orders/temp_${Date.now()}/${fileName}`;
        }

        // Calculate shipping cost
        if (orderData.shipping.enabled) {
          orderData.shipping.cost = paymentSettings.calculateShipping(
            orderData.books.reduce((total, book) => total + (book.price * book.quantity), 0),
            true
          );
        }

        // Create the order
        const order = await PurchasedBooks.create(orderData);
        
        // Update the payment file path with actual order ID
        if (orderData.payment.file) {
          const oldPath = path.join(process.cwd(), 'public', orderData.payment.file);
          const newDir = path.join(process.cwd(), 'public/uploads/orders', order.orderId);
          const fileName = path.basename(orderData.payment.file);
          const newPath = path.join(newDir, fileName);
          
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }
          
          fs.renameSync(oldPath, newPath);
          
          // Remove temp directory
          const tempDir = path.dirname(oldPath);
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          // Update order with correct file path
          order.payment.file = `uploads/orders/${order.orderId}/${fileName}`;
          await order.save();
        }

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: {
            orderId: order.orderId,
            order: order
          }
        });
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
          success: false,
          message: 'Error creating order',
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