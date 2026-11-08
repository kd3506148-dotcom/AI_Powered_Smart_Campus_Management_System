const mongoose = require('mongoose');

// Timetable schema to schedule classes for departments and semesters
const timetableSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: [true, 'Day of the week is required'],
      enum: {
        values: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        message: '{VALUE} is not a valid campus weekday',
      },
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g., 09:00 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g., 10:00 AM)'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
    room: {
      type: String,
      required: [true, 'Classroom or Lab number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: [true, 'Section is required (e.g., A, B)'],
      trim: true,
      default: 'A',
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly search timetable by department, semester, and section
timetableSchema.index({ department: 1, semester: 1, section: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
