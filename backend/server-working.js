const express = require("express")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// MongoDB Connection - Use Atlas URI
const MONGO_URI =
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
  department: { type: String, default: "Computer Science" },
  firstLogin: { type: Boolean, default: true },
})

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String, required: true },
    credits: { type: Number, default: 3 },
    semester: { type: String, default: "Fall" },
    year: { type: Number, default: new Date().getFullYear() },
    isActive: { type: Boolean, default: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxStudents: { type: Number, default: 20 },
  },
  {
    timestamps: true,
  },
)

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String },
    type: {
      type: String,
      enum: ["academic", "cultural", "sports", "workshop", "seminar", "general"],
      default: "general",
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxAttendees: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

// Assignment Schema
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  },
)

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["event", "assignment", "announcement", "general", "system"],
      default: "general",
    },
    relatedTo: {
      model: { type: String, enum: ["Event", "Assignment", "Course"] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model("User", userSchema)
const Course = mongoose.model("Course", courseSchema)
const Event = mongoose.model("Event", eventSchema)
const Assignment = mongoose.model("Assignment", assignmentSchema)
const Notification = mongoose.model("Notification", notificationSchema)

// Middleware to verify JWT token
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

// Helper function to create notifications
const createNotifications = async (title, message, type, sender, recipients, relatedTo = null) => {
  try {
    const notifications = recipients.map((recipientId) => ({
      title,
      message,
      recipient: recipientId,
      sender: sender._id,
      type,
      relatedTo,
    }))

    await Notification.insertMany(notifications)
    console.log(`✅ Created ${notifications.length} notifications for ${type}`)
  } catch (error) {
    console.error("❌ Error creating notifications:", error)
  }
}

// Register a new user
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

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, "your-secret-key")
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        firstLogin: user.firstLogin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ===== COURSE ROUTES =====

// Get all courses
app.get("/api/courses", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching courses for user: ${req.user.email} (${req.user.role})`)

    let query = { isActive: true }

    // Filter courses based on user role
    if (req.user.role === "faculty") {
      // Faculty see courses they teach or from their department
      query = {
        $or: [{ instructor: req.user._id }, { department: req.user.department }],
        isActive: true,
      }
    } else if (req.user.role === "student") {
      // Students see courses from their department
      query.department = req.user.department
    }

    const courses = await Course.find(query).populate("instructor", "name email").sort({ createdAt: -1 })

    console.log(`✅ Found ${courses.length} courses`)
    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

// Get available courses for enrollment
app.get("/api/courses/available", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching available courses for user: ${req.user.email}`)

    const { department } = req.query
    const query = { isActive: true }

    // Filter by department if provided
    if (department) {
      query.department = department
    } else if (req.user.role === "student") {
      // Default to user's department for students
      query.department = req.user.department
    }

    // Find courses where the student is not already enrolled
    const courses = await Course.find({
      ...query,
      students: { $ne: req.user._id }, // Not already enrolled
    }).populate("instructor", "name email")

    console.log(`✅ Found ${courses.length} available courses`)
    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching available courses:", error)
    res.status(500).json({ message: "Failed to fetch available courses" })
  }
})

