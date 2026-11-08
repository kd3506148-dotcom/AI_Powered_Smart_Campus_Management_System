// Central export file for all Mongoose models
// Allows clean imports: const { User, Complaint } = require('../models');

const User = require('./User');
const Attendance = require('./Attendance');
const Timetable = require('./Timetable');
const Complaint = require('./Complaint');
const Booking = require('./Booking');
const Notification = require('./Notification');
const Announcement = require('./Announcement');
const Message = require('./Message');
const LeaveRequest = require('./LeaveRequest');

module.exports = {
  User,
  Attendance,
  Timetable,
  Complaint,
  Booking,
  Notification,
  Announcement,
  Message,
  LeaveRequest,
};
