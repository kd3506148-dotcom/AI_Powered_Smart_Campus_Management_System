const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  getMyNotifications,
  markNotificationRead,
  getRoomMessages,
  postMessage,
} = require('../controllers/communicationController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Announcements
router.get('/announcements', verifyToken, getAnnouncements);
router.post('/announcements', verifyToken, authorizeRoles('Faculty', 'Admin', 'Staff'), createAnnouncement);

// Notifications
router.get('/notifications', verifyToken, getMyNotifications);
router.put('/notifications/read', verifyToken, markNotificationRead);

// Messages / Chat
router.get('/messages/:room', verifyToken, getRoomMessages);
router.post('/messages', verifyToken, postMessage);

module.exports = router;

