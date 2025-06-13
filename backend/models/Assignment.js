const mongoose = require("mongoose")

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attachments: [{ name: String, url: String }],
  totalMarks: { type: Number, required: true },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
      content: { type: String },
      attachments: [{ name: String, url: String }],
      marks: { type: Number },
      feedback: { type: String },
      status: { type: String, enum: ["submitted", "graded", "late"], default: "submitted" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Assignment", assignmentSchema)
