const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

const MUSIC_LIBRARY = {
  anxiety: [
    { id: 'a1', title: 'Ocean Waves', artist: 'Nature Sounds', duration: '10:00', frequency: '432Hz', mood: 'calming', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', emoji: '🌊' },
    { id: 'a2', title: 'Forest Rain', artist: 'Ambient Therapy', duration: '8:00', frequency: '528Hz', mood: 'calming', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', emoji: '🌧️' },
    { id: 'a3', title: 'Tibetan Bowls', artist: 'Healing Sounds', duration: '12:00', frequency: '396Hz', mood: 'grounding', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', emoji: '🔔' }
  ],
  stress: [
    { id: 's1', title: 'Deep Relaxation', artist: 'Calm Mind', duration: '15:00', frequency: '432Hz', mood: 'relaxing', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', emoji: '😌' },
    { id: 's2', title: 'Gentle Piano', artist: 'Peaceful Keys', duration: '6:00', frequency: 'natural', mood: 'soothing', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', emoji: '🎹' },
    { id: 's3', title: 'Wind Chimes', artist: 'Nature Therapy', duration: '9:00', frequency: '528Hz', mood: 'uplifting', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', emoji: '🎐' }
  ],
  sleep: [
    { id: 'sl1', title: 'Delta Waves', artist: 'Sleep Science', duration: '30:00', frequency: '2Hz', mood: 'sleep', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', emoji: '🌙' },
    { id: 'sl2', title: 'Night Rain', artist: 'Sleep Sounds', duration: '45:00', frequency: 'binaural', mood: 'sleep', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', emoji: '🌧️' },
    { id: 'sl3', title: 'Lullaby Waves', artist: 'Dream Therapy', duration: '20:00', frequency: '432Hz', mood: 'sleep', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', emoji: '💤' }
  ],
  focus: [
    { id: 'f1', title: 'Alpha Waves', artist: 'Focus Lab', duration: '25:00', frequency: '10Hz', mood: 'focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', emoji: '🎯' },
    { id: 'f2', title: 'Study Flow', artist: 'Brain Boost', duration: '50:00', frequency: 'binaural', mood: 'focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', emoji: '📚' },
    { id: 'f3', title: 'Concentration', artist: 'Mind Music', duration: '30:00', frequency: '14Hz', mood: 'focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', emoji: '🧠' }
  ],
  meditation: [
    { id: 'm1', title: 'OM Chanting', artist: 'Sacred Sounds', duration: '11:00', frequency: '136Hz', mood: 'spiritual', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', emoji: '🕉️' },
    { id: 'm2', title: 'Chakra Healing', artist: 'Energy Therapy', duration: '20:00', frequency: '528Hz', mood: 'healing', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', emoji: '✨' },
    { id: 'm3', title: 'Zen Garden', artist: 'Mindful Music', duration: '15:00', frequency: '432Hz', mood: 'peaceful', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', emoji: '🌸' }
  ],
  happiness: [
    { id: 'h1', title: 'Morning Joy', artist: 'Uplifting Sounds', duration: '5:00', frequency: '528Hz', mood: 'uplifting', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', emoji: '☀️' },
    { id: 'h2', title: 'Positive Vibes', artist: 'Good Energy', duration: '7:00', frequency: '639Hz', mood: 'joyful', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', emoji: '🌈' }
  ]
};

const EMOTION_TO_MUSIC = {
  anxiety: 'anxiety', stress: 'stress', sadness: 'meditation',
  anger: 'stress', happiness: 'happiness', loneliness: 'meditation',
  neutral: 'focus', fear: 'anxiety'
};

// Get music by mood/emotion
router.get('/recommend/:emotion', auth, (req, res) => {
  const { emotion } = req.params;
  const category = EMOTION_TO_MUSIC[emotion] || 'meditation';
  const tracks = MUSIC_LIBRARY[category] || MUSIC_LIBRARY.meditation;
  res.json({ tracks, category, emotion });
});

// Get all categories
router.get('/categories', auth, (req, res) => {
  const categories = Object.keys(MUSIC_LIBRARY).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: MUSIC_LIBRARY[key].length,
    emoji: { anxiety: '🌊', stress: '😌', sleep: '🌙', focus: '🎯', meditation: '🧘', happiness: '☀️' }[key]
  }));
  res.json({ categories });
});

// Get tracks by category
router.get('/category/:category', auth, (req, res) => {
  const tracks = MUSIC_LIBRARY[req.params.category];
  if (!tracks) return res.status(404).json({ error: 'Category not found' });
  res.json({ tracks });
});

module.exports = router;
