const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["assignment", "attendance", "grade", "announcement", "event", "message", "system"],
    required: true,
  },
  relatedTo: {
    model: { type: String, enum: ["Assignment", "Course", "Event", "Grade", "Attendance"] },
    id: { type: mongoose.Schema.Types.ObjectId },
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Notification", notificationSchema)