// Get enrolled courses for student
app.get("/api/courses/enrolled", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching enrolled courses for student: ${req.user.email}`)

    const courses = await Course.find({
      students: req.user._id,
      isActive: true,
    }).populate("instructor", "name email")

    console.log(`✅ Found ${courses.length} enrolled courses`)
    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching enrolled courses:", error)
    res.status(500).json({ message: "Failed to fetch enrolled courses" })
  }
})

// Enroll in course
app.post("/api/courses/enroll", verifyToken, async (req, res) => {
  try {
    const { courseId } = req.body
    console.log(`📝 Enrolling student ${req.user.email} in course ${courseId}`)

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    // Check if course is full
    if (course.maxStudents && course.students.length >= course.maxStudents) {
      return res.status(400).json({ message: "Course is full" })
    }

    // Add student to course
    course.students.push(req.user._id)
    await course.save()

    console.log(`✅ Successfully enrolled in course: ${course.title}`)
    res.json({ message: "Successfully enrolled in course", course })
  } catch (error) {
    console.error("❌ Error enrolling in course:", error)
    res.status(500).json({ message: "Failed to enroll in course" })
  }
})

// Update first login status
app.post("/api/courses/first-login", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { firstLogin: false })
    console.log(`✅ Updated first login status for ${req.user.email}`)
    res.json({ message: "First login status updated" })
  } catch (error) {
    console.error("❌ Error updating first login status:", error)
    res.status(500).json({ message: "Failed to update first login status" })
  }
})

// Create a new course
app.post("/api/courses", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, code, description, credits, semester, year } = req.body

    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" })
    }

    const course = new Course({
      title,
      code,
      description,
      credits: credits || 3,
      semester: semester || "Fall",
      year: year || new Date().getFullYear(),
      instructor: req.user._id,
      department: req.user.department,
    })

    await course.save()
    await course.populate("instructor", "name email")

    // Create notifications for students in the same department
    const studentsInDepartment = await User.find({
      role: "student",
      department: req.user.department,
    })

    if (studentsInDepartment.length > 0) {
      await createNotifications(
        "New Course Available",
        `A new course "${title}" (${code}) has been added to the ${req.user.department} department.`,
        "general",
        req.user,
        studentsInDepartment.map((student) => student._id),
        { model: "Course", id: course._id },
      )
    }

    console.log(`✅ Created course: ${course.title}`)
    res.status(201).json(course)
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

// ===== EVENT ROUTES =====

// Get all events
app.get("/api/events", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching events for user: ${req.user.email} (${req.user.role})`)

    let query = { isActive: true }

    // Filter events based on user role
    if (req.user.role === "faculty" || req.user.role === "student") {
      // Faculty and students see events from their department or global events
      query = {
        $or: [
          { department: req.user.department },
          { department: { $exists: false } },
          { department: null },
          { department: "" },
        ],
        isActive: true,
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

// Get event by ID
app.get("/api/events/:eventId", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("organizer", "name email")
      .populate("attendees", "name email")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json(event)
  } catch (error) {
    console.error("❌ Error fetching event:", error)
    res.status(500).json({ message: "Failed to fetch event" })
  }
})

// Create a new event
app.post("/api/events", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, description, date, location, type, maxAttendees } = req.body

    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      type: type || "general",
      maxAttendees,
      organizer: req.user._id,
      department: req.user.department,
    })

    await event.save()
    await event.populate("organizer", "name email")

    // Create notifications for all users in the same department
    let recipientQuery = {}

    if (req.user.role === "faculty") {
      // Faculty events notify students and other faculty in the same department
      recipientQuery = {
        department: req.user.department,
        _id: { $ne: req.user._id }, // Exclude the creator
      }
    } else if (req.user.role === "admin") {
      // Admin events notify everyone
      recipientQuery = { _id: { $ne: req.user._id } }
    }

    const recipients = await User.find(recipientQuery)

    if (recipients.length > 0) {
      await createNotifications(
        "New Event Created",
        `${req.user.name} has created a new event: "${title}" scheduled for ${new Date(date).toLocaleDateString()}.`,
        "event",
        req.user,
        recipients.map((user) => user._id),
        { model: "Event", id: event._id },
      )
    }

    console.log(`✅ Created event: ${event.title}`)
    res.status(201).json(event)
  } catch (error) {
    console.error("❌ Error creating event:", error)
    res.status(500).json({ message: "Failed to create event" })
  }
})

// ===== ASSIGNMENT ROUTES =====

// Get assignments for student
app.get("/api/assignments/student/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params

    // Get courses the student is enrolled in
    const courses = await Course.find({ students: studentId })
    const courseIds = courses.map((course) => course._id)

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate("course", "title code")
      .populate("instructor", "name")
      .sort({ dueDate: 1 })

    res.json(assignments)
  } catch (error) {
    console.error("❌ Error fetching student assignments:", error)
    res.status(500).json({ message: "Failed to fetch assignments" })
  }
})

