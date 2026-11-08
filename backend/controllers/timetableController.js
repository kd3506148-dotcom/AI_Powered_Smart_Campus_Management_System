/**
 * Timetable Controller
 * Manages department weekly lecture schedules, faculty class assignments, and classroom bookings
 */

const { Timetable } = require('../models');

// Standard weekday sort order
const weekdayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// @desc    Get timetable slots filtered by department, semester, section, or day
// @route   GET /api/timetable
// @access  Private (All authenticated roles)
const getTimetable = async (req, res, next) => {
  try {
    const { department, semester = 6, section = 'A', dayOfWeek } = req.query;
    const filter = {
      semester: Number(semester),
      section,
    };

    if (department && department !== 'All') {
      filter.department = department;
    }
    if (dayOfWeek && dayOfWeek !== 'All') {
      filter.dayOfWeek = dayOfWeek;
    }

    const slots = await Timetable.find(filter)
      .populate('faculty', 'name email employeeId department')
      .sort({ startTime: 1 });

    // Sort entries by weekday order if multiple days are returned
    slots.sort((a, b) => (weekdayOrder[a.dayOfWeek] || 0) - (weekdayOrder[b.dayOfWeek] || 0));

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teaching schedule for the logged-in faculty member
// @route   GET /api/timetable/my-schedule
// @access  Private (Faculty only)
const getFacultySchedule = async (req, res, next) => {
  try {
    const facultyId = req.user._id;

    const slots = await Timetable.find({ faculty: facultyId })
      .populate('faculty', 'name email employeeId')
      .sort({ startTime: 1 });

    slots.sort((a, b) => (weekdayOrder[a.dayOfWeek] || 0) - (weekdayOrder[b.dayOfWeek] || 0));

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new timetable slot
// @route   POST /api/timetable
// @access  Private (Admin, Faculty)
const createTimetableEntry = async (req, res, next) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
      subject,
      faculty,
      room,
      department,
      semester,
      section,
    } = req.body;

    const newSlot = await Timetable.create({
      dayOfWeek,
      startTime,
      endTime,
      subject,
      faculty: faculty || req.user._id,
      room,
      department: department || req.user.department || 'Computer Science & Engineering',
      semester: Number(semester) || 6,
      section: section || 'A',
    });

    const populatedSlot = await Timetable.findById(newSlot._id).populate(
      'faculty',
      'name email employeeId'
    );

    return res.status(201).json({
      success: true,
      message: 'Timetable lecture slot created successfully.',
      slot: populatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private (Admin only)
const deleteTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slot = await Timetable.findByIdAndDelete(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Timetable slot not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Timetable slot deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimetable,
  getFacultySchedule,
  createTimetableEntry,
  deleteTimetableEntry,
};

