const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const announcementController = require("../controllers/announcementController")

console.log("📢 Announcement routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get all announcements
router.get("/", announcementController.getAllAnnouncements)

// Create announcement (Faculty and Admin only)
router.post("/", requireRole(["faculty", "admin"]), announcementController.createAnnouncement)

// Get announcement by ID
router.get("/:announcementId", announcementController.getAnnouncementById)

// Update announcement (Faculty and Admin only)
router.put("/:announcementId", requireRole(["faculty", "admin"]), announcementController.updateAnnouncement)

// Delete announcement (Faculty and Admin only)
router.delete("/:announcementId", requireRole(["faculty", "admin"]), announcementController.deleteAnnouncement)

module.exports = router