// Create assignment
app.post("/api/assignments", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, description, courseId, dueDate, totalMarks } = req.body

    const course = await Course.findById(courseId).populate("students")
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const assignment = new Assignment({
      title,
      description,
      course: courseId,
      instructor: req.user._id,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
    })

    await assignment.save()
    await assignment.populate("course", "title code")

    // Create notifications for all students enrolled in the course
    if (course.students.length > 0) {
      await createNotifications(
        "New Assignment Posted",
        `A new assignment "${title}" has been posted for ${course.title}. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
        "assignment",
        req.user,
        course.students.map((student) => student._id),
        { model: "Assignment", id: assignment._id },
      )
    }

    console.log(`✅ Created assignment: ${assignment.title}`)
    res.status(201).json(assignment)
  } catch (error) {
    console.error("❌ Error creating assignment:", error)
    res.status(500).json({ message: "Failed to create assignment" })
  }
})

// ===== NOTIFICATION ROUTES =====

// Get notifications for current user
app.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(notifications)
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

// Mark notification as read
app.put("/api/notifications/:notificationId/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    console.error("❌ Error marking notification as read:", error)
    res.status(500).json({ message: "Failed to mark notification as read" })
  }
})

// ===== USER ROUTES =====

// Get all students (for faculty/admin)
app.get("/api/users/students", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching students for user: ${req.user.email} (${req.user.role})`)
    console.log(`👤 User department: ${req.user.department}`)

    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const query = { role: "student" }

    // If faculty, only show students from their department
    if (req.user.role === "faculty") {
      query.department = req.user.department || "Computer Science"
      console.log(`📚 Filtering students by department: ${query.department}`)
    }

    const students = await User.find(query).select("-password")
    console.log(`✅ Found ${students.length} students`)

    // Log each student for debugging
    students.forEach((student) => {
      console.log(`   - ${student.name} (${student.department})`)
    })

    res.json({ data: students })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

// Update user
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

// Delete user (admin only)
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  })
})

// Initialize sample data
const initializeSampleData = async () => {
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
            description: "Basic programming concepts using Python",
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
            description: "Annual technology symposium featuring industry experts and student presentations",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: "Main Auditorium",
            organizer: facultyUser._id,
            department: "Computer Science",
            type: "academic",
          },
          {
            title: "Career Fair",
            description: "Meet with industry professionals and explore career opportunities",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            location: "Campus Center",
            organizer: facultyUser._id,
            type: "general",
          },
        ]

        await Event.insertMany(sampleEvents)
        console.log("✅ Sample events created")
      }
    }
  } catch (error) {
    console.error("❌ Error initializing sample data:", error)
  }
}

// Initialize sample data when server starts
mongoose.connection.once("open", () => {
  initializeSampleData()
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📍 Health check: http://localhost:${port}/api/health`)
  console.log(`📋 Available endpoints:`)
  console.log(`   - POST /api/login`)
  console.log(`   - POST /api/register`)
  console.log(`   - GET /api/profile`)
  console.log(`   - GET /api/courses`)
  console.log(`   - GET /api/courses/available`)
  console.log(`   - GET /api/courses/enrolled`)
  console.log(`   - POST /api/courses/enroll`)
  console.log(`   - POST /api/courses/first-login`)
  console.log(`   - POST /api/courses`)
  console.log(`   - GET /api/events`)
  console.log(`   - GET /api/events/:eventId`)
  console.log(`   - POST /api/events`)
  console.log(`   - GET /api/assignments/student/:studentId`)
  console.log(`   - POST /api/assignments`)
  console.log(`   - GET /api/notifications`)
  console.log(`   - PUT /api/notifications/:notificationId/read`)
  console.log(`   - GET /api/users/students`)
  console.log(`   - PUT /api/users/:userId`)
  console.log(`   - DELETE /api/users/:userId`)
})
