import mongoose from 'mongoose';

const querySchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      default: 'General Inquiry'
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'Resolved'],
      default: 'Open'
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true
  }
);

const Query = mongoose.model('Query', querySchema);

export default Query;
