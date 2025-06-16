const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

console.log("🔄 Connecting to MongoDB...")

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas")
    createSampleData()
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
  })

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
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
})

const User = mongoose.model("User", userSchema)

// Course Schema
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String }, // Add title field for compatibility
  code: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  instructorName: String, // For display purposes
  department: { type: String, required: true },
  credits: { type: Number, default: 3 },
  semester: { type: String, default: "Fall" },
  year: { type: Number, default: () => new Date().getFullYear() },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add students field for compatibility
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  maxStudents: { type: Number, default: 50 },
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
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  department: String,
  category: { type: String, default: "general" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
})

const Event = mongoose.model("Event", eventSchema)

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  maxMarks: { type: Number, default: 100 },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
      marks: { type: Number, default: 0 },
      feedback: String,
      status: { type: String, enum: ["submitted", "graded", "pending"], default: "submitted" },
      gradedAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

const Assignment = mongoose.model("Assignment", assignmentSchema)

// Notification Schema
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: String,
  type: {
    type: String,
    enum: ["info", "warning", "success", "error", "assignment", "grade", "event", "course"],
    default: "info",
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  read: { type: Boolean, default: false },
  readAt: Date,
  relatedTo: {
    model: String,
    id: mongoose.Schema.Types.ObjectId,
  },
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

// Debug route to check users
app.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password")
    res.json({
      count: users.length,
      users: users,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== AUTH ROUTES ====================

// Login Route
app.post("/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body)

    const { email, password } = req.body

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log("👤 User found:", user ? `${user.name} (${user.email})` : "No user found")

    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(401).json({ message: "Invalid credentials - user not found" })
    }

    // Check password
    console.log("🔍 Checking password...")
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log("🔑 Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return res.status(401).json({ message: "Invalid credentials - wrong password" })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful:", email)

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
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
    console.log("📝 Registration attempt:", req.body.email)

    const { name, email, password, role = "student", department = "Computer Science" } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
      studentId: role === "student" ? `STU${Date.now()}` : undefined,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("✅ Registration successful:", email)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
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

// Get Current User
app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// ==================== USER ROUTES ====================

// Get user by ID
app.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ success: true, user })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Failed to fetch user" })
  }
})

// ==================== API ROUTES ====================

// Dashboard Route
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    console.log("📊 Dashboard data requested for user:", req.user.userId)

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's courses
    const courses = await Course.find({
      $or: [{ enrolledStudents: userId }, { students: userId }, { instructor: userId }],
    }).populate("instructor", "name")

    // Get user's assignments
    const assignments = await Assignment.find({
      course: { $in: courses.map((c) => c._id) },
    })
      .populate("course", "name code title")
      .sort({ dueDate: 1 })

    // Get upcoming events (filter by department if user has one)
    const eventQuery = { date: { $gte: new Date() } }
    if (user.department) {
      eventQuery.$or = [{ department: user.department }, { department: { $exists: false } }]
    }

    const events = await Event.find(eventQuery).sort({ date: 1 }).limit(5)

    // Get notifications
    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    const dashboardData = {
      user: {
        id: user._id,
        _id: user._id,
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

    console.log("✅ Dashboard data prepared:", {
      courses: courses.length,
      assignments: assignments.length,
      events: events.length,
      notifications: notifications.length,
    })

    res.json(dashboardData)
  } catch (error) {
    console.error("💥 Dashboard data error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard data" })
  }
})

