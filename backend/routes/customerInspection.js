const express = require('express');
const router = express.Router();
const CustomerInspection = require('../models/CustomerInspection');
const auth = require('../middleware/auth');

// Get all customer inspections
router.get('/', async (req, res) => {
  try {
    const { status, orderId, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.overallStatus = status;
    if (orderId) filter.order = orderId;
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    const inspections = await CustomerInspection.find(filter)
      .populate('order')
      .populate('items.product')
      .populate('items.order')
      .sort({ scheduledDate: -1 });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inspection by ID
router.get('/:id', async (req, res) => {
  try {
    const inspection = await CustomerInspection.findById(req.params.id)
      .populate('order')
      .populate('items.product')
      .populate('items.order');
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer inspection (protected)
router.post('/', auth, async (req, res) => {
  try {
    const inspection = new CustomerInspection(req.body);
    await inspection.save();
    await inspection.populate('order');
    await inspection.populate('items.product');
    res.status(201).json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer inspection (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const inspection = await CustomerInspection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('order').populate('items.product').populate('items.order');
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer inspection (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const inspection = await CustomerInspection.findByIdAndDelete(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

