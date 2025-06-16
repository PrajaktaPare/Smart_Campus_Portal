const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const courseRoutes = require("./routes/course")
const assignmentRoutes = require("./routes/assignment")
const attendanceRoutes = require("./routes/attendance")
const gradeRoutes = require("./routes/grade")
const eventRoutes = require("./routes/event")
const announcementRoutes = require("./routes/announcement")
const notificationRoutes = require("./routes/notification")
const placementRoutes = require("./routes/placement")

// Use routes
app.use("/api", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/grades", gradeRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/placements", placementRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Test endpoint to check all routes
app.get("/api/test-routes", (req, res) => {
  res.json({
    message: "All routes are registered",
    routes: [
      "/api/auth",
      "/api/users",
      "/api/courses",
      "/api/assignments",
      "/api/attendance",
      "/api/grades",
      "/api/events",
      "/api/announcements",
      "/api/notifications",
      "/api/placements",
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({ message: "Something went wrong!", error: err.message })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ message: "Route not found", path: req.originalUrl })
})

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/smart_campus"

    console.log("🔄 Connecting to MongoDB...")
    console.log("📍 MongoDB URI:", mongoURI.replace(/\/\/.*@/, "//***:***@")) // Hide credentials in logs

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ MongoDB connected successfully")
    console.log("📊 Database:", mongoose.connection.name)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`)
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`)
      console.log(`🧪 Test Routes: http://localhost:${PORT}/api/test-routes`)
      console.log("📋 Available Routes:")
      console.log("   - POST /api/login")
      console.log("   - POST /api/register")
      console.log("   - GET  /api/users")
      console.log("   - GET  /api/courses")
      console.log("   - GET  /api/assignments")
      console.log("   - GET  /api/events")
      console.log("   - GET  /api/notifications")
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()

module.exports = app
