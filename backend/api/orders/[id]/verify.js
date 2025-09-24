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
    const { isApproved, notes } = req.body;

    // Validate input
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be a boolean' });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is in correct state for verification
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ 
        message: 'Order payment has already been processed' 
      });
    }

    // Verify payment using the order method
    await order.verifyPayment(isApproved, notes, session.user.id);

    // Populate the updated order for response
    const updatedOrder = await Order.findById(id)
      .populate('userId', 'name email')
      .lean();

    res.status(200).json({
      message: `Payment ${isApproved ? 'approved' : 'rejected'} successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}