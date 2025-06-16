const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notificationController")
const auth = require("../middleware/auth")

// Get notifications for the current user
router.get("/", auth, notificationController.getUserNotifications)

// Mark notification as read
router.put("/:notificationId/read", auth, notificationController.markAsRead)

// Mark all notifications as read
router.put("/read-all", auth, notificationController.markAllAsRead)

// Delete a notification
router.delete("/:notificationId", auth, notificationController.deleteNotification)

// Create a notification (admin/faculty only)
router.post("/", auth, notificationController.createNotification)

module.exports = router
