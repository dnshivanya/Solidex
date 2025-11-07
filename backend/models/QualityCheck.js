const mongoose = require('mongoose');

const qualityCheckItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  checkedQuantity: {
    type: Number,
    default: 0
  },
  passedQuantity: {
    type: Number,
    default: 0
  },
  failedQuantity: {
    type: Number,
    default: 0
  },
  defects: [{
    type: String,
    description: String
  }],
  inspectorNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Passed', 'Failed', 'Partial'],
    default: 'Pending'
  }
});

const qualityCheckSchema = new mongoose.Schema({
  qcNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  dcReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryChallan'
  },
  type: {
    type: String,
    enum: ['Incoming', 'Outgoing', 'Production', 'Rework'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [qualityCheckItemSchema],
  inspector: {
    type: String,
    required: true
  },
  overallStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Passed', 'Failed', 'Partial'],
    default: 'Pending'
  },
  remarks: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  createdBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

// Generate QC Number before save
qualityCheckSchema.pre('save', async function(next) {
  if (!this.qcNumber || this.qcNumber.trim() === '') {
    const prefix = 'QC';
    const year = new Date().getFullYear();
    
    const existingQCs = await this.constructor.find({
      qcNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ qcNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingQCs.length > 0 && existingQCs[0].qcNumber) {
      const match = existingQCs[0].qcNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.qcNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('QualityCheck', qualityCheckSchema);

