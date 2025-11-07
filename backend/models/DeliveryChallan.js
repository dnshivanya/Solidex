const mongoose = require('mongoose');

const dcItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    default: 'PCS'
  },
  description: {
    type: String
  }
});

const dcSchema = new mongoose.Schema({
  dcNumber: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null/undefined values but enforces uniqueness for non-null values
  },
  type: {
    type: String,
    enum: ['Inward', 'Outward'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  partyName: {
    type: String,
    required: true
  },
  partyAddress: {
    type: String
  },
  partyContact: {
    type: String
  },
  items: [dcItemSchema],
  vehicleNumber: {
    type: String
  },
  driverName: {
    type: String
  },
  driverContact: {
    type: String
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  createdBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

// Generate DC Number before save
dcSchema.pre('save', async function(next) {
  // Only generate if dcNumber is not already set
  if (!this.dcNumber || this.dcNumber.trim() === '') {
    const prefix = this.type === 'Inward' ? 'INW' : 'OUT';
    const year = new Date().getFullYear();
    
    // Find the highest existing DC number for this type and year
    const existingDCs = await this.constructor.find({
      type: this.type,
      dcNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ dcNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingDCs.length > 0 && existingDCs[0].dcNumber) {
      // Extract sequence number from existing DC
      const match = existingDCs[0].dcNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.dcNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DeliveryChallan', dcSchema);

