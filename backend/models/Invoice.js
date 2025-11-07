const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  description: {
    type: String
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
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  amount: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
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
    enum: ['Sales', 'Purchase', 'Service'],
    required: true,
    default: 'Sales'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
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
  partyGSTIN: {
    type: String
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  notes: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

// Generate Invoice Number before save
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber || this.invoiceNumber.trim() === '') {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    
    const existingInvoices = await this.constructor.find({
      invoiceNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ invoiceNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (existingInvoices.length > 0 && existingInvoices[0].invoiceNumber) {
      const match = existingInvoices[0].invoiceNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
    
    this.invoiceNumber = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Calculate totals before save
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemAmount = (item.quantity * item.rate) - (item.discount || 0);
      item.amount = itemAmount + (itemAmount * (item.tax || 0) / 100);
      return sum + item.amount;
    }, 0);
    
    this.total = this.subtotal - (this.discount || 0) + (this.tax || 0) + (this.shipping || 0);
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

