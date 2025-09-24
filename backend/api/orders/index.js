import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Cart from '../../../models/Cart';

// Mock orders data for development
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
  const { method } = req;

  try {
    await connectToDatabase();

    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get orders with filtering and pagination
async function handleGet(req, res) {
  try {
    const {
      userId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    let filteredOrders = [...mockOrders];

    // Apply filters
    if (userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === userId);
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (startDate || endDate) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply sorting
    filteredOrders.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'total':
          aValue = a.pricing.total;
          bValue = b.pricing.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'orderNumber':
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Calculate summary statistics
    const summary = {
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + order.pricing.total, 0),
      statusCounts: {
        pending: filteredOrders.filter(o => o.status === 'pending').length,
        processing: filteredOrders.filter(o => o.status === 'processing').length,
        completed: filteredOrders.filter(o => o.status === 'completed').length,
        cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
      },
      averageOrderValue: filteredOrders.length > 0 
        ? filteredOrders.reduce((sum, order) => sum + order.pricing.total, 0) / filteredOrders.length
        : 0
    };

    return res.status(200).json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalOrders,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      summary
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
}

// Create new order
async function handlePost(req, res) {
  try {
    const {
      userId,
      items,
      customer,
      billing,
      shipping,
      paymentMethod,
      notes
    } = req.body;

    // Validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User ID and items are required'
      });
    }

    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required'
      });
    }

    if (!billing || !billing.address || !billing.city) {
      return res.status(400).json({
        success: false,
        message: 'Billing address is required'
      });
    }

    // Generate order ID and number
    const orderId = `ORD-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`;
    const orderNumber = `TLS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(mockOrders.length + 1).padStart(3, '0')}`;

    // Calculate pricing
    let subtotal = 0;
    let discount = 0;
    
    const processedItems = items.map(item => {
      const itemSubtotal = item.discountedPrice * item.quantity;
      const itemDiscount = (item.price - item.discountedPrice) * item.quantity;
      
      subtotal += itemSubtotal;
      discount += itemDiscount;
      
      return {
        ...item,
        type: item.type || 'ebook'
      };
    });

    // Calculate tax (8% rate)
    const tax = subtotal * 0.08;
    
    // Calculate shipping (free for digital items)
    const hasPhysicalItems = processedItems.some(item => item.type === 'poster');
    const shippingCost = hasPhysicalItems ? 5.99 : 0.00;
    
    const total = subtotal + tax + shippingCost;

    // Create new order
    const newOrder = {
      id: orderId,
      userId,
      orderNumber,
      status: 'pending',
      items: processedItems,
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shippingCost.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      },
      customer,
      billing,
      shipping: shipping || billing,
      payment: {
        method: paymentMethod || 'razorpay',
        status: 'pending'
      },
      fulfillment: {
        status: 'awaiting_payment'
      },
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);

    return res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
}