const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: String,
  specializations: [String],
  bio: String,
  experience: Number,
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  languages: [String],
  sessionPrice: { type: Number, default: 500 },
  currency: { type: String, default: 'INR' },
  availability: [{
    day: String,
    slots: [String]
  }],
  isApproved: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  totalSessions: { type: Number, default: 0 },
  badges: [String]
}, { timestamps: true });

module.exports = mongoose.model('Therapist', therapistSchema);
