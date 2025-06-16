const mongoose = require("mongoose")

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  marks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String, required: true }, // Letter grade (A, B, C, D, F)
  semester: { type: String, required: true },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Grade", gradeSchema)
