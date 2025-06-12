const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const courseRoutes = require("./routes/course")
const eventRoutes = require("./routes/event")
const attendanceRoutes = require("./routes/attendance")
const gradeRoutes = require("./routes/grade")
const placementRoutes = require("./routes/placement")
const notificationRoutes = require("./routes/notification")
const userRoutes = require("./routes/user")
const assignmentRoutes = require("./routes/assignment")
const announcementRoutes = require("./routes/announcement")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartcampus")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/grades", gradeRoutes)
app.use("/api/placements", placementRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/announcements", announcementRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
