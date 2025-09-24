import dbConnect from '../../lib/mongodb';
import Order from '../../models/Order';
import PaymentSettings from '../../models/PaymentSettings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      
      // If user is not admin, only show their orders
      if (session.user.role !== 'admin') {
        query.userId = session.user.id;
      }
      
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Order.countDocuments(query);

      res.status(200).json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  else if (req.method === 'POST') {
      try {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const {
          items,
          shippingAddress,
          billingAddress,
          paymentMethod,
          transactionProof,
          notes,
          pricing
        } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Order items are required'
          });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
          return res.status(400).json({
            success: false,
            error: 'Shipping address is required'
          });
        }

        if (!paymentMethod) {
          return res.status(400).json({
            success: false,
            error: 'Payment method is required'
          });
        }

        if (!transactionProof) {
          return res.status(400).json({
            success: false,
            error: 'Transaction proof is required'
          });
        }

        // Validate payment method exists and is active
        const paymentSettings = await PaymentSettings.getSettings();
        const activePaymentMethods = paymentSettings.getActivePaymentMethods();
        const selectedMethod = activePaymentMethods.find(method => method.type === paymentMethod);
        
        if (!selectedMethod) {
          return res.status(400).json({
            success: false,
            error: 'Invalid payment method'
          });
        }

        // Generate order number
        const orderCount = await Order.countDocuments();
        const orderNumber = `TLS${Date.now().toString().slice(-6)}${(orderCount + 1).toString().padStart(3, '0')}`;

        // Create order
        const order = await Order.create({
          orderNumber,
          userId: session.user.id,
          items: items.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            type: item.type
          })),
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          paymentMethod: {
            type: paymentMethod,
            name: selectedMethod.name,
            accountNumber: selectedMethod.accountNumber,
            accountName: selectedMethod.accountName,
            bankName: selectedMethod.bankName
          },
          transactionProof,
          notes: notes || '',
          pricing: {
            subtotal: pricing.subtotal || 0,
            tax: pricing.tax || 0,
            shipping: pricing.shipping || 0,
            total: pricing.total || 0
          },
          status: 'pending_verification',
          paymentStatus: 'pending',
          verificationDeadline: new Date(Date.now() + (paymentSettings.general?.verificationTimeout || 24) * 60 * 60 * 1000)
        });

        // Populate the created order
        const populatedOrder = await Order.findById(order._id)
          .populate('userId', 'name email')
          .populate('items.productId');

        res.status(201).json({
          success: true,
          data: populatedOrder,
          message: 'Order created successfully'
        });
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create order'
        });
      }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}