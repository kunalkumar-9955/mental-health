const express = require('express');
const Dream = require('../models/Dream');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');
const { generateAIResponse } = require('../services/aiService');

const router = express.Router();
router.use(requireDB);

// Analyze and save dream
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, moodBefore } = req.body;
    if (!description?.trim()) return res.status(400).json({ error: 'Dream description required' });

    // AI analysis
    const prompt = `Analyze this dream/nightmare for emotional and psychological insights. Respond ONLY in JSON:
Dream: "${description.slice(0, 500)}"
Type: ${type || 'dream'}
JSON: {"dominantEmotion":"string","stressIndicators":["array"],"subconsciousThemes":["array"],"interpretation":"2 sentence compassionate interpretation","riskLevel":"low|medium|high","symbols":["key symbols found"]}`;

    let aiAnalysis = { dominantEmotion: 'neutral', stressIndicators: [], subconsciousThemes: [], interpretation: 'Your dream reflects your inner emotional world.', riskLevel: 'low', symbols: [] };

    try {
      const aiReply = await generateAIResponse([{ role: 'user', content: prompt }], 'general');
      const match = aiReply.match(/\{[\s\S]*\}/);
      if (match) aiAnalysis = { ...aiAnalysis, ...JSON.parse(match[0]) };
    } catch (e) {}

    const dream = await Dream.create({
      userId: req.userId,
      title: title || `Dream - ${new Date().toLocaleDateString()}`,
      description,
      type: type || 'dream',
      emotions: [aiAnalysis.dominantEmotion],
      symbols: aiAnalysis.symbols || [],
      aiAnalysis,
      moodBefore
    });

    res.status(201).json({ dream });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze dream' });
  }
});

// Get all dreams
router.get('/', auth, async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: req.userId }).sort({ date: -1 }).limit(50);
    res.json({ dreams });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dreams' });
  }
});

// Delete dream
router.delete('/:id', auth, async (req, res) => {
  try {
    await Dream.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Dream deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete dream' });
  }
});

module.exports = router;
