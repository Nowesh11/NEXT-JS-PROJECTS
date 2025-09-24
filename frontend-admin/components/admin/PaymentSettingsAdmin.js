import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PaymentSettingsAdmin() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('epay');

  // Form state
  const [formData, setFormData] = useState({
    epay: {
      enabled: true,
      accountNumber: '',
      accountName: '',
      bankName: '',
      ifscCode: '',
      upiId: '',
      qrCodeImage: '',
      instructions: 'Please transfer the amount to the above account and upload the transaction proof.'
    },
    fbx: {
      enabled: true,
      accountNumber: '',
      accountName: '',
      bankName: '',
      ifscCode: '',
      upiId: '',
      qrCodeImage: '',
      instructions: 'Please transfer the amount to the above FBX account and upload the transaction proof.'
    },
    general: {
      currency: 'INR',
      taxRate: 0,
      shippingFee: 0,
      freeShippingThreshold: 500,
      manualVerification: true,
      verificationTimeout: 24, // hours
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
      maxFileSize: 5 // MB
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [uploadingQR, setUploadingQR] = useState(false);

  // Fetch payment settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-settings', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setFormData({
          epay: {
            enabled: data.data.epay?.enabled !== undefined ? data.data.epay.enabled : true,
            accountNumber: data.data.epay?.accountNumber || '',
            accountName: data.data.epay?.accountName || '',
            bankName: data.data.epay?.bankName || '',
            ifscCode: data.data.epay?.ifscCode || '',
            upiId: data.data.epay?.upiId || '',
            qrCodeImage: data.data.epay?.qrCodeImage || '',
            instructions: data.data.epay?.instructions || 'Please transfer the amount to the above account and upload the transaction proof.'
          },
          fbx: {
            enabled: data.data.fbx?.enabled !== undefined ? data.data.fbx.enabled : true,
            accountNumber: data.data.fbx?.accountNumber || '',
            accountName: data.data.fbx?.accountName || '',
            bankName: data.data.fbx?.bankName || '',
            ifscCode: data.data.fbx?.ifscCode || '',
            upiId: data.data.fbx?.upiId || '',
            qrCodeImage: data.data.fbx?.qrCodeImage || '',
            instructions: data.data.fbx?.instructions || 'Please transfer the amount to the above FBX account and upload the transaction proof.'
          },
          general: {
            currency: data.data.general?.currency || 'INR',
            taxRate: data.data.general?.taxRate || 0,
            shippingFee: data.data.general?.shippingFee || 0,
            freeShippingThreshold: data.data.general?.freeShippingThreshold || 500,
            manualVerification: data.data.general?.manualVerification !== undefined ? data.data.general.manualVerification : true,
            verificationTimeout: data.data.general?.verificationTimeout || 24,
            allowedFileTypes: data.data.general?.allowedFileTypes || ['jpg', 'jpeg', 'png', 'pdf'],
            maxFileSize: data.data.general?.maxFileSize || 5
          }
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    // ePay validation
    if (formData.epay.enabled) {
      if (!formData.epay.accountNumber.trim()) {
        errors.epayAccountNumber = 'ePay Account Number is required';
      }
      if (!formData.epay.accountName.trim()) {
        errors.epayAccountName = 'ePay Account Name is required';
      }
      if (!formData.epay.bankName.trim()) {
        errors.epayBankName = 'ePay Bank Name is required';
      }
    }

    // FBX validation
    if (formData.fbx.enabled) {
      if (!formData.fbx.accountNumber.trim()) {
        errors.fbxAccountNumber = 'FBX Account Number is required';
      }
      if (!formData.fbx.accountName.trim()) {
        errors.fbxAccountName = 'FBX Account Name is required';
      }
      if (!formData.fbx.bankName.trim()) {
        errors.fbxBankName = 'FBX Bank Name is required';
      }
    }

    // General settings validation
    if (formData.general.taxRate < 0 || formData.general.taxRate > 100) {
      errors.taxRate = 'Tax rate must be between 0 and 100';
    }
    if (formData.general.shippingFee < 0) {
      errors.shippingFee = 'Shipping fee cannot be negative';
    }
    if (formData.general.freeShippingThreshold < 0) {
      errors.freeShippingThreshold = 'Free shipping threshold cannot be negative';
    }
    if (formData.general.verificationTimeout < 1 || formData.general.verificationTimeout > 168) {
      errors.verificationTimeout = 'Verification timeout must be between 1 and 168 hours';
    }
    if (formData.general.maxFileSize < 1 || formData.general.maxFileSize > 10) {
      errors.maxFileSize = 'Max file size must be between 1 and 10 MB';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment settings updated successfully!');
        fetchSettings();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle QR code upload
  const handleQRUpload = async (file, paymentMethod) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'qr-code');
    formData.append('paymentMethod', paymentMethod);

    setUploadingQR(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          [paymentMethod]: {
            ...prev[paymentMethod],
            qrCodeImage: data.filePath
          }
        }));
        alert('QR code uploaded successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('Error uploading QR code: ' + err.message);
    } finally {
      setUploadingQR(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Please log in to access the admin panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchSettings()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'epay', name: 'ePay', icon: 'fas fa-university' },
              { id: 'fbx', name: 'FBX', icon: 'fas fa-money-check-alt' },
              { id: 'general', name: 'General Settings', icon: 'fas fa-cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* ePay Settings */}
          {activeTab === 'epay' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">ePay Configuration</h3>
                  <p className="text-sm text-gray-500">Configure ePay manual payment method</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.epay.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, enabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable ePay</span>
                  </label>
                </div>
              </div>

              {formData.epay.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.epay.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, accountNumber: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.epayAccountNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter account number"
                    />
                    {formErrors.epayAccountNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.epayAccountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={formData.epay.accountName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, accountName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.epayAccountName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter account holder name"
                    />
                    {formErrors.epayAccountName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.epayAccountName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.epay.bankName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, bankName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.epayBankName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter bank name"
                    />
                    {formErrors.epayBankName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.epayBankName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.epay.ifscCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, ifscCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={formData.epay.upiId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, upiId: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter UPI ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleQRUpload(e.target.files[0], 'epay')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploadingQR}
                      />
                      {uploadingQR && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    {formData.epay.qrCodeImage && (
                      <div className="mt-2">
                        <img
                          src={formData.epay.qrCodeImage}
                          alt="ePay QR Code"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Instructions
                    </label>
                    <textarea
                      value={formData.epay.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        epay: { ...prev.epay, instructions: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter payment instructions for customers"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FBX Settings */}
          {activeTab === 'fbx' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">FBX Configuration</h3>
                  <p className="text-sm text-gray-500">Configure FBX manual payment method</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.fbx.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, enabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable FBX</span>
                  </label>
                </div>
              </div>

              {formData.fbx.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.fbx.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, accountNumber: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.fbxAccountNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter account number"
                    />
                    {formErrors.fbxAccountNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fbxAccountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fbx.accountName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, accountName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.fbxAccountName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter account holder name"
                    />
                    {formErrors.fbxAccountName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fbxAccountName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fbx.bankName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, bankName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.fbxBankName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter bank name"
                    />
                    {formErrors.fbxBankName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fbxBankName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.fbx.ifscCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, ifscCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={formData.fbx.upiId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, upiId: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter UPI ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleQRUpload(e.target.files[0], 'fbx')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploadingQR}
                      />
                      {uploadingQR && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    {formData.fbx.qrCodeImage && (
                      <div className="mt-2">
                        <img
                          src={formData.fbx.qrCodeImage}
                          alt="FBX QR Code"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Instructions
                    </label>
                    <textarea
                      value={formData.fbx.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fbx: { ...prev.fbx, instructions: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter payment instructions for customers"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Payment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.general.currency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, currency: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.general.taxRate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, taxRate: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.taxRate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.taxRate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.taxRate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.general.shippingFee}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, shippingFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.shippingFee ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.shippingFee && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.shippingFee}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.general.freeShippingThreshold}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, freeShippingThreshold: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.freeShippingThreshold ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.freeShippingThreshold && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.freeShippingThreshold}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Timeout (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={formData.general.verificationTimeout}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, verificationTimeout: parseInt(e.target.value) || 24 }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.verificationTimeout ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.verificationTimeout && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.verificationTimeout}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Time limit for customers to upload transaction proof</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.general.maxFileSize}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, maxFileSize: parseInt(e.target.value) || 5 }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.maxFileSize ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.maxFileSize && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.maxFileSize}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed File Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['jpg', 'jpeg', 'png', 'pdf'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.general.allowedFileTypes.includes(type)}
                            onChange={(e) => {
                              const types = [...formData.general.allowedFileTypes];
                              if (e.target.checked) {
                                types.push(type);
                              } else {
                                const index = types.indexOf(type);
                                if (index > -1) types.splice(index, 1);
                              }
                              setFormData(prev => ({
                                ...prev,
                                general: { ...prev.general, allowedFileTypes: types }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 uppercase">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.general.manualVerification}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          general: { ...prev.general, manualVerification: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Enable Manual Payment Verification
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, all payments require manual verification by admin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}