const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Bucket', 'Bucket Hard Facing', 'Re-bore and Re-Alignment', 'Dozer Blades', 'Other'],
    default: 'Other'
  },
  specifications: {
    type: String
  },
  unit: {
    type: String,
    default: 'PCS'
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

