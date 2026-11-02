const mongoose = require('mongoose');

const companionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personality: {
    type: String,
    enum: ['soft_supportive', 'motivational_coach', 'calm_listener', 'friendly_bestfriend', 'meditation_guide', 'strict_mentor'],
    default: 'friendly_bestfriend'
  },
  friendName: { type: String, default: 'Aria' },
  favoriteTopics: [String],
  emotionalBond: { type: Number, default: 0, min: 0, max: 100 },
  checkInStreak: { type: Number, default: 0 },
  lastCheckIn: Date,
  memories: [{
    topic: String,
    emotion: String,
    note: String,
    date: { type: Date, default: Date.now }
  }],
  totalConversations: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Companion', companionSchema);
