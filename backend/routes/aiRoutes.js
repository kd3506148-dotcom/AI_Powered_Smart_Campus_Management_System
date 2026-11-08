const express = require('express');
const router = express.Router();
const { askChatbot, triageComplaint, getStudyTips } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

router.post('/chat', verifyToken, askChatbot);
router.post('/triage', verifyToken, triageComplaint);
router.get('/study-tips', verifyToken, getStudyTips);

module.exports = router;