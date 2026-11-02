const express = require('express');
const Journal = require('../models/Journal');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');
const { analyzeEmotionWithGemini, generateAIResponse } = require('../services/aiService');

const router = express.Router();
router.use(requireDB);

// Create journal entry
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, mood, emotions, tags } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Analyze emotion from journal content
    const emotionAnalysis = analyzeEmotionWithGemini ? await analyzeEmotionWithGemini(content) : { detected: 'neutral', score: 0 };
    
    // Generate AI insight using Gemini
    let aiInsight = '';
    try {
      const insightMessages = [
        { role: 'user', content: `Please provide a brief, compassionate insight about this journal entry in 2-3 sentences. Be warm and supportive: "${content.slice(0, 500)}"` }
      ];
      aiInsight = await generateAIResponse(insightMessages, 'general');
    } catch (e) {
      aiInsight = 'Thank you for sharing your thoughts. Journaling is a powerful tool for self-reflection and emotional processing. Keep writing — every entry is a step toward understanding yourself better.';
    }

    const entry = new Journal({
      userId: req.userId,
      title: title || `Journal - ${new Date().toLocaleDateString()}`,
      content,
      mood: mood || emotionAnalysis.score / 10,
      emotions: emotions || [emotionAnalysis.detected],
      tags: tags || [],
      aiInsight
    });

    await entry.save();
    res.status(201).json({ message: 'Journal entry saved', entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// Get all journal entries
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const entries = await Journal.find({ userId: req.userId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Journal.countDocuments({ userId: req.userId });

    res.json({ entries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get single entry
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
