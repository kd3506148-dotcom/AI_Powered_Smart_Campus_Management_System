const mongoose = require('mongoose');

// Notification schema for real-time user alerts and system updates
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null indicates a system-generated alert
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'Announcement',
          'Attendance',
          'Complaint',
          'Booking',
          'System',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'System',
    },
    link: {
      type: String,
      default: '', // Optional relative frontend route (e.g., /complaints/123)
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch unread notifications for a specific user
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