// ==================== COURSES API ====================
app.get("/api/courses", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Courses requested")
    const courses = await Course.find({ isActive: true })
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name email")
      .populate("students", "name email")

    // Add compatibility fields
    const coursesWithCompatibility = courses.map((course) => ({
      ...course.toObject(),
      title: course.title || course.name,
      students: course.students || course.enrolledStudents || [],
    }))

    res.json({ data: coursesWithCompatibility })
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

// Replace the course creation endpoint with this improved version
app.post("/api/courses", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Creating course:", req.body)

    const { title, name, code, description, credits, semester, year, department } = req.body

    // Validate required fields
    if (!title && !name) {
      return res.status(400).json({ message: "Course title/name is required" })
    }
    if (!code) {
      return res.status(400).json({ message: "Course code is required" })
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() })
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" })
    }

    // Get user info for instructor
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const courseData = {
      name: name || title,
      title: title || name,
      code: code.toUpperCase(),
      description: description || "",
      department: department || user.department || "Computer Science",
      credits: Number(credits) || 3,
      semester: semester || "Fall",
      year: Number(year) || new Date().getFullYear(),
      instructor: req.user.userId,
      instructorName: user.name || "Faculty",
      enrolledStudents: [],
      students: [],
      isActive: true,
    }

    console.log("📝 Final course data:", courseData)
    const course = new Course(courseData)
    await course.save()

    console.log("✅ Course created successfully:", course.title || course.name)
    res.status(201).json({
      message: "Course created successfully",
      data: course,
    })
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    })
  }
})

// Add these routes after the existing course routes

// Get available courses for enrollment (not enrolled by current user)
app.get("/api/courses/available", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Available courses requested for user:", req.user.userId)

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get all active courses in user's department
    const allCourses = await Course.find({
      isActive: true,
      department: user.department,
    })
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name email")
      .populate("students", "name email")

    // Filter out courses the user is already enrolled in
    const availableCourses = allCourses.filter((course) => {
      const enrolledStudents = course.enrolledStudents || course.students || []
      return !enrolledStudents.some((student) => student._id.toString() === req.user.userId)
    })

    // Add enrollment stats
    const coursesWithStats = availableCourses.map((course) => ({
      ...course.toObject(),
      title: course.title || course.name,
      enrolledCount: (course.enrolledStudents || course.students || []).length,
      maxStudents: course.maxStudents || 50,
    }))

    res.json({ data: coursesWithStats })
  } catch (error) {
    console.error("Error fetching available courses:", error)
    res.status(500).json({ message: "Failed to fetch available courses" })
  }
})

// Get courses student is enrolled in
app.get("/api/courses/student", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Student courses requested for user:", req.user.userId)

    const courses = await Course.find({
      $or: [{ enrolledStudents: req.user.userId }, { students: req.user.userId }],
      isActive: true,
    })
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name email")
      .populate("students", "name email")

    const coursesWithCompatibility = courses.map((course) => ({
      ...course.toObject(),
      title: course.title || course.name,
      enrolledCount: (course.enrolledStudents || course.students || []).length,
    }))

    res.json({ data: coursesWithCompatibility })
  } catch (error) {
    console.error("Error fetching student courses:", error)
    res.status(500).json({ message: "Failed to fetch student courses" })
  }
})

// Enroll in course
app.post("/api/courses/:courseId/enroll", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Enrolling user", req.user.userId, "in course", req.params.courseId)

    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is already enrolled
    const enrolledStudents = course.enrolledStudents || course.students || []
    const isAlreadyEnrolled = enrolledStudents.some((studentId) => studentId.toString() === req.user.userId)

    if (isAlreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    // Check enrollment limit
    const maxStudents = course.maxStudents || 50
    if (enrolledStudents.length >= maxStudents) {
      return res.status(400).json({ message: "Course is full" })
    }

    // Add student to course
    if (!course.enrolledStudents) {
      course.enrolledStudents = []
    }
    if (!course.students) {
      course.students = []
    }

    course.enrolledStudents.push(req.user.userId)
    course.students.push(req.user.userId)
    await course.save()

    // Add course to user's enrolled courses
    if (!user.enrolledCourses) {
      user.enrolledCourses = []
    }
    user.enrolledCourses.push(course._id)
    await user.save()

    // Send notification
    try {
      await createNotification({
        recipient: req.user.userId,
        title: `Enrolled in ${course.title || course.name}`,
        message: `You have successfully enrolled in ${course.title || course.name} (${course.code}). Classes start soon!`,
        type: "course",
        relatedTo: {
          model: "Course",
          id: course._id,
        },
      })

      // Notify instructor
      if (course.instructor) {
        await createNotification({
          recipient: course.instructor,
          title: `New Student Enrollment`,
          message: `${user.name} has enrolled in your course ${course.title || course.name} (${course.code}).`,
          type: "course",
        })
      }
    } catch (notifError) {
      console.warn("Failed to send enrollment notifications:", notifError)
    }

    console.log("✅ User enrolled successfully in course")
    res.json({
      message: "Successfully enrolled in course",
      course: {
        ...course.toObject(),
        title: course.title || course.name,
      },
    })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    res.status(500).json({ message: "Failed to enroll in course" })
  }
})

