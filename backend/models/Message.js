const mongoose = require('mongoose');

// Message schema for live chat rooms and direct communication via Socket.IO
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null if the message is posted to a public or department room
    },
    room: {
      type: String,
      default: 'general', // e.g., 'general', 'campus-helpdesk', or custom channel ID
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to quickly load messages for a specific chat room in chronological order
messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
