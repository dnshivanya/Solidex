const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    type: String,
    default: 'Main Warehouse'
  },
  batchNumber: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one stock entry per product per location
stockSchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);

