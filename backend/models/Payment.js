import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
  },
  customerPhone: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  signatureVerified: {
    type: Boolean,
    default: false,
  },
  paymentGateway: {
    type: String,
    required: true,
    enum: ['Razorpay', 'COD'],
  },
  paymentMethod: {
    type: String,
    required: true,
    // E.g., 'UPI', 'Card', 'Net Banking', 'Cash on Delivery'
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Success', 'Failed', 'Cancelled', 'Refunded', 'Collected'],
    default: 'Pending',
  },
  refundStatus: {
    type: String,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
