const mongoose = require('mongoose');

const therapySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: {
    type: String,
    enum: ['general', 'student_stress', 'anxiety_relief', 'depression_support',
           'relationship', 'motivation', 'sleep_therapy', 'panic_attack', 'meditation'],
    required: true
  },
  duration: Number, // minutes
  exercises: [{
    name: String,
    completed: Boolean,
    duration: Number
  }],
  moodBefore: Number,
  moodAfter: Number,
  notes: String,
  aiSummary: String,
  helpful: Boolean,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TherapySession', therapySessionSchema);
