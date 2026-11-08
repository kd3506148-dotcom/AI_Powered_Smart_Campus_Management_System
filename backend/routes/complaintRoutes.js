const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaint,
} = require('../controllers/complaintController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.post('/', verifyToken, createComplaint);
router.get('/', verifyToken, getComplaints);
router.put('/:id', verifyToken, authorizeRoles('Staff', 'Admin'), updateComplaint);

module.exports = router;

