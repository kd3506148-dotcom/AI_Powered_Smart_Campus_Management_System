const { Announcement, Notification, Message } = require('../models');

// Announcements
const getAnnouncements = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ targetRoles: req.user.role }, { targetRoles: 'all' }],
    };
    const announcements = await Announcement.find(filter)
      .populate('author', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetRoles, priority, department } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      targetRoles: targetRoles || ['Student', 'Faculty', 'Staff', 'Admin'],
      priority: priority || 'Normal',
      department: department || 'All',
      author: req.user._id,
    });
    const populated = await Announcement.findById(announcement._id).populate('author', 'name role department');
    const io = req.app.get('io');
    if (io) io.emit('announcement_created', populated);
    res.status(201).json({ success: true, announcement: populated });
  } catch (error) {
    next(error);
  }
};

// Notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Messages for chat
const getRoomMessages = async (req, res, next) => {
  try {
    const room = req.params.room || 'general';
    const messages = await Message.find({ room })
      .populate('sender', 'name role department')
      .sort({ createdAt: 1 })
      .limit(100);
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

const postMessage = async (req, res, next) => {
  try {
    const { room = 'general', content } = req.body;
    const message = await Message.create({
      room,
      content,
      sender: req.user._id,
      readBy: [req.user._id],
    });
    const populated = await Message.findById(message._id).populate('sender', 'name role department');
    const io = req.app.get('io');
    if (io) io.to(room).emit('new_message', populated);
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  getMyNotifications,
  markNotificationRead,
  getRoomMessages,
  postMessage,
};

