const express = require('express');
const Companion = require('../models/Companion');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');
const { generateAIResponse } = require('../services/aiService');

const router = express.Router();
router.use(requireDB);

const PERSONALITY_PROMPTS = {
  soft_supportive: `You are Aria, a warm and gentle AI companion. You speak softly, validate every emotion, and make the user feel completely safe and understood. Use gentle language, emojis occasionally, and always end with a caring question.`,
  motivational_coach: `You are Aria, an energetic motivational coach and friend. You inspire action, celebrate wins, push gently through challenges, and believe deeply in the user's potential. Be enthusiastic but genuine.`,
  calm_listener: `You are Aria, a peaceful and patient listener. You speak slowly and thoughtfully, never rush, reflect back what you hear, and create a space of deep calm. Use minimal words but make each one count.`,
  friendly_bestfriend: `You are Aria, the user's best friend who genuinely cares. You're casual, fun, use everyday language, remember things they've shared, and make them feel less alone. Be real, warm, and occasionally playful.`,
  meditation_guide: `You are Aria, a serene meditation and mindfulness guide. You speak in flowing, peaceful language, guide breathing, suggest grounding exercises, and help the user find inner stillness.`,
  strict_mentor: `You are Aria, a caring but firm productivity mentor. You hold the user accountable, celebrate discipline, gently challenge avoidance, and help them build healthy mental habits. Be direct but always kind.`
};

// Get or create companion profile
router.get('/profile', auth, async (req, res) => {
  try {
    let companion = await Companion.findOne({ userId: req.userId });
    if (!companion) {
      companion = await Companion.create({ userId: req.userId });
    }
    res.json({ companion });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get companion profile' });
  }
});

// Update companion personality
router.put('/personality', auth, async (req, res) => {
  try {
    const { personality, friendName } = req.body;
    const companion = await Companion.findOneAndUpdate(
      { userId: req.userId },
      { personality, ...(friendName && { friendName }) },
      { new: true, upsert: true }
    );
    res.json({ companion });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update personality' });
  }
});

// Chat with AI companion
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionMessages = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    let companion = await Companion.findOne({ userId: req.userId });
    if (!companion) companion = await Companion.create({ userId: req.userId });

    const systemPrompt = PERSONALITY_PROMPTS[companion.personality] || PERSONALITY_PROMPTS.friendly_bestfriend;

    // Build memory context
    let memoryCtx = '';
    if (companion.memories.length > 0) {
      const recent = companion.memories.slice(-5);
      memoryCtx = `\nThings you remember about this person: ${recent.map(m => m.note).join('; ')}.`;
    }
    if (companion.favoriteTopics.length > 0) {
      memoryCtx += `\nTheir favorite topics: ${companion.favoriteTopics.join(', ')}.`;
    }

    const fullPrompt = systemPrompt + memoryCtx + `\nEmotional bond level: ${companion.emotionalBond}/100. Adjust warmth accordingly.\nIMPORTANT: Be conversational, caring, and human-like. Max 3 sentences. Ask one follow-up question.`;

    const messages = [
      ...sessionMessages.slice(-6),
      { role: 'user', content: message }
    ];

    const reply = await generateAIResponse(messages, 'general', {});

    // Update companion stats
    companion.totalConversations += 1;
    companion.emotionalBond = Math.min(100, companion.emotionalBond + 1);
    companion.lastCheckIn = new Date();
    await companion.save();

    res.json({ reply, companion: { personality: companion.personality, friendName: companion.friendName, emotionalBond: companion.emotionalBond } });
  } catch (e) {
    console.error('Companion chat error:', e.message);
    res.status(500).json({ error: 'Companion chat failed' });
  }
});

// Daily check-in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { mood, note } = req.body;
    let companion = await Companion.findOne({ userId: req.userId });
    if (!companion) companion = await Companion.create({ userId: req.userId });

    const today = new Date();
    const lastCheckin = companion.lastCheckIn;
    const isConsecutive = lastCheckin && (today - lastCheckin) < 48 * 60 * 60 * 1000;

    companion.checkInStreak = isConsecutive ? companion.checkInStreak + 1 : 1;
    companion.lastCheckIn = today;
    companion.emotionalBond = Math.min(100, companion.emotionalBond + 2);

    if (note) {
      companion.memories.push({ topic: 'daily_checkin', emotion: mood > 6 ? 'positive' : 'needs_support', note: note.slice(0, 100) });
      if (companion.memories.length > 50) companion.memories = companion.memories.slice(-50);
    }

    await companion.save();

    const messages = [{ role: 'user', content: `Daily check-in: mood ${mood}/10. ${note || ''}` }];
    const reply = await generateAIResponse(messages, 'general', {});

    res.json({ reply, streak: companion.checkInStreak, emotionalBond: companion.emotionalBond });
  } catch (e) {
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// Get personalities list
router.get('/personalities', (req, res) => {
  res.json({
    personalities: [
      { id: 'soft_supportive', name: 'Soft & Supportive', emoji: '🌸', desc: 'Gentle, validating, emotionally safe' },
      { id: 'motivational_coach', name: 'Motivational Coach', emoji: '⚡', desc: 'Energetic, inspiring, action-oriented' },
      { id: 'calm_listener', name: 'Calm Listener', emoji: '🌊', desc: 'Peaceful, patient, deeply present' },
      { id: 'friendly_bestfriend', name: 'Best Friend', emoji: '💛', desc: 'Casual, fun, genuinely caring' },
      { id: 'meditation_guide', name: 'Meditation Guide', emoji: '🧘', desc: 'Serene, mindful, grounding' },
      { id: 'strict_mentor', name: 'Productivity Mentor', emoji: '🎯', desc: 'Accountable, disciplined, kind' }
    ]
  });
});

module.exports = router;
