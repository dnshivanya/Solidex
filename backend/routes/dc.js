const express = require('express');
const router = express.Router();
const DeliveryChallan = require('../models/DeliveryChallan');
const Stock = require('../models/Stock');
const auth = require('../middleware/auth');

// Get all DCs (public for viewing)
router.get('/', async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const dcs = await DeliveryChallan.find(filter)
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(dcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get DC by ID (public for viewing)
router.get('/:id', async (req, res) => {
  try {
    const dc = await DeliveryChallan.findById(req.params.id)
      .populate('items.product');
    if (!dc) {
      return res.status(404).json({ error: 'DC not found' });
    }
    res.json(dc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create DC (protected)
router.post('/', auth, async (req, res) => {
  try {
    const dc = new DeliveryChallan(req.body);
    await dc.save();
    await dc.populate('items.product');
    res.status(201).json(dc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update DC (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const dc = await DeliveryChallan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('items.product');
    if (!dc) {
      return res.status(404).json({ error: 'DC not found' });
    }
    res.json(dc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete DC (update stock) (protected)
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const dc = await DeliveryChallan.findById(req.params.id)
      .populate('items.product');
    if (!dc) {
      return res.status(404).json({ error: 'DC not found' });
    }

    if (dc.status === 'Completed') {
      return res.status(400).json({ error: 'DC already completed' });
    }

    // Update stock for each item
    for (const item of dc.items) {
      const stock = await Stock.findOne({ product: item.product._id });
      
      if (dc.type === 'Inward') {
        // Inward: Add to stock
        if (stock) {
          stock.quantity += item.quantity;
          stock.lastUpdated = new Date();
          await stock.save();
        } else {
          await Stock.create({
            product: item.product._id,
            quantity: item.quantity
          });
        }
      } else {
        // Outward: Subtract from stock
        if (!stock || stock.quantity < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${item.product.name}` 
          });
        }
        stock.quantity -= item.quantity;
        stock.lastUpdated = new Date();
        await stock.save();
      }
    }

    dc.status = 'Completed';
    await dc.save();
    await dc.populate('items.product');
    res.json(dc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete DC (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const dc = await DeliveryChallan.findByIdAndDelete(req.params.id);
    if (!dc) {
      return res.status(404).json({ error: 'DC not found' });
    }
    res.json({ message: 'DC deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

