import mongoose from 'mongoose';

const campaignSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Email', 'WhatsApp', 'SMS', 'Facebook Ad'],
      default: 'Email'
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'Running', 'Paused', 'Finished'],
      default: 'Scheduled'
    },
    sent: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
