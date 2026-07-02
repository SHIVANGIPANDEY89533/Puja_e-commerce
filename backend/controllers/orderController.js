import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { notifyAdmins } from '../services/notificationService.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const { userName, email, phone, address, items, total, paymentMethod, discountAmount } = req.body;

  if (items && items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
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
      status: 'Placed'
    });

    const createdOrder = await order.save();

    // Reduce product stock quantities
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    // Clear the user's cart after successful order
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    await notifyAdmins(
      'Success',
      'New Order Placed',
      `Order #${createdOrder._id.toString().substring(0, 6)} placed by ${userName} for ₹${total}`,
      createdOrder._id,
      'Order'
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID (Tracking)
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id);

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign order delivery executive (Admin only)
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin
const assignOrderDelivery = async (req, res) => {
  const { executiveId } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.deliveryExecutive = executiveId;
      order.status = 'Processing'; // Dispatched transition
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery executive assigned orders
// @route   GET /api/orders/delivery/assigned
// @access  Private/Delivery
const getDeliveryAssignedOrders = async (req, res) => {
  const executiveId = req.user.id || 'exec-1'; // fallback

  try {
    const orders = await Order.find({ deliveryExecutive: executiveId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery status
// @route   PUT /api/orders/:id/delivery-status
// @access  Private/Delivery
const updateDeliveryStatus = async (req, res) => {
  const { status, notes } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      order.deliveryNotes = notes || order.deliveryNotes;

      if (status === 'Delivered') {
        order.paymentStatus = 'Paid';
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status directly (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatusAdmin = async (req, res) => {
  const { status, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      let statusChanged = false;
      if (status && order.status !== status) {
        order.status = status;
        statusChanged = true;
      }
      
      if (paymentStatus && order.paymentStatus !== paymentStatus) {
        order.paymentStatus = paymentStatus;
        statusChanged = true;
      }

      const updatedOrder = await order.save();

      if (statusChanged) {
        if (status === 'Cancelled' || status === 'Returned') {
          await notifyAdmins('Warning', `Order ${status}`, `Order #${order._id.toString().substring(0, 6)} was ${status}`, order._id, 'Order');
        }
        if (paymentStatus === 'Failed' || paymentStatus === 'Refunded') {
          await notifyAdmins('Error', `Payment ${paymentStatus}`, `Payment for Order #${order._id.toString().substring(0, 6)} is ${paymentStatus}`, order._id, 'Order');
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  assignOrderDelivery,
  getDeliveryAssignedOrders,
  updateDeliveryStatus,
  updateOrderStatusAdmin
};
