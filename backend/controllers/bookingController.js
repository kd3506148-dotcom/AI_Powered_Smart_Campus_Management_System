const { Booking, Notification } = require('../models');

// @desc Request classroom/lab booking
// @route POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { resourceType, resourceName, date, startTime, endTime, purpose } = req.body;

    // Conflict check with existing approved bookings
    const conflict = await Booking.findOne({
      resourceName,
      date: new Date(date),
      startTime,
      status: 'Approved',
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Resource ${resourceName} is already booked on this date at ${startTime}.`,
      });
    }

    const booking = await Booking.create({
      resourceType,
      resourceName,
      date: new Date(date),
      startTime,
      endTime,
      purpose,
      bookedBy: req.user._id,
      status: 'Pending',
    });

    const populated = await Booking.findById(booking._id).populate('bookedBy', 'name email role department');

    const io = req.app.get('io');
    if (io) io.emit('booking_created', populated);

    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Get bookings
// @route GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, resourceType } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (resourceType && resourceType !== 'All') filter.resourceType = resourceType;

    // Students only see their own requests; faculty/admin can see public calendar
    if (req.user.role === 'Student') {
      filter.bookedBy = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate('bookedBy', 'name email role department')
      .populate('approvedBy', 'name email employeeId')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc Approve or reject booking
// @route PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, approvalRemarks } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    booking.status = status;
    booking.approvedBy = req.user._id;
    if (approvalRemarks) booking.approvalRemarks = approvalRemarks;

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('bookedBy', 'name email role department')
      .populate('approvedBy', 'name email employeeId');

    // Notification
    if (populated.bookedBy?._id) {
      await Notification.create({
        recipient: populated.bookedBy._id,
        title: `Facility Booking ${status}`,
        message: `Your booking for ${booking.resourceName} on ${new Date(booking.date).toLocaleDateString()} has been ${status.toLowerCase()}.`,
        type: 'Booking',
        link: '/bookings',
      });
    }

    const io = req.app.get('io');
    if (io) io.emit('booking_updated', populated);

    res.status(200).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
};

