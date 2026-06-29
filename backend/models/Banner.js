import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    redirectUrl: {
      type: String,
    },
    displayPosition: {
      type: String,
      enum: ['Home', 'Category', 'Product', 'Global'],
      default: 'Home'
    },
    priority: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
