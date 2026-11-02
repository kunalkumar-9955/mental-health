const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: Number, min: 1, max: 10, required: true },
  emotions: [{
    name: String,
    score: Number
  }],
  note: String,
  activities: [String],
  sleepHours: Number,
  stressLevel: { type: Number, min: 1, max: 10 },
  anxietyLevel: { type: Number, min: 1, max: 10 },
  energyLevel: { type: Number, min: 1, max: 10 },
  weather: String,
  triggers: [String],
  gratitude: [String],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);
