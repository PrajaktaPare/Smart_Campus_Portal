const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const notificationController = require("../controllers/notificationController")

console.log("🔔 Notification routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get notifications for current user
router.get("/", notificationController.getNotifications)

// Create notification (Faculty and Admin only)
router.post("/", requireRole(["faculty", "admin"]), notificationController.createNotification)

// Mark notification as read
router.put("/:notificationId/read", notificationController.markAsRead)

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification)

module.exports = router
