const express = require('express');
const { auth } = require('../middleware/auth');
const { generateMotivationalQuote } = require('../services/aiService');

const router = express.Router();

// Get daily motivation
router.get('/motivation', async (req, res) => {
  try {
    const quote = await generateMotivationalQuote();
    res.json({ quote, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get motivation' });
  }
});

// Get wellness reminders
router.get('/reminders', auth, async (req, res) => {
  const hour = new Date().getHours();
  const reminders = [];

  if (hour >= 7 && hour <= 9) {
    reminders.push({ type: 'morning', message: 'Good morning! How are you feeling today? Take a moment to check in with yourself.' });
  }
  if (hour >= 12 && hour <= 14) {
    reminders.push({ type: 'hydration', message: 'Remember to drink water and take a mindful break from your screen.' });
  }
  if (hour >= 20 && hour <= 22) {
    reminders.push({ type: 'sleep', message: 'It\'s getting late. Consider starting your bedtime routine for better sleep.' });
  }

  reminders.push({ type: 'mood', message: 'Don\'t forget to log your mood today to track your emotional wellness journey.' });

  res.json({ reminders });
});

module.exports = router;
