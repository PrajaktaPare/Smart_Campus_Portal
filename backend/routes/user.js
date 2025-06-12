const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")
const router = express.Router()

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(req.user.userId, { name, email }, { new: true }).select("-password")
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
