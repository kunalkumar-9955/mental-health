const express = require('express');
const TherapySession = require('../models/TherapySession');
const { auth } = require('../middleware/auth');
const { generateMotivationalQuote, generateAIResponse } = require('../services/aiService');

const router = express.Router();

// Get therapy modes
router.get('/modes', (req, res) => {
  res.json({
    modes: [
      {
        id: 'general',
        name: 'General Support',
        description: 'Open conversation with your AI therapist',
        icon: '💬',
        color: 'purple',
        exercises: ['Breathing', 'Journaling', 'Reflection']
      },
      {
        id: 'student_stress',
        name: 'Student Stress',
        description: 'Academic pressure, exams, and study-life balance',
        icon: '📚',
        color: 'blue',
        exercises: ['Time Management', 'Study Breaks', 'Exam Anxiety Relief']
      },
      {
        id: 'anxiety_relief',
        name: 'Anxiety Relief',
        description: 'Calm anxiety with proven techniques',
        icon: '🌊',
        color: 'cyan',
        exercises: ['4-7-8 Breathing', 'Grounding', 'Progressive Relaxation']
      },
      {
        id: 'depression_support',
        name: 'Depression Support',
        description: 'Gentle support for low mood and depression',
        icon: '🌱',
        color: 'green',
        exercises: ['Behavioral Activation', 'Self-Compassion', 'Gratitude Practice']
      },
      {
        id: 'relationship',
        name: 'Relationship Support',
        description: 'Navigate relationship challenges',
        icon: '💝',
        color: 'pink',
        exercises: ['Communication Skills', 'Boundary Setting', 'Self-Love']
      },
      {
        id: 'motivation',
        name: 'Motivation Mode',
        description: 'Reignite your drive and purpose',
        icon: '⚡',
        color: 'yellow',
        exercises: ['Goal Setting', 'Affirmations', 'Vision Board']
      },
      {
        id: 'sleep_therapy',
        name: 'Sleep Therapy',
        description: 'Improve sleep quality and bedtime routine',
        icon: '🌙',
        color: 'indigo',
        exercises: ['Sleep Hygiene', 'Body Scan', 'Bedtime Routine']
      },
      {
        id: 'panic_attack',
        name: 'Panic Attack Support',
        description: 'Immediate help during panic attacks',
        icon: '🆘',
        color: 'red',
        exercises: ['Box Breathing', 'Grounding', 'Safety Affirmations']
      },
      {
        id: 'meditation',
        name: 'Meditation Companion',
        description: 'Guided mindfulness and meditation',
        icon: '🧘',
        color: 'teal',
        exercises: ['Mindfulness', 'Body Scan', 'Loving Kindness']
      }
    ]
  });
});

// Log therapy session
router.post('/session', auth, async (req, res) => {
  try {
    const { mode, duration, exercises, moodBefore, moodAfter, notes, helpful } = req.body;
    
    const session = new TherapySession({
      userId: req.userId,
      mode,
      duration,
      exercises: exercises || [],
      moodBefore,
      moodAfter,
      notes,
      helpful
    });

    await session.save();
    res.status(201).json({ message: 'Session logged', session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Get motivational quote
router.get('/quote', async (req, res) => {
  try {
    const quote = await generateMotivationalQuote();
    res.json({ quote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

// Get breathing exercises
router.get('/breathing', (req, res) => {
  res.json({
    exercises: [
      {
        id: 'box',
        name: 'Box Breathing',
        description: 'Used by Navy SEALs for stress control',
        steps: [
          { action: 'Inhale', duration: 4, instruction: 'Breathe in slowly' },
          { action: 'Hold', duration: 4, instruction: 'Hold your breath' },
          { action: 'Exhale', duration: 4, instruction: 'Breathe out slowly' },
          { action: 'Hold', duration: 4, instruction: 'Hold empty' }
        ],
        cycles: 4
      },
      {
        id: '478',
        name: '4-7-8 Breathing',
        description: 'Natural tranquilizer for the nervous system',
        steps: [
          { action: 'Inhale', duration: 4, instruction: 'Breathe in through nose' },
          { action: 'Hold', duration: 7, instruction: 'Hold your breath' },
          { action: 'Exhale', duration: 8, instruction: 'Exhale through mouth' }
        ],
        cycles: 4
      },
      {
        id: 'calm',
        name: 'Calm Breathing',
        description: 'Simple relaxation breathing',
        steps: [
          { action: 'Inhale', duration: 5, instruction: 'Breathe in gently' },
          { action: 'Exhale', duration: 5, instruction: 'Breathe out slowly' }
        ],
        cycles: 6
      }
    ]
  });
});

module.exports = router;
