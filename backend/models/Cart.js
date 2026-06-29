import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity cannot be less than 1']
    },
    price: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: false } // Prevent mongoose from creating separate _id for each cart item
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true // A user can only have one active cart
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
