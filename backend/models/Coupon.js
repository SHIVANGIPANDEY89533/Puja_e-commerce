import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    discount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['percent', 'flat'],
      default: 'percent'
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    minCart: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
