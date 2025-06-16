const express = require("express")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

console.log("🚀 Starting server...")

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
  department: { type: String, default: "Computer Science" },
})

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String, required: true },
    credits: { type: Number, default: 3 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxStudents: { type: Number, default: 20 },
  },
  { timestamps: true },
)

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
const Course = mongoose.model("Course", courseSchema)
const Event = mongoose.model("Event", eventSchema)

// Auth middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, "your-secret-key")
    const user = await User.findById(decoded._id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(401).json({ message: "Invalid token" })
  }
}

// Routes
app.get("/api/health", (req, res) => {
  console.log("📍 Health check requested")
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    endpoints: [
      "GET /api/health",
      "POST /api/login",
      "POST /api/register",
      "GET /api/profile",
      "GET /api/courses",
      "POST /api/courses",
      "GET /api/events",
      "POST /api/events",
      "GET /api/users/students",
    ],
  })
})

app.post("/api/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email)
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, "your-secret-key")
    console.log("✅ Login successful:", user.email, "Role:", user.role)

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcryptjs.hash(password, 12)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      department: department || "Computer Science",
    })

    await newUser.save()
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/courses", verifyToken, async (req, res) => {
  try {
    console.log(`📚 Courses requested by: ${req.user.email} (${req.user.role})`)

    let query = {}

    if (req.user.role === "faculty") {
      query = {
        $or: [{ instructor: req.user._id }, { department: req.user.department }],
      }
    } else if (req.user.role === "student") {
      query.department = req.user.department
    }

    const courses = await Course.find(query).populate("instructor", "name email")
    console.log(`✅ Found ${courses.length} courses`)

    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

app.post("/api/courses", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, code, description, credits } = req.body

    const course = new Course({
      title,
      code,
      description,
      credits: credits || 3,
      instructor: req.user._id,
      department: req.user.department,
    })

    await course.save()
    await course.populate("instructor", "name email")

    console.log(`✅ Created course: ${course.title}`)
    res.status(201).json(course)
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

app.get("/api/events", verifyToken, async (req, res) => {
  try {
    console.log(`🎉 Events requested by: ${req.user.email} (${req.user.role})`)

    let query = {}

    if (req.user.role !== "admin") {
      query = {
        $or: [{ department: req.user.department }, { department: { $exists: false } }, { department: null }],
      }
    }

    const events = await Event.find(query).populate("organizer", "name email").sort({ date: 1 })
    console.log(`✅ Found ${events.length} events`)

    res.json({ data: events })
  } catch (error) {
    console.error("❌ Error fetching events:", error)
    res.status(500).json({ message: "Failed to fetch events" })
  }
})

app.post("/api/events", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, description, date, location } = req.body

    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      organizer: req.user._id,
      department: req.user.department,
    })

    await event.save()
    await event.populate("organizer", "name email")

    console.log(`✅ Created event: ${event.title}`)
    res.status(201).json(event)
  } catch (error) {
    console.error("❌ Error creating event:", error)
    res.status(500).json({ message: "Failed to create event" })
  }
})

app.get("/api/users/students", verifyToken, async (req, res) => {
  try {
    console.log(`👥 Students requested by: ${req.user.email} (${req.user.role})`)

    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const query = { role: "student" }

    if (req.user.role === "faculty") {
      query.department = req.user.department
    }

    const students = await User.find(query).select("-password")
    console.log(`✅ Found ${students.length} students`)

    res.json({ data: students })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

app.put("/api/users/:userId", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { name, email, department } = req.body
    const user = await User.findByIdAndUpdate(req.params.userId, { name, email, department }, { new: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log(`✅ Updated user: ${user.name}`)
    res.json(user)
  } catch (error) {
    console.error("❌ Error updating user:", error)
    res.status(500).json({ message: "Failed to update user" })
  }
})

app.delete("/api/users/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const user = await User.findByIdAndDelete(req.params.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log(`✅ Deleted user: ${user.name}`)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user" })
  }
})

// Create sample data
const createSampleData = async () => {
  try {
    const courseCount = await Course.countDocuments()
    if (courseCount === 0) {
      console.log("🔄 Creating sample courses...")

      const facultyUser = await User.findOne({ role: "faculty" })
      if (facultyUser) {
        const sampleCourses = [
          {
            title: "Introduction to Programming",
            code: "CS101",
            description: "Learn basic programming concepts",
            instructor: facultyUser._id,
            department: "Computer Science",
            credits: 3,
          },
          {
            title: "Data Structures",
            code: "CS201",
            description: "Advanced data structures and algorithms",
            instructor: facultyUser._id,
            department: "Computer Science",
            credits: 4,
          },
        ]

        await Course.insertMany(sampleCourses)
        console.log("✅ Sample courses created")
      }
    }

    const eventCount = await Event.countDocuments()
    if (eventCount === 0) {
      console.log("🔄 Creating sample events...")

      const facultyUser = await User.findOne({ role: "faculty" })
      if (facultyUser) {
        const sampleEvents = [
          {
            title: "Tech Symposium 2024",
            description: "Annual technology symposium",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: "Main Auditorium",
            organizer: facultyUser._id,
            department: "Computer Science",
          },
        ]

        await Event.insertMany(sampleEvents)
        console.log("✅ Sample events created")
      }
    }
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  }
}

mongoose.connection.once("open", () => {
  createSampleData()
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📍 Health check: http://localhost:${port}/api/health`)
  console.log(`📋 Available endpoints:`)
  console.log(`   POST /api/login`)
  console.log(`   POST /api/register`)
  console.log(`   GET  /api/profile`)
  console.log(`   GET  /api/courses`)
  console.log(`   POST /api/courses`)
  console.log(`   GET  /api/events`)
  console.log(`   POST /api/events`)
  console.log(`   GET  /api/users/students`)
})
