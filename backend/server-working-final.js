const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

console.log("🚀 Starting Smart Campus Portal Server...")

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
  department: { type: String, default: "Computer Science" },
  studentId: String,
  year: Number,
  semester: Number,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

// Course Schema
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  code: { type: String, required: true },
  description: String,
  instructor: String,
  department: String,
  credits: Number,
  semester: Number,
  year: Number,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
})

const Course = mongoose.model("Course", courseSchema)

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  location: String,
  organizer: String,
  category: { type: String, default: "general" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
})

const Event = mongoose.model("Event", eventSchema)

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  maxMarks: { type: Number, default: 100 },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
      marks: Number,
      feedback: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

const Assignment = mongoose.model("Assignment", assignmentSchema)

// Notification Schema
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: String,
  type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const Notification = mongoose.model("Notification", notificationSchema)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// ==================== AUTH ROUTES ====================

// Login Route
app.post("/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful:", email)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      },
    })
  } catch (error) {
    console.error("💥 Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Register Route
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department: "Computer Science",
      studentId: role === "student" ? `STU${Date.now()}` : undefined,
    })

    await user.save()

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      },
    })
  } catch (error) {
    console.error("💥 Registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// ==================== API ROUTES ====================

// Health Check
app.get("/api/health", (req, res) => {
  console.log("🏥 Health check requested")
  res.json({
    status: "OK",
    message: "Smart Campus Portal API is running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/courses",
      "GET /api/events",
      "GET /api/assignments",
      "GET /api/users/students",
      "GET /api/users/faculty",
      "GET /api/notifications",
      "GET /api/dashboard",
    ],
  })
})

// Courses API
app.get("/api/courses", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Courses requested")
    const courses = await Course.find().populate("enrolledStudents", "name email")

    const coursesWithCompatibility = courses.map((course) => ({
      ...course.toObject(),
      title: course.title || course.name,
      students: course.students || course.enrolledStudents || [],
    }))

    console.log(`✅ Returning ${coursesWithCompatibility.length} courses`)
    res.json({ data: coursesWithCompatibility })
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

app.post("/api/courses", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Creating course:", req.body.title || req.body.name)
    const courseData = {
      ...req.body,
      title: req.body.title || req.body.name,
      name: req.body.name || req.body.title,
    }
    const course = new Course(courseData)
    await course.save()
    console.log("✅ Course created successfully")
    res.status(201).json(course)
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

// Events API
app.get("/api/events", authenticateToken, async (req, res) => {
  try {
    console.log("📅 Events requested")
    const events = await Event.find().sort({ date: 1 })
    console.log(`✅ Returning ${events.length} events`)
    res.json({ data: events })
  } catch (error) {
    console.error("❌ Error fetching events:", error)
    res.status(500).json({ message: "Failed to fetch events" })
  }
})

app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    console.log("📅 Creating event:", req.body.title)
    const event = new Event(req.body)
    await event.save()
    console.log("✅ Event created successfully")
    res.status(201).json(event)
  } catch (error) {
    console.error("❌ Error creating event:", error)
    res.status(500).json({ message: "Failed to create event" })
  }
})

// Assignments API
app.get("/api/assignments", authenticateToken, async (req, res) => {
  try {
    console.log("📝 Assignments requested")
    const assignments = await Assignment.find().populate("course", "name code title")
    console.log(`✅ Returning ${assignments.length} assignments`)
    res.json({ data: assignments })
  } catch (error) {
    console.error("❌ Error fetching assignments:", error)
    res.status(500).json({ message: "Failed to fetch assignments" })
  }
})

app.post("/api/assignments", authenticateToken, async (req, res) => {
  try {
    console.log("📝 Creating assignment:", req.body.title)
    const assignment = new Assignment(req.body)
    await assignment.save()
    console.log("✅ Assignment created successfully")
    res.status(201).json(assignment)
  } catch (error) {
    console.error("❌ Error creating assignment:", error)
    res.status(500).json({ message: "Failed to create assignment" })
  }
})

