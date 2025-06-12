const Placement = require('../models/Placement');

exports.getPlacements = async (req, res) => {
  try {
    const userId = req.params.userId;
    const placements = await Placement.find({ studentId: userId });
    res.status(200).json(placements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