// Unenroll from course
app.post("/api/courses/:courseId/unenroll", authenticateToken, async (req, res) => {
  try {
    console.log("📚 Unenrolling user", req.user.userId, "from course", req.params.courseId)

    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Remove student from course
    course.enrolledStudents = (course.enrolledStudents || []).filter(
      (studentId) => studentId.toString() !== req.user.userId,
    )
    course.students = (course.students || []).filter((studentId) => studentId.toString() !== req.user.userId)
    await course.save()

    // Remove course from user's enrolled courses
    user.enrolledCourses = (user.enrolledCourses || []).filter(
      (courseId) => courseId.toString() !== req.params.courseId,
    )
    await user.save()

    // Send notification
    try {
      await createNotification({
        recipient: req.user.userId,
        title: `Unenrolled from ${course.title || course.name}`,
        message: `You have been unenrolled from ${course.title || course.name} (${course.code}).`,
        type: "course",
      })
    } catch (notifError) {
      console.warn("Failed to send unenrollment notification:", notifError)
    }

    console.log("✅ User unenrolled successfully from course")
    res.json({ message: "Successfully unenrolled from course" })
  } catch (error) {
    console.error("Error unenrolling from course:", error)
    res.status(500).json({ message: "Failed to unenroll from course" })
  }
})

// ==================== EVENTS API ====================
app.get("/api/events", authenticateToken, async (req, res) => {
  try {
    console.log("📅 Events requested")
    const user = await User.findById(req.user.userId)

    // Filter events by department if user has one
    const eventQuery = {}
    if (user && user.department) {
      eventQuery.$or = [{ department: user.department }, { department: { $exists: false } }]
    }

    const events = await Event.find(eventQuery).sort({ date: 1 })
    res.json({ data: events })
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ message: "Failed to fetch events" })
  }
})

app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    console.log("📅 Creating event:", req.body)

    const user = await User.findById(req.user.userId)
    const eventData = {
      ...req.body,
      organizerId: req.user.userId,
      organizer: req.body.organizer || user.name,
      department: user.department,
    }

    const event = new Event(eventData)
    await event.save()

    // Send notifications to students in the same department
    try {
      const departmentStudents = await User.find({ role: "student", department: user.department })
      for (const student of departmentStudents) {
        await createNotification({
          recipient: student._id,
          title: `New Event: ${eventData.title}`,
          message: `A new event has been scheduled: ${eventData.title} on ${new Date(eventData.date).toLocaleDateString()} at ${eventData.time}. Location: ${eventData.location}`,
          type: "event",
        })
      }
      console.log(`✅ Sent event notifications to ${departmentStudents.length} students`)
    } catch (notifError) {
      console.warn("Failed to send event notifications:", notifError)
    }

    res.status(201).json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Failed to create event" })
  }
})

// ==================== ASSIGNMENTS API ====================
app.get("/api/assignments", authenticateToken, async (req, res) => {
  try {
    console.log("📝 Assignments requested")
    const assignments = await Assignment.find().populate("course", "name code title").populate("instructor", "name")
    res.json({ data: assignments })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    res.status(500).json({ message: "Failed to fetch assignments" })
  }
})