// Users API
app.get("/api/users/students", authenticateToken, async (req, res) => {
  try {
    console.log("👥 Students requested")
    const students = await User.find({ role: "student" }).select("-password")
    console.log(`✅ Returning ${students.length} students`)
    res.json({ data: students })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

app.get("/api/users/faculty", authenticateToken, async (req, res) => {
  try {
    console.log("👨‍🏫 Faculty requested")
    const faculty = await User.find({ role: "faculty" }).select("-password")
    console.log(`✅ Returning ${faculty.length} faculty`)
    res.json({ data: faculty })
  } catch (error) {
    console.error("❌ Error fetching faculty:", error)
    res.status(500).json({ message: "Failed to fetch faculty" })
  }
})

// Notifications API
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Notifications requested")
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 })
    console.log(`✅ Returning ${notifications.length} notifications`)
    res.json({ data: notifications })
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

// Dashboard API
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    console.log("📊 Dashboard data requested")
    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const courses = await Course.find({ enrolledStudents: userId })
    const assignments = await Assignment.find({
      course: { $in: courses.map((c) => c._id) },
    }).populate("course", "name code")
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(5)
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10)

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      },
      courses,
      assignments,
      events,
      notifications,
      stats: {
        totalCourses: courses.length,
        pendingAssignments: assignments.filter((a) => new Date(a.dueDate) > new Date()).length,
        upcomingEvents: events.length,
        unreadNotifications: notifications.filter((n) => !n.read).length,
      },
    }

    console.log("✅ Dashboard data prepared")
    res.json(dashboardData)
  } catch (error) {
    console.error("❌ Dashboard error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard data" })
  }
})

// Debug route
app.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password")
    res.json({ count: users.length, users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create Sample Data
async function createSampleData() {
  try {
    console.log("🌱 Checking for existing data...")

    const existingUser = await User.findOne({ email: "jatin@gmail.com" })
    if (existingUser) {
      console.log("📋 Sample data already exists")
      return
    }

    console.log("🔄 Creating sample data...")
    const hashedPassword = await bcrypt.hash("student123", 10)

    // Create users
    const studentUser = new User({
      name: "Jatin Kumar",
      email: "jatin@gmail.com",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      studentId: "STU001",
      year: 3,
      semester: 6,
    })

    const facultyUser = new User({
      name: "Dr. Sarah Wilson",
      email: "faculty@gmail.com",
      password: hashedPassword,
      role: "faculty",
      department: "Computer Science",
    })

    await studentUser.save()
    await facultyUser.save()
    console.log("✅ Users created")

    // Create courses
    const courses = await Course.insertMany([
      {
        name: "Data Structures and Algorithms",
        title: "Data Structures and Algorithms",
        code: "CS301",
        description: "Fundamental data structures and algorithms",
        instructor: "Dr. Sarah Wilson",
        department: "Computer Science",
        credits: 4,
        semester: 6,
        year: 2024,
        enrolledStudents: [studentUser._id],
        students: [studentUser._id],
      },
      {
        name: "Database Management Systems",
        title: "Database Management Systems",
        code: "CS302",
        description: "Introduction to database concepts and SQL",
        instructor: "Dr. Sarah Wilson",
        department: "Computer Science",
        credits: 3,
        semester: 6,
        year: 2024,
        enrolledStudents: [studentUser._id],
        students: [studentUser._id],
      },
    ])
    console.log("✅ Courses created")

    // Create events
    await Event.insertMany([
      {
        title: "Tech Fest 2024",
        description: "Annual technology festival",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: "10:00 AM",
        location: "Main Auditorium",
        organizer: "Computer Science Department",
      },
      {
        title: "Career Fair",
        description: "Meet with top recruiters",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: "9:00 AM",
        location: "Sports Complex",
        organizer: "Placement Cell",
      },
    ])
    console.log("✅ Events created")

    // Create assignments
    await Assignment.insertMany([
      {
        title: "Binary Search Tree Implementation",
        description: "Implement a binary search tree with all basic operations",
        course: courses[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        maxMarks: 100,
      },
      {
        title: "Database Design Project",
        description: "Design a database for a library management system",
        course: courses[1]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        maxMarks: 100,
      },
    ])
    console.log("✅ Assignments created")

    console.log("🎉 Sample data creation completed!")
    console.log("🔐 Login credentials:")
    console.log("   Student: jatin@gmail.com / student123")
    console.log("   Faculty: faculty@gmail.com / student123")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  }
}

// Error handling
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err)
  res.status(500).json({ message: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Endpoint not found:", req.originalUrl)
  res.status(404).json({
    message: "Endpoint not found",
    requested: req.originalUrl,
  })
})

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas")
    createSampleData()

    // Start server
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🔍 Debug users: http://localhost:${PORT}/debug/users`)
      console.log(`🔐 Login with: jatin@gmail.com / student123`)
      console.log("✅ All API endpoints are ready!")
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
  })
