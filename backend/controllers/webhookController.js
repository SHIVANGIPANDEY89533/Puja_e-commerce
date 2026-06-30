import asyncHandler from 'express-async-handler';
import { verifyWebhookSignature } from '../services/paymentService.js';
import Order from '../models/Order.js';
import { notifyAdmins } from '../services/notificationService.js';

// @desc    Handle Razorpay Webhooks
// @route   POST /api/payments/webhook
// @access  Public
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookBody = JSON.stringify(req.body);

  const isValid = verifyWebhookSignature(webhookBody, signature);

  if (!isValid) {
    res.status(400);
    throw new Error('Invalid webhook signature');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  let order;
  if (payload.payment && payload.payment.entity) {
    order = await Order.findOne({ razorpayOrderId: payload.payment.entity.order_id });
  }

  switch (event) {
    case 'payment.captured':
    case 'order.paid':
      if (order && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.transactionId = payload.payment.entity.id;
        order.paymentDate = new Date();
        await order.save();
      }
      break;
    
    case 'payment.failed':
      if (order) {
        order.paymentStatus = 'Failed';
        await order.save();
        await notifyAdmins('Error', 'Payment Failed', `Payment failed for order #${order._id}`, order._id, 'Order');
      }
      break;

    case 'refund.processed':
      if (order) {
        order.paymentStatus = 'Refunded';
        await order.save();
        await notifyAdmins('Info', 'Refund Completed', `Refund processed for order #${order._id}`, order._id, 'Order');
      }
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }

  res.json({ status: 'ok' });
});

export { handleRazorpayWebhook };
