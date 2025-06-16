const Notification = require("../models/Notification")

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    console.log("🔔 Getting notifications for user:", req.user.email)

    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type } = req.body

    const notification = new Notification({
      recipient,
      sender: req.user.userId,
      title,
      message,
      type: type || "system",
    })

    await notification.save()

    const populatedNotification = await Notification.findById(notification._id).populate("sender", "name email")

    res.status(201).json(populatedNotification)
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.userId },
      { read: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user.userId,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