app.post("/api/assignments", authenticateToken, async (req, res) => {
  try {
    console.log("📝 Creating assignment:", req.body)

    const assignmentData = {
      ...req.body,
      instructor: req.user.userId,
    }

    const assignment = new Assignment(assignmentData)
    await assignment.save()

    const populatedAssignment = await Assignment.findById(assignment._id).populate("course", "name code title")

    // Send notifications to enrolled students and department students
    try {
      const course = await Course.findById(req.body.course)
      if (course) {
        // Notify enrolled students
        const studentIds = course.students || course.enrolledStudents || []
        for (const studentId of studentIds) {
          await createNotification({
            recipient: studentId,
            title: `New Assignment: ${req.body.title}`,
            message: `A new assignment has been posted for ${course.title || course.name}. Due date: ${new Date(req.body.dueDate).toLocaleDateString()}`,
            type: "assignment",
            relatedTo: {
              model: "Assignment",
              id: assignment._id,
            },
          })
        }

        // Also notify all students in the department
        const departmentStudents = await User.find({ role: "student", department: course.department })
        for (const student of departmentStudents) {
          await createNotification({
            recipient: student._id,
            title: `New Assignment Posted`,
            message: `A new assignment "${req.body.title}" has been posted for a course in your department. Check your courses for details.`,
            type: "assignment",
          })
        }
      }
    } catch (notifError) {
      console.warn("Failed to send assignment notifications:", notifError)
    }

    res.status(201).json(populatedAssignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    res.status(500).json({ message: "Failed to create assignment" })
  }
})

// Grade assignment submission
app.post("/api/assignments/:assignmentId/submissions/:submissionId/grade", authenticateToken, async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params
    const { marks, feedback } = req.body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    const submission = assignment.submissions.id(submissionId)
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    // Update submission with grade
    submission.marks = Number(marks)
    submission.feedback = feedback
    submission.status = "graded"
    submission.gradedAt = new Date()

    await assignment.save()

    // Send notification to the student
    try {
      await createNotification({
        recipient: submission.student,
        title: `Assignment Graded: ${assignment.title}`,
        message: `Your assignment "${assignment.title}" has been graded. Score: ${marks}/${assignment.totalMarks || assignment.maxMarks || 100}`,
        type: "grade",
        relatedTo: {
          model: "Assignment",
          id: assignment._id,
        },
      })
    } catch (notifError) {
      console.warn("Failed to send grade notification:", notifError)
    }

    res.json({
      message: "Assignment graded successfully",
      data: assignment,
    })
  } catch (error) {
    console.error("Error grading assignment:", error)
    res.status(500).json({ message: "Failed to grade assignment" })
  }
})

// ==================== STUDENT-SPECIFIC ROUTES ====================

// Get student assignments
app.get("/api/students/:studentId/assignments", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params

    // Get courses the student is enrolled in
    const courses = await Course.find({
      $or: [{ enrolledStudents: studentId }, { students: studentId }],
    })

    // Get assignments for those courses
    const assignments = await Assignment.find({
      course: { $in: courses.map((c) => c._id) },
    }).populate("course", "name code title")

    res.json({ data: assignments })
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    res.status(500).json({ message: "Failed to fetch student assignments" })
  }
})

// Get student attendance
app.get("/api/students/:studentId/attendance", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params

    // Mock attendance data for now
    const attendance = []

    res.json({
      data: attendance,
      stats: {
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        attendancePercentage: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    res.status(500).json({ message: "Failed to fetch student attendance" })
  }
})

// Get student grades
app.get("/api/students/:studentId/grades", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params

    // Get grades from assignment submissions
    const assignments = await Assignment.find({})
      .populate("course", "name code title")
      .populate("submissions.student", "name email")

    const grades = []
    assignments.forEach((assignment) => {
      const studentSubmission = assignment.submissions.find(
        (sub) => sub.student && sub.student._id.toString() === studentId && sub.status === "graded",
      )
      if (studentSubmission) {
        grades.push({
          assignment: assignment.title,
          course: assignment.course,
          marks: studentSubmission.marks,
          totalMarks: assignment.totalMarks || assignment.maxMarks || 100,
          feedback: studentSubmission.feedback,
          gradedAt: studentSubmission.gradedAt,
        })
      }
    })

    // Calculate stats
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0)
    const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.totalMarks, 0)
    const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0

    res.json({
      data: grades,
      stats: {
        totalGrades: grades.length,
        totalMarks,
        totalMaxMarks,
        percentage: Math.round(percentage),
        gpa: (percentage / 20).toFixed(2), // Simple GPA calculation
      },
    })
  } catch (error) {
    console.error("Error fetching student grades:", error)
    res.status(500).json({ message: "Failed to fetch student grades" })
  }
})

