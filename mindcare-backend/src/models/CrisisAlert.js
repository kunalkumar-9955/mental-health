const mongoose = require('mongoose');

const crisisAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  triggerPhrase: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  context: String,
  responseGiven: String,
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  helplineShown: { type: Boolean, default: false },
  breathingExerciseDone: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CrisisAlert', crisisAlertSchema);
