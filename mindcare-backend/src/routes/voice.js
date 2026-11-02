const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { analyzeEmotionWithGemini, analyzeEmotion, transcribeVoice } = require('../services/aiService');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) return cb(null, true);
    cb(new Error('Only audio files are allowed'));
  }
});

// ─── Analyze Voice ────────────────────────────────────────────────────────────
router.post('/analyze', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Step 1: Transcribe with Whisper
    const transcription = await transcribeVoice(req.file.buffer, req.file.mimetype);

    // Step 2: Analyze emotion from transcription text
    let voiceEmotion;
    if (transcription.success && transcription.text) {
      voiceEmotion = await analyzeEmotionWithGemini(transcription.text);
    } else {
      voiceEmotion = { detected: 'neutral', score: 0, intensity: 'low', source: 'local' };
    }

    // Step 3: Compute stress score from emotion
    const stressMap = { anxiety: 85, stress: 80, anger: 70, sadness: 60, fear: 75, loneliness: 55, neutral: 20, happiness: 10 };
    const baseStress = stressMap[voiceEmotion.detected] || 30;
    const stressScore = Math.min(100, Math.round(baseStress * (voiceEmotion.score / 100) + 20));

    const analysis = {
      transcription: transcription.text || '(Could not transcribe audio)',
      transcriptionSuccess: transcription.success,
      emotion: voiceEmotion,
      stressScore,
      stressLevel: stressScore > 65 ? 'high' : stressScore > 40 ? 'medium' : 'low',
      voiceCharacteristics: {
        pace: stressScore > 65 ? 'fast' : stressScore > 40 ? 'moderate' : 'calm',
        tone: voiceEmotion.detected,
        clarity: transcription.success ? 'clear' : 'unclear'
      },
      suggestions: getVoiceSuggestions(stressScore, voiceEmotion.detected)
    };

    res.json({ analysis });
  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500).json({ error: 'Voice analysis failed. Please try again.' });
  }
});

const getVoiceSuggestions = (stressScore, emotion) => {
  if (stressScore > 65) {
    return [
      'Your voice indicates elevated stress. Try the 4-7-8 breathing technique.',
      'Take a 5-minute break and practice mindful breathing.',
      'Consider a short meditation session to calm your nervous system.'
    ];
  }
  if (emotion === 'sadness') {
    return [
      "I can hear some sadness in your voice. It's okay to feel this way.",
      'Would you like to talk about what\'s on your mind?',
      'A gentle walk or journaling might help process these feelings.'
    ];
  }
  if (emotion === 'anxiety') {
    return [
      'Your voice suggests some anxiety. Try grounding yourself with the 5-4-3-2-1 technique.',
      'Focus on slow, deep breaths — in for 4 counts, out for 6.',
      'Remember: this feeling is temporary and will pass.'
    ];
  }
  return [
    'Your voice sounds relatively calm — great job!',
    'Keep up the good work with your emotional wellness.',
    'Consider a brief mindfulness check-in to maintain this balance.'
  ];
};

module.exports = router;
