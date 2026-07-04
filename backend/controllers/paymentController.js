import asyncHandler from 'express-async-handler';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { notifyAdmins } from '../services/notificationService.js';

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }

  // 1. Validate Product Prices & Stock, Calculate Total
  let calculatedTotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.id);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Product ${item.name} is out of stock`);
    }
    calculatedTotal += product.price * item.qty;
  }

  // 2. Apply Coupon
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (coupon && calculatedTotal >= coupon.minCart) {
      if (coupon.type === 'percentage') {
        discountAmount = (calculatedTotal * coupon.discount) / 100;
      } else {
        discountAmount = coupon.discount;
      }
    }
  }

  const finalAmount = Math.max(0, calculatedTotal - discountAmount);

  // 3. Create Razorpay Order
  // receipt max length for Razorpay is 40 characters
  const receiptId = `rcpt_${req.user._id.toString().substring(18)}_${Date.now()}`;
  const razorpayOrder = await createRazorpayOrder(finalAmount, receiptId);

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    currency: razorpayOrder.currency,
    publicKey: process.env.RAZORPAY_KEY_ID || 'mock_key_id'
  });
});

// @desc    Verify Payment and Create Order
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature, 
    userName, 
    email, 
    phone, 
    address, 
    items, 
    total, 
    paymentMethod,
    discountAmount 
  } = req.body;

  let isSignatureValid = false;
  let paymentGateway = 'Razorpay';
  let paymentStatus = 'Success';

  // 1. Verify Razorpay Signature
  if (paymentMethod !== 'Cash on Delivery') {
    isSignatureValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isSignatureValid) {
      paymentStatus = 'Failed';
    }
  } else {
    paymentGateway = 'COD';
    paymentStatus = 'Pending';
  }

  // Generate Transaction ID
  const txnId = paymentMethod !== 'Cash on Delivery' ? razorpayPaymentId : `TXN_COD_${Date.now()}`;

  // 2. Create Order (Only if payment is successful or COD)
  let createdOrder = null;
  if (paymentStatus === 'Success' || paymentStatus === 'Pending') {
    const order = new Order({
      userId: req.user._id,
      userName,
      email,
      phone,
      address,
      items,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      status: 'Placed',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      transactionId: txnId,
      paymentDate: paymentMethod !== 'Cash on Delivery' ? new Date() : null,
      paymentAmount: total,
      paymentCurrency: 'INR'
    });

    createdOrder = await order.save();

    // 3. Reduce Product Stock
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    // 4. Clear Customer Cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  // 5. Save Payment Record
  const paymentRecord = new Payment({
    transactionId: txnId,
    orderId: createdOrder ? createdOrder._id : null,
    userId: req.user._id,
    customerName: userName,
    customerEmail: email,
    customerPhone: phone,
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    razorpaySignature: razorpaySignature || null,
    signatureVerified: isSignatureValid,
    paymentGateway: paymentGateway,
    paymentMethod: paymentMethod,
    amount: total,
    currency: 'INR',
    paymentStatus: paymentStatus,
    paidAt: paymentStatus === 'Success' ? new Date() : null,
  });

  await paymentRecord.save();

  if (paymentStatus === 'Failed') {
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  // 5. Generate Notifications
  await notifyAdmins(
    'Success',
    'New Paid Order',
    `Order #${createdOrder._id.toString().substring(0, 6)} placed by ${userName} for ₹${total}`,
    createdOrder._id,
    'Order'
  );

  res.status(201).json(createdOrder);
});

// @desc    Get Payment Details
// @route   GET /api/payments/:id
// @access  Private/Admin
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('orderId', 'status total');
  if (payment) {
    res.json(payment);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({}).sort({ createdAt: -1 });
  res.json(payments);
});

// @desc    Update Payment Status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, refundAmount } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (payment) {
    payment.paymentStatus = status || payment.paymentStatus;
    
    if (status === 'Refunded' && refundAmount) {
      payment.refundStatus = 'Processed';
      payment.refundAmount = refundAmount;
    }
    
    if (status === 'Collected' || status === 'Success') {
      payment.paidAt = new Date();
    }

    const updatedPayment = await payment.save();

    // Optionally update the associated order
    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);
      if (order) {
        if (status === 'Success' || status === 'Collected') {
          order.paymentStatus = 'Paid';
        } else if (status === 'Refunded') {
          order.paymentStatus = 'Refunded';
        }
        await order.save();
      }
    }

    res.json(updatedPayment);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Get Payment Statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const totalRevenue = await Payment.aggregate([
    { $match: { paymentStatus: { $in: ['Success', 'Collected'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRevenue = await Payment.aggregate([
    { $match: { paymentStatus: { $in: ['Success', 'Collected'] }, createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const statusCounts = await Payment.aggregate([
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);

  const totalTransactions = await Payment.countDocuments();

  const stats = {
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
    totalTransactions,
    successful: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    collected: 0,
  };

  statusCounts.forEach(stat => {
    if (stat._id === 'Success') stats.successful = stat.count;
    if (stat._id === 'Pending') stats.pending = stat.count;
    if (stat._id === 'Failed') stats.failed = stat.count;
    if (stat._id === 'Refunded') stats.refunded = stat.count;
    if (stat._id === 'Collected') stats.collected = stat.count;
  });

  res.json(stats);
});

export {
  createPaymentOrder,
  verifyPayment,
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
  getPaymentStats
};
