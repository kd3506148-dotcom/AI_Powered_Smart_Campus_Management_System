const mongoose = require('mongoose');

// Attendance schema to record student presence marked by faculty
const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Late', 'Excused'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'Present',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
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

// Compound index to prevent duplicate attendance entry for same student, subject, and date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
