const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

console.log("🚀 Starting Smart Campus Portal Server...")

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

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

// Connect to database
connectDB()

// Import routes with error handling
const loadRoutes = () => {
  try {
    console.log("📋 Loading routes...")

    // Auth routes
    const authRoutes = require("./routes/auth")
    app.use("/api", authRoutes)
    console.log("✅ Auth routes loaded")

    // User routes
    const userRoutes = require("./routes/user")
    app.use("/api/users", userRoutes)
    console.log("✅ User routes loaded")

    // Course routes
    const courseRoutes = require("./routes/course")
    app.use("/api/courses", courseRoutes)
    console.log("✅ Course routes loaded")

    // Assignment routes
    const assignmentRoutes = require("./routes/assignment")
    app.use("/api/assignments", assignmentRoutes)
    console.log("✅ Assignment routes loaded")

    // Event routes
    const eventRoutes = require("./routes/event")
    app.use("/api/events", eventRoutes)
    console.log("✅ Event routes loaded")

    // Notification routes
    const notificationRoutes = require("./routes/notification")
    app.use("/api/notifications", notificationRoutes)
    console.log("✅ Notification routes loaded")

    console.log("🎉 All routes loaded successfully!")
  } catch (error) {
    console.error("❌ Error loading routes:", error.message)
    console.log("⚠️ Continuing with basic routes only...")
  }
}

// Load routes
loadRoutes()

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    database: mongoose.connection.name || "Unknown",
  })
})

// Test routes endpoint
app.get("/api/test-routes", (req, res) => {
  res.json({
    message: "Server is running with all routes",
    routes: [
      "POST /api/login",
      "POST /api/register",
      "GET /api/users",
      "GET /api/users/students",
      "GET /api/courses",
      "GET /api/assignments",
      "GET /api/events",
      "GET /api/notifications",
    ],
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["GET /api/health", "GET /api/test-routes", "POST /api/login", "POST /api/register"],
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error:", error.message)
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🧪 Test routes: http://localhost:${PORT}/api/test-routes`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/login`)
  console.log("📋 Server ready to handle requests!")
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("📦 MongoDB connection closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("📦 MongoDB connection closed")
    process.exit(0)
  })
})

module.exports = app
