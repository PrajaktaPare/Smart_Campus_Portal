// backend/controllers/attendanceController.js
const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    const attendance = await Attendance.find({ studentId: userId });
    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
