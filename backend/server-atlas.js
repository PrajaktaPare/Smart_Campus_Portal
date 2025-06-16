const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
require("dotenv").config()

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

// MONGODB ATLAS CONNECTION - FIXED
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...")

    // Get MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables")
    }

    console.log("🔗 Connecting to Atlas...")

    // FIXED CONNECTION OPTIONS - No deprecated options
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })

    console.log(`✅ MongoDB Atlas Connected Successfully!`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`🌐 Host: ${conn.connection.host}`)

    // Create initial users
    await createInitialUser()
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message)
    console.log("💡 TROUBLESHOOTING:")
    console.log("💡 1. Check your Atlas connection string in .env")
    console.log("💡 2. Ensure your IP is whitelisted in Atlas")
    console.log("💡 3. Verify your database username/password")
    console.log("💡 4. Make sure your cluster is running")
    process.exit(1)
  }
}

// Create initial users
const createInitialUser = async () => {
  try {
    // Define User schema
    const userSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
        department: String,
        studentId: String,
        employeeId: String,
      },
      { timestamps: true },
    )

    const User = mongoose.models.User || mongoose.model("User", userSchema)

    // Check if any users exist
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log("🔄 Creating initial test users in Atlas...")

      const testUsers = [
        {
          name: "Test Student",
          email: "student@example.com",
          password: await bcrypt.hash("student123", 10),
          role: "student",
          department: "Computer Science",
          studentId: "STU001",
        },
        {
          name: "Test Faculty",
          email: "faculty@example.com",
          password: await bcrypt.hash("student123", 10),
          role: "faculty",
          department: "Computer Science",
          employeeId: "FAC001",
        },
        {
          name: "Test Admin",
          email: "admin@example.com",
          password: await bcrypt.hash("student123", 10),
          role: "admin",
          department: "Administration",
          employeeId: "ADM001",
        },
      ]

      await User.insertMany(testUsers)
      console.log("✅ Initial test users created in Atlas!")
      console.log("📧 LOGIN CREDENTIALS:")
      console.log("   👨‍🎓 Student: student@example.com / student123")
      console.log("   👨‍🏫 Faculty: faculty@example.com / student123")
      console.log("   👨‍💼 Admin: admin@example.com / student123")
    } else {
      console.log(`✅ Found ${userCount} existing users in Atlas database`)
    }
  } catch (error) {
    console.log("⚠️ Could not create initial users:", error.message)
  }
}

// Connect to database
connectDB()

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    database: mongoose.connection.name || "Unknown",
    host: mongoose.connection.host || "Unknown",
    provider: "MongoDB Atlas",
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

    // Define User schema
    const userSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
        department: String,
        studentId: String,
        employeeId: String,
      },
      { timestamps: true },
    )

    const User = mongoose.models.User || mongoose.model("User", userSchema)

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
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

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
      },
      token: "atlas-token-" + user._id,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Server error during login", error: error.message })
  }
})

// Test routes
app.get("/api/courses", (req, res) => {
  res.json([
    { _id: "1", name: "Computer Science 101", code: "CS101", credits: 3 },
    { _id: "2", name: "Mathematics", code: "MATH101", credits: 4 },
  ])
})

app.get("/api/events", (req, res) => {
  res.json([
    { _id: "1", title: "Welcome Event", date: new Date(), description: "Welcome to campus" },
    { _id: "2", title: "Tech Talk", date: new Date(), description: "Latest in technology" },
  ])
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`☁️ Using MongoDB Atlas`)
  console.log(`🔐 Test login: faculty@example.com / student123`)
})
