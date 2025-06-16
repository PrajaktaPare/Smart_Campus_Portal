const express = require("express")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")

console.log("🔧 Quick Server Fix - Adding Missing Endpoints")

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

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
  firstLogin: { type: Boolean, default: true },
})

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
    type: {
      type: String,
      enum: ["academic", "cultural", "sports", "workshop", "seminar", "general"],
      default: "general",
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxAttendees: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
  },
  { timestamps: true },
)

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
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
const Course = mongoose.model("Course", courseSchema)
const Event = mongoose.model("Event", eventSchema)
const Assignment = mongoose.model("Assignment", assignmentSchema)
const Notification = mongoose.model("Notification", notificationSchema)

// Middleware
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
    console.log(`✅ Created ${notifications.length} notifications for ${type}: ${title}`)
  } catch (error) {
    console.error("❌ Error creating notifications:", error)
  }
}

// Auth Routes
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

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Course Routes
app.get("/api/courses", verifyToken, async (req, res) => {
  try {
    let query = { isActive: true }
    if (req.user.role === "faculty") {
      query = {
        $or: [{ instructor: req.user._id }, { department: req.user.department }],
        isActive: true,
      }
    } else if (req.user.role === "student") {
      query.department = req.user.department
    }

    const courses = await Course.find(query).populate("instructor", "name email").sort({ createdAt: -1 })
    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

app.get("/api/courses/available", verifyToken, async (req, res) => {
  try {
    const { department } = req.query
    const query = { isActive: true }

    if (department) {
      query.department = department
    } else if (req.user.role === "student") {
      query.department = req.user.department
    }

    const courses = await Course.find({
      ...query,
      students: { $ne: req.user._id },
    }).populate("instructor", "name email")

    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching available courses:", error)
    res.status(500).json({ message: "Failed to fetch available courses" })
  }
})

app.get("/api/courses/enrolled", verifyToken, async (req, res) => {
  try {
    const courses = await Course.find({
      students: req.user._id,
      isActive: true,
    }).populate("instructor", "name email")

    res.json(courses)
  } catch (error) {
    console.error("❌ Error fetching enrolled courses:", error)
    res.status(500).json({ message: "Failed to fetch enrolled courses" })
  }
})

app.post("/api/courses/enroll", verifyToken, async (req, res) => {
  try {
    const { courseId } = req.body
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    if (course.maxStudents && course.students.length >= course.maxStudents) {
      return res.status(400).json({ message: "Course is full" })
    }

    course.students.push(req.user._id)
    await course.save()

    res.json({ message: "Successfully enrolled in course", course })
  } catch (error) {
    console.error("❌ Error enrolling in course:", error)
    res.status(500).json({ message: "Failed to enroll in course" })
  }
})

app.post("/api/courses/first-login", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { firstLogin: false })
    res.json({ message: "First login status updated" })
  } catch (error) {
    console.error("❌ Error updating first login status:", error)
    res.status(500).json({ message: "Failed to update first login status" })
  }
})

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

    // Notify students in the same department
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

    res.status(201).json(course)
  } catch (error) {
    console.error("❌ Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

// Event Routes
app.get("/api/events", verifyToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching events for user: ${req.user.email} (${req.user.role})`)

    let query = { isActive: true }

    // Filter events based on user role and department
    if (req.user.role === "faculty" || req.user.role === "student") {
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

    console.log(`✅ Found ${events.length} events for ${req.user.department} department`)
    res.json({ data: events })
  } catch (error) {
    console.error("❌ Error fetching events:", error)
    res.status(500).json({ message: "Failed to fetch events" })
  }
})

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

    // Create notifications for users in the same department
    let recipientQuery = {}

    if (req.user.role === "faculty") {
      // Faculty events notify students and other faculty in the same department
      recipientQuery = {
        department: req.user.department,
        _id: { $ne: req.user._id },
      }
    } else if (req.user.role === "admin") {
      // Admin events notify everyone
      recipientQuery = { _id: { $ne: req.user._id } }
    }

    const recipients = await User.find(recipientQuery)

    if (recipients.length > 0) {
      await createNotifications(
        "New Event Created",
        `${req.user.name} has created a new event: "${title}" scheduled for ${new Date(date).toLocaleDateString()} at ${location || "TBA"}.`,
        "event",
        req.user,
        recipients.map((user) => user._id),
        { model: "Event", id: event._id },
      )
    }

    console.log(`✅ Created event: ${event.title} and notified ${recipients.length} users`)
    res.status(201).json(event)
  } catch (error) {
    console.error("❌ Error creating event:", error)
    res.status(500).json({ message: "Failed to create event" })
  }
})

// Assignment Routes
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

    console.log(`✅ Found ${assignments.length} assignments for student`)
    res.json(assignments)
  } catch (error) {
    console.error("❌ Error fetching student assignments:", error)
    res.status(500).json({ message: "Failed to fetch assignments" })
  }
})

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

    console.log(`✅ Created assignment: ${assignment.title} and notified ${course.students.length} students`)
    res.status(201).json(assignment)
  } catch (error) {
    console.error("❌ Error creating assignment:", error)
    res.status(500).json({ message: "Failed to create assignment" })
  }
})

// Notification Routes
app.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(50)

    console.log(`✅ Found ${notifications.length} notifications for ${req.user.email}`)
    res.json(notifications)
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

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

// User Routes
app.get("/api/users/students", verifyToken, async (req, res) => {
  try {
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const query = { role: "student" }
    if (req.user.role === "faculty") {
      query.department = req.user.department || "Computer Science"
    }

    const students = await User.find(query).select("-password")
    res.json({ data: students })
  } catch (error) {
    console.error("❌ Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
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
    // Create sample users if they don't exist
    const existingStudent = await User.findOne({ email: "student@test.com" })
    if (!existingStudent) {
      const hashedPassword = await bcryptjs.hash("password123", 12)

      const sampleUsers = [
        {
          name: "Jatin Student",
          email: "student@test.com",
          password: hashedPassword,
          role: "student",
          department: "Computer Science",
          firstLogin: false,
        },
        {
          name: "Roshan Faculty",
          email: "faculty@test.com",
          password: hashedPassword,
          role: "faculty",
          department: "Computer Science",
        },
        {
          name: "Admin User",
          email: "admin@test.com",
          password: hashedPassword,
          role: "admin",
          department: "Computer Science",
        },
      ]

      await User.insertMany(sampleUsers)
      console.log("✅ Sample users created")
    }

    // Create sample courses
    const courseCount = await Course.countDocuments()
    if (courseCount === 0) {
      const facultyUser = await User.findOne({ role: "faculty" })
      if (facultyUser) {
        const sampleCourses = [
          {
            title: "Database Systems",
            code: "CS301",
            description: "Advanced database concepts and design",
            instructor: facultyUser._id,
            department: "Computer Science",
            credits: 3,
          },
          {
            title: "MERN Stack",
            code: "CS105",
            description: "Full-stack web development with MongoDB, Express, React, Node.js",
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

        const courses = await Course.insertMany(sampleCourses)

        // Enroll the student in some courses
        const student = await User.findOne({ email: "student@test.com" })
        if (student) {
          await Course.findByIdAndUpdate(courses[0]._id, { $push: { students: student._id } })
          await Course.findByIdAndUpdate(courses[1]._id, { $push: { students: student._id } })
        }

        console.log("✅ Sample courses created and student enrolled")
      }
    }

    // Create sample events
    const eventCount = await Event.countDocuments()
    if (eventCount === 0) {
      const facultyUser = await User.findOne({ role: "faculty" })
      if (facultyUser) {
        const sampleEvents = [
          {
            title: "Tech Symposium 2024",
            description: "Annual technology symposium featuring industry experts and student presentations",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            location: "Main Auditorium",
            organizer: facultyUser._id,
            department: "Computer Science",
            type: "academic",
          },
          {
            title: "Career Fair",
            description: "Meet with industry professionals and explore career opportunities",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            location: "Campus Center",
            organizer: facultyUser._id,
            department: "Computer Science",
            type: "general",
          },
          {
            title: "Coding Workshop",
            description: "Hands-on coding workshop for beginners",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            location: "Computer Lab",
            organizer: facultyUser._id,
            department: "Computer Science",
            type: "workshop",
          },
        ]

        await Event.insertMany(sampleEvents)
        console.log("✅ Sample events created")
      }
    }

    // Create sample assignments
    const assignmentCount = await Assignment.countDocuments()
    if (assignmentCount === 0) {
      const facultyUser = await User.findOne({ role: "faculty" })
      const courses = await Course.find({ instructor: facultyUser._id })

      if (facultyUser && courses.length > 0) {
        const sampleAssignments = [
          {
            title: "Database Design Project",
            description: "Design and implement a database for a library management system",
            course: courses[0]._id,
            instructor: facultyUser._id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            totalMarks: 100,
          },
          {
            title: "React Component Development",
            description: "Create a responsive dashboard using React components",
            course: courses[1]._id,
            instructor: facultyUser._id,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            totalMarks: 100,
          },
        ]

        await Assignment.insertMany(sampleAssignments)
        console.log("✅ Sample assignments created")
      }
    }

    // Create sample notifications
    const notificationCount = await Notification.countDocuments()
    if (notificationCount === 0) {
      const student = await User.findOne({ email: "student@test.com" })
      const faculty = await User.findOne({ role: "faculty" })

      if (student && faculty) {
        const sampleNotifications = [
          {
            title: "Welcome to Smart Campus Portal",
            message: "Welcome to the Smart Campus Portal! Explore courses, events, and assignments.",
            recipient: student._id,
            sender: faculty._id,
            type: "system",
          },
          {
            title: "New Event: Tech Symposium 2024",
            message: "A new event 'Tech Symposium 2024' has been scheduled for next week.",
            recipient: student._id,
            sender: faculty._id,
            type: "event",
          },
        ]

        await Notification.insertMany(sampleNotifications)
        console.log("✅ Sample notifications created")
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
  console.log(`🚀 Quick Fix Server running on port ${port}`)
  console.log(`📍 Health check: http://localhost:${port}/api/health`)
  console.log(`📍 Available courses: http://localhost:${port}/api/courses/available`)
  console.log(`📍 Test login: student@test.com / password123`)
  console.log(``)
  console.log(`✅ All course endpoints are now available!`)
})
