const mongoose = require("mongoose")

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    language: {
      type: String,
      default: "en",
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      assignments: {
        type: Boolean,
        default: true,
      },
      grades: {
        type: Boolean,
        default: true,
      },
      events: {
        type: Boolean,
        default: true,
      },
    },
    dashboard: {
      layout: {
        type: String,
        enum: ["grid", "list"],
        default: "grid",
      },
      widgets: {
        type: [String],
        default: ["assignments", "grades", "attendance", "events"],
      },
    },
    accessibility: {
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      highContrast: {
        type: Boolean,
        default: false,
      },
      reducedMotion: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("UserPreferences", userPreferencesSchema)
