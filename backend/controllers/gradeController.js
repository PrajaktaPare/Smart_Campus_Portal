const Grade = require('../models/Grade');

exports.getGrades = async (req, res) => {
  try {
    const userId = req.params.userId;
    const grades = await Grade.find({ studentId: userId });
    res.status(200).json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
