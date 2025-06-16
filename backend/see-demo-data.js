const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
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

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/smart_campus_portal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Clear existing data
    console.log("🗑️ Clearing existing data...")
    await User.deleteMany({})
    await Course.deleteMany({})
    await Assignment.deleteMany({})
    await Event.deleteMany({})
    await Notification.deleteMany({})
    await Attendance.deleteMany({})
    await Grade.deleteMany({})
    await Placement.deleteMany({})

    console.log("✅ Existing data cleared")

    // Create Users
    console.log("👥 Creating users...")

    const hashedPassword = await bcrypt.hash("password123", 10)

    // Admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@smartcampus.edu",
      password: hashedPassword,
      role: "admin",
    })
    await admin.save()
    console.log("✅ Admin user created")

    // Faculty users
    const faculty1 = new User({
      name: "Dr. John Smith",
      email: "john.smith@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
    })
    await faculty1.save()

    const faculty2 = new User({
      name: "Prof. Sarah Johnson",
      email: "sarah.johnson@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
    })
    await faculty2.save()

    const faculty3 = new User({
      name: "Dr. Michael Brown",
      email: "michael.brown@smartcampus.edu",
      password: hashedPassword,
      role: "faculty",
    })
    await faculty3.save()

    console.log("✅ Faculty users created")

    // Student users
    const students = []
    const studentData = [
      { name: "Alice Wilson", email: "alice.wilson@student.smartcampus.edu" },
      { name: "Bob Davis", email: "bob.davis@student.smartcampus.edu" },
      { name: "Charlie Brown", email: "charlie.brown@student.smartcampus.edu" },
      { name: "Diana Prince", email: "diana.prince@student.smartcampus.edu" },
      { name: "Edward Norton", email: "edward.norton@student.smartcampus.edu" },
      { name: "Fiona Green", email: "fiona.green@student.smartcampus.edu" },
      { name: "George Miller", email: "george.miller@student.smartcampus.edu" },
      { name: "Hannah White", email: "hannah.white@student.smartcampus.edu" },
      { name: "Ian Black", email: "ian.black@student.smartcampus.edu" },
      { name: "Julia Roberts", email: "julia.roberts@student.smartcampus.edu" },
    ]

    for (const studentInfo of studentData) {
      const student = new User({
        name: studentInfo.name,
        email: studentInfo.email,
        password: hashedPassword,
        role: "student",
      })
      await student.save()
      students.push(student)
    }

    console.log("✅ Student users created")

    // Create Courses
    console.log("📚 Creating courses...")

    const course1 = new Course({
      code: "CS101",
      title: "Introduction to Computer Science",
      description: "Basic concepts of computer science and programming",
      instructor: faculty1._id,
      students: students.slice(0, 5).map((s) => s._id),
      semester: "Fall",
      year: 2024,
      credits: 3,
      schedule: [
        { day: "Monday", startTime: "09:00", endTime: "10:30", room: "CS-101" },
        { day: "Wednesday", startTime: "09:00", endTime: "10:30", room: "CS-101" },
        { day: "Friday", startTime: "09:00", endTime: "10:30", room: "CS-101" },
      ],
    })
    await course1.save()

    const course2 = new Course({
      code: "MATH201",
      title: "Calculus II",
      description: "Advanced calculus concepts and applications",
      instructor: faculty2._id,
      students: students.slice(2, 7).map((s) => s._id),
      semester: "Fall",
      year: 2024,
      credits: 4,
      schedule: [
        { day: "Tuesday", startTime: "10:00", endTime: "11:30", room: "MATH-201" },
        { day: "Thursday", startTime: "10:00", endTime: "11:30", room: "MATH-201" },
      ],
    })
    await course2.save()

    const course3 = new Course({
      code: "PHYS301",
      title: "Quantum Physics",
      description: "Introduction to quantum mechanics and modern physics",
      instructor: faculty3._id,
      students: students.slice(5, 10).map((s) => s._id),
      semester: "Fall",
      year: 2024,
      credits: 3,
      schedule: [
        { day: "Monday", startTime: "14:00", endTime: "15:30", room: "PHYS-301" },
        { day: "Wednesday", startTime: "14:00", endTime: "15:30", room: "PHYS-301" },
      ],
    })
    await course3.save()

    console.log("✅ Courses created")

    // Create Assignments
    console.log("📝 Creating assignments...")

    const assignment1 = new Assignment({
      title: "Programming Basics",
      description: "Write a simple program demonstrating basic programming concepts",
      course: course1._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalMarks: 100,
      createdBy: faculty1._id,
      submissions: [],
    })
    await assignment1.save()

    const assignment2 = new Assignment({
      title: "Calculus Problem Set",
      description: "Solve the given calculus problems from chapter 5",
      course: course2._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      totalMarks: 50,
      createdBy: faculty2._id,
      submissions: [],
    })
    await assignment2.save()

    console.log("✅ Assignments created")

    // Create Events
    console.log("🎉 Creating events...")

    const event1 = new Event({
      title: "Tech Conference 2024",
      description: "Annual technology conference featuring latest innovations",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: "Main Auditorium",
      organizer: admin._id,
      attendees: [],
    })
    await event1.save()

    const event2 = new Event({
      title: "Career Fair",
      description: "Meet with top employers and explore career opportunities",
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      location: "Student Center",
      organizer: admin._id,
      attendees: [],
    })
    await event2.save()

    console.log("✅ Events created")

    // Create Grades
    console.log("📊 Creating grades...")

    for (let i = 0; i < 5; i++) {
      const grade = new Grade({
        studentId: students[i]._id,
        course: "CS101",
        grade: ["A", "B+", "A-", "B", "A"][i],
        semester: "Fall 2024",
      })
      await grade.save()
    }

    console.log("✅ Grades created")

    // Create Placements
    console.log("💼 Creating placements...")

    const placements = [
      { student: students[0], company: "Google", role: "Software Engineer", status: "Placed" },
      { student: students[1], company: "Microsoft", role: "Data Analyst", status: "Placed" },
      { student: students[2], company: "Amazon", role: "Cloud Engineer", status: "Interview Scheduled" },
      { student: students[3], company: "Apple", role: "iOS Developer", status: "Applied" },
      { student: students[4], company: "Meta", role: "Frontend Developer", status: "Placed" },
    ]

    for (const placementData of placements) {
      const placement = new Placement({
        studentId: placementData.student._id,
        studentName: placementData.student.name,
        company: placementData.company,
        role: placementData.role,
        status: placementData.status,
      })
      await placement.save()
    }

    console.log("✅ Placements created")

    // Create Attendance Records
    console.log("📅 Creating attendance records...")

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const attendance1 = new Attendance({
      course: course1._id,
      date: yesterday,
      markedBy: faculty1._id,
      records: course1.students.map((studentId, index) => ({
        student: studentId,
        status: index % 3 === 0 ? "absent" : "present",
        remark: index % 3 === 0 ? "Sick leave" : "",
      })),
    })
    await attendance1.save()

    console.log("✅ Attendance records created")

    // Create Notifications
    console.log("🔔 Creating notifications...")

    for (const student of students.slice(0, 3)) {
      const notification = new Notification({
        recipient: student._id,
        sender: admin._id,
        title: "Welcome to Smart Campus Portal",
        message: "Welcome to the new academic year! Please check your course schedule.",
        type: "system",
      })
      await notification.save()
    }

    console.log("✅ Notifications created")

    console.log("🎉 Database seeding completed successfully!")

    // Display summary
    const userCount = await User.countDocuments()
    const courseCount = await Course.countDocuments()
    const assignmentCount = await Assignment.countDocuments()
    const eventCount = await Event.countDocuments()
    const gradeCount = await Grade.countDocuments()
    const placementCount = await Placement.countDocuments()
    const attendanceCount = await Attendance.countDocuments()
    const notificationCount = await Notification.countDocuments()

    console.log("\n📊 Database Summary:")
    console.log(`👥 Users: ${userCount}`)
    console.log(`📚 Courses: ${courseCount}`)
    console.log(`📝 Assignments: ${assignmentCount}`)
    console.log(`🎉 Events: ${eventCount}`)
    console.log(`📊 Grades: ${gradeCount}`)
    console.log(`💼 Placements: ${placementCount}`)
    console.log(`📅 Attendance Records: ${attendanceCount}`)
    console.log(`🔔 Notifications: ${notificationCount}`)

    console.log("\n🔑 Login Credentials:")
    console.log("Admin: admin@smartcampus.edu / password123")
    console.log("Faculty: john.smith@smartcampus.edu / password123")
    console.log("Student: alice.wilson@student.smartcampus.edu / password123")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the seeding function
seedDatabase()
