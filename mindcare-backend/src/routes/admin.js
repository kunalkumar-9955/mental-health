const express = require('express');
const User = require('../models/User');
const Chat = require('../models/Chat');
const MoodLog = require('../models/MoodLog');
const CrisisAlert = require('../models/CrisisAlert');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simple admin check middleware
const adminCheck = async (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get admin stats
router.get('/stats', auth, adminCheck, async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalChats, crisisAlerts, moodLogs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Chat.countDocuments(),
      CrisisAlert.countDocuments({ resolved: false }),
      MoodLog.countDocuments()
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalChats,
        crisisAlerts,
        moodLogs
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get all users (admin)
router.get('/users', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get crisis alerts (admin)
router.get('/crisis-alerts', auth, adminCheck, async (req, res) => {
  try {
    const alerts = await CrisisAlert.find()
      .populate('userId', 'displayName email')
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crisis alerts' });
  }
});

module.exports = router;
