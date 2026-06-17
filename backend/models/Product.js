import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    originalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    images: {
      type: [String],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    features: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      required: true,
      default: 5.0
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
