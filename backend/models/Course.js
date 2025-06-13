const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  credits: { type: Number, required: true },
  schedule: [
    {
      day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      startTime: String,
      endTime: String,
      room: String,
    },
  ],
  materials: [
    {
      title: String,
      description: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Course", courseSchema)
