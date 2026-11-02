const express = require('express');
const { auth } = require('../middleware/auth');
const { analyzeEmotionWithGemini, analyzeEmotion } = require('../services/aiService');

const router = express.Router();

// ─── Analyze Text Emotion ─────────────────────────────────────────────────────
router.post('/analyze', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Gemini-powered analysis
    const emotion = await analyzeEmotionWithGemini(text);
    const suggestions = getEmotionSuggestions(emotion.detected);

    res.json({ emotion, suggestions, timestamp: new Date() });
  } catch (error) {
    console.error('Emotion analysis error:', error);
    // Fallback to local
    const emotion = analyzeEmotion(req.body.text || '');
    res.json({ emotion, suggestions: getEmotionSuggestions(emotion.detected), timestamp: new Date() });
  }
});

const getEmotionSuggestions = (emotion) => {
  const map = {
    sadness: [
      'Try a 5-minute breathing exercise to ground yourself',
      'Write down 3 things you are grateful for today',
      'Reach out to someone you trust and share how you feel',
      'Take a gentle walk outside — nature helps lift mood'
    ],
    anxiety: [
      'Practice the 4-7-8 breathing technique right now',
      'Try the 5-4-3-2-1 grounding exercise',
      'Limit caffeine intake today — it amplifies anxiety',
      'Write down your worries to externalize and examine them'
    ],
    stress: [
      'Take a 10-minute break from screens',
      'Try progressive muscle relaxation',
      'Write down your top 3 priorities and focus only on those',
      'Practice mindful breathing for 5 minutes'
    ],
    anger: [
      'Count slowly to 10 before responding to anything',
      'Take a brisk walk to release physical tension',
      'Write in your journal — express without filtering',
      'Practice deep belly breathing to calm your nervous system'
    ],
    happiness: [
      'Share your joy with someone you care about',
      'Write down what made you happy to remember it',
      'Use this positive energy for something creative',
      'Practice gratitude meditation to amplify this feeling'
    ],
    loneliness: [
      'Reach out to a friend or family member right now',
      'Join an online community around something you love',
      'Practice self-compassion meditation',
      'Consider volunteering — connection through giving helps'
    ],
    fear: [
      'Name the fear specifically — vague fears feel bigger',
      'Practice box breathing: 4 in, 4 hold, 4 out, 4 hold',
      'Remind yourself: you have survived every difficult moment so far',
      'Talk to someone you trust about what is scaring you'
    ],
    neutral: [
      'Check in with yourself — how are you really feeling?',
      'Practice 5 minutes of mindfulness',
      'Set one positive intention for the rest of your day'
    ]
  };
  return map[emotion] || map.neutral;
};

module.exports = router;
