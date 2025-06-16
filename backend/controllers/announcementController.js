const Announcement = require("../models/Announcement")

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    console.log("📢 Getting all announcements")

    const announcements = await Announcement.find().populate("createdBy", "name email").sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body

    const announcement = new Announcement({
      title,
      content,
      priority: priority || "normal",
      createdBy: req.user.userId,
    })

    await announcement.save()

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate("createdBy", "name email")

    res.status(201).json(populatedAnnouncement)
  } catch (error) {
    console.error("Error creating announcement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId).populate("createdBy", "name email")

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    res.json(announcement)
  } catch (error) {
    console.error("Error fetching announcement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params
    const updates = req.body

    const announcement = await Announcement.findByIdAndUpdate(announcementId, updates, { new: true }).populate(
      "createdBy",
      "name email",
    )

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    res.json(announcement)
  } catch (error) {
    console.error("Error updating announcement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.announcementId)

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    res.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
