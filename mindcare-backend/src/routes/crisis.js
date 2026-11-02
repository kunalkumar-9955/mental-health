const express = require('express');
const CrisisAlert = require('../models/CrisisAlert');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get crisis resources
router.get('/resources', (req, res) => {
  res.json({
    helplines: [
      { name: 'iCall (India)', number: '9152987821', available: '8am-10pm Mon-Sat' },
      { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' },
      { name: 'AASRA', number: '9820466627', available: '24/7' },
      { name: 'Snehi', number: '044-24640050', available: '8am-10pm' },
      { name: 'iCall WhatsApp', number: '9152987821', available: 'WhatsApp' },
      { name: 'International (Befrienders)', url: 'https://www.befrienders.org', available: '24/7' }
    ],
    breathingExercise: {
      name: '4-7-8 Breathing',
      steps: [
        'Breathe in through your nose for 4 seconds',
        'Hold your breath for 7 seconds',
        'Exhale completely through your mouth for 8 seconds',
        'Repeat 4 times'
      ]
    },
    groundingExercise: {
      name: '5-4-3-2-1 Grounding',
      steps: [
        'Name 5 things you can SEE',
        'Name 4 things you can TOUCH',
        'Name 3 things you can HEAR',
        'Name 2 things you can SMELL',
        'Name 1 thing you can TASTE'
      ]
    }
  });
});

// Log crisis resolution
router.post('/resolve/:alertId', auth, async (req, res) => {
  try {
    const alert = await CrisisAlert.findOneAndUpdate(
      { _id: req.params.alertId, userId: req.userId },
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Crisis resolved', alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve crisis' });
  }
});

// Get user crisis history
router.get('/history', auth, async (req, res) => {
  try {
    const alerts = await CrisisAlert.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crisis history' });
  }
});

module.exports = router;
