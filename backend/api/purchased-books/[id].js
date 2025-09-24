import dbConnect from '../../../lib/mongodb';
import PurchasedBooks from '../../../models/PurchasedBooks';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { id } } = req;
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated and is admin for most operations
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Admin access required'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const order = await PurchasedBooks.findById(id)
          .populate('books.bookId', 'title author coverImage price')
          .populate('payment.verifiedBy', 'name email')
          .populate('statusHistory.updatedBy', 'name email');

        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        res.status(200).json({
          success: true,
          data: order
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching order',
          error: error.message
        });
      }
      break;

    case 'PUT':
      try {
        const { status, notes, adminNotes, shippingStatus, trackingNumber } = req.body;

        const order = await PurchasedBooks.findById(id);
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Update fields if provided
        if (status && status !== order.status) {
          await order.updateStatus(status, session.user.id, notes);
        }

        if (adminNotes !== undefined) {
          order.adminNotes = adminNotes;
        }

        if (shippingStatus && order.shipping.enabled) {
          order.shipping.shippingStatus = shippingStatus;
          
          if (shippingStatus === 'shipped' && !order.shipping.shippedAt) {
            order.shipping.shippedAt = new Date();
          }
          
          if (shippingStatus === 'delivered' && !order.shipping.deliveredAt) {
            order.shipping.deliveredAt = new Date();
          }
        }

        if (trackingNumber && order.shipping.enabled) {
          order.shipping.trackingNumber = trackingNumber;
        }

        await order.save();

        // Populate the updated order
        const updatedOrder = await PurchasedBooks.findById(id)
          .populate('books.bookId', 'title author coverImage price')
          .populate('payment.verifiedBy', 'name email')
          .populate('statusHistory.updatedBy', 'name email');

        res.status(200).json({
          success: true,
          message: 'Order updated successfully',
          data: updatedOrder
        });
      } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
          success: false,
          message: 'Error updating order',
          error: error.message
        });
      }
      break;

    case 'DELETE':
      try {
        const order = await PurchasedBooks.findById(id);
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        // Only allow deletion of pending or cancelled orders
        if (!['pending', 'cancelled'].includes(order.status)) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete orders that are not pending or cancelled'
          });
        }

        await PurchasedBooks.findByIdAndDelete(id);

        res.status(200).json({
          success: true,
          message: 'Order deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
          success: false,
          message: 'Error deleting order',
          error: error.message
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}