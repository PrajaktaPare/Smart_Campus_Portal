const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  name: { type: String, required: true },
  courses: [{ type: String }],
  attendance: [{ date: Date, status: String }],
  grades: [{ course: String, grade: String }],
});

module.exports = mongoose.model('User', userSchema);