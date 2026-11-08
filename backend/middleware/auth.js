/**
 * Authentication and Authorization Middleware
 * Verifies JWT tokens and enforces role-based access control (RBAC)
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 1. Verify JWT token from the Authorization header
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for "Bearer <token>" in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token using secret key
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB and attach to req.user (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact campus admin.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// 2. Restrict route access to specific roles (e.g., 'Admin', 'Faculty')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden: Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};

