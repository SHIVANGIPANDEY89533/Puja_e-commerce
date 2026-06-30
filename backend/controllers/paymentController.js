import asyncHandler from 'express-async-handler';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import Order from '../models/Order.js';
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
  const receiptId = `receipt_${req.user._id}_${Date.now()}`;
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

  // 1. Verify Razorpay Signature
  if (paymentMethod !== 'Cash on Delivery') {
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  }

  // 2. Create Order
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
    transactionId: razorpayPaymentId || `COD_${Date.now()}`,
    paymentDate: paymentMethod !== 'Cash on Delivery' ? new Date() : null,
    paymentAmount: total,
    paymentCurrency: 'INR'
  });

  const createdOrder = await order.save();

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
// @access  Private
const getPaymentDetails = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ razorpayPaymentId: req.params.id });
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

export {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails
};
