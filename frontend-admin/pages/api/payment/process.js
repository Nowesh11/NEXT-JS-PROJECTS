// API route for payment processing
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      amount, 
      currency = 'USD', 
      paymentMethod, 
      customerInfo, 
      type, // 'subscription', 'donation', 'purchase'
      metadata 
    } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod || !customerInfo || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Mock payment processing - replace with actual payment gateway
    const paymentResult = await processPayment({
      amount,
      currency,
      paymentMethod,
      customerInfo,
      type,
      metadata
    });

    if (paymentResult.success) {
      // Log successful payment
      console.log('Payment processed successfully:', {
        transactionId: paymentResult.transactionId,
        amount,
        currency,
        type,
        timestamp: new Date().toISOString()
      });

      // In production, save to database
      await savePaymentRecord(paymentResult);

      return res.status(200).json({
        success: true,
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        status: 'completed',
        message: 'Payment processed successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment processing failed'
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Mock payment processing function
async function processPayment(paymentData) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { amount, currency, paymentMethod, customerInfo, type } = paymentData;

  // Mock validation - simulate different scenarios
  const scenarios = {
    // Test card numbers for different outcomes
    '4242424242424242': { success: true }, // Success
    '4000000000000002': { success: false, error: 'Card declined' }, // Declined
    '4000000000009995': { success: false, error: 'Insufficient funds' }, // Insufficient funds
    '4000000000000069': { success: false, error: 'Expired card' }, // Expired
  };

  const cardNumber = paymentMethod.cardNumber?.replace(/\s/g, '');
  const scenario = scenarios[cardNumber];

  if (scenario) {
    if (scenario.success) {
      return {
        success: true,
        transactionId: generateTransactionId(),
        amount,
        currency,
        paymentMethod: {
          type: 'card',
          last4: cardNumber.slice(-4),
          brand: getCardBrand(cardNumber)
        },
        customerInfo,
        type,
        processedAt: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: scenario.error
      };
    }
  }

  // Default success for other card numbers
  return {
    success: true,
    transactionId: generateTransactionId(),
    amount,
    currency,
    paymentMethod: {
      type: 'card',
      last4: cardNumber?.slice(-4) || '****',
      brand: getCardBrand(cardNumber)
    },
    customerInfo,
    type,
    processedAt: new Date().toISOString()
  };
}

// Helper functions
function generateTransactionId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN_${timestamp}_${random}`;
}

function getCardBrand(cardNumber) {
  if (!cardNumber) return 'unknown';
  
  const number = cardNumber.replace(/\s/g, '');
  
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  
  return 'unknown';
}

// Mock function to save payment record
async function savePaymentRecord(paymentResult) {
  // In production, save to database
  console.log('Saving payment record:', paymentResult);
  
  // Mock database save
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ saved: true, id: paymentResult.transactionId });
    }, 100);
  });
}

// Webhook handler for payment status updates (separate endpoint)
export async function handlePaymentWebhook(req, res) {
  try {
    const { event, data } = req.body;
    
    switch (event) {
      case 'payment.succeeded':
        console.log('Payment succeeded:', data);
        // Update database, send confirmation email, etc.
        break;
        
      case 'payment.failed':
        console.log('Payment failed:', data);
        // Handle failed payment, notify user, etc.
        break;
        
      case 'subscription.created':
        console.log('Subscription created:', data);
        // Activate subscription, grant access, etc.
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
}