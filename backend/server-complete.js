const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs") // Change from 'bcrypt' to 'bcryptjs'
const jwt = require("jsonwebtoken") // Import jwt
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MONGODB CONNECTION
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables")
    }

    if (!mongoUri.includes("/smart_campus_portal")) {
      mongoUri = mongoUri.replace("mongodb.net/", "mongodb.net/smart_campus_portal")
    }

    console.log("🔗 Connecting to database...")

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    await createInitialUser()
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

// Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
})

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", UserSchema)

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  credits: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
})

const Course = mongoose.model("Course", CourseSchema)

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      submissionDate: { type: Date, default: Date.now },
      marks: { type: Number, min: 0, max: 100 },
      feedback: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Assignment = mongoose.model("Assignment", AssignmentSchema)

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Event = mongoose.model("Event", EventSchema)

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "error"], default: "info" },
  createdAt: { type: Date, default: Date.now },
})

const Notification = mongoose.model("Notification", NotificationSchema)

// Authentication Routes
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const newUser = new User({ name, email, password, role, department })
    await newUser.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/user", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Course Routes
app.post("/api/courses", async (req, res) => {
  try {
    const { code, title, description, credits, instructor, students } = req.body

    if (!code || !title || !credits || !instructor) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return res.status(400).json({ message: "Course with this code already exists" })
    }

    const newCourse = new Course({ code, title, description, credits, instructor, students })
    await newCourse.save()

    res.status(201).json({ message: "Course created successfully", course: newCourse })
  } catch (error) {
    console.error("Create course error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name")
    res.json(courses)
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name").populate("students", "name")
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    res.json(course)
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { code, title, description, credits, instructor, students } = req.body

    if (!code || !title || !credits || !instructor) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { code, title, description, credits, instructor, students },
      { new: true },
    )

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ message: "Course updated successfully", course: updatedCourse })
  } catch (error) {
    console.error("Update course error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.delete("/api/courses/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id)
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" })
    }
    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Delete course error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Assignment Routes
