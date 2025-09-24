import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [isEnglish, setIsEnglish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [transactionFile, setTransactionFile] = useState(null);
  const [transactionProof, setTransactionProof] = useState('');
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      fullName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia',
      phone: ''
    },
    billingAddress: {
      sameAsShipping: true,
      fullName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Malaysia'
    },
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    
    fetchPaymentSettings();
  }, [user, cart, router]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings');
      const data = await response.json();
      
      if (data.success) {
        setPaymentSettings(data.data);
        const activeMethods = data.data.getActivePaymentMethods ? 
          data.data.getActivePaymentMethods() : 
          getActivePaymentMethods(data.data);
        setPaymentMethods(activeMethods);
        if (activeMethods.length > 0) {
          setSelectedPaymentMethod(activeMethods[0].type);
        }
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const getActivePaymentMethods = (settings) => {
    const methods = [];
    if (settings.epay?.enabled) {
      methods.push({
        type: 'epay',
        name: 'ePay UM',
        accountNumber: settings.epay.accountNumber,
        accountName: settings.epay.accountName,
        bankName: settings.epay.bankName,
        qrCode: settings.epay.qrCode,
        instructions: settings.epay.instructions
      });
    }
    if (settings.fbx?.enabled) {
      methods.push({
        type: 'fbx',
        name: 'FBX Bank Transfer',
        accountNumber: settings.fbx.accountNumber,
        accountName: settings.fbx.accountName,
        bankName: settings.fbx.bankName,
        qrCode: settings.fbx.qrCode,
        instructions: settings.fbx.instructions
      });
    }
    return methods;
  };

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size and type
    const maxSize = (paymentSettings?.general?.maxFileSize || 5) * 1024 * 1024; // MB to bytes
    const allowedTypes = paymentSettings?.general?.allowedFileTypes || 
      ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      alert(`File size must be less than ${paymentSettings?.general?.maxFileSize || 5}MB`);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, JPG, or PDF files only.');
      return;
    }

    setTransactionFile(file);
    
    // Upload file
    const formData = new FormData();
    formData.append('transactionProof', file);
    
    try {
      setLoading(true);
      const response = await fetch('/api/upload-transaction', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactionProof(data.data.url);
      } else {
        alert(data.error || 'Failed to upload transaction proof');
        setTransactionFile(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload transaction proof');
      setTransactionFile(null);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate shipping address
    const requiredShippingFields = ['fullName', 'address', 'city', 'state', 'postalCode', 'phone'];
    requiredShippingFields.forEach(field => {
      if (!orderData.shippingAddress[field]) {
        newErrors[`shippingAddress.${field}`] = `${field} is required`;
      }
    });
    
    // Validate billing address if different from shipping
    if (!orderData.billingAddress.sameAsShipping) {
      const requiredBillingFields = ['fullName', 'address', 'city', 'state', 'postalCode'];
      requiredBillingFields.forEach(field => {
        if (!orderData.billingAddress[field]) {
          newErrors[`billingAddress.${field}`] = `${field} is required`;
        }
      });
    }
    
    // Validate payment method and transaction proof
    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!transactionProof) {
      newErrors.transactionProof = 'Please upload transaction proof';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotals = () => {
    const subtotal = getTotalPrice();
    const tax = paymentSettings?.general?.taxRate ? 
      (subtotal * paymentSettings.general.taxRate / 100) : 0;
    const shipping = paymentSettings?.general?.shippingCost || 0;
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { subtotal, tax, shipping, total } = calculateTotals();
      
      const orderPayload = {
        items: cart.map(item => ({
          productId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          type: item.type // 'book', 'ebook', 'poster'
        })),
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress.sameAsShipping ? 
          orderData.shippingAddress : orderData.billingAddress,
        paymentMethod: selectedPaymentMethod,
        transactionProof,
        notes: orderData.notes,
        pricing: {
          subtotal,
          tax,
          shipping,
          total
        },
        status: 'pending_verification'
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        clearCart();
        router.push(`/order-confirmation/${data.data._id}`);
      } else {
        alert(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = paymentMethods.find(method => method.type === selectedPaymentMethod);
  const { subtotal, tax, shipping, total } = calculateTotals();

  if (!user || cart.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsEnglish(!isEnglish)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEnglish ? 'தமிழ்' : 'English'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              {isEnglish ? 'Checkout' : 'பணம் செலுத்துதல்'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isEnglish ? 'Shipping Address' : 'அனுப்பும் முகவரி'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isEnglish ? 'Full Name' : 'முழு பெயர்'}
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.fullName}
                      onChange={(e) => handleInputChange('shippingAddress', 'fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['shippingAddress.fullName'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['shippingAddress.fullName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.fullName']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isEnglish ? 'Phone' : 'தொலைபேசி'}
                    </label>
                    <input
                      type="tel"
                      value={orderData.shippingAddress.phone}
                      onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['shippingAddress.phone'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['shippingAddress.phone'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.phone']}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEnglish ? 'Address' : 'முகவரி'}
                  </label>
                  <textarea
                    value={orderData.shippingAddress.address}
                    onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['shippingAddress.address'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['shippingAddress.address'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.address']}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isEnglish ? 'City' : 'நகரம்'}
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.city}
                      onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['shippingAddress.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['shippingAddress.city'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.city']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isEnglish ? 'State' : 'மாநிலம்'}
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.state}
                      onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['shippingAddress.state'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['shippingAddress.state'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.state']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isEnglish ? 'Postal Code' : 'அஞ்சல் குறியீடு'}
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors['shippingAddress.postalCode'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['shippingAddress.postalCode'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.postalCode']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isEnglish ? 'Payment Method' : 'பணம் செலுத்தும் முறை'}
                </h3>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.type} className="border rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.type}
                          checked={selectedPaymentMethod === method.type}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.bankName}</div>
                        </div>
                      </label>
                      
                      {selectedPaymentMethod === method.type && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {isEnglish ? 'Account Details' : 'கணக்கு விவரங்கள்'}
                              </p>
                              <p className="text-sm text-gray-600">Bank: {method.bankName}</p>
                              <p className="text-sm text-gray-600">Account: {method.accountNumber}</p>
                              <p className="text-sm text-gray-600">Name: {method.accountName}</p>
                            </div>
                            
                            {method.qrCode && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  {isEnglish ? 'QR Code' : 'QR குறியீடு'}
                                </p>
                                <img 
                                  src={method.qrCode} 
                                  alt="Payment QR Code" 
                                  className="w-32 h-32 object-contain border rounded"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {isEnglish ? 'Instructions' : 'வழிமுறைகள்'}
                            </p>
                            <p className="text-sm text-gray-600">{method.instructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Transaction Proof Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isEnglish ? 'Upload Transaction Proof' : 'பரிவர்த்தனை ஆதாரம் பதிவேற்றம்'}
                </h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="transaction-upload"
                  />
                  
                  <label htmlFor="transaction-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      {transactionFile ? (
                        <div>
                          <p className="font-medium text-green-600">✓ {transactionFile.name}</p>
                          <p className="text-sm">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">
                            {isEnglish ? 'Click to upload transaction proof' : 'பரிவர்த்தனை ஆதாரம் பதிவேற்ற கிளிக் செய்யவும்'}
                          </p>
                          <p className="text-sm">
                            {isEnglish ? 'JPEG, PNG, JPG or PDF (Max 5MB)' : 'JPEG, PNG, JPG அல்லது PDF (அதிகபட்சம் 5MB)'}
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                {errors.transactionProof && (
                  <p className="text-red-500 text-sm mt-1">{errors.transactionProof}</p>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEnglish ? 'Order Notes (Optional)' : 'ஆர்டர் குறிப்புகள் (விருப்பமானது)'}
                </label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isEnglish ? 'Any special instructions...' : 'ஏதேனும் சிறப்பு வழிமுறைகள்...'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  isEnglish ? 'Processing...' : 'செயலாக்கப்படுகிறது...'
                ) : (
                  isEnglish ? 'Place Order' : 'ஆர்டர் செய்யவும்'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4">
              {isEnglish ? 'Order Summary' : 'ஆர்டர் சுருக்கம்'}
            </h3>
            
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item._id}-${item.type}`} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {isEnglish ? 'Quantity' : 'அளவு'}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">RM {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>{isEnglish ? 'Subtotal' : 'துணை மொத்தம்'}</span>
                <span>RM {subtotal.toFixed(2)}</span>
              </div>
              
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>{isEnglish ? 'Tax' : 'வரி'} ({paymentSettings?.general?.taxRate}%)</span>
                  <span>RM {tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>{isEnglish ? 'Shipping' : 'அனுப்புதல்'}</span>
                <span>RM {shipping.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>{isEnglish ? 'Total' : 'மொத்தம்'}</span>
                  <span>RM {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;