import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/AdminLayout';
import Head from 'next/head';
import { toast } from 'react-toastify';

export default function PaymentSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('epay');
  const [formData, setFormData] = useState({
    epay: {
      enabled: true,
      accountNumber: '',
      accountName: '',
      bankName: '',
      instructions: ''
    },
    fbx: {
      enabled: true,
      accountNumber: '',
      accountName: '',
      bankName: '',
      instructions: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});

  // Check authentication
  useEffect(() => {
    if (!session && !loading) {
      router.push('/admin/login');
    } else if (session) {
      fetchSettings();
    }
  }, [session]);

  // Fetch payment settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setFormData({
          epay: {
            enabled: data.data.epay?.enabled !== undefined ? data.data.epay.enabled : true,
            accountNumber: data.data.epay?.accountNumber || '',
            accountName: data.data.epay?.accountName || '',
            bankName: data.data.epay?.bankName || '',
            instructions: data.data.epay?.instructions || 'Please transfer the amount to the above account and upload the transaction proof.'
          },
          fbx: {
            enabled: data.data.fbx?.enabled !== undefined ? data.data.fbx.enabled : true,
            accountNumber: data.data.fbx?.accountNumber || '',
            accountName: data.data.fbx?.accountName || '',
            bankName: data.data.fbx?.bankName || '',
            instructions: data.data.fbx?.instructions || 'Please transfer the amount to the above account and upload the transaction proof.'
          }
        });
      } else {
        throw new Error(data.message || 'Failed to fetch payment settings');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (formData.epay.enabled) {
      if (!formData.epay.accountNumber) {
        errors.epayAccountNumber = 'Account number is required';
      }
      if (!formData.epay.accountName) {
        errors.epayAccountName = 'Account name is required';
      }
      if (!formData.epay.bankName) {
        errors.epayBankName = 'Bank name is required';
      }
    }
    
    if (formData.fbx.enabled) {
      if (!formData.fbx.accountNumber) {
        errors.fbxAccountNumber = 'Account number is required';
      }
      if (!formData.fbx.accountName) {
        errors.fbxAccountName = 'Account name is required';
      }
      if (!formData.fbx.bankName) {
        errors.fbxBankName = 'Bank name is required';
      }
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update payment settings');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Payment settings updated successfully!');
        fetchSettings();
      } else {
        throw new Error(data.message || 'Failed to update payment settings');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Payment Settings | Admin</title>
        </Head>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Payment Settings | Admin</title>
      </Head>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchSettings()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading || saving}
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
                { id: 'fbx', name: 'FBX', icon: 'fas fa-money-check-alt' }
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

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => fetchSettings()}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors mr-3"
                disabled={loading || saving}
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading || saving}
              >
                {saving ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epayum: paymentSettings.epayum
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save E-PAY UM settings');
      }

      toast.success('E-PAY UM settings saved successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error saving E-PAY UM settings:', error);
      toast.error('Failed to save E-PAY UM settings');
    } finally {
      setSaving(false);
    }
  };

  // Save FBX settings
  const saveFbxSettings = async () => {
    const { bankName, accountNumber, accountHolder } = paymentSettings.fbx;
    
    if (!bankName || !accountNumber || !accountHolder) {
      toast.error('Bank name, account number, and account holder are required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fbx: paymentSettings.fbx
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save FBX settings');
      }

      toast.success('FBX settings saved successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error saving FBX settings:', error);
      toast.error('Failed to save FBX settings');
    } finally {
      setSaving(false);
    }
  };

  // Save shipping settings
  const saveShippingSettings = async () => {
    if (!paymentSettings.shipping.fee || paymentSettings.shipping.fee < 0) {
      toast.error('Valid shipping fee is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping: paymentSettings.shipping
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save shipping settings');
      }

      toast.success('Shipping settings saved successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      toast.error('Failed to save shipping settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Fetch payment gateways
  const fetchPaymentGateways = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/payment-gateways', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGateways(data.gateways || []);
        setStats({
          totalGateways: data.gateways?.length || 0,
          activeGateways: data.gateways?.filter(g => g.isActive)?.length || 0,
          testModeGateways: data.gateways?.filter(g => g.mode === 'test')?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
    }
  };

  // Handle gateway modal
  const handleAddGateway = () => {
    setEditingGateway(null);
    setGatewayForm({
      gateway: '',
      apiKey: '',
      secretKey: '',
      webhookSecret: '',
      mode: 'test',
      isActive: false,
      configuration: ''
    });
    setShowGatewayModal(true);
  };

  const handleEditGateway = (gateway) => {
    setEditingGateway(gateway);
    setGatewayForm({
      gateway: gateway.gateway,
      apiKey: gateway.apiKey,
      secretKey: gateway.secretKey,
      webhookSecret: gateway.webhookSecret || '',
      mode: gateway.mode,
      isActive: gateway.isActive,
      configuration: JSON.stringify(gateway.configuration || {}, null, 2)
    });
    setShowGatewayModal(true);
  };

  // Save payment gateway
  const savePaymentGateway = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingGateway ? 'PUT' : 'POST';
      const url = editingGateway 
        ? `/api/admin/payment-gateways/${editingGateway._id}`
        : '/api/admin/payment-gateways';

      let configuration = {};
      if (gatewayForm.configuration) {
        try {
          configuration = JSON.parse(gatewayForm.configuration);
        } catch (e) {
          toast.error('Invalid JSON configuration');
          return;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...gatewayForm,
          configuration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save payment gateway');
      }

      toast.success(`Payment gateway ${editingGateway ? 'updated' : 'added'} successfully`);
      setShowGatewayModal(false);
      fetchPaymentGateways();
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      toast.error('Failed to save payment gateway');
    }
  };

  // Delete payment gateway
  const deletePaymentGateway = async (gatewayId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/payment-gateways/${gatewayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment gateway');
      }

      toast.success('Payment gateway deleted successfully');
      setDeleteConfirm(null);
      fetchPaymentGateways();
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      toast.error('Failed to delete payment gateway');
    }
  };

  const handleDeleteGateway = (gatewayId) => {
     deletePaymentGateway(gatewayId);
   };

   // Export to CSV functionality
   const exportToCSV = () => {
     const csvData = gateways.map(gateway => ({
       Gateway: gateway.gateway,
       Mode: gateway.mode,
       Status: gateway.isActive ? 'Active' : 'Inactive',
       'API Key': gateway.apiKey ? gateway.apiKey.substring(0, 10) + '...' : '',
       Created: new Date(gateway.createdAt).toLocaleDateString()
     }));

     const csvContent = [
       Object.keys(csvData[0] || {}).join(','),
       ...csvData.map(row => Object.values(row).join(','))
     ].join('\n');

     const blob = new Blob([csvContent], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `payment-gateways-${new Date().toISOString().split('T')[0]}.csv`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     window.URL.revokeObjectURL(url);
   };

  useEffect(() => {
    fetchPaymentSettings();
    fetchPaymentGateways();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getText('payment.settings.title', 'Payment Settings')}</h1>
            <p className="text-gray-600 mt-2">{getText('payment.settings.subtitle', 'Configure payment gateways and settings')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchPaymentSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {getText('payment.refresh', 'Refresh Settings')}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Configuration Forms */}
      <div className="grid gap-6 mb-8">
        {/* E-PAY UM Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{getText('payment.epayum.title', 'E-PAY UM Configuration')}</h3>
            <p className="text-gray-600 mt-1">{getText('payment.epayum.subtitle', 'Configure E-PAY UM payment gateway settings')}</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="epayumLink" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.epayum.link', 'E-PAY UM Payment Link')} *
                </label>
                <input
                  type="url"
                  id="epayumLink"
                  value={paymentSettings.epayum.link}
                  onChange={(e) => handleInputChange('epayum', 'link', e.target.value)}
                  placeholder="https://epay.um.edu.my/sistem/admin/login"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">The URL where users will be redirected to make E-PAY UM payments</p>
              </div>
              <div>
                <label htmlFor="epayumInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.epayum.instructions', 'Payment Instructions')}
                </label>
                <textarea
                  id="epayumInstructions"
                  value={paymentSettings.epayum.instructions}
                  onChange={(e) => handleInputChange('epayum', 'instructions', e.target.value)}
                  placeholder="Please transfer the money and upload the payment proof file"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Instructions displayed to users for E-PAY UM payments</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveEpayumSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {saving ? getText('common.saving', 'Saving...') : getText('payment.epayum.save', 'Save E-PAY UM Settings')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FBX Bank Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{getText('payment.fbx.title', 'FBX Bank Transfer Configuration')}</h3>
            <p className="text-gray-600 mt-1">{getText('payment.fbx.subtitle', 'Configure bank transfer details for FBX payments')}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fbxBankName" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.fbx.bankName', 'Bank Name')} *
                </label>
                <input
                  type="text"
                  id="fbxBankName"
                  value={paymentSettings.fbx.bankName}
                  onChange={(e) => handleInputChange('fbx', 'bankName', e.target.value)}
                  placeholder="Maybank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="fbxAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.fbx.accountNumber', 'Account Number')} *
                </label>
                <input
                  type="text"
                  id="fbxAccountNumber"
                  value={paymentSettings.fbx.accountNumber}
                  onChange={(e) => handleInputChange('fbx', 'accountNumber', e.target.value)}
                  placeholder="157223402785"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="fbxAccountHolder" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.fbx.accountHolder', 'Account Holder Name')} *
                </label>
                <input
                  type="text"
                  id="fbxAccountHolder"
                  value={paymentSettings.fbx.accountHolder}
                  onChange={(e) => handleInputChange('fbx', 'accountHolder', e.target.value)}
                  placeholder="Nowesh Kumar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="fbxInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.fbx.instructions', 'Transfer Instructions')}
                </label>
                <textarea
                  id="fbxInstructions"
                  value={paymentSettings.fbx.instructions}
                  onChange={(e) => handleInputChange('fbx', 'instructions', e.target.value)}
                  placeholder="Please transfer to this account and upload payment slip"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Instructions displayed to users for bank transfers</p>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={saveFbxSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {saving ? getText('common.saving', 'Saving...') : getText('payment.fbx.save', 'Save FBX Settings')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{getText('payment.shipping.title', 'Shipping Configuration')}</h3>
            <p className="text-gray-600 mt-1">{getText('payment.shipping.subtitle', 'Configure shipping fees and currency')}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.shipping.fee', 'Shipping Fee')} *
                </label>
                <input
                  type="number"
                  id="shippingFee"
                  value={paymentSettings.shipping.fee}
                  onChange={(e) => handleInputChange('shipping', 'fee', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  placeholder="10.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Default shipping fee amount</p>
              </div>
              <div>
                <label htmlFor="shippingCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('payment.shipping.currency', 'Currency')} *
                </label>
                <select
                  id="shippingCurrency"
                  value={paymentSettings.shipping.currency}
                  onChange={(e) => handleInputChange('shipping', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="RM">RM (Malaysian Ringgit)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={saveShippingSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {saving ? getText('common.saving', 'Saving...') : getText('payment.shipping.save', 'Save Shipping Settings')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{getText('payment.current.title', 'Current Payment Settings')}</h3>
          <p className="text-gray-600 mt-1">{getText('payment.current.subtitle', 'Overview of current payment configuration')}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E-PAY UM Current Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">{getText('payment.epayum.title', 'E-PAY UM')}</h4>
              {paymentSettings.epayum.link ? (
                <div className="space-y-2">
                  <p><strong>{getText('payment.epayum.link', 'Link')}:</strong> {paymentSettings.epayum.link}</p>
                  {paymentSettings.epayum.instructions && (
                    <p><strong>{getText('payment.epayum.instructions', 'Instructions')}:</strong> {paymentSettings.epayum.instructions}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">{getText('common.notConfigured', 'Not configured')}</p>
              )}
            </div>

            {/* FBX Current Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">{getText('payment.fbx.title', 'FBX Bank Transfer')}</h4>
              {paymentSettings.fbx.bankName ? (
                <div className="space-y-2">
                  <p><strong>{getText('payment.fbx.bankName', 'Bank')}:</strong> {paymentSettings.fbx.bankName}</p>
                  <p><strong>{getText('payment.fbx.accountNumber', 'Account')}:</strong> {paymentSettings.fbx.accountNumber}</p>
                  <p><strong>{getText('payment.fbx.accountHolder', 'Holder')}:</strong> {paymentSettings.fbx.accountHolder}</p>
                  {paymentSettings.fbx.instructions && (
                    <p><strong>{getText('payment.fbx.instructions', 'Instructions')}:</strong> {paymentSettings.fbx.instructions}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Not configured</p>
              )}
            </div>

            {/* Shipping Current Settings */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-3">{getText('payment.shipping.title', 'Shipping')}</h4>
              <div className="space-y-2">
                <p><strong>{getText('payment.shipping.fee', 'Fee')}:</strong> {paymentSettings.shipping.currency}{paymentSettings.shipping.fee.toFixed(2)}</p>
                <p><strong>{getText('payment.shipping.currency', 'Currency')}:</strong> {paymentSettings.shipping.currency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getText('payment.gateway.title', 'Payment Gateway Management')}</h2>
              <p className="text-gray-600 mt-1">{getText('payment.gateway.subtitle', 'Manage external payment gateways')}</p>
            </div>
            <button
              onClick={handleAddGateway}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
{getText('payment.gateway.add', 'Add Payment Gateway')}
            </button>
          </div>
        </div>

        {/* Gateway Statistics */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalGateways}</div>
              <div className="text-sm text-blue-600">{getText('payment.gateway.total', 'Total Gateways')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.activeGateways}</div>
              <div className="text-sm text-green-600">{getText('payment.gateway.active', 'Active Gateways')}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.testModeGateways}</div>
              <div className="text-sm text-yellow-600">{getText('payment.gateway.test', 'Test Mode')}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getText('payment.gateway.search', 'Search gateways...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{getText('common.allStatus', 'All Status')}</option>
              <option value="active">{getText('common.active', 'Active')}</option>
              <option value="inactive">{getText('common.inactive', 'Inactive')}</option>
            </select>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{getText('common.allModes', 'All Modes')}</option>
              <option value="live">{getText('payment.gateway.live', 'Live')}</option>
              <option value="test">{getText('payment.gateway.test', 'Test')}</option>
            </select>
             <button
               onClick={exportToCSV}
               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <span>{getText('common.exportCsv', 'Export CSV')}</span>
             </button>
           </div>
         </div>

        {/* Gateway Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.name', 'Gateway')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.mode', 'Mode')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.status', 'Status')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.apikey', 'API Key')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.created', 'Created')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getText('payment.gateway.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // Filter gateways based on search and filters
                const filteredGateways = gateways.filter(gateway => {
                  const matchesSearch = gateway.gateway.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      gateway.apiKey?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || 
                                      (statusFilter === 'active' && gateway.isActive) ||
                                      (statusFilter === 'inactive' && !gateway.isActive);
                  const matchesMode = modeFilter === 'all' || gateway.mode === modeFilter;
                  return matchesSearch && matchesStatus && matchesMode;
                });

                if (filteredGateways.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || statusFilter !== 'all' || modeFilter !== 'all' 
                              ? getText('payment.gateway.noResults', 'No gateways match your filters')
                              : getText('payment.gateway.nodata', 'No payment gateways found')
                            }
                          </p>
                          <p className="text-gray-500">
                            {searchTerm || statusFilter !== 'all' || modeFilter !== 'all'
                              ? getText('payment.gateway.tryDifferentFilters', 'Try adjusting your search or filters')
                              : getText('payment.gateway.nodata.subtitle', 'Add your first payment gateway to get started.')
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return filteredGateways.map((gateway) => (
                  <tr key={gateway._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">{gateway.gateway}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        gateway.mode === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {gateway.mode === 'live' ? getText('payment.gateway.live', 'Live') : getText('payment.gateway.test', 'Test')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        gateway.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {gateway.isActive ? getText('common.active', 'Active') : getText('common.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">***{gateway.apiKey?.slice(-4)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(gateway.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditGateway(gateway)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Gateway"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(gateway._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Gateway"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingGateway ? getText('payment.gateway.edit', 'Edit Payment Gateway') : getText('payment.gateway.add', 'Add Payment Gateway')}
                </h2>
                <button
                  onClick={() => setShowGatewayModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="gateway" className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('payment.gateway.name', 'Payment Gateway')} *
                  </label>
                  <select
                    id="gateway"
                    value={gatewayForm.gateway}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, gateway: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{getText('payment.gateway.select', 'Select Gateway')}</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="fpx">FPX (Malaysian Banks)</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('payment.gateway.apikey', 'API Key')} *
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={gatewayForm.apiKey}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Your API key will be encrypted and stored securely</p>
                </div>
                
                <div>
                  <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key *
                  </label>
                  <input
                    type="password"
                    id="secretKey"
                    value={gatewayForm.secretKey}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Enter secret key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Your secret key will be encrypted and stored securely</p>
                </div>
                
                <div>
                  <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    id="webhookSecret"
                    value={gatewayForm.webhookSecret}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    placeholder="Enter webhook secret (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Used for webhook signature verification</p>
                </div>
                
                <div>
                  <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('payment.gateway.mode', 'Mode')} *
                  </label>
                  <select
                    id="mode"
                    value={gatewayForm.mode}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="test">{getText('payment.gateway.testMode', 'Test Mode')}</option>
                    <option value="live">{getText('payment.gateway.liveMode', 'Live Mode')}</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={gatewayForm.isActive}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    {getText('payment.gateway.setActive', 'Set as Active Gateway')}
                  </label>
                </div>
                <p className="text-sm text-gray-500">{getText('payment.gateway.activeNote', 'Only one gateway can be active at a time')}</p>
                
                <div>
                  <label htmlFor="configuration" className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('payment.gateway.configuration', 'Additional Configuration (JSON)')}
                  </label>
                  <textarea
                    id="configuration"
                    value={gatewayForm.configuration}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, configuration: e.target.value }))}
                    placeholder='{"currency": "USD", "country": "US"}'
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">{getText('payment.gateway.configNote', 'Optional gateway-specific configuration in JSON format')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowGatewayModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
{getText('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={savePaymentGateway}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingGateway ? getText('common.update', 'Update Gateway') : getText('common.save', 'Save Gateway')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getText('common.confirmDelete', 'Confirm Delete')}</h3>
            <p className="text-gray-600 mb-6">
              {getText('payment.gateway.deleteConfirm', 'Are you sure you want to delete this payment gateway? This action cannot be undone.')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {getText('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleDeleteGateway(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {getText('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettingsManagement;