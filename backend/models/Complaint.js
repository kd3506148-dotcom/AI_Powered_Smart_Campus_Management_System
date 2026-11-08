const mongoose = require('mongoose');

// Complaint schema for campus issues tracked from submission to resolution
const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          'Hostel',
          'Academic',
          'Infrastructure',
          'Mess/Canteen',
          'Network/WiFi',
          'Maintenance',
          'Other',
        ],
        message: '{VALUE} is not a valid complaint category',
      },
      default: 'Other',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
        message: '{VALUE} is not a valid complaint status',
      },
      default: 'Submitted',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who submitted the complaint is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Staff member assigned to fix the issue
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: 'Campus Premises',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // AI enrichment flags (computed in Phase 6 by Python LLM microservice)
    aiCategorized: {
      type: Boolean,
      default: false,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up dashboard queries and staff assignment lists
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
