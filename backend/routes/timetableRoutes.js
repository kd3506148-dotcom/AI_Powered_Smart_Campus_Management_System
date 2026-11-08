/**
 * Timetable API Routes
 * Endpoints for querying department schedules, faculty workloads, and managing slots
 */

const express = require('express');
const router = express.Router();

const {
  getTimetable,
  getFacultySchedule,
  createTimetableEntry,
  deleteTimetableEntry,
} = require('../controllers/timetableController');

const {
  verifyToken,
  authorizeRoles,
} = require('../middleware/auth');

const {
  validateTimetableEntry,
  handleValidationErrors,
} = require('../middleware/validator');

// 1. Get class timetable (Open to all authenticated campus roles)
router.get('/', verifyToken, getTimetable);

// 2. Get teaching schedule for currently logged in faculty member
router.get(
  '/my-schedule',
  verifyToken,
  authorizeRoles('Faculty'),
  getFacultySchedule
);

// 3. Create a new lecture slot (Admin & Faculty)
router.post(
  '/',
  verifyToken,
  authorizeRoles('Admin', 'Faculty'),
  validateTimetableEntry,
  handleValidationErrors,
  createTimetableEntry
);

// 4. Delete a lecture slot (Admin only)
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('Admin'),
  deleteTimetableEntry
);

module.exports = router;

