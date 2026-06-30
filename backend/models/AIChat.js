import mongoose from 'mongoose';

const aiChatMessageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['User', 'AI'],
      required: true
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

const aiChatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      default: 'Support Conversation'
    },
    messages: [aiChatMessageSchema]
  },
  {
    timestamps: true
  }
);

const AIChat = mongoose.model('AIChat', aiChatSchema);

export default AIChat;
