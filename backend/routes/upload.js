const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadDrawing = require('../middleware/uploadDrawing');
const auth = require('../middleware/auth');
const path = require('path');

// Upload single image
router.post('/product-image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file path (relative to public/uploads)
    const fileUrl = `/uploads/products/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/product-images', auth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    res.json({
      success: true,
      imageUrls: imageUrls,
      filenames: req.files.map(file => file.filename)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload drawing file
router.post('/drawing', auth, uploadDrawing.single('drawing'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/drawings/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl: fileUrl,
      filename: req.file.filename,
      fileType: path.extname(req.file.originalname).toUpperCase().replace('.', '')
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;


