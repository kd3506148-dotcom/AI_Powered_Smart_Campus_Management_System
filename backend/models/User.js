const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition with 4 distinct roles
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    // The 4 main roles for campus management
    role: {
      type: String,
      enum: {
        values: ['Student', 'Faculty', 'Admin', 'Staff'],
        message: '{VALUE} is not a valid campus role',
      },
      default: 'Student',
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    // Roll number applies specifically to students
    rollNumber: {
      type: String,
      trim: true,
      sparse: true, // Allows null/empty for faculty/admin/staff without uniqueness collision
    },
    // Employee ID for faculty, staff, and admin
    employeeId: {
      type: String,
      trim: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
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
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Hash the password automatically before saving if it has been modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method to compare entered password with hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive password field when converting document to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
