/**
 * Authentication Routes
 * Endpoints for signup, signin, user profile, and campus dashboard statistics
 */

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getCampusStats,
} = require('../controllers/authController');

const {
  verifyToken,
  authorizeRoles,
} = require('../middleware/auth');

const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require('../middleware/validator');

// Public routes
router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);

// Protected routes (Requires valid JWT)
router.get('/me', verifyToken, getCurrentUser);
router.get('/stats', verifyToken, getCampusStats);
router.get('/users', verifyToken, authorizeRoles('Admin', 'Staff'), getAllUsers);

module.exports = router;

