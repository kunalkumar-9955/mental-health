const mongoose = require('mongoose');

const dreamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: { type: String, required: true },
  type: { type: String, enum: ['dream', 'nightmare', 'recurring', 'lucid'], default: 'dream' },
  emotions: [String],
  symbols: [String],
  aiAnalysis: {
    dominantEmotion: String,
    stressIndicators: [String],
    subconsciousThemes: [String],
    interpretation: String,
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
  },
  moodBefore: Number,
  moodAfter: Number,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Dream', dreamSchema);
