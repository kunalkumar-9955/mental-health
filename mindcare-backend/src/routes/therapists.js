const express = require('express');
const Therapist = require('../models/Therapist');
const { auth } = require('../middleware/auth');
const requireDB = require('../middleware/requireDB');

const router = express.Router();
router.use(requireDB);

// Seed demo therapists if none exist
const seedTherapists = async () => {
  const count = await Therapist.countDocuments();
  if (count > 0) return;
  await Therapist.insertMany([
    { name: 'Dr. Priya Sharma', email: 'priya@mindcare.ai', specializations: ['Anxiety', 'Depression', 'CBT'], bio: 'Compassionate therapist with 8 years helping people overcome anxiety and depression using evidence-based approaches.', experience: 8, rating: 4.9, reviewCount: 127, languages: ['English', 'Hindi'], sessionPrice: 800, isApproved: true, badges: ['Top Rated', 'CBT Expert'] },
    { name: 'Dr. Rahul Mehta', email: 'rahul@mindcare.ai', specializations: ['Stress', 'Relationships', 'Trauma'], bio: 'Specialized in trauma-informed care and relationship counseling. Creating safe spaces for healing.', experience: 6, rating: 4.7, reviewCount: 89, languages: ['English', 'Hindi', 'Gujarati'], sessionPrice: 700, isApproved: true, badges: ['Trauma Specialist'] },
    { name: 'Dr. Ananya Krishnan', email: 'ananya@mindcare.ai', specializations: ['Student Mental Health', 'Career Stress', 'Mindfulness'], bio: 'Helping students and young professionals navigate life transitions with mindfulness and compassion.', experience: 5, rating: 4.8, reviewCount: 64, languages: ['English', 'Tamil', 'Hindi'], sessionPrice: 600, isApproved: true, badges: ['Youth Specialist'] },
    { name: 'Dr. Vikram Patel', email: 'vikram@mindcare.ai', specializations: ['Sleep Disorders', 'Burnout', 'Work-Life Balance'], bio: 'Expert in burnout recovery and sleep therapy. Helping professionals reclaim their wellbeing.', experience: 10, rating: 4.6, reviewCount: 203, languages: ['English', 'Hindi'], sessionPrice: 1000, isApproved: true, badges: ['Burnout Expert', 'Senior Therapist'] },
    { name: 'Dr. Meera Joshi', email: 'meera@mindcare.ai', specializations: ['Grief', 'Loss', 'Emotional Healing'], bio: 'Specializing in grief counseling and emotional healing. Walking alongside you through life\'s hardest moments.', experience: 7, rating: 4.9, reviewCount: 156, languages: ['English', 'Marathi', 'Hindi'], sessionPrice: 750, isApproved: true, badges: ['Grief Specialist', 'Top Rated'] }
  ]);
};

// Get all approved therapists
router.get('/', auth, async (req, res) => {
  try {
    await seedTherapists();
    const { specialization, language, maxPrice, sort = 'rating' } = req.query;
    const query = { isApproved: true };
    if (specialization) query.specializations = { $in: [new RegExp(specialization, 'i')] };
    if (language) query.languages = { $in: [new RegExp(language, 'i')] };
    if (maxPrice) query.sessionPrice = { $lte: parseInt(maxPrice) };

    const sortMap = { rating: { rating: -1 }, price: { sessionPrice: 1 }, experience: { experience: -1 } };
    const therapists = await Therapist.find(query).sort(sortMap[sort] || { rating: -1 });
    res.json({ therapists });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// Get single therapist
router.get('/:id', auth, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    res.json({ therapist });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch therapist' });
  }
});

// Book appointment (simplified)
router.post('/:id/book', auth, async (req, res) => {
  try {
    const { date, slot, type = 'video' } = req.body;
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    // In production: create appointment record, send confirmation email
    res.json({
      message: 'Appointment request sent successfully',
      appointment: {
        therapistName: therapist.name,
        date, slot, type,
        status: 'pending',
        confirmationId: `MC${Date.now().toString(36).toUpperCase()}`
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

module.exports = router;
