import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    senderType: {
      type: String,
      required: true,
      enum: ['Customer', 'Admin', 'AI']
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Not required for AI
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ticketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Order Issue',
        'Payment Issue',
        'Refund',
        'Return',
        'Product Issue',
        'Account Issue',
        'Delivery Issue',
        'Technical Problem',
        'General Inquiry'
      ]
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'],
      default: 'Open'
    },
    attachments: [
      {
        type: String
      }
    ],
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
