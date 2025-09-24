import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiTruck, FiPackage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    method: 'standard',
    carrier: '',
    trackingNumber: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId, isApproved) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved,
          notes: verificationNotes
        })
      });

      if (response.ok) {
        toast.success(`Payment ${isApproved ? 'approved' : 'rejected'} successfully`);
        fetchOrders();
        setShowModal(false);
        setVerificationNotes('');
      } else {
        throw new Error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          shippingInfo: newStatus === 'shipped' ? shippingInfo : undefined
        })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
        setShowModal(false);
        setShippingInfo({
          method: 'standard',
          carrier: '',
          trackingNumber: '',
          estimatedDelivery: ''
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending_verification: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const OrderModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Payment Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus.toUpperCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Total:</span> {formatCurrency(selectedOrder.pricing.total)}</p>
                  <p><span className="font-medium">Created:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod.type.toUpperCase()}</p>
                  <p><span className="font-medium">Bank:</span> {selectedOrder.paymentMethod.bankName}</p>
                  <p><span className="font-medium">Account:</span> {selectedOrder.paymentMethod.accountNumber}</p>
                  <p><span className="font-medium">Account Name:</span> {selectedOrder.paymentMethod.accountName}</p>
                  {selectedOrder.transactionProof && (
                    <div className="mt-2">
                      <span className="font-medium">Transaction Proof:</span>
                      <img 
                        src={selectedOrder.transactionProof} 
                        alt="Transaction Proof" 
                        className="mt-1 max-w-xs border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items and Actions */}
            <div className="space-y-4">
              {/* Items */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <p className="font-medium">{item.title}</p>
                      <p>Type: {item.type}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {formatCurrency(item.price)}</p>
                      <p>Subtotal: {formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Subtotal:</span> {formatCurrency(selectedOrder.pricing.subtotal)}</p>
                  <p><span className="font-medium">Tax:</span> {formatCurrency(selectedOrder.pricing.tax)}</p>
                  <p><span className="font-medium">Shipping:</span> {formatCurrency(selectedOrder.pricing.shipping)}</p>
                  <p className="font-bold border-t pt-1"><span>Total:</span> {formatCurrency(selectedOrder.pricing.total)}</p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Actions</h3>
                <div className="space-y-3">
                  {selectedOrder.paymentStatus === 'pending' && (
                    <div className="space-y-2">
                      <textarea
                        placeholder="Verification notes (optional)"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyPayment(selectedOrder._id, true)}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          <FiCheck className="mr-1" /> Approve Payment
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(selectedOrder._id, false)}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          <FiX className="mr-1" /> Reject Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'verified' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'processing')}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <FiPackage className="mr-1" /> Mark as Processing
                    </button>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Carrier"
                          value={shippingInfo.carrier}
                          onChange={(e) => setShippingInfo({...shippingInfo, carrier: e.target.value})}
                          className="p-2 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          value={shippingInfo.trackingNumber}
                          onChange={(e) => setShippingInfo({...shippingInfo, trackingNumber: e.target.value})}
                          className="p-2 border rounded text-sm"
                        />
                      </div>
                      <input
                        type="date"
                        placeholder="Estimated Delivery"
                        value={shippingInfo.estimatedDelivery}
                        onChange={(e) => setShippingInfo({...shippingInfo, estimatedDelivery: e.target.value})}
                        className="w-full p-2 border rounded text-sm"
                      />
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'shipped')}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        <FiTruck className="mr-1" /> Mark as Shipped
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <FiCheck className="mr-1" /> Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.totalItems} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.shippingAddress.fullName}</div>
                      <div className="text-sm text-gray-500">{order.shippingAddress.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.paymentMethod.type.toUpperCase()}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.pricing.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FiEye className="mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {showModal && <OrderModal />}
    </div>
  );
};

export default OrdersAdmin;