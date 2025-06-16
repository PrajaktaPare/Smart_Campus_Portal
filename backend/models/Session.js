const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
      ip: String,
      location: {
        country: String,
        city: String,
        region: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
sessionSchema.index({ sessionToken: 1 })
sessionSchema.index({ userId: 1 })
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
sessionSchema.index({ isActive: 1 })

// Instance methods
sessionSchema.methods.updateActivity = function () {
  this.lastActivity = new Date()
  return this.save()
}

sessionSchema.methods.deactivate = function () {
  this.isActive = false
  return this.save()
}

// Static methods
sessionSchema.statics.findActiveSession = function (sessionToken) {
  return this.findOne({
    sessionToken,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).populate("userId")
}

sessionSchema.statics.deactivateUserSessions = function (userId, excludeSessionId = null) {
  const query = { userId, isActive: true }
  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId }
  }
  return this.updateMany(query, { isActive: false })
}

sessionSchema.statics.cleanupExpiredSessions = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  })
}

module.exports = mongoose.model("Session", sessionSchema)
