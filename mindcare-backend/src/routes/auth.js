const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'mindcare_secret_key_2024',
    { expiresIn: '30d' }
  );
};

// Helper: format validation errors nicely
const formatValidationErrors = (errors) => {
  return errors.array().map(e => e.msg).join('. ');
};

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', requireDB, [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: formatValidationErrors(errors) });
    }

    const { email, password, displayName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const user = new User({
      email,
      password,
      displayName: displayName?.trim() || email.split('@')[0],
      authProvider: 'email'
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', requireDB, [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: formatValidationErrors(errors) });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
    }

    if (user.isAnonymous) {
      return res.status(401).json({ error: 'This is an anonymous account. Please use anonymous login.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Anonymous Login ──────────────────────────────────────────────────────────
router.post('/anonymous', requireDB, async (req, res) => {
  try {
    const anonymousId = uuidv4();
    const user = new User({
      displayName: `Guest_${anonymousId.slice(0, 8)}`,
      isAnonymous: true,
      anonymousId,
      authProvider: 'anonymous'
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Anonymous session created',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Anonymous login error:', error);
    res.status(500).json({ error: 'Failed to create anonymous session. Please try again.' });
  }
});

// ─── Firebase / Google Auth ───────────────────────────────────────────────────
router.post('/firebase', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID is required' });
    }

    let user = await User.findOne({ firebaseUid });
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = new User({
        firebaseUid,
        email,
        displayName: displayName || 'User',
        photoURL,
        authProvider: 'google'
      });
    } else {
      user.firebaseUid = firebaseUid;
      user.lastSeen = new Date();
      if (displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;
    }

    await user.save();
    const token = generateToken(user._id);

    res.json({ message: 'Firebase auth successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ error: 'Firebase authentication failed. Please try again.' });
  }
});

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, profile, settings } = req.body;
    const user = req.user;

    if (displayName !== undefined) user.displayName = displayName.trim() || user.displayName;
    if (profile) user.profile = { ...user.profile.toObject?.() || user.profile, ...profile };
    if (settings) user.settings = { ...user.settings.toObject?.() || user.settings, ...settings };

    await user.save();
    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed. Please try again.' });
  }
});

// ─── Delete Account ───────────────────────────────────────────────────────────
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Account deletion failed. Please try again.' });
  }
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail()
], async (req, res) => {
  // Always return success to prevent email enumeration
  res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
});

module.exports = router;
