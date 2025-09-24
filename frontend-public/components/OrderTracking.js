import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';

const OrderTracking = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('email'); // 'email' or 'orderId'
  const [searchValue, setSearchValue] = useState('');

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (session?.user?.email && searchType === 'email') {
      setSearchValue(session.user.email);
    }
  }, [session, searchType]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter an order ID or email address');
      return;
    }

    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const params = new URLSearchParams();
      if (searchType === 'email') {
        params.append('email', searchValue.trim());
      } else {
        params.append('orderId', searchValue.trim());
      }

      const response = await fetch(`/api/order-tracking?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'review':
        return '👀';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Authentication Check */}
          {status === 'loading' ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : !session ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-4">Sign In Required</h3>
              <p className="text-gray-600 mb-6">
                Please sign in to track your orders or search by order ID.
              </p>
              <button
                onClick={() => signIn()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex mb-2">
                      <label className="flex items-center mr-4">
                        <input
                          type="radio"
                          value="email"
                          checked={searchType === 'email'}
                          onChange={(e) => {
                            setSearchType(e.target.value);
                            if (session?.user?.email) {
                              setSearchValue(session.user.email);
                            }
                          }}
                          className="mr-2"
                        />
                        Search by Email
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="orderId"
                          checked={searchType === 'orderId'}
                          onChange={(e) => {
                            setSearchType(e.target.value);
                            setSearchValue('');
                          }}
                          className="mr-2"
                        />
                        Search by Order ID
                      </label>
                    </div>
                    <input
                      type={searchType === 'email' ? 'email' : 'text'}
                      placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter order ID (e.g., ORD-10001)'}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Searching...' : 'Track Orders'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Orders List */}
              {orders.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Your Orders ({orders.length})</h3>
                  {orders.map((order) => (
                    <div key={order.orderId} className="border border-gray-200 rounded-lg p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{order.orderId}</h4>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Books */}
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Books ({order.books.length})</h5>
                        <div className="space-y-2">
                          {order.books.map((book, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              <div className="flex items-center space-x-3">
                                {book.coverImage && (
                                  <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-12 h-16 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{book.title}</p>
                                  <p className="text-sm text-gray-600">Qty: {book.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium">RM {book.price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span>Subtotal:</span>
                          <span>RM {order.totals.subtotal.toFixed(2)}</span>
                        </div>
                        {order.shipping.enabled && (
                          <div className="flex justify-between items-center mb-2">
                            <span>Shipping:</span>
                            <span>RM {order.totals.shippingCost.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>RM {order.totals.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div>
                        <h5 className="font-medium mb-3">Order Status</h5>
                        <div className="space-y-3">
                          {order.statusHistory.map((status, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                status.status === order.status ? 'bg-blue-600' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1">
                                <p className="font-medium capitalize">{status.status}</p>
                                <p className="text-sm text-gray-600">{status.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(status.date)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping.enabled && order.shipping.address && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium mb-2">Shipping Address</h5>
                          <p className="text-gray-600">{order.shipping.address}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {orders.length === 0 && !loading && !error && searchValue && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                  <p className="text-gray-600">
                    {searchType === 'email' 
                      ? 'No orders found for this email address.' 
                      : 'No order found with this ID.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;