const mongoose = require('mongoose');

// Booking schema for classrooms, labs, seminar halls with Admin approval workflow
const bookingSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: [
          'Classroom',
          'Computer Lab',
          'Seminar Hall',
          'Auditorium',
          'Project Lab',
        ],
        message: '{VALUE} is not a valid facility type',
      },
    },
    resourceName: {
      type: String,
      required: [true, 'Resource name/number is required (e.g., Seminar Hall A)'],
      trim: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g., 10:00 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g., 12:00 PM)'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Booking purpose is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who approved or rejected the request
      default: null,
    },
    approvalRemarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to quickly find resource booking conflicts by date and facility
bookingSchema.index({ resourceName: 1, date: 1, status: 1 });
bookingSchema.index({ bookedBy: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
