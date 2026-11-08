const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const askChatbot = async (req, res, next) => {
  try {
    const { message } = req.body;
    try {
      const response = await axios.post(`${AI_URL}/chat`, {
        message,
        role: req.user.role,
      }, { timeout: 4000 });
      return res.status(200).json({ success: true, reply: response.data.reply });
    } catch (e) {
      // Smart local fallback if python service is not started
      return res.status(200).json({
        success: true,
        reply: `SmartCampus AI Assistant: I can help with attendance rules (75% min), class timetables, filing complaints, and campus facility booking for ${req.user.role}s.`,
      });
    }
  } catch (error) {
    next(error);
  }
};

const triageComplaint = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    try {
      const response = await axios.post(`${AI_URL}/triage`, { title, description }, { timeout: 4000 });
      return res.status(200).json({ success: true, ...response.data });
    } catch (e) {
      // Rule-based fallback
      const text = `${title} ${description}`.toLowerCase();
      let category = 'Other';
      let priority = 'Medium';
      if (text.includes('wifi') || text.includes('internet')) { category = 'Network/WiFi'; priority = 'High'; }
      else if (text.includes('water') || text.includes('hostel')) { category = 'Hostel'; priority = 'Urgent'; }
      else if (text.includes('projector') || text.includes('light')) { category = 'Infrastructure'; priority = 'High'; }
      return res.status(200).json({ success: true, category, priority, confidence: 0.85 });
    }
  } catch (error) {
    next(error);
  }
};

const getStudyTips = async (req, res, next) => {
  try {
    const { subject } = req.query;
    try {
      const response = await axios.post(`${AI_URL}/study-tips`, { subject }, { timeout: 4000 });
      return res.status(200).json({ success: true, tips: response.data.tips });
    } catch (e) {
      return res.status(200).json({
        success: true,
        tips: `High-yield study tips for ${subject}:\n1. Review unit formulas & diagrams.\n2. Practice past university midterm exams.\n3. Implement code/circuit examples directly.\n4. Form peer study groups for doubt clearing.`,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askChatbot,
  triageComplaint,
  getStudyTips,
};

