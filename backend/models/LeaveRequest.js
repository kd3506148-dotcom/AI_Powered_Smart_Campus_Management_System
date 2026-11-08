const mongoose = require('mongoose');

// Leave request schema for students and faculty with approval status
const leaveRequestSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['Sick', 'Casual', 'Duty', 'Emergency', 'Other'],
        message: '{VALUE} is not a valid leave type',
      },
      default: 'Casual',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Faculty, HOD, or Admin who reviewed the request
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ applicant: 1, status: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
