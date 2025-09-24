import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { id } = req.query;
    const { status, shippingInfo } = req.body;

    // Validate input
    const validStatuses = [
      'pending_verification',
      'verified',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses 
      });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const currentStatus = order.status;
    const validTransitions = {
      'pending_verification': ['verified', 'cancelled'],
      'verified': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['refunded'],
      'cancelled': [],
      'refunded': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${currentStatus} to ${status}`,
        validTransitions: validTransitions[currentStatus]
      });
    }

    let updatedOrder;

    // Handle different status updates
    switch (status) {
      case 'processing':
        updatedOrder = await order.updateStatus('processing', 'Order is being processed', session.user.id);
        break;
        
      case 'shipped':
        if (!shippingInfo) {
          return res.status(400).json({ message: 'Shipping information is required' });
        }
        
        // Validate shipping info
        const requiredShippingFields = ['carrier', 'trackingNumber'];
        for (const field of requiredShippingFields) {
          if (!shippingInfo[field]) {
            return res.status(400).json({ 
              message: `${field} is required for shipping` 
            });
          }
        }
        
        // Convert estimatedDelivery to Date if provided
        if (shippingInfo.estimatedDelivery) {
          shippingInfo.estimatedDelivery = new Date(shippingInfo.estimatedDelivery);
        }
        
        updatedOrder = await order.ship(shippingInfo, session.user.id);
        break;
        
      case 'delivered':
        updatedOrder = await order.deliver(session.user.id);
        break;
        
      case 'cancelled':
        updatedOrder = await order.updateStatus('cancelled', 'Order cancelled by admin', session.user.id);
        break;
        
      default:
        updatedOrder = await order.updateStatus(status, `Status updated to ${status}`, session.user.id);
    }

    // Populate the updated order for response
    const populatedOrder = await Order.findById(id)
      .populate('userId', 'name email')
      .lean();

    res.status(200).json({
      message: 'Order status updated successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}