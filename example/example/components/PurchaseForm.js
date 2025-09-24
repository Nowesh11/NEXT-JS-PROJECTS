import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const PurchaseForm = ({ books = [], isOpen, onClose, type = 'individual' }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    user: {
      name: '',
      email: '',
      phone: ''
    },
    payment: {
      method: 'epayum',
      file: null
    },
    shipping: {
      enabled: false,
      address: ''
    }
  });
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch payment settings on component mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch('/api/payment-settings');
        const data = await response.json();
        if (data.success) {
          setPaymentSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      }
    };

    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        user: {
          name: session.user.name || '',
          email: session.user.email || '',
          phone: prev.user.phone
        }
      }));
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          file
        }
      }));
      setError('');
    }
  };

  const calculateTotal = () => {
    const subtotal = books.reduce((sum, book) => sum + (book.price * book.quantity), 0);
    const shippingCost = formData.shipping.enabled ? (paymentSettings?.shippingCost || 10) : 0;
    return {
      subtotal,
      shippingCost,
      total: subtotal + shippingCost
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.user.name || !formData.user.email || !formData.user.phone) {
        throw new Error('Please fill in all user details');
      }

      if (!formData.payment.file) {
        throw new Error('Please upload transaction file');
      }

      if (formData.shipping.enabled && !formData.shipping.address) {
        throw new Error('Please provide shipping address');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Prepare order data
      const orderData = {
        user: formData.user,
        books: books.map(book => ({
          bookId: book._id || book.bookId,
          quantity: book.quantity || 1
        })),
        payment: {
          method: formData.payment.method
        },
        shipping: formData.shipping
      };

      submitData.append('orderData', JSON.stringify(orderData));
      submitData.append('transactionFile', formData.payment.file);

      const response = await fetch('/api/purchased-books', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          user: { name: '', email: '', phone: '' },
          payment: { method: 'epayum', file: null },
          shipping: { enabled: false, address: '' }
        });
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {type === 'individual' ? 'Buy Now' : 'Checkout'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Order Placed Successfully!
              </h3>
              <p className="text-gray-600">
                You will receive a confirmation email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                {books.map((book, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm">
                      {book.title?.en || book.title} × {book.quantity || 1}
                    </span>
                    <span className="font-medium">
                      RM {((book.price || 0) * (book.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between items-center mb-1">
                  <span>Subtotal:</span>
                  <span>RM {totals.subtotal.toFixed(2)}</span>
                </div>
                {formData.shipping.enabled && (
                  <div className="flex justify-between items-center mb-1">
                    <span>Shipping:</span>
                    <span>RM {totals.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>RM {totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* User Details */}
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="user.name"
                    placeholder="Full Name"
                    value={formData.user.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    name="user.email"
                    placeholder="Email Address"
                    value={formData.user.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="tel"
                  name="user.phone"
                  placeholder="Phone Number"
                  value={formData.user.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-4"
                  required
                />
              </div>

              {/* Shipping */}
              <div>
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    name="shipping.enabled"
                    checked={formData.shipping.enabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">
                    Add Shipping (+RM {paymentSettings?.shippingCost || 10})
                  </span>
                </label>
                {formData.shipping.enabled && (
                  <textarea
                    name="shipping.address"
                    placeholder="Shipping Address"
                    value={formData.shipping.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment.method"
                      value="epayum"
                      checked={formData.payment.method === 'epayum'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">ePay UM</div>
                      {paymentSettings?.epayum && (
                        <div className="text-sm text-gray-600">
                          <a
                            href={paymentSettings.epayum.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {paymentSettings.epayum.link}
                          </a>
                          <p>{paymentSettings.epayum.instructions}</p>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment.method"
                      value="fbx"
                      checked={formData.payment.method === 'fbx'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">Bank Transfer (FBX)</div>
                      {paymentSettings?.fbx && (
                        <div className="text-sm text-gray-600">
                          <p>Bank: {paymentSettings.fbx.bankName}</p>
                          <p>Account: {paymentSettings.fbx.accountNumber}</p>
                          <p>Holder: {paymentSettings.fbx.accountHolder}</p>
                          <p>{paymentSettings.fbx.instructions}</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block font-medium mb-2">
                  Upload Transaction File (PDF/JPEG/PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.payment.file && (
                  <p className="text-sm text-green-600 mt-1">
                    File selected: {formData.payment.file.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : `Place Order (RM ${totals.total.toFixed(2)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;