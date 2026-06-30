import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const { range } = req.query; // daily, weekly, monthly, yearly
  
  let matchDate = {};
  const now = new Date();
  let startDate = new Date();
  
  if (range === 'daily') {
    startDate.setDate(now.getDate() - 1);
  } else if (range === 'weekly') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'monthly') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (range === 'yearly') {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    // Default to all time if no range
    startDate = new Date(0);
  }
  
  matchDate = { createdAt: { $gte: startDate } };

  // Calculate Total Revenue and Orders
  const revenueStats = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
  ]);

  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
  const totalOrders = revenueStats.length > 0 ? revenueStats[0].totalOrders : 0;

  // Customers Count
  const totalCustomers = await User.countDocuments(matchDate);

  // Products Count
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

  // Order Status Distribution
  const orderStatusDistribution = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Payment Status Distribution
  const paymentStatusDistribution = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);

  const paymentMethodDistribution = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
  ]);

  // Daily/Monthly Sales Chart Data
  const format = range === 'yearly' || range === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
  const salesChartData = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, sales: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Top Selling Products (From Orders)
  const topProducts = await Order.aggregate([
    { $match: matchDate },
    { $unwind: '$items' },
    { $group: { _id: '$items.id', name: { $first: '$items.name' }, totalSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    summary: {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts
    },
    orderStatusDistribution,
    paymentStatusDistribution,
    paymentMethodDistribution,
    salesChartData,
    topProducts
  });
});
