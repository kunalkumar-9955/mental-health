const express = require('express');
const Chat = require('../models/Chat');
const MoodLog = require('../models/MoodLog');
const TherapySession = require('../models/TherapySession');
const CrisisAlert = require('../models/CrisisAlert');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');

const router = express.Router();
router.use(requireDB);

// Get full dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalChats,
      recentMoods,
      therapySessions,
      crisisAlerts
    ] = await Promise.all([
      Chat.countDocuments({ userId }),
      MoodLog.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }),
      TherapySession.find({ userId, date: { $gte: thirtyDaysAgo } }),
      CrisisAlert.countDocuments({ userId })
    ]);

    // Mood trend data
    const moodData = recentMoods.map(m => ({
      date: m.date.toISOString().split('T')[0],
      mood: m.mood,
      stress: m.stressLevel || 5,
      sleep: m.sleepHours || 7,
      anxiety: m.anxietyLevel || 5
    }));

    // Therapy mode distribution
    const modeDistribution = {};
    therapySessions.forEach(s => {
      modeDistribution[s.mode] = (modeDistribution[s.mode] || 0) + 1;
    });

    // Weekly mood averages
    const weeklyAverages = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      
      const weekMoods = recentMoods.filter(m => m.date >= weekStart && m.date < weekEnd);
      const avg = weekMoods.length > 0 
        ? weekMoods.reduce((sum, m) => sum + m.mood, 0) / weekMoods.length 
        : 0;
      
      weeklyAverages.push({
        week: `Week ${4 - i}`,
        avgMood: Math.round(avg * 10) / 10
      });
    }

    // Overall wellness score
    const avgMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length 
      : 5;
    const wellnessScore = Math.round((avgMood / 10) * 100);

    res.json({
      overview: {
        totalSessions: totalChats,
        moodLogs: recentMoods.length,
        therapySessions: therapySessions.length,
        crisisAlerts,
        wellnessScore
      },
      moodData,
      weeklyAverages,
      modeDistribution,
      avgMood: Math.round(avgMood * 10) / 10
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get emotional score
router.get('/emotional-score', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMoods = await MoodLog.find({ 
      userId, 
      date: { $gte: sevenDaysAgo } 
    });

    const recentChats = await Chat.find({ 
      userId, 
      startedAt: { $gte: sevenDaysAgo } 
    }).select('dominantEmotion crisisDetected');

    // Calculate emotional score
    let score = 70; // Base score
    
    if (recentMoods.length > 0) {
      const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
      score = Math.round((avgMood / 10) * 100);
    }

    const crisisCount = recentChats.filter(c => c.crisisDetected).length;
    score = Math.max(0, score - crisisCount * 10);

    const emotionBreakdown = {
      happiness: 0,
      sadness: 0,
      anxiety: 0,
      stress: 0,
      neutral: 0
    };

    recentChats.forEach(chat => {
      if (chat.dominantEmotion && emotionBreakdown.hasOwnProperty(chat.dominantEmotion)) {
        emotionBreakdown[chat.dominantEmotion]++;
      }
    });

    res.json({
      score,
      breakdown: emotionBreakdown,
      trend: score > 60 ? 'positive' : score > 40 ? 'neutral' : 'needs_attention'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate emotional score' });
  }
});

module.exports = router;
