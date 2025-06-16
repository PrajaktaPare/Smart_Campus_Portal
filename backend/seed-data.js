const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("./models/User")
const Course = require("./models/Course")
const Assignment = require("./models/Assignment")
const Attendance = require("./models/Attendance")
const Grade = require("./models/Grade")
const Event = require("./models/Event")
const Notification = require("./models/Notification")

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({}),
      Event.deleteMany({}),
      Notification.deleteMany({}),
    ])
    console.log("🗑️ Cleared existing data")

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10)

    const users = await User.insertMany([
      // Admin
      {
        name: "Admin User",
        email: "admin@smartcampus.edu",
        password: hashedPassword,
        role: "admin",
        studentId: "ADMIN001",
      },
      // Faculty
      {
        name: "Dr. John Smith",
        email: "john.smith@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        department: "Computer Science",
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        department: "Mathematics",
      },
      {
        name: "Dr. Michael Brown",
        email: "michael.brown@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        department: "Physics",
      },
      // Students
      {
        name: "Alice Wilson",
        email: "alice.wilson@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        studentId: "CS2024001",
        department: "Computer Science",
        year: 3,
      },
      {
        name: "Bob Davis",
        email: "bob.davis@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        studentId: "CS2024002",
        department: "Computer Science",
        year: 2,
      },
      {
        name: "Carol Martinez",
        email: "carol.martinez@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        studentId: "MATH2024001",
        department: "Mathematics",
        year: 4,
      },
      {
        name: "David Lee",
        email: "david.lee@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        studentId: "PHY2024001",
        department: "Physics",
        year: 1,
      },
      {
        name: "Emma Thompson",
        email: "emma.thompson@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        studentId: "CS2024003",
        department: "Computer Science",
        year: 3,
      },
    ])

    console.log(`✅ Created ${users.length} users`)

    // Get user references
    const admin = users.find((u) => u.role === "admin")
    const faculty = users.filter((u) => u.role === "faculty")
    const students = users.filter((u) => u.role === "student")

    // Create courses
    const courses = await Course.insertMany([
      {
        name: "Data Structures and Algorithms",
        code: "CS301",
        description: "Fundamental data structures and algorithms",
        instructor: faculty[0]._id,
        students: [students[0]._id, students[1]._id, students[4]._id],
        credits: 4,
        semester: "Fall 2024",
      },
      {
        name: "Database Management Systems",
        code: "CS401",
        description: "Design and implementation of database systems",
        instructor: faculty[0]._id,
        students: [students[0]._id, students[4]._id],
        credits: 3,
        semester: "Fall 2024",
      },
      {
        name: "Linear Algebra",
        code: "MATH201",
        description: "Vector spaces, matrices, and linear transformations",
        instructor: faculty[1]._id,
        students: [students[2]._id, students[0]._id],
        credits: 3,
        semester: "Fall 2024",
      },
      {
        name: "Quantum Physics",
        code: "PHY301",
        description: "Introduction to quantum mechanics",
        instructor: faculty[2]._id,
        students: [students[3]._id],
        credits: 4,
        semester: "Fall 2024",
      },
      {
        name: "Web Development",
        code: "CS201",
        description: "Modern web development technologies",
        instructor: faculty[0]._id,
        students: [students[1]._id, students[4]._id],
        credits: 3,
        semester: "Fall 2024",
      },
    ])

    console.log(`✅ Created ${courses.length} courses`)

    // Create assignments
    const assignments = await Assignment.insertMany([
      {
        title: "Binary Search Tree Implementation",
        description: "Implement a binary search tree with insert, delete, and search operations",
        course: courses[0]._id,
        instructor: faculty[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 100,
        type: "programming",
      },
      {
        title: "Database Design Project",
        description: "Design a database schema for an e-commerce application",
        course: courses[1]._id,
        instructor: faculty[0]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxPoints: 150,
        type: "project",
      },
      {
        title: "Matrix Operations Quiz",
        description: "Quiz on matrix multiplication and determinants",
        course: courses[2]._id,
        instructor: faculty[1]._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        maxPoints: 50,
        type: "quiz",
      },
      {
        title: "Quantum States Problem Set",
        description: "Solve problems related to quantum state superposition",
        course: courses[3]._id,
        instructor: faculty[2]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxPoints: 75,
        type: "homework",
      },
      {
        title: "React Component Development",
        description: "Build a responsive React component library",
        course: courses[4]._id,
        instructor: faculty[0]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        maxPoints: 120,
        type: "project",
      },
    ])

    console.log(`✅ Created ${assignments.length} assignments`)

    // Create attendance records
    const attendanceRecords = []
    const today = new Date()

    // Create 10 days of attendance for each course
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      for (const course of courses) {
        for (const studentId of course.students) {
          attendanceRecords.push({
            student: studentId,
            course: course._id,
            date: date,
            status: Math.random() > 0.2 ? "present" : "absent", // 80% attendance rate
            markedBy: course.instructor,
          })
        }
      }
    }

    await Attendance.insertMany(attendanceRecords)
    console.log(`✅ Created ${attendanceRecords.length} attendance records`)

    // Create grades
    const grades = []
    for (const assignment of assignments) {
      const course = courses.find((c) => c._id.equals(assignment.course))
      for (const studentId of course.students) {
        const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100
        grades.push({
          student: studentId,
          course: course._id,
          assignment: assignment._id,
          score: score,
          maxScore: assignment.maxPoints,
          gradedBy: assignment.instructor,
          gradedAt: new Date(),
        })
      }
    }

    await Grade.insertMany(grades)
    console.log(`✅ Created ${grades.length} grades`)

    // Create events
    const events = await Event.insertMany([
      {
        title: "Fall Semester Orientation",
        description: "Welcome event for new students",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: "Main Auditorium",
        type: "academic",
        createdBy: admin._id,
      },
      {
        title: "Computer Science Department Seminar",
        description: "Latest trends in AI and Machine Learning",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: "CS Building Room 101",
        type: "seminar",
        createdBy: faculty[0]._id,
      },
      {
        title: "Mathematics Competition",
        description: "Annual inter-college mathematics competition",
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: "Mathematics Department",
        type: "competition",
        createdBy: faculty[1]._id,
      },
      {
        title: "Physics Lab Open House",
        description: "Explore our state-of-the-art physics laboratories",
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: "Physics Lab Complex",
        type: "open-house",
        createdBy: faculty[2]._id,
      },
      {
        title: "Career Fair 2024",
        description: "Meet with top employers and explore career opportunities",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: "Student Center",
        type: "career",
        createdBy: admin._id,
      },
    ])

    console.log(`✅ Created ${events.length} events`)

    // Create notifications
    const notifications = []
    for (const student of students) {
      notifications.push(
        {
          recipient: student._id,
          title: "Welcome to Smart Campus Portal",
          message: "Your account has been successfully created. Explore all the features available to you.",
          type: "welcome",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          recipient: student._id,
          title: "New Assignment Posted",
          message: "A new assignment has been posted in one of your courses. Check your dashboard for details.",
          type: "assignment",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          recipient: student._id,
          title: "Upcoming Event Reminder",
          message: "Don't forget about the upcoming events this week. Check the events section for more details.",
          type: "event",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          recipient: student._id,
          title: "Grade Updated",
          message: "Your grade for a recent assignment has been updated. Check your grades section.",
          type: "grade",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          recipient: student._id,
          title: "Attendance Reminder",
          message: "Your attendance percentage is below 85%. Please ensure regular attendance.",
          type: "attendance",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      )
    }

    await Notification.insertMany(notifications)
    console.log(`✅ Created ${notifications.length} notifications`)

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Test Credentials:")
    console.log("👨‍💼 Admin: admin@smartcampus.edu / password123")
    console.log("👨‍🏫 Faculty: john.smith@smartcampus.edu / password123")
    console.log("👩‍🎓 Student: alice.wilson@student.smartcampus.edu / password123")
    console.log("\n🔗 You can now start the servers and test the application!")
  } catch (error) {
    console.error("💥 Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("📡 Disconnected from MongoDB")
    process.exit(0)
  }
}

// Run the seeding function
seedDatabase()
