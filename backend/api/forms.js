const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const { verifySession } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { generateReferenceNumber } = require('../utils/helpers');

// @route   GET /api/forms
// @desc    Get all forms with optional filtering
// @access  Public/Private depending on filter
router.get('/', async (req, res) => {
  try {
    const { type, linkedId, role, status, isAdmin } = req.query;
    
    // Build query object
    const query = {};
    
    if (type) query.type = type;
    if (linkedId) query.linkedId = mongoose.Types.ObjectId(linkedId);
    if (role) query.role = role;
    
    // For public access, only show active forms
    if (!isAdmin || isAdmin !== 'true') {
      query.status = 'active';
      const currentDate = new Date();
      query.startDate = { $lte: currentDate };
      query.endDate = { $gte: currentDate };
    } else if (status) {
      query.status = status;
    }

    const forms = await Form.find(query)
      .sort({ startDate: -1 })
      .select('title slug type linkedId role description startDate endDate status responseCount');
    
    res.json({ success: true, count: forms.length, data: forms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/forms/:id
// @desc    Get single form
// @access  Public/Private depending on status
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Check if form is active or user is admin
    const isAdmin = req.query.isAdmin === 'true';
    const currentDate = new Date();
    const isActive = form.status === 'active' && 
                    form.startDate <= currentDate && 
                    form.endDate >= currentDate;

    if (!isActive && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'This form is not currently active' 
      });
    }

    res.json({ success: true, data: form });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/forms
// @desc    Create new form
// @access  Private (Admin only)
router.post('/', verifySession, checkPermission('forms.create'), async (req, res) => {
  try {
    // Generate slug from title
    let slug = '';
    if (req.body.title && req.body.title.en) {
      const slugBase = req.body.title.en.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      slug = slugBase;
      
      // Check if slug exists and append number if needed
      let slugExists = true;
      let counter = 1;
      
      while (slugExists) {
        const existingForm = await Form.findOne({ slug });
        if (!existingForm) {
          slugExists = false;
        } else {
          slug = `${slugBase}-${counter}`;
          counter++;
        }
      }
    }

    // Create form with generated slug
    const formData = {
      ...req.body,
      slug,
      created_by: req.session.user.id,
      created_at: Date.now()
    };

    const form = await Form.create(formData);
    res.status(201).json({ success: true, data: form });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/forms/:id
// @desc    Update form
// @access  Private (Admin only)
router.put('/:id', verifySession, checkPermission('forms.update'), async (req, res) => {
  try {
    // Find form first to check if it exists
    let form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Update form
    form = await Form.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updated_by: req.session.user.id,
        updated_at: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: form });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   DELETE /api/forms/:id
// @desc    Delete form
// @access  Private (Admin only)
router.delete('/:id', verifySession, checkPermission('forms.delete'), async (req, res) => {
  try {
    // Check if form has responses
    const responseCount = await FormResponse.countDocuments({ formId: req.params.id });
    
    if (responseCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete form with ${responseCount} responses. Archive it instead.` 
      });
    }

    const form = await Form.findByIdAndDelete(req.params.id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   GET /api/forms/entity/:type/:id
// @desc    Get forms for a specific entity (project, activity, initiative)
// @access  Public/Private depending on status
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { role, isAdmin } = req.query;
    
    // Validate type
    const validTypes = ['project', 'activity', 'initiative'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid entity type. Must be project, activity, or initiative' 
      });
    }

    // Build query
    const query = {
      type,
      linkedId: mongoose.Types.ObjectId(id)
    };
    
    if (role) query.role = role;
    
    // For public access, only show active forms
    if (!isAdmin || isAdmin !== 'true') {
      query.status = 'active';
      const currentDate = new Date();
      query.startDate = { $lte: currentDate };
      query.endDate = { $gte: currentDate };
    }

    const forms = await Form.find(query)
      .sort({ startDate: -1 })
      .select('title slug type linkedId role description startDate endDate status responseCount');
    
    res.json({ success: true, count: forms.length, data: forms });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;