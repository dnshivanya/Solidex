const express = require('express');
const router = express.Router();
const Drawing = require('../models/Drawing');
const auth = require('../middleware/auth');

// Get all drawings
router.get('/', async (req, res) => {
  try {
    const { orderId, productId, status } = req.query;
    const filter = {};
    if (orderId) filter.order = orderId;
    if (productId) filter.product = productId;
    if (status) filter.status = status;

    const drawings = await Drawing.find(filter)
      .populate('order')
      .populate('product')
      .sort({ createdAt: -1 });
    res.json(drawings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get drawing by ID
router.get('/:id', async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id)
      .populate('order')
      .populate('product');
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create drawing (protected)
router.post('/', auth, async (req, res) => {
  try {
    const drawing = new Drawing(req.body);
    await drawing.save();
    await drawing.populate('order');
    await drawing.populate('product');
    res.status(201).json(drawing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update drawing (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const drawing = await Drawing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('order').populate('product');
    
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete drawing (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const drawing = await Drawing.findByIdAndDelete(req.params.id);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.json({ message: 'Drawing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

