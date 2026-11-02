const mongoose = require('mongoose');

const wellnessScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  scores: {
    stress: { type: Number, default: 50 },
    anxiety: { type: Number, default: 50 },
    burnoutRisk: { type: Number, default: 30 },
    emotionalStability: { type: Number, default: 60 },
    recoveryScore: { type: Number, default: 60 },
    overallWellness: { type: Number, default: 55 }
  },
  riskLevel: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
  predictions: {
    burnoutRisk: Number,
    depressionRisk: Number,
    anxietyRelapse: Number,
    stressOverload: Number
  },
  triggers: [String],
  recommendations: [String],
  lifeBalance: {
    sleep: Number,
    work: Number,
    social: Number,
    exercise: Number,
    nutrition: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('WellnessScore', wellnessScoreSchema);
