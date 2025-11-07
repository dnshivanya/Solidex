const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  specifications: {
    type: String
  },
  rate: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerContact: {
    type: String
  },
  customerEmail: {
    type: String
  },
  customerAddress: {
    type: String
  },
  customerGSTIN: {
    type: String
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Production', 'Ready for Inspection', 'Inspection Scheduled', 'Approved', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  remarks: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

// Generate Order Number before save
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber || this.orderNumber.trim() === '') {
    const prefix = 'ORD';
    const year = new Date().getFullYear();
    
    const existingOrders = await this.constructor.find({
      orderNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ orderNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingOrders.length > 0 && existingOrders[0].orderNumber) {
      const match = existingOrders[0].orderNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.orderNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

