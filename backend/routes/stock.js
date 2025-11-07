const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all stock (public for viewing)
router.get('/', async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate('product')
      .sort({ lastUpdated: -1 });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const stock = await Stock.find({ product: req.params.productId })
      .populate('product');
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStock = await Stock.find({ quantity: { $lte: threshold } })
      .populate('product');
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stock entry (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { product, quantity, location } = req.body;
    
    if (!product) {
      return res.status(400).json({ error: 'Product is required' });
    }
    
    // Check if stock entry already exists for this product and location
    const existingStock = await Stock.findOne({ 
      product: product,
      location: location || 'Main Warehouse'
    });
    
    if (existingStock) {
      // Update existing stock
      existingStock.quantity = quantity || existingStock.quantity;
      existingStock.lastUpdated = new Date();
      await existingStock.save();
      await existingStock.populate('product');
      return res.json(existingStock);
    }
    
    // Create new stock entry
    const stock = new Stock({
      product,
      quantity: quantity || 0,
      location: location || 'Main Warehouse',
      lastUpdated: new Date()
    });
    
    await stock.save();
    await stock.populate('product');
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update stock manually (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    ).populate('product');
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete stock entry (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ message: 'Stock entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock summary
router.get('/summary', async (req, res) => {
  try {
    const totalProducts = await Stock.countDocuments();
    const totalQuantity = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const lowStock = await Stock.countDocuments({ quantity: { $lte: 10 } });
    
    res.json({
      totalProducts,
      totalQuantity: totalQuantity[0]?.total || 0,
      lowStockCount: lowStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

