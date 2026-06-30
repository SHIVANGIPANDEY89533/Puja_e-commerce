import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true }
});

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
      default: 0.0
    },
    status: {
      type: String,
      required: true,
      default: 'Pending'
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets', 'EMI', 'Cash on Delivery', 'Online']
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'],
      default: 'Pending'
    },
    razorpayOrderId: {
      type: String,
      default: null
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      default: null
    },
    paymentDate: {
      type: Date,
      default: null
    },
    paymentAmount: {
      type: Number,
      default: 0
    },
    paymentCurrency: {
      type: String,
      default: 'INR'
    },
    deliveryExecutive: {
      type: String,
      default: null
    },
    deliveryNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
