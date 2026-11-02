const express = require('express');
const MoodLog = require('../models/MoodLog');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');

const router = express.Router();
router.use(requireDB);

// Log mood
router.post('/log', auth, async (req, res) => {
  try {
    const { mood, emotions, note, activities, sleepHours, stressLevel, anxietyLevel, energyLevel, triggers, gratitude } = req.body;
    
    if (!mood || mood < 1 || mood > 10) {
      return res.status(400).json({ error: 'Mood must be between 1 and 10' });
    }

    const moodLog = new MoodLog({
      userId: req.userId,
      mood,
      emotions: emotions || [],
      note,
      activities: activities || [],
      sleepHours,
      stressLevel,
      anxietyLevel,
      energyLevel,
      triggers: triggers || [],
      gratitude: gratitude || []
    });

    await moodLog.save();
    res.status(201).json({ message: 'Mood logged', moodLog });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

// Get mood history
router.get('/history', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await MoodLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

// Get mood analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await MoodLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (logs.length === 0) {
      return res.json({ analytics: null, message: 'No mood data available' });
    }

    // Calculate averages
    const avgMood = logs.reduce((sum, l) => sum + l.mood, 0) / logs.length;
    const avgStress = logs.filter(l => l.stressLevel).reduce((sum, l) => sum + l.stressLevel, 0) / 
                      (logs.filter(l => l.stressLevel).length || 1);
    const avgSleep = logs.filter(l => l.sleepHours).reduce((sum, l) => sum + l.sleepHours, 0) / 
                     (logs.filter(l => l.sleepHours).length || 1);

    // Mood trend (last 7 days vs previous 7 days)
    const last7 = logs.slice(-7);
    const prev7 = logs.slice(-14, -7);
    const recentAvg = last7.reduce((sum, l) => sum + l.mood, 0) / (last7.length || 1);
    const prevAvg = prev7.reduce((sum, l) => sum + l.mood, 0) / (prev7.length || 1);
    const trend = recentAvg > prevAvg ? 'improving' : recentAvg < prevAvg ? 'declining' : 'stable';

    // Daily data for charts
    const dailyData = logs.map(l => ({
      date: l.date,
      mood: l.mood,
      stress: l.stressLevel,
      sleep: l.sleepHours,
      anxiety: l.anxietyLevel,
      energy: l.energyLevel
    }));

    // Most common emotions
    const emotionCounts = {};
    logs.forEach(l => {
      l.emotions.forEach(e => {
        emotionCounts[e.name || e] = (emotionCounts[e.name || e] || 0) + 1;
      });
    });

    res.json({
      analytics: {
        avgMood: Math.round(avgMood * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        trend,
        totalLogs: logs.length,
        dailyData,
        emotionFrequency: emotionCounts,
        bestDay: logs.reduce((best, l) => l.mood > best.mood ? l : best, logs[0]),
        worstDay: logs.reduce((worst, l) => l.mood < worst.mood ? l : worst, logs[0])
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get today's mood
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const log = await MoodLog.findOne({
      userId: req.userId,
      date: { $gte: today }
    }).sort({ date: -1 });

    res.json({ log });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today\'s mood' });
  }
});

module.exports = router;