// ==================== USERS API ====================
app.get("/api/users/students", authenticateToken, async (req, res) => {
  try {
    console.log("👥 Students requested")
    const user = await User.findById(req.user.userId)

    // Faculty can only see students from their department
    const query = { role: "student" }
    if (user.role === "faculty" && user.department) {
      query.department = user.department
    }

    const students = await User.find(query).select("-password")
    res.json({ data: students })
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

app.get("/api/users/faculty", authenticateToken, async (req, res) => {
  try {
    console.log("👨‍🏫 Faculty requested")
    const faculty = await User.find({ role: "faculty" }).select("-password")
    res.json({ data: faculty })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    res.status(500).json({ message: "Failed to fetch faculty" })
  }
})

// ==================== NOTIFICATIONS API ====================
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Notifications requested")
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 })
    res.json({ data: notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

app.post("/api/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Creating notification:", req.body)
    const notification = new Notification(req.body)
    await notification.save()
    res.status(201).json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({ message: "Failed to create notification" })
  }
})

app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { read: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({
      message: "Notification marked as read",
      data: notification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Failed to mark notification as read" })
  }
})

// Helper function to create notifications
async function createNotification(notificationData) {
  try {
    const notification = new Notification(notificationData)
    await notification.save()
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Smart Campus Portal API is running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/courses",
      "/api/events",
      "/api/assignments",
      "/api/users/students",
      "/api/users/faculty",
      "/api/notifications",
      "/api/dashboard",
      "/api/students/:id/assignments",
      "/api/students/:id/attendance",
      "/api/students/:id/grades",
    ],
  })
})

// Create Sample Data with YOUR EMAIL
async function createSampleData() {
  try {
    console.log("🌱 Checking for existing data...")

    // Check if your user already exists
    const existingUser = await User.findOne({ email: "jatin@gmail.com" })
    if (existingUser) {
      console.log("📋 Your user already exists:", existingUser.email)
      await createSampleCoursesIfNeeded()
      return
    }

    console.log("🔄 Creating your user account...")

    const hashedPassword = await bcrypt.hash("student123", 10)

    // Create your user
    const yourUser = new User({
      name: "Jatin Kumar",
      email: "jatin@gmail.com",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      studentId: "STU001",
      year: 3,
      semester: 6,
    })

    await yourUser.save()
    console.log("✅ Your user account created successfully!")

    // Create a faculty user too
    const facultyUser = new User({
      name: "Dr. Sarah Wilson",
      email: "faculty@gmail.com",
      password: hashedPassword,
      role: "faculty",
      department: "Computer Science",
    })

    await facultyUser.save()
    console.log("✅ Faculty user created!")

    await createSampleCoursesIfNeeded()

    console.log("🎉 Database setup completed!")
    console.log("🔐 Your login credentials:")
    console.log("   Student: jatin@gmail.com / student123")
    console.log("   Faculty: faculty@gmail.com / student123")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  }
}

