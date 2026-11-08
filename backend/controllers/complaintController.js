const { Complaint, Notification } = require('../models');

// @desc Create a new complaint
// @route POST /api/complaints
// @access Private
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      location: location || 'Campus',
      submittedBy: req.user._id,
      status: 'Submitted',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email rollNumber department')
      .populate('assignedTo', 'name email employeeId');

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_created', populated);
    }

    res.status(201).json({ success: true, complaint: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Get complaints (filtered by role)
// @route GET /api/complaints
// @access Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === 'Student') {
      filter.submittedBy = req.user._id;
    } else if (req.user.role === 'Staff') {
      filter.$or = [{ assignedTo: req.user._id }, { status: 'Submitted' }];
    }

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email rollNumber department')
      .populate('assignedTo', 'name email employeeId department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

// @desc Update complaint status and assign staff
// @route PUT /api/complaints/:id
// @access Private (Staff, Admin)
const updateComplaint = async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    const populated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email rollNumber department')
      .populate('assignedTo', 'name email employeeId department');

    // Notify student
    if (populated.submittedBy?._id) {
      await Notification.create({
        recipient: populated.submittedBy._id,
        title: `Complaint Status: ${status}`,
        message: `Your complaint "${complaint.title}" is now ${status}.`,
        type: 'Complaint',
        link: '/complaints',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_updated', populated);
    }

    res.status(200).json({ success: true, complaint: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaint,
};

