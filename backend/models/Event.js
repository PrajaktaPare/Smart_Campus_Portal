const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["academic", "cultural", "sports", "workshop", "seminar", "general"],
      default: "general",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxAttendees: {
      type: Number,
      default: null, // null means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
eventSchema.index({ date: 1 })
eventSchema.index({ organizer: 1 })
eventSchema.index({ type: 1 })

module.exports = mongoose.model("Event", eventSchema)
