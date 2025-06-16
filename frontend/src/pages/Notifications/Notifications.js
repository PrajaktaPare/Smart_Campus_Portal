"use client"

import { useState, useEffect } from "react"
import "./Notifications.css"

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        console.log("🔄 Fetching notifications from database")

        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("http://localhost:8000/api/notifications", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("📊 Notifications API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ API Error:", errorText)
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        const notificationsData = await response.json()
        console.log("✅ Notifications fetched from database:", notificationsData)

        // Handle both array and object responses
        const notifications = Array.isArray(notificationsData) ? notificationsData : notificationsData.data || []

        // Process notifications to ensure proper format
        const processedNotifications = notifications.map((notification) => ({
          ...notification,
          isRead: notification.read || notification.isRead || false,
          date: notification.createdAt || notification.date,
          link: notification.relatedTo
            ? `/${notification.relatedTo.model.toLowerCase()}s/${notification.relatedTo.id}`
            : "#",
        }))

        setNotifications(processedNotifications)
        setLoading(false)
      } catch (err) {
        console.error("❌ Error fetching notifications:", err)
        setError("Failed to fetch notifications: " + err.message)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            (notification._id || notification.id) === id ? { ...notification, isRead: true, read: true } : notification,
          ),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getToken("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setNotifications(notifications.filter((notification) => (notification._id || notification.id) !== id))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "assignment":
        return "📝"
      case "event":
        return "🎉"
      case "grade":
        return "📊"
      case "attendance":
        return "📋"
      case "announcement":
        return "📢"
      default:
        return "📌"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((notification) => !notification.isRead)
        : notifications.filter((notification) => notification.type === filter)

  if (loading) return <div className="loading">Loading notifications...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          <button
            className="btn btn-outline-primary"
            onClick={markAllAsRead}
            disabled={!notifications.some((notification) => !notification.isRead)}
          >
            Mark All as Read
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="notifications-filter">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All
          </button>
          <button className={`filter-btn ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
            Unread
          </button>
          <button
            className={`filter-btn ${filter === "assignment" ? "active" : ""}`}
            onClick={() => setFilter("assignment")}
          >
            Assignments
          </button>
          <button className={`filter-btn ${filter === "event" ? "active" : ""}`} onClick={() => setFilter("event")}>
            Events
          </button>
          <button className={`filter-btn ${filter === "grade" ? "active" : ""}`} onClick={() => setFilter("grade")}>
            Grades
          </button>
          <button
            className={`filter-btn ${filter === "announcement" ? "active" : ""}`}
            onClick={() => setFilter("announcement")}
          >
            Announcements
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <p>No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id || notification.id}
              className={`notification-item ${!notification.isRead ? "unread" : ""}`}
            >
              <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-date">{formatDate(notification.date)}</div>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => markAsRead(notification._id || notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <a href={notification.link} className="btn btn-sm btn-outline-secondary">
                  View
                </a>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteNotification(notification._id || notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications
