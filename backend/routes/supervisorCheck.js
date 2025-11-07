const express = require('express');
const router = express.Router();
const SupervisorCheck = require('../models/SupervisorCheck');
const auth = require('../middleware/auth');

// Get all supervisor checks
router.get('/', async (req, res) => {
  try {
    const { status, orderId, productId, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.overallStatus = status;
    if (orderId) filter.order = orderId;
    if (productId) filter.product = productId;
    if (startDate || endDate) {
      filter.checkDate = {};
      if (startDate) filter.checkDate.$gte = new Date(startDate);
      if (endDate) filter.checkDate.$lte = new Date(endDate);
    }

    const checks = await SupervisorCheck.find(filter)
      .populate('order')
      .populate('drawing')
      .populate('product')
      .sort({ checkDate: -1 });
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supervisor check by ID
router.get('/:id', async (req, res) => {
  try {
    const check = await SupervisorCheck.findById(req.params.id)
      .populate('order')
      .populate('drawing')
      .populate('product');
    if (!check) {
      return res.status(404).json({ error: 'Supervisor check not found' });
    }
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create supervisor check (protected)
router.post('/', auth, async (req, res) => {
  try {
    const check = new SupervisorCheck(req.body);
    await check.save();
    await check.populate('order');
    await check.populate('drawing');
    await check.populate('product');
    res.status(201).json(check);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update supervisor check (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const check = await SupervisorCheck.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('order').populate('drawing').populate('product');
    
    if (!check) {
      return res.status(404).json({ error: 'Supervisor check not found' });
    }
    
    // Update overall status based on dimension checks
    if (check.dimensions && check.dimensions.length > 0) {
      const allPassed = check.dimensions.every(d => d.status === 'Pass');
      const hasFailed = check.dimensions.some(d => d.status === 'Fail');
      
      if (hasFailed) check.overallStatus = 'Failed';
      else if (allPassed && check.visualInspection?.status === 'Pass' && check.materialCheck?.status === 'Pass') {
        check.overallStatus = 'Passed';
      } else if (check.dimensions.some(d => d.status === 'Pending')) {
        check.overallStatus = 'In Progress';
      }
    }
    
    await check.save();
    res.json(check);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete supervisor check (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const check = await SupervisorCheck.findByIdAndDelete(req.params.id);
    if (!check) {
      return res.status(404).json({ error: 'Supervisor check not found' });
    }
    res.json({ message: 'Supervisor check deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

