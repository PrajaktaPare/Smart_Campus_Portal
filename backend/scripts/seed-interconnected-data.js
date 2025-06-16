const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Course = require("../models/Course")
const Assignment = require("../models/Assignment")
const Event = require("../models/Event")
const Announcement = require("../models/Announcement")
const Grade = require("../models/Grade")
const Attendance = require("../models/Attendance")
require("dotenv").config()

const seedInterconnectedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({}),
      Event.deleteMany({}),
      Announcement.deleteMany({}),
      Grade.deleteMany({}),
      Attendance.deleteMany({}),
    ])
    console.log("🗑️ Cleared existing data")

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("password123", salt)

    // 1. Create Users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@smartcampus.edu",
      password: hashedPassword,
      role: "admin",
      employeeId: "EMP001",
      department: "Administration",
    })

    const faculty1 = await User.create({
      name: "Dr. John Smith",
      email: "john.smith@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
      employeeId: "FAC001",
      department: "Computer Science",
    })

    const faculty2 = await User.create({
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
      employeeId: "FAC002",
      department: "Mathematics",
    })

    const student1 = await User.create({
      name: "Alice Wilson",
      email: "alice.wilson@student.smartcampus.edu",
      password: hashedPassword,
      role: "student",
      studentId: "STU001",
      department: "Computer Science",
    })

    const student2 = await User.create({
      name: "Bob Johnson",
      email: "bob.johnson@student.smartcampus.edu",
      password: hashedPassword,
      role: "student",
      studentId: "STU002",
      department: "Computer Science",
    })

    const student3 = await User.create({
      name: "Charlie Brown",
      email: "charlie.brown@student.smartcampus.edu",
      password: hashedPassword,
      role: "student",
      studentId: "STU003",
      department: "Mathematics",
    })

    // Create your specific user
    const yourUser = await User.create({
      name: "Lion User",
      email: "lion@gmail.com",
      password: hashedPassword,
      role: "student",
      studentId: "STU004",
      department: "Computer Science",
    })

    console.log("👥 Created users")

    // 2. Create Courses with Faculty and Students
    const course1 = await Course.create({
      title: "Introduction to Programming",
      code: "CS101",
      description: "Learn the basics of programming with Python",
      instructor: faculty1._id,
      students: [student1._id, student2._id, yourUser._id],
      semester: "Fall 2024",
      year: 2024,
      credits: 3,
    })

    const course2 = await Course.create({
      title: "Data Structures and Algorithms",
      code: "CS201",
      description: "Advanced programming concepts and algorithms",
      instructor: faculty1._id,
      students: [student1._id, yourUser._id],
      semester: "Fall 2024",
      year: 2024,
      credits: 4,
    })

    const course3 = await Course.create({
      title: "Calculus I",
      code: "MATH101",
      description: "Introduction to differential calculus",
      instructor: faculty2._id,
      students: [student2._id, student3._id, yourUser._id],
      semester: "Fall 2024",
      year: 2024,
      credits: 3,
    })

    console.log("📚 Created courses with enrollments")

    // 3. Create Assignments
    const assignment1 = await Assignment.create({
      title: "Python Basics Assignment",
      description: "Complete the basic Python exercises",
      course: course1._id,
      instructor: faculty1._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      submissions: [],
    })

    const assignment2 = await Assignment.create({
      title: "Algorithm Implementation",
      description: "Implement sorting algorithms",
      course: course2._id,
      instructor: faculty1._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalMarks: 150,
      submissions: [],
    })

    const assignment3 = await Assignment.create({
      title: "Calculus Problem Set",
      description: "Solve differential calculus problems",
      course: course3._id,
      instructor: faculty2._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalMarks: 80,
      submissions: [],
    })

    console.log("📝 Created assignments")

    // 4. Create Grades
    await Grade.create({
      student: student1._id,
      course: course1._id,
      assignment: assignment1._id,
      marks: 85,
      totalMarks: 100,
      feedback: "Good work! Keep it up.",
      gradedBy: faculty1._id,
    })

    await Grade.create({
      student: yourUser._id,
      course: course1._id,
      assignment: assignment1._id,
      marks: 92,
      totalMarks: 100,
      feedback: "Excellent work!",
      gradedBy: faculty1._id,
    })

    await Grade.create({
      student: student2._id,
      course: course3._id,
      assignment: assignment3._id,
      marks: 78,
      totalMarks: 80,
      feedback: "Very good understanding of concepts.",
      gradedBy: faculty2._id,
    })

    console.log("🎯 Created grades")

    // 5. Create Attendance Records
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)

    // Attendance for CS101
    await Attendance.create({
      student: student1._id,
      course: course1._id,
      date: yesterday,
      status: "present",
      markedBy: faculty1._id,
    })

    await Attendance.create({
      student: yourUser._id,
      course: course1._id,
      date: yesterday,
      status: "present",
      markedBy: faculty1._id,
    })

    await Attendance.create({
      student: student2._id,
      course: course1._id,
      date: yesterday,
      status: "absent",
      markedBy: faculty1._id,
    })

    // Attendance for CS201
    await Attendance.create({
      student: student1._id,
      course: course2._id,
      date: twoDaysAgo,
      status: "present",
      markedBy: faculty1._id,
    })

    await Attendance.create({
      student: yourUser._id,
      course: course2._id,
      date: twoDaysAgo,
      status: "present",
      markedBy: faculty1._id,
    })

    console.log("📊 Created attendance records")

    // 6. Create Events
    await Event.create({
      title: "Computer Science Seminar",
      description: "Latest trends in AI and Machine Learning",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Auditorium A",
      organizer: faculty1._id,
      attendees: [student1._id, student2._id, yourUser._id],
    })

    await Event.create({
      title: "Math Competition",
      description: "Annual mathematics competition for all students",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: "Math Building",
      organizer: faculty2._id,
      attendees: [student3._id, yourUser._id],
    })

    await Event.create({
      title: "Career Fair",
      description: "Meet with top employers and explore career opportunities",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      location: "Student Center",
      organizer: admin._id,
      attendees: [student1._id, student2._id, student3._id, yourUser._id],
    })

    console.log("🎉 Created events")

    // 7. Create Announcements
    await Announcement.create({
      title: "Welcome to Fall 2024 Semester",
      content:
        "We're excited to welcome all students to the new academic year. Please check your course schedules and prepare for an amazing semester!",
      author: admin._id,
      targetAudience: "all",
      priority: "high",
    })

    await Announcement.create({
      title: "CS101 Assignment Deadline Extended",
      content: "Due to technical issues, the Python Basics Assignment deadline has been extended by 2 days.",
      author: faculty1._id,
      targetAudience: "students",
      priority: "medium",
      course: course1._id,
    })

    await Announcement.create({
      title: "Library Hours Extended",
      content: "The library will now be open 24/7 during exam weeks to support student studies.",
      author: admin._id,
      targetAudience: "all",
      priority: "low",
    })

    console.log("📢 Created announcements")

    console.log("\n🎉 Database seeded successfully with interconnected data!")
    console.log("\n👤 Test Users Created:")
    console.log("📧 Admin: admin@smartcampus.edu / password123")
    console.log("📧 Faculty 1: john.smith@smartcampus.edu / password123")
    console.log("📧 Faculty 2: sarah.johnson@smartcampus.edu / password123")
    console.log("📧 Student 1: alice.wilson@student.smartcampus.edu / password123")
    console.log("📧 Student 2: bob.johnson@student.smartcampus.edu / password123")
    console.log("📧 Student 3: charlie.brown@student.smartcampus.edu / password123")
    console.log("📧 Your User: lion@gmail.com / password123")

    console.log("\n📊 Data Summary:")
    console.log(`👥 Users: ${await User.countDocuments()}`)
    console.log(`📚 Courses: ${await Course.countDocuments()}`)
    console.log(`📝 Assignments: ${await Assignment.countDocuments()}`)
    console.log(`🎯 Grades: ${await Grade.countDocuments()}`)
    console.log(`📊 Attendance: ${await Attendance.countDocuments()}`)
    console.log(`🎉 Events: ${await Event.countDocuments()}`)
    console.log(`📢 Announcements: ${await Announcement.countDocuments()}`)
  } catch (error) {
    console.error("💥 Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

seedInterconnectedData()


