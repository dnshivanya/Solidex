const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  drawingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  version: {
    type: String,
    default: '1.0'
  },
  revision: {
    type: String
  },
  drawingFile: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'DWG', 'DXF', 'PNG', 'JPG', 'Other'],
    default: 'PDF'
  },
  uploadedBy: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String
  },
  approvalDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Superseded'],
    default: 'Draft'
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      outerDiameter: Number,
      innerDiameter: Number,
      thickness: Number,
      customFields: [{
        name: String,
        value: String,
        unit: String
      }]
    },
    material: String,
    weight: Number,
    other: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate Drawing Number before save
drawingSchema.pre('save', async function(next) {
  if (!this.drawingNumber || this.drawingNumber.trim() === '') {
    const prefix = 'DRW';
    const year = new Date().getFullYear();
    
    const existingDrawings = await this.constructor.find({
      drawingNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ drawingNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingDrawings.length > 0 && existingDrawings[0].drawingNumber) {
      const match = existingDrawings[0].drawingNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.drawingNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Drawing', drawingSchema);

