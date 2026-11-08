const mongoose = require('mongoose');

// Announcement schema for campus-wide or role-targeted broadcasts
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
    },
    // Target audience filter
    targetRoles: {
      type: [
        {
          type: String,
          enum: ['Student', 'Faculty', 'Staff', 'Admin'],
        },
      ],
      default: ['Student', 'Faculty', 'Staff', 'Admin'],
    },
    department: {
      type: String,
      default: 'All', // 'All' means visible to all departments
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Normal', 'Important', 'Urgent'],
        message: '{VALUE} is not a valid announcement priority',
      },
      default: 'Normal',
    },
    expiresAt: {
      type: Date,
      default: null, // Null means it does not expire automatically
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently query announcements by target role and recency
announcementSchema.index({ targetRoles: 1, department: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