app.post("/api/assignments", async (req, res) => {
  try {
    const { title, description, dueDate, course } = req.body

    if (!title || !dueDate || !course) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      course,
      createdBy: req.user.id,
    })

    await newAssignment.save()

    res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment })
  } catch (error) {
    console.error("Create assignment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("course", "code title").populate("createdBy", "name")
    res.json(assignments)
  } catch (error) {
    console.error("Get assignments error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/assignments/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "code title")
      .populate("createdBy", "name")
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }
    res.json(assignment)
  } catch (error) {
    console.error("Get assignment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.put("/api/assignments/:id", async (req, res) => {
  try {
    const { title, description, dueDate, course } = req.body

    if (!title || !dueDate || !course) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, course },
      { new: true },
    )

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json({ message: "Assignment updated successfully", assignment: updatedAssignment })
  } catch (error) {
    console.error("Update assignment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.delete("/api/assignments/:id", async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id)
    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }
    res.json({ message: "Assignment deleted successfully" })
  } catch (error) {
    console.error("Delete assignment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add this endpoint after the existing assignment routes
app.get("/api/students/:studentId/assignments", async (req, res) => {
  try {
    const { studentId } = req.params

    console.log(`📝 Fetching assignments for student: ${studentId}`)

    // Get all courses the student is enrolled in
    const enrolledCourses = await Course.find({ students: studentId }).select("_id")
    const courseIds = enrolledCourses.map((course) => course._id)

    if (courseIds.length === 0) {
      console.log("⚠️ Student not enrolled in any courses")
      return res.json([])
    }

    // Get all assignments from those courses
    const assignments = await Assignment.find({
      course: { $in: courseIds },
    })
      .populate("course", "code title instructor")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 })

    console.log(`✅ Found ${assignments.length} assignments for student`)

    // Add submission status for each assignment
    const assignmentsWithStatus = assignments.map((assignment) => {
      const userSubmission = assignment.submissions.find((sub) => sub.student.toString() === studentId)

      return {
        ...assignment.toObject(),
        userSubmission: userSubmission || null,
        isSubmitted: !!userSubmission,
        isOverdue: new Date(assignment.dueDate) < new Date() && !userSubmission,
      }
    })

    res.json(assignmentsWithStatus)
  } catch (error) {
    console.error("❌ Error fetching student assignments:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add endpoint to refresh student dashboard data
app.get("/api/students/:studentId/dashboard-refresh", async (req, res) => {
  try {
    const { studentId } = req.params

    // Get fresh data for dashboard
    const [courses, assignments, events, notifications] = await Promise.all([
      Course.find({ students: studentId }).populate("instructor", "name").select("title code credits instructor"),

      Assignment.find({
        course: { $in: await Course.find({ students: studentId }).select("_id") },
      })
        .populate("course", "code title")
        .sort({ dueDate: 1 })
        .limit(10),

      Event.find({
        $or: [{ department: { $exists: false } }, { department: null }, { department: req.user.department }],
        date: { $gte: new Date() },
      })
        .sort({ date: 1 })
        .limit(5),

      Notification.find({ recipient: studentId }).sort({ createdAt: -1 }).limit(10),
    ])

    res.json({
      courses,
      assignments,
      events,
      notifications,
      stats: {
        enrolledCourses: courses.length,
        assignments: assignments.length,
        attendance: 85, // Mock data
        grades: assignments.filter((a) => a.submissions.some((s) => s.student.toString() === studentId && s.marks))
          .length,
      },
    })
  } catch (error) {
    console.error("❌ Error refreshing dashboard:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Event Routes
app.post("/api/events", async (req, res) => {
  try {
    const { title, description, date, location, department } = req.body

    if (!title || !date) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const newEvent = new Event({ title, description, date, location, department })
    await newEvent.save()

    res.status(201).json({ message: "Event created successfully", event: newEvent })
  } catch (error) {
    console.error("Create event error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 })
    res.json(events)
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Notification Routes
app.post("/api/notifications", async (req, res) => {
  try {
    const { recipient, message, type } = req.body

    if (!recipient || !message) {
      return res.status(400).json({ message: "Please enter all required fields" })
    }

    const newNotification = new Notification({ recipient, message, type })
    await newNotification.save()

    res.status(201).json({ message: "Notification created successfully", notification: newNotification })
  } catch (error) {
    console.error("Create notification error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("recipient", "name").sort({ createdAt: -1 })
    res.json(notifications)
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Submission Routes
app.post("/api/assignments/:assignmentId/submit", async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { studentId } = req.body // Assuming studentId is passed in the request body

    // Validate input
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" })
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Check if the student is enrolled in the course
    const course = await Course.findById(assignment.course)
    if (!course || !course.students.includes(studentId)) {
      return res.status(400).json({ message: "Student is not enrolled in this course" })
    }

    // Check if the student has already submitted the assignment
    const existingSubmission = assignment.submissions.find((sub) => sub.student.toString() === studentId)
    if (existingSubmission) {
      return res.status(400).json({ message: "Assignment already submitted by this student" })
    }

    // Create a new submission
    assignment.submissions.push({ student: studentId })
    await assignment.save()

    res.status(201).json({ message: "Assignment submitted successfully" })
  } catch (error) {
    console.error("Submit assignment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Route to record marks and feedback for a submission
app.put("/api/assignments/:assignmentId/submissions/:submissionId", async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params
    const { marks, feedback } = req.body

    // Validate input
    if (marks === undefined || feedback === undefined) {
      return res.status(400).json({ message: "Marks and feedback are required" })
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Find the submission
    const submission = assignment.submissions.id(submissionId)
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    // Update the submission
    submission.marks = marks
    submission.feedback = feedback
    await assignment.save()

    res.json({ message: "Submission updated successfully" })
  } catch (error) {
    console.error("Update submission error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Function to create initial user
async function createInitialUser() {
  try {
    const existingAdmin = await User.findOne({ role: "admin" })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10)

      const newAdmin = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      })

      await newAdmin.save()
      console.log("✅ Initial admin user created successfully")
    } else {
      console.log("✅ Admin user already exists")
    }
  } catch (error) {
    console.error("❌ Error creating initial admin user:", error)
  }
}

// Start Server
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server started on port ${port}`))
