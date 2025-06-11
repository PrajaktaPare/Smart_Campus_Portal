const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Placement', placementSchema);