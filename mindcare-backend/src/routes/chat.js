const express = require('express');
const Chat = require('../models/Chat');
const CrisisAlert = require('../models/CrisisAlert');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');
const {
  detectCrisis,
  analyzeEmotion,
  analyzeEmotionWithGemini,
  generateAIResponse,
  generateCrisisResponse
} = require('../services/aiService');

const router = express.Router();

// Apply requireDB to all chat routes
router.use(requireDB);

// Send message and get AI response
router.post('/message', auth, async (req, res) => {
  try {
    const { message, sessionId, therapyMode = 'general' } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Crisis detection
    const crisisCheck = detectCrisis(message);

    // Emotion analysis — use Gemini AI for richer results
    const emotion = await analyzeEmotionWithGemini(message);

    // Get or create chat session
    let chat;
    if (sessionId) {
      chat = await Chat.findOne({ _id: sessionId, userId: req.userId });
    }
    
    if (!chat) {
      chat = new Chat({
        userId: req.userId,
        therapyMode,
        sessionTitle: message.slice(0, 50) + (message.length > 50 ? '...' : '')
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      emotion,
      isCrisis: crisisCheck.isCrisis
    });

    // Generate AI response
    let aiResponse;
    if (crisisCheck.isCrisis) {
      aiResponse = generateCrisisResponse(crisisCheck.severity);
      
      // Log crisis alert
      const alert = new CrisisAlert({
        userId: req.userId,
        sessionId: chat._id,
        triggerPhrase: crisisCheck.triggers[0],
        severity: crisisCheck.severity,
        context: message,
        responseGiven: aiResponse
      });
      await alert.save();

      // Notify via socket
      if (req.io) {
        req.io.to(`user_${req.userId}`).emit('crisis_detected', {
          severity: crisisCheck.severity,
          sessionId: chat._id
        });
      }
    } else {
      // Build message history for AI
      const messageHistory = chat.messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const user = await User.findById(req.userId);
      aiResponse = await generateAIResponse(
        messageHistory,
        therapyMode,
        user?.memory || {}
      );
    }

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      emotion: { detected: 'supportive', score: 80 }
    });

    // Update chat metadata
    chat.dominantEmotion = emotion.detected;
    chat.crisisDetected = crisisCheck.isCrisis || chat.crisisDetected;
    
    await chat.save();

    // Update user memory with detected patterns
    if (emotion.detected !== 'neutral' && emotion.score > 50) {
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { 'memory.recurringPatterns': emotion.detected },
        'profile.currentMood': Math.max(1, Math.min(10, 
          emotion.detected === 'happiness' ? 8 : 
          emotion.detected === 'sadness' ? 3 : 5
        ))
      });
    }

    res.json({
      sessionId: chat._id,
      message: aiResponse,
      emotion,
      isCrisis: crisisCheck.isCrisis,
      crisisSeverity: crisisCheck.severity,
      therapyMode
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get all chat sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await Chat.find({ userId: req.userId })
      .select('sessionTitle therapyMode dominantEmotion crisisDetected startedAt messages')
      .sort({ startedAt: -1 })
      .limit(50);

    const sessionsWithCount = sessions.map(s => ({
      ...s.toObject(),
      messageCount: s.messages.length,
      messages: undefined
    }));

    res.json({ sessions: sessionsWithCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get specific session
router.get('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.sessionId, 
      userId: req.userId 
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session: chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Delete session
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ 
      _id: req.params.sessionId, 
      userId: req.userId 
    });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Delete all sessions
router.delete('/sessions', auth, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.userId });
    res.json({ message: 'All sessions deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sessions' });
  }
});

// Export session as text
router.get('/sessions/:sessionId/export', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.sessionId, 
      userId: req.userId 
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const exportData = {
      title: chat.sessionTitle,
      mode: chat.therapyMode,
      date: chat.startedAt,
      messages: chat.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
    };

    res.json({ export: exportData });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
