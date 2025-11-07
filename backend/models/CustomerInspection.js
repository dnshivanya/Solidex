const mongoose = require('mongoose');

const inspectionItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  inspectedQuantity: {
    type: Number,
    default: 0
  },
  passedQuantity: {
    type: Number,
    default: 0
  },
  rejectedQuantity: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String
  }
});

const customerInspectionSchema = new mongoose.Schema({
  inspectionNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerTeam: [{
    name: String,
    designation: String,
    contact: String
  }],
  scheduledDate: {
    type: Date,
    required: true
  },
  actualDate: {
    type: Date
  },
  inspectionType: {
    type: String,
    enum: ['Pre-Production', 'In-Process', 'Final', 'Re-Inspection'],
    default: 'Final'
  },
  items: [inspectionItemSchema],
  overallStatus: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Passed', 'Failed', 'Conditional Approval', 'Cancelled'],
    default: 'Scheduled'
  },
  customerRemarks: {
    type: String
  },
  internalRemarks: {
    type: String
  },
  documents: {
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

// Generate Inspection Number before save
customerInspectionSchema.pre('save', async function(next) {
  if (!this.inspectionNumber || this.inspectionNumber.trim() === '') {
    const prefix = 'INS';
    const year = new Date().getFullYear();
    
    const existingInspections = await this.constructor.find({
      inspectionNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ inspectionNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingInspections.length > 0 && existingInspections[0].inspectionNumber) {
      const match = existingInspections[0].inspectionNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.inspectionNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('CustomerInspection', customerInspectionSchema);

