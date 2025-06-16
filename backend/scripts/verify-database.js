const mongoose = require("mongoose")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Course = require("../models/Course")
const Assignment = require("../models/Assignment")
const Event = require("../models/Event")
const Notification = require("../models/Notification")
const Attendance = require("../models/Attendance")
const Grade = require("../models/Grade")
const Placement = require("../models/Placement")

async function verifyDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart_campus_portal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Check collections
    console.log("\n📊 Database Verification:")

    const users = await User.find({})
    console.log(`👥 Users: ${users.length}`)
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })

    const courses = await Course.find({}).populate("instructor", "name")
    console.log(`\n📚 Courses: ${courses.length}`)
    courses.forEach((course) => {
      console.log(`  - ${course.code}: ${course.title} (Instructor: ${course.instructor.name})`)
    })

    const assignments = await Assignment.find({}).populate("course", "code title")
    console.log(`\n📝 Assignments: ${assignments.length}`)
    assignments.forEach((assignment) => {
      console.log(`  - ${assignment.title} (Course: ${assignment.course.code})`)
    })

    const events = await Event.find({}).populate("organizer", "name")
    console.log(`\n🎉 Events: ${events.length}`)
    events.forEach((event) => {
      console.log(`  - ${event.title} (Organizer: ${event.organizer.name})`)
    })

    const grades = await Grade.find({})
    console.log(`\n📊 Grades: ${grades.length}`)

    const placements = await Placement.find({})
    console.log(`\n💼 Placements: ${placements.length}`)
    placements.forEach((placement) => {
      console.log(`  - ${placement.studentName} at ${placement.company} (${placement.status})`)
    })

    const attendance = await Attendance.find({})
    console.log(`\n📅 Attendance Records: ${attendance.length}`)

    const notifications = await Notification.find({})
    console.log(`\n🔔 Notifications: ${notifications.length}`)

    console.log("\n✅ Database verification completed!")
  } catch (error) {
    console.error("❌ Error verifying database:", error)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the verification function
verifyDatabase()
