const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Import all route files
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const courseRoutes = require("./routes/course")
const eventRoutes = require("./routes/event")
const assignmentRoutes = require("./routes/assignment")
const attendanceRoutes = require("./routes/attendance")
const gradeRoutes = require("./routes/grade")
const notificationRoutes = require("./routes/notification")
const announcementRoutes = require("./routes/announcement")
const placementRoutes = require("./routes/placement")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/grades", gradeRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/placements", placementRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Start the server
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
