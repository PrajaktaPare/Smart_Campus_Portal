const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Course = require("../models/Course")
const Assignment = require("../models/Assignment")
const Event = require("../models/Event")
const Announcement = require("../models/Announcement")
require("dotenv").config()

const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]

const simpleSeed = async () => {
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
    ])
    console.log("🗑️ Cleared existing data")

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("password123", salt)

    // 1. Create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@smartcampus.edu",
      password: hashedPassword,
      role: "admin",
      department: "Administration",
      employeeId: "EMP001",
      isFirstLogin: false,
    })

    // 2. Create Faculty for Computer Science
    const faculty = await User.create({
      name: "Dr. John Smith",
      email: "faculty1@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
      department: "Computer Science",
      employeeId: "FAC001",
      isFirstLogin: false,
    })

    // 3. Create your specific user
    const yourUser = await User.create({
      name: "Cat User",
      email: "lion@gmail.com",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      studentId: "STU999",
      isFirstLogin: true,
      enrolledCourses: [],
    })

    // 4. Create a few more students
    const student1 = await User.create({
      name: "Alice Johnson",
      email: "alice@student.smartcampus.edu",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      studentId: "STU001",
      isFirstLogin: false,
      enrolledCourses: [],
    })

    const student2 = await User.create({
      name: "Bob Wilson",
      email: "bob@student.smartcampus.edu",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      studentId: "STU002",
      isFirstLogin: false,
      enrolledCourses: [],
    })

    console.log("👥 Created users")

    // 5. Create Computer Science Courses
    const course1 = await Course.create({
      code: "CS101",
      title: "Introduction to Programming",
      description: "Learn the basics of programming with Python",
      department: "Computer Science",
      instructor: faculty._id,
      students: [student1._id, student2._id], // Pre-enroll some students
      semester: "Fall 2024",
      year: 2024,
      credits: 3,
      maxStudents: 30,
      isActive: true,
    })

    const course2 = await Course.create({
      code: "CS201",
      title: "Data Structures",
      description: "Advanced programming concepts and data structures",
      department: "Computer Science",
      instructor: faculty._id,
      students: [student1._id],
      semester: "Fall 2024",
      year: 2024,
      credits: 3,
      maxStudents: 30,
      isActive: true,
    })

    const course3 = await Course.create({
      code: "CS301",
      title: "Database Systems",
      description: "Database design and management",
      department: "Computer Science",
      instructor: faculty._id,
      students: [],
      semester: "Fall 2024",
      year: 2024,
      credits: 3,
      maxStudents: 30,
      isActive: true,
    })

    console.log("📚 Created courses")

    // 6. Update student enrolled courses
    await User.findByIdAndUpdate(student1._id, { enrolledCourses: [course1._id, course2._id] })
    await User.findByIdAndUpdate(student2._id, { enrolledCourses: [course1._id] })

    console.log("🎓 Updated student enrollments")

    // 7. Create Assignments
    const assignment1 = await Assignment.create({
      title: "CS101 Assignment 1 - Hello World",
      description: "Create your first Python program",
      course: course1._id,
      createdBy: faculty._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      submissions: [],
    })

    const assignment2 = await Assignment.create({
      title: "CS201 Assignment 1 - Arrays and Lists",
      description: "Implement basic data structures",
      course: course2._id,
      createdBy: faculty._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      submissions: [],
    })

    console.log("📝 Created assignments")

    // 8. Create Events
    await Event.create({
      title: "Computer Science Seminar",
      description: "Latest trends in AI and Machine Learning",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Auditorium A",
      organizer: faculty._id,
      attendees: [yourUser._id, student1._id, student2._id],
    })

    console.log("🎉 Created events")

    // 9. Create Announcements
    await Announcement.create({
      title: "Welcome to Fall 2024 Semester",
      content: "We're excited to welcome all students to the new academic year!",
      author: admin._id,
      targetAudience: "all",
      priority: "high",
    })

    await Announcement.create({
      title: "Course Enrollment Open",
      content: "Students can now enroll in courses for the Fall 2024 semester.",
      author: admin._id,
      targetAudience: "students",
      priority: "medium",
    })

    console.log("📢 Created announcements")

    console.log("\n🎉 Database seeded successfully!")
    console.log("\n👤 Test Users Created:")
    console.log("📧 Admin: admin@smartcampus.edu / password123")
    console.log("📧 Faculty: faculty1@smartcampus.edu / password123")
    console.log("📧 Your User: lion@gmail.com / password123 (First Login)")
    console.log("📧 Student 1: alice@student.smartcampus.edu / password123")
    console.log("📧 Student 2: bob@student.smartcampus.edu / password123")

    console.log("\n📊 Data Summary:")
    console.log(`👥 Users: ${await User.countDocuments()}`)
    console.log(`📚 Courses: ${await Course.countDocuments()}`)
    console.log(`📝 Assignments: ${await Assignment.countDocuments()}`)
    console.log(`🎉 Events: ${await Event.countDocuments()}`)
    console.log(`📢 Announcements: ${await Announcement.countDocuments()}`)
  } catch (error) {
    console.error("💥 Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

simpleSeed()
