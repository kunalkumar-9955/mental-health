const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  displayName: {
    type: String,
    trim: true,
    default: 'Anonymous User'
  },
  photoURL: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'anonymous'],
    default: 'email'
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  profile: {
    age: Number,
    gender: String,
    language: { type: String, default: 'en' },
    therapyGoals: [String],
    currentMood: { type: Number, default: 5 },
    stressLevel: { type: Number, default: 5 },
    preferredTherapyMode: { type: String, default: 'general' }
  },
  wellness: {
    streak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    meditationMinutes: { type: Number, default: 0 },
    badges: [String],
    wellnessScore: { type: Number, default: 50 },
    lastCheckIn: Date
  },
  memory: {
    stressTriggers: [String],
    calmingMethods: [String],
    recurringPatterns: [String],
    importantDates: [{ date: Date, note: String }]
  },
  settings: {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    privacyMode: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
