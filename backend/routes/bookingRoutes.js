const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getBookings);
router.put('/:id/status', verifyToken, authorizeRoles('Admin'), updateBookingStatus);

module.exports = router;

