const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  date: { type: Date, required: true, default: Date.now },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      status: { type: String, enum: ["present", "absent", "late"], required: true },
      remark: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

attendanceSchema.index({ course: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", attendanceSchema)
