const mongoose = require('mongoose');

const dimensionCheckSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  specification: {
    type: String,
    required: true
  },
  actualValue: {
    type: Number
  },
  tolerance: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Pending'],
    default: 'Pending'
  },
  remarks: {
    type: String
  }
});

const supervisorCheckSchema = new mongoose.Schema({
  checkNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  drawing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drawing'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String
  },
  supervisor: {
    type: String,
    required: true
  },
  checkDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkType: {
    type: String,
    enum: ['Pre-Production', 'In-Process', 'Final', 'Random'],
    default: 'In-Process'
  },
  dimensions: [dimensionCheckSchema],
  visualInspection: {
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Pending'],
      default: 'Pending'
    },
    remarks: String
  },
  materialCheck: {
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Pending'],
      default: 'Pending'
    },
    remarks: String
  },
  overallStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Passed', 'Failed', 'Conditional Pass'],
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

// Generate Check Number before save
supervisorCheckSchema.pre('save', async function(next) {
  if (!this.checkNumber || this.checkNumber.trim() === '') {
    const prefix = 'CHK';
    const year = new Date().getFullYear();
    
    const existingChecks = await this.constructor.find({
      checkNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ checkNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingChecks.length > 0 && existingChecks[0].checkNumber) {
      const match = existingChecks[0].checkNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.checkNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SupervisorCheck', supervisorCheckSchema);