// Create sample courses if none exist
async function createSampleCoursesIfNeeded() {
  try {
    const existingCourses = await Course.find({})
    if (existingCourses.length > 0) {
      console.log("📚 Courses already exist:", existingCourses.length)
      return
    }

    console.log("📚 Creating sample courses...")

    const facultyUser = await User.findOne({ email: "faculty@gmail.com" })
    const studentUser = await User.findOne({ email: "jatin@gmail.com" })

    if (!facultyUser) {
      console.log("❌ Faculty user not found, skipping course creation")
      return
    }

    const sampleCourses = [
      {
        name: "Data Structures and Algorithms",
        title: "Data Structures and Algorithms",
        code: "CS301",
        description: "Fundamental data structures and algorithms",
        instructor: facultyUser._id,
        instructorName: "Dr. Sarah Wilson",
        department: "Computer Science",
        credits: 4,
        semester: "Fall",
        year: 2024,
        enrolledStudents: studentUser ? [studentUser._id] : [],
        students: studentUser ? [studentUser._id] : [],
      },
      {
        name: "Database Management Systems",
        title: "Database Management Systems",
        code: "CS302",
        description: "Introduction to database concepts and SQL",
        instructor: facultyUser._id,
        instructorName: "Dr. Sarah Wilson",
        department: "Computer Science",
        credits: 3,
        semester: "Fall",
        year: 2024,
        enrolledStudents: studentUser ? [studentUser._id] : [],
        students: studentUser ? [studentUser._id] : [],
      },
      {
        name: "Web Development",
        title: "Web Development",
        code: "CS303",
        description: "Full-stack web development with modern frameworks",
        instructor: facultyUser._id,
        instructorName: "Dr. Sarah Wilson",
        department: "Computer Science",
        credits: 4,
        semester: "Fall",
        year: 2024,
        enrolledStudents: studentUser ? [studentUser._id] : [],
        students: studentUser ? [studentUser._id] : [],
      },
    ]

    const courses = await Course.insertMany(sampleCourses)
    console.log("✅ Sample courses created:", courses.length)

    // Create sample assignments
    const sampleAssignments = [
      {
        title: "Binary Search Tree Implementation",
        description: "Implement a binary search tree with all basic operations",
        course: courses[0]._id,
        instructor: facultyUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        maxMarks: 100,
        submissions: studentUser
          ? [
              {
                student: studentUser._id,
                submittedAt: new Date(),
                marks: 85,
                feedback: "Good implementation, but could be optimized further.",
                status: "graded",
                gradedAt: new Date(),
              },
            ]
          : [],
      },
      {
        title: "Database Design Project",
        description: "Design a database for a library management system",
        course: courses[1]._id,
        instructor: facultyUser._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        maxMarks: 100,
      },
    ]

    await Assignment.insertMany(sampleAssignments)
    console.log("✅ Sample assignments created")

    // Create sample events
    const sampleEvents = [
      {
        title: "Tech Fest 2024",
        description: "Annual technology festival",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: "10:00 AM",
        location: "Main Auditorium",
        organizer: "Computer Science Department",
        organizerId: facultyUser._id,
        department: "Computer Science",
        category: "academic",
      },
    ]

    await Event.insertMany(sampleEvents)
    console.log("✅ Sample events created")

    // Create sample notifications
    if (studentUser) {
      const sampleNotifications = [
        {
          title: "Welcome to Smart Campus Portal",
          message: "Your account has been successfully created. Explore all the features!",
          type: "success",
          recipient: studentUser._id,
        },
        {
          title: "Assignment Graded",
          message: "Your Binary Search Tree assignment has been graded. Score: 85/100",
          type: "grade",
          recipient: studentUser._id,
        },
      ]

      await Notification.insertMany(sampleNotifications)
      console.log("✅ Sample notifications created")
    }
  } catch (error) {
    console.error("❌ Error creating sample courses:", error)
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
    available: [
      "/api/courses",
      "/api/events",
      "/api/assignments",
      "/api/users/students",
      "/api/users/faculty",
      "/api/notifications",
      "/api/dashboard",
      "/api/students/:id/assignments",
      "/api/students/:id/attendance",
      "/api/students/:id/grades",
    ],
  })
})

// Start server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔍 Debug users: http://localhost:${PORT}/debug/users`)
  console.log(`🔐 Login with: jatin@gmail.com / student123`)
})
