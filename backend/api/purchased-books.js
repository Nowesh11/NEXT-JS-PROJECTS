import PurchasedBook from '../../models/PurchasedBook';
import PaymentSettings from '../../models/PaymentSettings';
import Book from '../../models/Book';
import dbConnect from '../../lib/mongodb';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;
  const session = await getSession({ req });

  await dbConnect();

  // Check authentication for all methods except GET with userId
  if (method !== 'GET' && !session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 10,
          status,
          email,
          userId,
          orderId,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Filter by status
        if (status) {
          query['shipping.status'] = status;
        }
        
        // Filter by user email
        if (email) {
          query['user.email'] = email;
        }
        
        // Filter by user ID - ensure users can only see their own orders
        if (userId) {
          // Validate that the requesting user can only access their own data
          if (!session && userId) {
            // For public access, require userId to match the session
            return res.status(401).json({ success: false, message: 'Authentication required to view purchase details' });
          }
          
          // For authenticated users, ensure they can only see their own data unless they're admin
          if (session && !session.user.isAdmin && session.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'You can only view your own purchase details' });
          }
          
          query['user.userId'] = mongoose.Types.ObjectId(userId);
        }
        
        // Filter by order ID
        if (orderId) {
          query.orderId = orderId;
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [purchasedBooks, total] = await Promise.all([
          PurchasedBook.find(query)
            .populate('books.bookId', 'title author coverImage')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          PurchasedBook.countDocuments(query)
        ]);
        
        // Calculate statistics
        const stats = {
          totalOrders: await PurchasedBook.countDocuments({}),
          pendingOrders: await PurchasedBook.countDocuments({ 'shipping.status': 'pending' }),
          processedOrders: await PurchasedBook.countDocuments({ 'shipping.status': { $in: ['processing', 'shipped', 'delivered'] } }),
          totalRevenue: await PurchasedBook.aggregate([
            { $group: { _id: null, total: { $sum: '$totals.total' } } }
          ]).then(result => result[0]?.total || 0)
        };
        
        res.status(200).json({
          success: true,
          data: purchasedBooks,
          stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch orders'
        });
      }
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

    case 'POST':
      try {
        const orderData = req.body;
        
        // Validate required fields
        if (!orderData.user?.name || !orderData.user?.email || !orderData.user?.phone) {
          return res.status(400).json({
            success: false,
            error: 'User name, email, and phone are required'
          });
        }
        
        if (!orderData.books || !Array.isArray(orderData.books) || orderData.books.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'At least one book is required'
          });
        }
        
        if (!orderData.payment?.method || !orderData.payment?.file) {
          return res.status(400).json({
            success: false,
            error: 'Payment method and transaction file are required'
          });
        }
        
        // Get payment settings for instructions
        const paymentSettings = await PaymentSettings.getSettings();
        
        // Set payment instructions based on method
        if (orderData.payment.method === 'epayum') {
          orderData.payment.instructions = paymentSettings.epayum.instructions;
        } else if (orderData.payment.method === 'fbx') {
          orderData.payment.instructions = paymentSettings.fbx.instructions;
        }
        
        // Validate and populate book details
        const bookDetails = [];
        let subtotal = 0;
        
        for (const bookItem of orderData.books) {
          const book = await Book.findById(bookItem.bookId);
          if (!book) {
            return res.status(400).json({
              success: false,
              error: `Book with ID ${bookItem.bookId} not found`
            });
          }
          
          if (book.status !== 'active') {
            return res.status(400).json({
              success: false,
              error: `Book "${book.title.en}" is not available`
            });
          }
          
          const itemSubtotal = book.price * bookItem.quantity;
          subtotal += itemSubtotal;
          
          bookDetails.push({
            bookId: book._id,
            title: book.title.en,
            quantity: bookItem.quantity,
            price: book.price,
            subtotal: itemSubtotal
          });
        }
        
        // Calculate shipping cost
        const shippingCost = orderData.shipping?.enabled ? paymentSettings.shippingCost : 0;
        
        // Create order
        const order = new PurchasedBook({
          ...orderData,
          books: bookDetails,
          totals: {
            subtotal,
            shippingCost,
            tax: 0,
            total: subtotal + shippingCost
          },
          payment: {
            ...orderData.payment,
            amount: subtotal + shippingCost
          },
          shipping: {
            ...orderData.shipping,
            cost: shippingCost
          },
          orderType: orderData.books.length === 1 ? 'individual' : 'bulk'
        });
        
        await order.save();
        
        res.status(201).json({
          success: true,
          data: order,
          message: 'Order created successfully'
        });
      } catch (error) {
        console.error('Error creating order:', error);
        
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create order'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
      break;
  }
}