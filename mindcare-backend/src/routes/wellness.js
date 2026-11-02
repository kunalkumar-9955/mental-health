const express = require('express');
const WellnessScore = require('../models/WellnessScore');
const MoodLog = require('../models/MoodLog');
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');
const { generateAIResponse } = require('../services/aiService');

const router = express.Router();
router.use(requireDB);

// Calculate and save wellness score
router.post('/calculate', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentMoods, recentChats] = await Promise.all([
      MoodLog.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: -1 }),
      Chat.find({ userId, startedAt: { $gte: sevenDaysAgo } }).select('dominantEmotion crisisDetected')
    ]);

    // Calculate scores
    const avgMood = recentMoods.length > 0
      ? recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length : 5;
    const avgStress = recentMoods.length > 0
      ? recentMoods.filter(m => m.stressLevel).reduce((s, m) => s + m.stressLevel, 0) / (recentMoods.filter(m => m.stressLevel).length || 1) : 5;
    const avgSleep = recentMoods.length > 0
      ? recentMoods.filter(m => m.sleepHours).reduce((s, m) => s + m.sleepHours, 0) / (recentMoods.filter(m => m.sleepHours).length || 1) : 7;
    const crisisCount = recentChats.filter(c => c.crisisDetected).length;

    const stressScore = Math.round(avgStress * 10);
    const anxietyScore = Math.round(Math.max(0, (10 - avgMood) * 8 + crisisCount * 10));
    const burnoutRisk = Math.round(stressScore * 0.6 + (avgSleep < 6 ? 30 : 0) + (recentMoods.length < 3 ? 20 : 0));
    const emotionalStability = Math.round(Math.max(0, 100 - stressScore * 0.5 - anxietyScore * 0.3));
    const recoveryScore = Math.round((avgMood / 10) * 60 + (avgSleep / 8) * 40);
    const overallWellness = Math.round((emotionalStability + recoveryScore) / 2);

    // Trend analysis for predictions
    const moodTrend = recentMoods.length >= 3
      ? recentMoods.slice(0, 3).reduce((s, m) => s + m.mood, 0) / 3 - recentMoods.slice(-3).reduce((s, m) => s + m.mood, 0) / 3
      : 0;

    const predictions = {
      burnoutRisk: Math.min(100, burnoutRisk + (moodTrend > 1 ? 20 : 0)),
      depressionRisk: Math.min(100, Math.round((10 - avgMood) * 8 + crisisCount * 15)),
      anxietyRelapse: Math.min(100, anxietyScore),
      stressOverload: Math.min(100, stressScore + (moodTrend > 0.5 ? 15 : 0))
    };

    const riskLevel = overallWellness < 30 ? 'critical' : overallWellness < 50 ? 'high' : overallWellness < 70 ? 'moderate' : 'low';

    const recommendations = [];
    if (avgSleep < 6) recommendations.push('Prioritize 7-8 hours of sleep tonight');
    if (stressScore > 60) recommendations.push('Try a 10-minute breathing exercise');
    if (avgMood < 4) recommendations.push('Consider talking to a mental health professional');
    if (recentMoods.length < 3) recommendations.push('Log your mood daily for better insights');
    if (crisisCount > 0) recommendations.push('Reach out to a trusted person today');
    if (recommendations.length === 0) recommendations.push('Keep up your wellness practices!');

    const score = await WellnessScore.create({
      userId,
      scores: { stress: stressScore, anxiety: anxietyScore, burnoutRisk, emotionalStability, recoveryScore, overallWellness },
      riskLevel,
      predictions,
      recommendations,
      lifeBalance: {
        sleep: Math.round((avgSleep / 8) * 100),
        work: 60,
        social: recentChats.length > 3 ? 70 : 40,
        exercise: recentMoods.filter(m => m.activities?.includes('exercise')).length > 0 ? 70 : 30,
        nutrition: 60
      }
    });

    res.json({ score });
  } catch (e) {
    console.error('Wellness calc error:', e.message);
    res.status(500).json({ error: 'Failed to calculate wellness score' });
  }
});

// Get latest wellness score
router.get('/latest', auth, async (req, res) => {
  try {
    const score = await WellnessScore.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ score });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get wellness score' });
  }
});

// Get wellness history
router.get('/history', auth, async (req, res) => {
  try {
    const scores = await WellnessScore.find({ userId: req.userId })
      .sort({ createdAt: -1 }).limit(30);
    res.json({ scores });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get wellness history' });
  }
});

// Get AI wellness report
router.get('/report', auth, async (req, res) => {
  try {
    const score = await WellnessScore.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!score) return res.json({ report: 'No wellness data yet. Start by logging your mood daily.' });

    const prompt = `Generate a compassionate 3-sentence mental wellness report based on these scores:
Overall Wellness: ${score.scores.overallWellness}/100
Stress: ${score.scores.stress}/100
Anxiety: ${score.scores.anxiety}/100
Burnout Risk: ${score.scores.burnoutRisk}/100
Risk Level: ${score.riskLevel}
Be warm, specific, and end with one actionable recommendation.`;

    const report = await generateAIResponse([{ role: 'user', content: prompt }], 'general');
    res.json({ report, score });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
