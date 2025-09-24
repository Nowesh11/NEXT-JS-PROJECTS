import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';

// Mock orders data (same as in index.js for consistency)
const mockOrders = [
  {
    id: 'ORD-2023-001',
    userId: 'user1',
    orderNumber: 'TLS-20231201-001',
    status: 'completed',
    items: [
      {
        type: 'ebook',
        itemId: '1',
        title: 'Tamil Literature Classics',
        price: 15.99,
        discountedPrice: 12.79,
        quantity: 1,
        downloadUrl: '/downloads/tamil-classics.pdf'
      },
      {
        type: 'ebook',
        itemId: '3',
        title: 'Tamil Grammar Guide',
        price: 18.99,
        discountedPrice: 15.76,
        quantity: 1,
        downloadUrl: '/downloads/grammar-guide.pdf'
      }
    ],
    pricing: {
      subtotal: 28.55,
      discount: 6.43,
      tax: 2.28,
      shipping: 0.00,
      total: 30.83
    },
    customer: {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-9876543210'
    },
    billing: {
      address: '123 Main Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India'
    },
    shipping: {
      address: '123 Main Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India',
      method: 'digital'
    },
    payment: {
      method: 'razorpay',
      transactionId: 'pay_MkL9J8K7H6G5F4',
      status: 'paid',
      paidAt: '2023-12-01T10:30:00Z'
    },
    fulfillment: {
      status: 'fulfilled',
      fulfilledAt: '2023-12-01T10:31:00Z',
      downloads: [
        {
          itemId: '1',
          downloadedAt: '2023-12-01T11:15:00Z',
          downloadCount: 3
        },
        {
          itemId: '3',
          downloadedAt: '2023-12-01T12:30:00Z',
          downloadCount: 1
        }
      ]
    },
    notes: 'Customer requested Tamil literature collection',
    createdAt: '2023-12-01T10:25:00Z',
    updatedAt: '2023-12-01T12:30:00Z'
  },
  {
    id: 'ORD-2023-002',
    userId: 'user2',
    orderNumber: 'TLS-20231202-002',
    status: 'processing',
    items: [
      {
        type: 'poster',
        itemId: '1',
        title: 'Tamil Heritage Mandala',
        price: 25.99,
        discountedPrice: 23.39,
        quantity: 1,
        printOptions: {
          size: '24x36',
          paper: 'canvas',
          frame: 'black'
        }
      }
    ],
    pricing: {
      subtotal: 23.39,
      discount: 2.60,
      tax: 1.87,
      shipping: 5.99,
      total: 31.25
    },
    customer: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91-9876543211'
    },
    billing: {
      address: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    },
    shipping: {
      address: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      method: 'standard',
      trackingNumber: 'TRK123456789'
    },
    payment: {
      method: 'stripe',
      transactionId: 'pi_3N8K7L2eZvKYlo2C0M5N6P8Q',
      status: 'paid',
      paidAt: '2023-12-02T14:20:00Z'
    },
    fulfillment: {
      status: 'printing',
      estimatedDelivery: '2023-12-08T00:00:00Z'
    },
    createdAt: '2023-12-02T14:15:00Z',
    updatedAt: '2023-12-02T16:45:00Z'
  },
  {
    id: 'ORD-2023-003',
    userId: 'user1',
    orderNumber: 'TLS-20231203-003',
    status: 'pending',
    items: [
      {
        type: 'ebook',
        itemId: '2',
        title: 'Modern Tamil Poetry',
        price: 12.99,
        discountedPrice: 12.99,
        quantity: 1
      }
    ],
    pricing: {
      subtotal: 12.99,
      discount: 0.00,
      tax: 1.04,
      shipping: 0.00,
      total: 14.03
    },
    customer: {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-9876543210'
    },
    billing: {
      address: '123 Main Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India'
    },
    payment: {
      method: 'razorpay',
      status: 'pending'
    },
    fulfillment: {
      status: 'awaiting_payment'
    },
    createdAt: '2023-12-03T09:30:00Z',
    updatedAt: '2023-12-03T09:30:00Z'
  }
];

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  try {
    await connectToDatabase();

    switch (method) {
      case 'GET':
        return handleGet(req, res, id);
      case 'PUT':
        return handlePut(req, res, id);
      case 'PATCH':
        return handlePatch(req, res, id);
      case 'DELETE':
        return handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Order API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get single order
async function handleGet(req, res, id) {
  try {
    const order = mockOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Add computed fields
    const orderWithComputedFields = {
      ...order,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      savingsAmount: order.pricing.discount,
      savingsPercentage: order.pricing.subtotal > 0 
        ? ((order.pricing.discount / (order.pricing.subtotal + order.pricing.discount)) * 100).toFixed(1)
        : 0,
      isDigitalOnly: order.items.every(item => item.type === 'ebook'),
      hasPhysicalItems: order.items.some(item => item.type === 'poster'),
      canDownload: order.status === 'completed' && order.payment.status === 'paid',
      canCancel: ['pending', 'processing'].includes(order.status),
      daysSinceOrder: Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24))
    };

    return res.status(200).json({
      success: true,
      data: orderWithComputedFields
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
}

// Update order (full update)
async function handlePut(req, res, id) {
  try {
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const {
      status,
      customer,
      billing,
      shipping,
      payment,
      fulfillment,
      notes
    } = req.body;

    // Validation for status transitions
    const currentOrder = mockOrders[orderIndex];
    const validStatusTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (status && !validStatusTransitions[currentOrder.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentOrder.status} to ${status}`
      });
    }

    // Update order
    const updatedOrder = {
      ...currentOrder,
      ...(status && { status }),
      ...(customer && { customer: { ...currentOrder.customer, ...customer } }),
      ...(billing && { billing: { ...currentOrder.billing, ...billing } }),
      ...(shipping && { shipping: { ...currentOrder.shipping, ...shipping } }),
      ...(payment && { payment: { ...currentOrder.payment, ...payment } }),
      ...(fulfillment && { fulfillment: { ...currentOrder.fulfillment, ...fulfillment } }),
      ...(notes !== undefined && { notes }),
      updatedAt: new Date().toISOString()
    };

    // Auto-update fulfillment status based on order status
    if (status === 'completed' && !fulfillment?.status) {
      updatedOrder.fulfillment.status = 'fulfilled';
      updatedOrder.fulfillment.fulfilledAt = new Date().toISOString();
    }

    mockOrders[orderIndex] = updatedOrder;

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
}

// Partial update order (PATCH)
async function handlePatch(req, res, id) {
  try {
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { action, ...updateData } = req.body;
    let updatedOrder = { ...mockOrders[orderIndex] };

    // Handle specific actions
    switch (action) {
      case 'confirm_payment':
        if (updatedOrder.payment.status !== 'paid') {
          updatedOrder.payment.status = 'paid';
          updatedOrder.payment.paidAt = new Date().toISOString();
          updatedOrder.status = 'processing';
          updatedOrder.fulfillment.status = 'processing';
        }
        break;

      case 'cancel':
        if (['pending', 'processing'].includes(updatedOrder.status)) {
          updatedOrder.status = 'cancelled';
          updatedOrder.fulfillment.status = 'cancelled';
          updatedOrder.fulfillment.cancelledAt = new Date().toISOString();
          updatedOrder.fulfillment.cancellationReason = updateData.reason || 'Customer request';
        } else {
          return res.status(400).json({
            success: false,
            message: 'Order cannot be cancelled in current status'
          });
        }
        break;

      case 'fulfill':
        if (updatedOrder.status === 'processing') {
          updatedOrder.status = 'completed';
          updatedOrder.fulfillment.status = 'fulfilled';
          updatedOrder.fulfillment.fulfilledAt = new Date().toISOString();
          
          // For digital items, generate download URLs
          updatedOrder.items.forEach(item => {
            if (item.type === 'ebook' && !item.downloadUrl) {
              item.downloadUrl = `/downloads/${item.itemId}-${item.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            }
          });
        }
        break;

      case 'add_tracking':
        if (updateData.trackingNumber) {
          updatedOrder.shipping.trackingNumber = updateData.trackingNumber;
          updatedOrder.shipping.carrier = updateData.carrier || 'Standard Shipping';
          updatedOrder.fulfillment.status = 'shipped';
          updatedOrder.fulfillment.shippedAt = new Date().toISOString();
        }
        break;

      case 'record_download':
        if (updateData.itemId && updatedOrder.status === 'completed') {
          if (!updatedOrder.fulfillment.downloads) {
            updatedOrder.fulfillment.downloads = [];
          }
          
          const existingDownload = updatedOrder.fulfillment.downloads.find(d => d.itemId === updateData.itemId);
          if (existingDownload) {
            existingDownload.downloadCount += 1;
            existingDownload.lastDownloadedAt = new Date().toISOString();
          } else {
            updatedOrder.fulfillment.downloads.push({
              itemId: updateData.itemId,
              downloadedAt: new Date().toISOString(),
              downloadCount: 1
            });
          }
        }
        break;

      case 'refund':
        if (['completed', 'processing'].includes(updatedOrder.status)) {
          updatedOrder.payment.status = 'refunded';
          updatedOrder.payment.refundedAt = new Date().toISOString();
          updatedOrder.payment.refundAmount = updateData.amount || updatedOrder.pricing.total;
          updatedOrder.status = 'cancelled';
          updatedOrder.fulfillment.status = 'refunded';
        }
        break;

      default:
        // Regular partial update
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined) {
            if (typeof updatedOrder[key] === 'object' && !Array.isArray(updatedOrder[key])) {
              updatedOrder[key] = { ...updatedOrder[key], ...updateData[key] };
            } else {
              updatedOrder[key] = updateData[key];
            }
          }
        });
        break;
    }

    updatedOrder.updatedAt = new Date().toISOString();
    mockOrders[orderIndex] = updatedOrder;

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: action ? `Action '${action}' completed successfully` : 'Order updated successfully'
    });
  } catch (error) {
    console.error('Patch order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
}

// Delete order (soft delete)
async function handleDelete(req, res, id) {
  try {
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = mockOrders[orderIndex];

    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be deleted'
      });
    }

    // In a real application, you might want to soft delete instead
    const deletedOrder = mockOrders.splice(orderIndex, 1)[0];

    return res.status(200).json({
      success: true,
      data: deletedOrder,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
}