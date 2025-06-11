const express = require('express');
const Placement = require('../models/Placement');
const auth = require('../middleware/auth');
const router = express.Router();

// Get placements for a student
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied' });

  try {
    const placements = await Placement.find({ studentId: req.user.id });
    res.json(placements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create placement (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const placement = new Placement(req.body);
  try {
    const newPlacement = await placement.save();
    res.status(201).json(newPlacement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;