const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// In-memory users for testing (no database needed)
const users = [
  {
    id: "1",
    name: "Test Student",
    email: "student@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // student123
    role: "student",
    department: "Computer Science",
    studentId: "STU001",
  },
  {
    id: "2",
    name: "Test Faculty",
    email: "faculty@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // student123
    role: "faculty",
    department: "Computer Science",
    employeeId: "FAC001",
  },
  {
    id: "3",
    name: "Test Admin",
    email: "admin@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // student123
    role: "admin",
    department: "Administration",
    employeeId: "ADM001",
  },
]

console.log("✅ Server starting WITHOUT database (in-memory mode)")
console.log("📧 Available test users:")
console.log("   👨‍🎓 Student: student@example.com / student123")
console.log("   👨‍🏫 Faculty: faculty@example.com / student123")
console.log("   👨‍💼 Admin: admin@example.com / student123")

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: "Disabled (in-memory mode)",
    database: "In-Memory",
    users: users.length,
  })
})

// Auth route
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user in memory
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    console.log("✅ Login successful:", email, "Role:", user.role)

    // Return user data
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
      },
      token: "simple-token-" + user.id,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Server error during login", error: error.message })
  }
})

// Mock API endpoints
app.get("/api/courses", (req, res) => {
  res.json([
    { _id: "1", name: "Computer Science 101", code: "CS101", credits: 3, instructor: "Dr. Smith" },
    { _id: "2", name: "Mathematics", code: "MATH101", credits: 4, instructor: "Dr. Johnson" },
    { _id: "3", name: "Physics", code: "PHY101", credits: 3, instructor: "Dr. Brown" },
  ])
})

app.get("/api/events", (req, res) => {
  res.json([
    { _id: "1", title: "Welcome Event", date: new Date(), description: "Welcome to campus" },
    { _id: "2", title: "Tech Talk", date: new Date(), description: "Latest in technology" },
    { _id: "3", title: "Career Fair", date: new Date(), description: "Meet potential employers" },
  ])
})

app.get("/api/users/students", (req, res) => {
  const students = users.filter((u) => u.role === "student")
  res.json(students)
})

app.get("/api/users/faculty", (req, res) => {
  const faculty = users.filter((u) => u.role === "faculty")
  res.json(faculty)
})

// Create course endpoint
app.post("/api/courses", (req, res) => {
  const { name, code, credits, description } = req.body
  const newCourse = {
    _id: Date.now().toString(),
    name,
    code,
    credits: Number.parseInt(credits),
    description,
    instructor: "Current User",
    createdAt: new Date(),
  }
  console.log("✅ Course created:", newCourse)
  res.json(newCourse)
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error handler:", error)
  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Test login: faculty@example.com / student123`)
  console.log(`💡 This server runs WITHOUT MongoDB for testing`)
})

// Handle process termination
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully")
  process.exit(0)
})
