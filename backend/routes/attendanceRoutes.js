/**
 * Attendance API Routes
 * Endpoints for recording and querying class attendance records
 */

const express = require('express');
const router = express.Router();

const {
  markAttendance,
  getMyAttendance,
  getClassAttendance,
  getStudentsForAttendance,
} = require('../controllers/attendanceController');

const {
  verifyToken,
  authorizeRoles,
} = require('../middleware/auth');

const {
  validateMarkAttendance,
  handleValidationErrors,
} = require('../middleware/validator');

// 1. Mark attendance for a class (Faculty & Admin only)
router.post(
  '/mark',
  verifyToken,
  authorizeRoles('Faculty', 'Admin'),
  validateMarkAttendance,
  handleValidationErrors,
  markAttendance
);

// 2. Get logged in student's personal attendance overview (Student only)
router.get(
  '/my',
  verifyToken,
  authorizeRoles('Student'),
  getMyAttendance
);

// 3. Get class attendance records (Faculty & Admin)
router.get(
  '/class',
  verifyToken,
  authorizeRoles('Faculty', 'Admin'),
  getClassAttendance
);

// 4. Get active students roster for taking attendance (Faculty & Admin)
router.get(
  '/students',
  verifyToken,
  authorizeRoles('Faculty', 'Admin'),
  getStudentsForAttendance
);

module.exports = router;

