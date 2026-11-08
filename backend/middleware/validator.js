/**
 * Input Validation Middleware using express-validator
 * Ensures incoming request bodies are properly sanitized and formatted
 */

const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 60 })
    .withMessage('Name cannot exceed 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['Student', 'Faculty', 'Admin', 'Staff'])
    .withMessage('Role must be one of: Student, Faculty, Admin, Staff'),

  body('department')
    .optional()
    .trim(),

  body('rollNumber')
    .optional()
    .trim(),

  body('employeeId')
    .optional()
    .trim(),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for marking attendance
const validateMarkAttendance = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),

  body('date')
    .notEmpty()
    .withMessage('Attendance date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO date'),

  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),

  body('section')
    .trim()
    .notEmpty()
    .withMessage('Section is required (e.g., A, B)'),

  body('records')
    .isArray({ min: 1 })
    .withMessage('Attendance records array is required and cannot be empty'),

  body('records.*.student')
    .isMongoId()
    .withMessage('Valid student Mongo ID is required for each attendance record'),

  body('records.*.status')
    .isIn(['Present', 'Absent', 'Late', 'Excused'])
    .withMessage('Status must be one of: Present, Absent, Late, Excused'),
];

// Validation rules for timetable slot
const validateTimetableEntry = [
  body('dayOfWeek')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    .withMessage('Valid weekday is required (Monday-Saturday)'),

  body('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required (e.g., 09:00 AM)'),

  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required (e.g., 10:00 AM)'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),

  body('faculty')
    .isMongoId()
    .withMessage('Valid faculty Mongo ID is required'),

  body('room')
    .trim()
    .notEmpty()
    .withMessage('Classroom or Lab room is required'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),

  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),

  body('section')
    .trim()
    .notEmpty()
    .withMessage('Section is required (e.g., A)'),
];

// Helper to check validation results and return formatted 400 error response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return primary user-friendly error message
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateMarkAttendance,
  validateTimetableEntry,
  handleValidationErrors,
};

