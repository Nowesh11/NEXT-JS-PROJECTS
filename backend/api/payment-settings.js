import PaymentSettings from '../models/PaymentSettings';
import mongoose from 'mongoose';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  
  // Get session for authentication
  const session = await getSession({ req });
  
  // For non-GET requests, require authentication and admin role
  if (req.method !== 'GET') {
    if (!session || !session.user.roles.includes('admin')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }

  // Connect to database
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  switch (method) {
    case 'GET':
      try {
        // Find existing settings or create default ones
        let settings = await PaymentSettings.findOne();
        if (!settings) {
          settings = new PaymentSettings();
          await settings.save();
        }
        
        res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch payment settings'
        });
      }
      break;

    case 'PUT':
      try {
        const updates = req.body;
        
        // Validate required fields for ePay
        if (updates.epay && updates.epay.enabled) {
          if (!updates.epay.accountNumber || !updates.epay.accountName || !updates.epay.bankName) {
            return res.status(400).json({
              success: false,
              message: 'ePay account number, account name, and bank name are required'
            });
          }
        }
        
        // Validate required fields for FBX
        if (updates.fbx && updates.fbx.enabled) {
          if (!updates.fbx.accountNumber || !updates.fbx.accountName || !updates.fbx.bankName) {
            return res.status(400).json({
              success: false,
              message: 'FBX account number, account name, and bank name are required'
            });
          }
        }
        
        // Find existing settings or create new ones
        let settings = await PaymentSettings.findOne();
        if (!settings) {
          settings = new PaymentSettings();
        }
        
        // Update fields based on request body
        if (updates.epay) {
          settings.epay = {
            ...settings.epay.toObject(),
            ...updates.epay
          };
        }
        
        if (updates.fbx) {
          settings.fbx = {
            ...settings.fbx.toObject(),
            ...updates.fbx
          };
        }
        
        if (updates.cash) {
          settings.cash = {
            ...settings.cash.toObject(),
            ...updates.cash
          };
        }
        
        if (updates.bankTransfer) {
          settings.bankTransfer = {
            ...settings.bankTransfer.toObject(),
            ...updates.bankTransfer
          };
        }
        
        // Save updated settings
        await settings.save();
        
        res.status(200).json({
          success: true,
          data: settings,
          message: 'Payment settings updated successfully'
        });
      } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to update payment settings'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}