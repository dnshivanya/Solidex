const express = require('express');
const router = express.Router();
const QualityCheck = require('../models/QualityCheck');
const auth = require('../middleware/auth');

// Get all quality checks
router.get('/', async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.overallStatus = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const qcs = await QualityCheck.find(filter)
      .populate('items.product')
      .populate('dcReference')
      .sort({ createdAt: -1 });
    res.json(qcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get QC by ID
router.get('/:id', async (req, res) => {
  try {
    const qc = await QualityCheck.findById(req.params.id)
      .populate('items.product')
      .populate('dcReference');
    if (!qc) {
      return res.status(404).json({ error: 'Quality check not found' });
    }
    res.json(qc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create quality check (protected)
router.post('/', auth, async (req, res) => {
  try {
    const qc = new QualityCheck(req.body);
    await qc.save();
    await qc.populate('items.product');
    await qc.populate('dcReference');
    res.status(201).json(qc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update quality check (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const qc = await QualityCheck.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('items.product').populate('dcReference');
    
    if (!qc) {
      return res.status(404).json({ error: 'Quality check not found' });
    }
    
    // Update overall status based on items
    if (qc.items && qc.items.length > 0) {
      const allPassed = qc.items.every(item => item.status === 'Passed');
      const allFailed = qc.items.every(item => item.status === 'Failed');
      const hasPartial = qc.items.some(item => item.status === 'Partial');
      
      if (allPassed) qc.overallStatus = 'Passed';
      else if (allFailed) qc.overallStatus = 'Failed';
      else if (hasPartial || qc.items.some(item => item.status === 'In Progress')) qc.overallStatus = 'Partial';
      else qc.overallStatus = 'In Progress';
    }
    
    await qc.save();
    res.json(qc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete quality check (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const qc = await QualityCheck.findByIdAndDelete(req.params.id);
    if (!qc) {
      return res.status(404).json({ error: 'Quality check not found' });
    }
    res.json({ message: 'Quality check deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

