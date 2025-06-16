const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables")
    }

    if (!mongoUri.includes("/smart_campus_portal")) {
      mongoUri = mongoUri.replace("mongodb.net/", "mongodb.net/smart_campus_portal")
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ MongoDB Connected")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

const populateData = async () => {
  try {
    console.log("🔄 Starting data population...")

    // User Schema
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

    // Course Schema
    const courseSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        description: String,
        department: String,
        credits: { type: Number, default: 3 },
        semester: { type: String, default: "Fall" },
        year: { type: Number, default: new Date().getFullYear() },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true },
    )

    const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)

    // Assignment Schema
    const assignmentSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        dueDate: { type: Date, required: true },
        maxPoints: { type: Number, default: 100 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        submissions: [
          {
            student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: String,
            fileUrl: String,
            submittedAt: { type: Date, default: Date.now },
            grade: Number,
            feedback: String,
            gradedAt: Date,
          },
        ],
      },
      { timestamps: true },
    )

    const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)

    // Event Schema
    const eventSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        date: { type: Date, required: true },
        location: String,
        type: { type: String, default: "general" },
        department: String,
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true },
    )

    const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)

    // Notification Schema
    const notificationSchema = new mongoose.Schema(
      {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: "general" },
        read: { type: Boolean, default: false },
        relatedTo: {
          model: String,
          id: mongoose.Schema.Types.ObjectId,
        },
      },
      { timestamps: true },
    )

    const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema)

    // Clear existing data
    console.log("🗑️ Clearing existing data...")
    await User.deleteMany({})
    await Course.deleteMany({})
    await Assignment.deleteMany({})
    await Event.deleteMany({})
    await Notification.deleteMany({})

    // Create Users
    console.log("👥 Creating users...")
    const users = await User.insertMany([
      {
        name: "Jatin Kumar",
        email: "jatin@example.com",
        password: await bcrypt.hash("student123", 10),
        role: "student",
        department: "Computer Science",
        studentId: "STU315379",
      },
      {
        name: "Dr. Smith",
        email: "faculty@example.com",
        password: await bcrypt.hash("student123", 10),
        role: "faculty",
        department: "Computer Science",
        employeeId: "FAC001",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("student123", 10),
        role: "admin",
        department: "Administration",
        employeeId: "ADM001",
      },
    ])

    const student = users.find((u) => u.role === "student")
    const faculty = users.find((u) => u.role === "faculty")

    // Create Courses
    console.log("📚 Creating courses...")
    const courses = await Course.insertMany([
      {
        title: "Introduction to Programming",
        code: "CS101",
        description: "Basic programming concepts using Python",
        department: "Computer Science",
        credits: 4,
        instructor: faculty._id,
        students: [student._id],
      },
      {
        title: "Data Structures and Algorithms",
        code: "CS201",
        description: "Fundamental data structures and algorithmic techniques",
        department: "Computer Science",
        credits: 4,
        instructor: faculty._id,
        students: [student._id],
      },
      {
        title: "Database Management Systems",
        code: "CS301",
        description: "Design and implementation of database systems",
        department: "Computer Science",
        credits: 3,
        instructor: faculty._id,
        students: [student._id],
      },
    ])

    // Create Assignments
    console.log("📝 Creating assignments...")
    const assignments = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      const assignmentData = [
        {
          title: `${course.code} - Assignment 1`,
          description: `First assignment for ${course.title}`,
          course: course._id,
          dueDate: new Date(Date.now() + (7 + i * 3) * 24 * 60 * 60 * 1000), // Staggered due dates
          maxPoints: 100,
          createdBy: faculty._id,
          submissions: [
            {
              student: student._id,
              content: "Sample submission content",
              submittedAt: new Date(),
              grade: 85 + i * 5,
              feedback: "Good work! Keep it up.",
              gradedAt: new Date(),
            },
          ],
        },
        {
          title: `${course.code} - Assignment 2`,
          description: `Second assignment for ${course.title}`,
          course: course._id,
          dueDate: new Date(Date.now() + (14 + i * 3) * 24 * 60 * 60 * 1000),
          maxPoints: 100,
          createdBy: faculty._id,
          submissions: [], // No submission yet
        },
      ]

      const courseAssignments = await Assignment.insertMany(assignmentData)
      assignments.push(...courseAssignments)
    }

    // Create Events
    console.log("🎉 Creating events...")
    await Event.insertMany([
      {
        title: "Computer Science Seminar",
        description: "Latest trends in AI and Machine Learning",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "CS Auditorium",
        type: "seminar",
        department: "Computer Science",
        organizer: faculty._id,
      },
      {
        title: "Tech Fest 2024",
        description: "Annual technology festival with competitions and exhibitions",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Main Campus",
        type: "festival",
        department: "Computer Science",
        organizer: faculty._id,
      },
      {
        title: "Career Fair",
        description: "Meet with top tech companies for internships and jobs",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: "Student Center",
        type: "career",
        department: "Computer Science",
        organizer: faculty._id,
      },
    ])

    // Create Notifications
    console.log("🔔 Creating notifications...")
    await Notification.insertMany([
      {
        recipient: student._id,
        title: "🆕 New Assignment: CS101 - Assignment 2",
        message: "A new assignment has been posted for Introduction to Programming. Due in 2 weeks.",
        type: "assignment",
        read: false,
      },
      {
        recipient: student._id,
        title: "🎉 Upcoming Event: Tech Fest 2024",
        message: "Don't miss the annual Tech Fest! Register now for competitions.",
        type: "event",
        read: false,
      },
      {
        recipient: student._id,
        title: "📊 Grade Posted: CS101 - Assignment 1",
        message: "Your grade for Assignment 1 has been posted. Score: 85/100",
        type: "grade",
        read: true,
      },
    ])

    console.log("✅ Data population completed successfully!")
    console.log("📊 Summary:")
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Courses: ${courses.length}`)
    console.log(`   - Assignments: ${assignments.length}`)
    console.log(`   - Events: 3`)
    console.log(`   - Notifications: 3`)
    console.log("")
    console.log("🔐 Test Login Credentials:")
    console.log("   Student: jatin@example.com / student123")
    console.log("   Faculty: faculty@example.com / student123")
    console.log("   Admin: admin@example.com / student123")
  } catch (error) {
    console.error("❌ Error populating data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Database connection closed")
  }
}

const main = async () => {
  await connectDB()
  await populateData()
}

main()
