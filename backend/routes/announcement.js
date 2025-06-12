const express = require("express")
const Announcement = require("../models/Announcement")
const auth = require("../middleware/auth")
const router = express.Router()

// Get announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 })
    res.json(announcements)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create announcement (admin/faculty only)
router.post("/", auth, async (req, res) => {
  if (req.user.role === "student") {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const announcement = new Announcement(req.body)
    await announcement.save()
    res.status(201).json(announcement)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router
