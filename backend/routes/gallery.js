const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all gallery items (public)
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get gallery item by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create gallery item (protected)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    const galleryItem = new Gallery({
      title: req.body.title || 'Untitled',
      image: imageUrl,
      description: req.body.description || '',
      order: req.body.order || 0
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update gallery item (protected)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    if (req.file) {
      galleryItem.image = `/uploads/products/${req.file.filename}`;
    }

    if (req.body.title) galleryItem.title = req.body.title;
    if (req.body.description !== undefined) galleryItem.description = req.body.description;
    if (req.body.order !== undefined) galleryItem.order = req.body.order;
    if (req.body.isActive !== undefined) galleryItem.isActive = req.body.isActive;

    await galleryItem.save();
    res.json(galleryItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete gallery item (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

