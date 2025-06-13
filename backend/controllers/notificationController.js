const Notification = require("../models/Notification")

// Get notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json(notifications)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    notification.read = true
    await notification.save()

    res.status(200).json({ message: "Notification marked as read" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.userId, read: false }, { $set: { read: true } })

    res.status(200).json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    await notification.deleteOne()

    res.status(200).json({ message: "Notification deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a notification (admin/faculty only)
exports.createNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: req.user.userId,
      title,
      message,
      type: type || "system",
    })

    await notification.save()

    res.status(201).json(notification)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
