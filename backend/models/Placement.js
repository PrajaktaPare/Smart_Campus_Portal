const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model('Placement', placementSchema);
