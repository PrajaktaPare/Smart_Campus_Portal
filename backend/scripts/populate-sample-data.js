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

    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

const createSampleData = async () => {
  try {
    // Define schemas
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

    const eventSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        date: { type: Date, required: true },
        location: String,
        type: { type: String, default: "general" },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        department: String,
      },
      { timestamps: true },
    )

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

    const attendanceSchema = new mongoose.Schema(
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        date: { type: Date, required: true },
        status: { type: String, enum: ["present", "absent", "late"], required: true },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
      { timestamps: true },
    )

    // Create models
    const User = mongoose.models.User || mongoose.model("User", userSchema)
    const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
    const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)
    const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)
    const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema)
    const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await User.deleteMany({})
    await Course.deleteMany({})
    await Assignment.deleteMany({})
    await Event.deleteMany({})
    await Notification.deleteMany({})
    await Attendance.deleteMany({})

    // Create users
    console.log("👥 Creating users...")
    const hashedPassword = await bcrypt.hash("student123", 10)

    const users = await User.insertMany([
      {
        name: "Jatin Kumar",
        email: "jatin@example.com",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        studentId: "STU315379",
      },
      {
        name: "Dr. Smith",
        email: "dr.smith@example.com",
        password: hashedPassword,
        role: "faculty",
        department: "Computer Science",
        employeeId: "FAC001",
      },
      {
        name: "Prof. Johnson",
        email: "prof.johnson@example.com",
        password: hashedPassword,
        role: "faculty",
        department: "Computer Science",
        employeeId: "FAC002",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        employeeId: "ADM001",
      },
    ])

    const [student, faculty1, faculty2, admin] = users

    // Create courses
    console.log("📚 Creating courses...")
    const courses = await Course.insertMany([
      {
        title: "Introduction to Programming",
        code: "CS101",
        description: "Learn the basics of programming with Python",
        department: "Computer Science",
        credits: 3,
        semester: "Fall",
        year: 2024,
        instructor: faculty1._id,
        students: [student._id],
        isActive: true,
      },
      {
        title: "Data Structures and Algorithms",
        code: "CS201",
        description: "Advanced data structures and algorithm design",
        department: "Computer Science",
        credits: 4,
        semester: "Fall",
        year: 2024,
        instructor: faculty2._id,
        students: [student._id],
        isActive: true,
      },
      {
        title: "Web Development",
        code: "CS301",
        description: "Full-stack web development with modern frameworks",
        department: "Computer Science",
        credits: 3,
        semester: "Fall",
        year: 2024,
        instructor: faculty1._id,
        students: [student._id],
        isActive: true,
      },
    ])

    // Create assignments
    console.log("📝 Creating assignments...")
    const assignments = await Assignment.insertMany([
      {
        title: "Python Basics Assignment",
        description: "Complete the Python programming exercises",
        course: courses[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 100,
        createdBy: faculty1._id,
        submissions: [
          {
            student: student._id,
            content: "Here is my Python assignment solution...",
            submittedAt: new Date(),
            grade: 85,
            feedback: "Good work! Consider optimizing your loops.",
            gradedAt: new Date(),
          },
        ],
      },
      {
        title: "Binary Tree Implementation",
        description: "Implement a binary search tree in your preferred language",
        course: courses[1]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxPoints: 150,
        createdBy: faculty2._id,
        submissions: [
          {
            student: student._id,
            content: "Binary tree implementation with insert, delete, and search methods...",
            submittedAt: new Date(),
            grade: 92,
            feedback: "Excellent implementation! Well documented code.",
            gradedAt: new Date(),
          },
        ],
      },
      {
        title: "React Portfolio Website",
        description: "Create a personal portfolio website using React",
        course: courses[2]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        maxPoints: 200,
        createdBy: faculty1._id,
        submissions: [],
      },
    ])

    // Create events
    console.log("🎉 Creating events...")
    await Event.insertMany([
      {
        title: "Computer Science Seminar",
        description: "Latest trends in AI and Machine Learning",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: "Auditorium A",
        type: "seminar",
        organizer: faculty1._id,
        department: "Computer Science",
        attendees: [student._id],
      },
      {
        title: "Coding Competition",
        description: "Annual programming contest for CS students",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: "Computer Lab 1",
        type: "competition",
        organizer: faculty2._id,
        department: "Computer Science",
        attendees: [],
      },
      {
        title: "Tech Career Fair",
        description: "Meet with top tech companies for internships and jobs",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: "Main Campus Hall",
        type: "career",
        organizer: admin._id,
        department: "General",
        attendees: [],
      },
    ])

    // Create notifications
    console.log("🔔 Creating notifications...")
    await Notification.insertMany([
      {
        recipient: student._id,
        title: "Assignment Graded",
        message: "Your Python Basics Assignment has been graded. Score: 85/100",
        type: "grade",
        read: false,
        relatedTo: {
          model: "Assignment",
          id: assignments[0]._id,
        },
      },
      {
        recipient: student._id,
        title: "New Assignment Posted",
        message: "React Portfolio Website assignment has been posted. Due in 21 days.",
        type: "assignment",
        read: false,
        relatedTo: {
          model: "Assignment",
          id: assignments[2]._id,
        },
      },
      {
        recipient: student._id,
        title: "Upcoming Event",
        message: "Computer Science Seminar is scheduled for next week. Don't miss it!",
        type: "event",
        read: false,
      },
    ])

    // Create attendance records
    console.log("📊 Creating attendance records...")
    const attendanceRecords = []

    // Create 20 attendance records for each course (simulate a semester)
    for (let i = 0; i < 20; i++) {
      for (const course of courses) {
        const date = new Date()
        date.setDate(date.getDate() - (20 - i)) // Past 20 days

        attendanceRecords.push({
          student: student._id,
          course: course._id,
          date: date,
          status: Math.random() > 0.2 ? "present" : "absent", // 80% attendance rate
          markedBy: course.instructor,
        })
      }
    }

    await Attendance.insertMany(attendanceRecords)

    console.log("✅ Sample data created successfully!")
    console.log("📧 Login credentials:")
    console.log("   Student: jatin@example.com / student123")
    console.log("   Faculty: dr.smith@example.com / student123")
    console.log("   Admin: admin@example.com / student123")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the script
connectDB().then(() => {
  createSampleData()
})
