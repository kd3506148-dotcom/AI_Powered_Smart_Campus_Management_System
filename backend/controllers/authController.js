/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval, and dashboard summaries
 */

const jwt = require('jsonwebtoken');
const { User, Complaint, Booking, Attendance, Announcement } = require('../models');

// Helper to generate a signed JWT token
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      department,
      rollNumber,
      employeeId,
      phone,
      semester,
      section,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create new user document (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: 'Student',
      department: department || 'General',
      rollNumber: role === 'Student' ? rollNumber : undefined,
      employeeId: role !== 'Student' ? employeeId : undefined,
      phone: phone || '',
      semester: semester || 1,
      section: section || 'A',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly include password field for comparison
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private (All authenticated roles)
const getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (filtered by role or department if queried)
// @route   GET /api/auth/users
// @access  Private (Admin or staff assignment lookups)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const query = { isActive: true };

    if (role) query.role = role;
    if (department && department !== 'All') query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get high-level campus statistics for dashboard widgets
// @route   GET /api/auth/stats
// @access  Private (All roles get relevant stats)
const getCampusStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalStaff,
      pendingComplaints,
      pendingBookings,
      announcementsCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'Student', isActive: true }),
      User.countDocuments({ role: 'Faculty', isActive: true }),
      User.countDocuments({ role: 'Staff', isActive: true }),
      Complaint.countDocuments({ status: { $in: ['Submitted', 'Assigned', 'In Progress'] } }),
      Booking.countDocuments({ status: 'Pending' }),
      Announcement.countDocuments(),
    ]);

    // Role-specific stats
    let userSpecific = {};

    if (req.user.role === 'Student') {
      const studentComplaints = await Complaint.countDocuments({ submittedBy: req.user._id });
      const totalAttendance = await Attendance.countDocuments({ student: req.user._id });
      const presentCount = await Attendance.countDocuments({
        student: req.user._id,
        status: { $in: ['Present', 'Late'] },
      });
      const attendanceRate =
        totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 85;

      userSpecific = {
        myComplaints: studentComplaints,
        attendanceRate,
        totalClasses: totalAttendance,
      };
    } else if (req.user.role === 'Faculty') {
      const myBookings = await Booking.countDocuments({ bookedBy: req.user._id });
      userSpecific = {
        myBookings,
      };
    } else if (req.user.role === 'Staff') {
      const assignedToMe = await Complaint.countDocuments({
        assignedTo: req.user._id,
        status: { $in: ['Assigned', 'In Progress'] },
      });
      const resolvedByMe = await Complaint.countDocuments({
        assignedTo: req.user._id,
        status: 'Resolved',
      });
      userSpecific = {
        assignedTasks: assignedToMe,
        resolvedTasks: resolvedByMe,
      };
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalStaff,
        pendingComplaints,
        pendingBookings,
        announcementsCount,
        ...userSpecific,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getCampusStats,
};

