const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs") // Use bcryptjs instead of bcrypt
const jwt = require("jsonwebtoken")

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas")
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Define Schemas
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    department: { type: String },
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String },
    credits: { type: Number },
    semester: { type: String },
    year: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

// Define Models
const User = mongoose.model("User", userSchema)
const Course = mongoose.model("Course", courseSchema)

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) {
    return res.sendStatus(401) // Unauthorized
  }

  jwt.verify(token, "secret123", (err, user) => {
    if (err) {
      return res.sendStatus(403) // Forbidden
    }
    req.user = user
    next()
  })
}

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    })

    // Save user to database
    await newUser.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const validPassword = await bcryptjs.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create and assign a token
    const token = jwt.sign({ _id: user._id, role: user.role, department: user.department }, "secret123", {
      expiresIn: "1h",
    })

    res.json({
      message: "Logged in successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Get all users (Admin only)
app.get("/api/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" })
  }

  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message })
  }
})

// Get available courses (filtered by department)
app.get("/api/courses/available", async (req, res) => {
  try {
    console.log("🔍 Getting available courses...")
    console.log("Query params:", req.query)

    const { department } = req.query

    // Build query filter
    const filter = { isActive: { $ne: false } }

    if (department) {
      filter.department = department
      console.log(`🎯 Filtering by department: ${department}`)
    }

    console.log("📊 MongoDB Query:", filter)

    // Find courses with the filter
    const courses = await Course.find(filter).populate("instructor", "name email").lean()

    console.log(`✅ Found ${courses.length} available courses`)

    // If no courses found and department specified, create sample courses
    if (courses.length === 0 && department) {
      console.log(`📝 Creating sample courses for ${department} department...`)

      const sampleCourses = [
        {
          title: "Introduction to Programming",
          code: "CS101",
          description: "Basic programming concepts and problem solving",
          department: department,
          credits: 3,
          semester: "Fall",
          year: new Date().getFullYear(),
          isActive: true,
        },
        {
          title: "Data Structures and Algorithms",
          code: "CS201",
          description: "Advanced data structures and algorithmic thinking",
          department: department,
          credits: 4,
          semester: "Fall",
          year: new Date().getFullYear(),
          isActive: true,
        },
        {
          title: "Database Management Systems",
          code: "CS301",
          description: "Relational databases and SQL",
          department: department,
          credits: 3,
          semester: "Spring",
          year: new Date().getFullYear(),
          isActive: true,
        },
      ]

      await Course.insertMany(sampleCourses)

      // Fetch the newly created courses
      const newCourses = await Course.find(filter).populate("instructor", "name email").lean()

      console.log(`✅ Created and returning ${newCourses.length} sample courses`)
      return res.json(newCourses)
    }

    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching available courses:", error.message)
    res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    })
  }
})

// Course routes
// Create a new course (Admin/Instructor only)
app.post("/api/courses", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "instructor") {
    return res.status(403).json({ message: "Unauthorized" })
  }

  try {
    const { title, code, description, instructor, department, credits, semester, year } = req.body

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" })
    }

    // Create new course
    const newCourse = new Course({
      title,
      code,
      description,
      instructor,
      department,
      credits,
      semester,
      year,
    })

    // Save course to database
    await newCourse.save()

    res.status(201).json({ message: "Course created successfully" })
  } catch (error) {
    console.error("Course creation error:", error)
    res.status(500).json({ message: "Course creation failed", error: error.message })
  }
})

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email")
    res.json(courses)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error: error.message })
  }
})

// Get a specific course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name email")
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    res.json(course)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course", error: error.message })
  }
})

// Update a course (Admin/Instructor only)
app.put("/api/courses/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "instructor") {
    return res.status(403).json({ message: "Unauthorized" })
  }

  try {
    const { title, code, description, instructor, department, credits, semester, year, isActive } = req.body

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        code,
        description,
        instructor,
        department,
        credits,
        semester,
        year,
        isActive,
      },
      { new: true },
    )

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ message: "Course updated successfully", course: updatedCourse })
  } catch (error) {
    console.error("Course update error:", error)
    res.status(500).json({ message: "Course update failed", error: error.message })
  }
})

// Delete a course (Admin only)
app.delete("/api/courses/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" })
  }

  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
