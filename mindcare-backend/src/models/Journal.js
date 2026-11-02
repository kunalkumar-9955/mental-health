const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  content: { type: String, required: true },
  mood: { type: Number, min: 1, max: 10 },
  emotions: [String],
  tags: [String],
  isVoice: { type: Boolean, default: false },
  voiceUrl: String,
  aiInsight: String,
  isPrivate: { type: Boolean, default: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);
