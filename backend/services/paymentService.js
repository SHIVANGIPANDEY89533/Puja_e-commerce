import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('RAZORPAY keys not found. Razorpay will run in mock mode if keys are absent.');
    return;
  }
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export const createRazorpayOrder = async (amount, receiptId) => {
  if (!razorpayInstance) {
    // For local dev without keys, mock the creation
    return {
      id: `order_mock_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: receiptId,
      status: 'created'
    };
  }

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: receiptId
  };

  return new Promise((resolve, reject) => {
    razorpayInstance.orders.create(options, function (err, order) {
      if (err) {
        reject(err);
      } else {
        resolve(order);
      }
    });
  });
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // Mock validation
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (webhookBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return true; // Mock

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookBody)
    .digest('hex');

  return expectedSignature === signature;
};
