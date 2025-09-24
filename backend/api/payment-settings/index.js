import dbConnect from '../../../lib/mongodb';
import PaymentSettings from '../../../models/PaymentSettings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  // Get session for authentication
  const session = await getServerSession(req, res, authOptions);

  switch (method) {
    case 'GET':
      try {
        const settings = await PaymentSettings.getCurrentSettings();
        
        res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching payment settings',
          error: error.message
        });
      }
      break;

    case 'PUT':
      // Check if user is authenticated and is admin
      if (!session || !session.user || session.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Admin access required'
        });
      }

      try {
        const updates = req.body;
        
        // Validate required fields
        if (updates.epayum) {
          if (!updates.epayum.link || !updates.epayum.instructions) {
            return res.status(400).json({
              success: false,
              message: 'ePay UM link and instructions are required'
            });
          }
        }
        
        if (updates.fbx) {
          if (!updates.fbx.bankName || !updates.fbx.accountNumber || !updates.fbx.accountHolder) {
            return res.status(400).json({
              success: false,
              message: 'FBX bank name, account number, and account holder are required'
            });
          }
        }

        const updatedSettings = await PaymentSettings.updateSettings(
          updates,
          session.user.id
        );

        res.status(200).json({
          success: true,
          message: 'Payment settings updated successfully',
          data: updatedSettings
        });
      } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({
          success: false,
          message: 'Error updating payment settings',
          error: error.message
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