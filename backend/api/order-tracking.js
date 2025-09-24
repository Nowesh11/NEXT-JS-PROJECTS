import PurchasedBook from '../../models/PurchasedBook';
import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { orderId, email } = req.query;
        
        if (!orderId && !email) {
          return res.status(400).json({
            success: false,
            error: 'Order ID or email is required'
          });
        }
        
        let query = {};
        
        if (orderId) {
          query.orderId = orderId;
        }
        
        if (email) {
          query['user.email'] = email;
        }
        
        const orders = await PurchasedBook.find(query)
          .populate('books.bookId', 'title author coverImage')
          .sort({ createdAt: -1 })
          .lean();
        
        if (!orders || orders.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No orders found'
          });
        }
        
        // Format orders for tracking display
        const formattedOrders = orders.map(order => ({
          orderId: order.orderId,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          books: order.books.map(book => ({
            title: book.title,
            quantity: book.quantity,
            price: book.price,
            coverImage: book.bookId?.coverImage
          })),
          totals: order.totals,
          shipping: order.shipping,
          payment: {
            method: order.payment.method,
            amount: order.payment.amount
          },
          statusHistory: [
            {
              status: 'pending',
              date: order.createdAt,
              description: 'Order placed and payment received'
            },
            ...(order.status === 'review' || order.status === 'shipped' || order.status === 'delivered' ? [{
              status: 'review',
              date: order.updatedAt,
              description: 'Order under review'
            }] : []),
            ...(order.status === 'shipped' || order.status === 'delivered' ? [{
              status: 'shipped',
              date: order.updatedAt,
              description: 'Order shipped'
            }] : []),
            ...(order.status === 'delivered' ? [{
              status: 'delivered',
              date: order.updatedAt,
              description: 'Order delivered'
            }] : [])
          ]
        }));
        
        res.status(200).json({
          success: true,
          data: formattedOrders
        });
      } catch (error) {
        console.error('Error tracking orders:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to track orders'
        });
      }
      break;

    case 'PUT':
      try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
          return res.status(400).json({
            success: false,
            error: 'Order ID and status are required'
          });
        }
        
        const validStatuses = ['pending', 'review', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
          });
        }
        
        const order = await PurchasedBook.findOneAndUpdate(
          { orderId },
          { status, updatedAt: new Date() },
          { new: true }
        );
        
        if (!order) {
          return res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: order,
          message: 'Order status updated successfully'
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update order status'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
      break;
  }
}