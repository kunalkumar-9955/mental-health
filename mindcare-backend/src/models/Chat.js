const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  emotion: {
    detected: String,
    score: Number,
    intensity: String,
    breakdown: {
      sadness: Number,
      anxiety: Number,
      stress: Number,
      anger: Number,
      happiness: Number,
      neutral: Number
    }
  },
  isCrisis: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  reactions: [String]
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionTitle: { type: String, default: 'New Session' },
  therapyMode: {
    type: String,
    enum: ['general', 'student_stress', 'anxiety_relief', 'depression_support', 
           'relationship', 'motivation', 'sleep_therapy', 'panic_attack', 'meditation'],
    default: 'general'
  },
  messages: [messageSchema],
  summary: String,
  overallMood: { type: Number, default: 5 },
  dominantEmotion: String,
  crisisDetected: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  duration: Number // in minutes
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
