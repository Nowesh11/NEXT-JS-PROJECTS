const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const { verifySession } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { generateReferenceNumber } = require('../utils/helpers');
const { Parser } = require('json2csv');

// @route   GET /api/form-responses
// @desc    Get all form responses with filtering
// @access  Private (Admin only)
router.get('/', verifySession, checkPermission('forms.view_responses'), async (req, res) => {
  try {
    const { formId, status, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = {};
    
    if (formId) query.formId = mongoose.Types.ObjectId(formId);
    if (status) query.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await FormResponse.countDocuments(query);
    
    // Get responses with pagination
    const responses = await FormResponse.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('formId', 'title slug type');
    
    res.json({ 
      success: true, 
      count: responses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: responses 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/form-responses/:id
// @desc    Get single form response
// @access  Private (Admin only)
router.get('/:id', verifySession, checkPermission('forms.view_responses'), async (req, res) => {
  try {
    const response = await FormResponse.findById(req.params.id)
      .populate('formId', 'title fields');
    
    if (!response) {
      return res.status(404).json({ success: false, error: 'Form response not found' });
    }

    res.json({ success: true, data: response });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Form response not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/form-responses
// @desc    Submit a form response
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { formId, user, responseData } = req.body;

    // Check if form exists and is active
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Check if form is active
    const currentDate = new Date();
    const isActive = form.status === 'active' && 
                    form.startDate <= currentDate && 
                    form.endDate >= currentDate;

    if (!isActive) {
      return res.status(403).json({ 
        success: false, 
        error: 'This form is not currently accepting submissions' 
      });
    }

    // Check if form requires authentication and user is authenticated
    if (form.settings.requireAuthentication && !user.userId) {
      return res.status(401).json({
        success: false,
        error: 'This form requires authentication to submit'
      });
    }

    // Check if user has already submitted a response if multiple submissions are not allowed
    if (!form.settings.allowMultipleSubmissions && user.userId) {
      const existingResponse = await FormResponse.findOne({
        formId: formId,
        'user.userId': user.userId
      });

      if (existingResponse) {
        return res.status(400).json({
          success: false,
          error: 'You have already submitted a response to this form'
        });
      }
    }

    // Check if form has reached maximum applications
    if (form.settings.maxApplications && form.responseCount >= form.settings.maxApplications) {
      return res.status(400).json({
        success: false,
        error: 'This form has reached its maximum number of applications'
      });
    }

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Create form response
    const formResponse = await FormResponse.create({
      formId,
      referenceNumber,
      user,
      responseData,
      submittedAt: Date.now()
    });

    // Update form response count
    await Form.findByIdAndUpdate(formId, {
      $inc: { responseCount: 1 }
    });

    res.status(201).json({ 
      success: true, 
      data: {
        id: formResponse._id,
        referenceNumber: formResponse.referenceNumber
      }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/form-responses/:id
// @desc    Update form response status and add admin notes
// @access  Private (Admin only)
router.put('/:id', verifySession, checkPermission('forms.update_responses'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Find response first to check if it exists
    let response = await FormResponse.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({ success: false, error: 'Form response not found' });
    }

    // Update response
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    
    // Add review information if status is changing
    if (status && status !== response.status) {
      updateData.reviewedBy = req.session.user.id;
      updateData.reviewedAt = Date.now();
    }

    response = await FormResponse.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: response });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Form response not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/form-responses/form/:formId
// @desc    Get all responses for a specific form
// @access  Private (Admin only)
router.get('/form/:formId', verifySession, checkPermission('forms.view_responses'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = {
      formId: mongoose.Types.ObjectId(req.params.formId)
    };
    
    if (status) query.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await FormResponse.countDocuments(query);
    
    // Get responses with pagination
    const responses = await FormResponse.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({ 
      success: true, 
      count: responses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: responses 
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Invalid form ID' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/form-responses/export/:formId
// @desc    Export form responses as CSV
// @access  Private (Admin only)
router.get('/export/:formId', verifySession, checkPermission('forms.export_responses'), async (req, res) => {
  try {
    // Get form to get field information
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Get all responses for this form
    const responses = await FormResponse.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    
    if (responses.length === 0) {
      return res.status(404).json({ success: false, error: 'No responses found for this form' });
    }

    // Prepare data for CSV export
    const fields = [
      { label: 'Reference Number', value: 'referenceNumber' },
      { label: 'Name', value: 'user.name' },
      { label: 'Email', value: 'user.email' },
      { label: 'Phone', value: 'user.phone' },
      { label: 'Status', value: 'status' },
      { label: 'Submitted At', value: 'submittedAt' }
    ];

    // Add form fields to CSV fields
    form.fields.forEach(field => {
      if (field.type !== 'section-break') {
        fields.push({
          label: field.label,
          value: row => {
            const fieldValue = row.responseData.get(field.id);
            if (Array.isArray(fieldValue)) {
              return fieldValue.join(', ');
            }
            return fieldValue || '';
          }
        });
      }
    });

    // Add admin notes
    fields.push({ label: 'Admin Notes', value: 'adminNotes' });

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(responses);

    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment(`${form.title.en || 'form'}-responses-${Date.now()}.csv`);
    
    // Send CSV data
    res.send(csv);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Invalid form ID' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/form-responses/stats/:formId
// @desc    Get statistics for a form's responses
// @access  Private (Admin only)
router.get('/stats/:formId', verifySession, checkPermission('forms.view_responses'), async (req, res) => {
  try {
    // Check if form exists
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Get response statistics
    const stats = await FormResponse.aggregate([
      { $match: { formId: mongoose.Types.ObjectId(req.params.formId) } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format statistics
    const formattedStats = {
      total: form.responseCount,
      byStatus: {}
    };

    stats.forEach(stat => {
      formattedStats.byStatus[stat._id] = stat.count;
    });

    // Get daily submission counts for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await FormResponse.aggregate([
      { 
        $match: { 
          formId: mongoose.Types.ObjectId(req.params.formId),
          submittedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    formattedStats.dailySubmissions = dailyStats.map(day => ({
      date: day._id,
      count: day.count
    }));

    res.json({ success: true, data: formattedStats });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Invalid form ID' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;