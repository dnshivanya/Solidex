const express = require('express');
const router = express.Router();
const DeliveryChallan = require('../models/DeliveryChallan');
const Stock = require('../models/Stock');
const Product = require('../models/Product');
const QualityCheck = require('../models/QualityCheck');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const CustomerInspection = require('../models/CustomerInspection');
const Drawing = require('../models/Drawing');
const SupervisorCheck = require('../models/SupervisorCheck');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's DCs
    const todayDCs = await DeliveryChallan.countDocuments({
      date: { $gte: today }
    });

    // This month's stats
    const thisMonthInward = await DeliveryChallan.countDocuments({
      type: 'Inward',
      date: { $gte: thisMonth }
    });
    const thisMonthOutward = await DeliveryChallan.countDocuments({
      type: 'Outward',
      date: { $gte: thisMonth }
    });

    // Stock summary
    const stockSummary = await Stock.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // Total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Recent DCs
    const recentDCs = await DeliveryChallan.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock items
    const lowStock = await Stock.find({ quantity: { $lte: 10 } })
      .populate('product')
      .limit(5);

    // Quality Check stats
    const pendingQCs = await QualityCheck.countDocuments({ overallStatus: 'Pending' });
    const failedQCs = await QualityCheck.countDocuments({ overallStatus: 'Failed' });
    const recentQCs = await QualityCheck.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(3);

    // Invoice stats
    const pendingInvoices = await Invoice.countDocuments({ status: { $in: ['Draft', 'Sent'] } });
    const totalInvoiceAmount = await Invoice.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const recentInvoices = await Invoice.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(3);

    // Order stats
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'In Production'] } });
    const totalOrderAmount = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const recentOrders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(3);

    // Customer Inspection stats
    const scheduledInspections = await CustomerInspection.countDocuments({ overallStatus: 'Scheduled' });
    const recentInspections = await CustomerInspection.find()
      .populate('order')
      .sort({ scheduledDate: -1 })
      .limit(3);

    // Drawing stats
    const pendingDrawings = await Drawing.countDocuments({ status: 'Pending Approval' });
    const recentDrawings = await Drawing.find()
      .populate('product')
      .populate('order')
      .sort({ createdAt: -1 })
      .limit(3);

    // Supervisor Check stats
    const pendingChecks = await SupervisorCheck.countDocuments({ overallStatus: 'Pending' });
    const recentChecks = await SupervisorCheck.find()
      .populate('product')
      .populate('order')
      .sort({ checkDate: -1 })
      .limit(3);

    res.json({
      todayDCs,
      thisMonthInward,
      thisMonthOutward,
      totalStock: stockSummary[0]?.total || 0,
      totalProducts,
      recentDCs,
      lowStock,
      pendingQCs,
      failedQCs,
      recentQCs,
      pendingInvoices,
      totalInvoiceAmount: totalInvoiceAmount[0]?.total || 0,
      recentInvoices,
      pendingOrders,
      totalOrderAmount: totalOrderAmount[0]?.total || 0,
      recentOrders,
      scheduledInspections,
      recentInspections,
      pendingDrawings,
      recentDrawings,
      pendingChecks,
      recentChecks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

