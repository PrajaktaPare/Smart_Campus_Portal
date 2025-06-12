const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  grade: { type: String, required: true },
  semester: { type: String, required: true },
});

module.exports = mongoose.model('Grade', gradeSchema);
