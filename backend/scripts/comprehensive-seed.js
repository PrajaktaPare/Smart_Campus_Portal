const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import all models
const User = require("../models/User")
const Course = require("../models/Course")
const Assignment = require("../models/Assignment")
const Attendance = require("../models/Attendance")
const Grade = require("../models/Grade")
const Event = require("../models/Event")
const Notification = require("../models/Notification")

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting comprehensive database seeding...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({}),
      Event.deleteMany({}),
      Notification.deleteMany({}),
    ])

    // Create Users
    console.log("👥 Creating users...")
    const hashedPassword = await bcrypt.hash("password123", 10)

    const users = await User.create([
      // Admin
      {
        name: "Admin User",
        email: "admin@smartcampus.edu",
        password: hashedPassword,
        role: "admin",
        phone: "555-0001",
        address: "123 Admin St, Campus City, CC 12345",
      },
      // Faculty
      {
        name: "Dr. John Smith",
        email: "john.smith@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        phone: "555-0002",
        address: "456 Faculty Ave, Campus City, CC 12345",
        department: "Computer Science",
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        phone: "555-0003",
        address: "789 Professor Blvd, Campus City, CC 12345",
        department: "Mathematics",
      },
      {
        name: "Dr. Michael Brown",
        email: "michael.brown@smartcampus.edu",
        password: hashedPassword,
        role: "faculty",
        phone: "555-0004",
        address: "321 Teacher Lane, Campus City, CC 12345",
        department: "Physics",
      },
      // Students
      {
        name: "Alice Wilson",
        email: "alice.wilson@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        phone: "555-1001",
        address: "100 Student Dorm A, Campus City, CC 12345",
        studentId: "STU001",
        year: 3,
        major: "Computer Science",
      },
      {
        name: "Bob Davis",
        email: "bob.davis@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        phone: "555-1002",
        address: "101 Student Dorm A, Campus City, CC 12345",
        studentId: "STU002",
        year: 2,
        major: "Computer Science",
      },
      {
        name: "Carol Martinez",
        email: "carol.martinez@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        phone: "555-1003",
        address: "102 Student Dorm B, Campus City, CC 12345",
        studentId: "STU003",
        year: 4,
        major: "Mathematics",
      },
      {
        name: "David Lee",
        email: "david.lee@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        phone: "555-1004",
        address: "103 Student Dorm B, Campus City, CC 12345",
        studentId: "STU004",
        year: 1,
        major: "Physics",
      },
      {
        name: "Emma Thompson",
        email: "emma.thompson@student.smartcampus.edu",
        password: hashedPassword,
        role: "student",
        phone: "555-1005",
        address: "104 Student Dorm C, Campus City, CC 12345",
        studentId: "STU005",
        year: 3,
        major: "Computer Science",
      },
    ])

    console.log(`✅ Created ${users.length} users`)

    // Get user references
    const admin = users.find((u) => u.role === "admin")
    const faculty = users.filter((u) => u.role === "faculty")
    const students = users.filter((u) => u.role === "student")
    const johnSmith = faculty.find((f) => f.email === "john.smith@smartcampus.edu")
    const sarahJohnson = faculty.find((f) => f.email === "sarah.johnson@smartcampus.edu")
    const michaelBrown = faculty.find((f) => f.email === "michael.brown@smartcampus.edu")

    // Create Courses
    console.log("📚 Creating courses...")
    const courses = await Course.create([
      {
        code: "CS101",
        title: "Introduction to Programming",
        description: "Learn the fundamentals of programming using Python",
        instructor: johnSmith._id,
        semester: "Fall",
        year: 2024,
        credits: 3,
        students: [students[0]._id, students[1]._id, students[4]._id],
        materials: [
          {
            title: "Course Syllabus",
            description: "Complete course syllabus and schedule",
            fileUrl: "/materials/cs101-syllabus.pdf",
            uploadedAt: new Date(),
          },
          {
            title: "Python Basics Guide",
            description: "Introduction to Python programming",
            fileUrl: "/materials/python-basics.pdf",
            uploadedAt: new Date(),
          },
        ],
      },
      {
        code: "CS201",
        title: "Data Structures and Algorithms",
        description: "Advanced programming concepts and algorithm design",
        instructor: johnSmith._id,
        semester: "Fall",
        year: 2024,
        credits: 4,
        students: [students[0]._id, students[4]._id],
        materials: [
          {
            title: "Algorithm Analysis",
            description: "Big O notation and complexity analysis",
            fileUrl: "/materials/algorithm-analysis.pdf",
            uploadedAt: new Date(),
          },
        ],
      },
      {
        code: "MATH201",
        title: "Calculus II",
        description: "Integral calculus and applications",
        instructor: sarahJohnson._id,
        semester: "Fall",
        year: 2024,
        credits: 4,
        students: [students[2]._id, students[3]._id],
        materials: [
          {
            title: "Integration Techniques",
            description: "Methods of integration",
            fileUrl: "/materials/integration.pdf",
            uploadedAt: new Date(),
          },
        ],
      },
      {
        code: "PHYS101",
        title: "General Physics I",
        description: "Mechanics and thermodynamics",
        instructor: michaelBrown._id,
        semester: "Fall",
        year: 2024,
        credits: 4,
        students: [students[3]._id, students[1]._id],
        materials: [
          {
            title: "Physics Lab Manual",
            description: "Laboratory experiments and procedures",
            fileUrl: "/materials/physics-lab.pdf",
            uploadedAt: new Date(),
          },
        ],
      },
      {
        code: "CS301",
        title: "Database Systems",
        description: "Database design and management",
        instructor: johnSmith._id,
        semester: "Fall",
        year: 2024,
        credits: 3,
        students: [students[0]._id, students[4]._id],
        materials: [],
      },
    ])

    console.log(`✅ Created ${courses.length} courses`)

    // Create Assignments
    console.log("📝 Creating assignments...")
    const assignments = []

    for (const course of courses) {
      const courseAssignments = await Assignment.create([
        {
          title: `${course.code} - Assignment 1`,
          description: `First assignment for ${course.title}`,
          course: course._id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          totalMarks: 100,
          createdBy: course.instructor,
          submissions: course.students.map((studentId, index) => ({
            student: studentId,
            submittedAt: index < 2 ? new Date() : null,
            fileUrl: index < 2 ? `/submissions/${course.code}-assignment1-${index}.pdf` : null,
            status: index < 2 ? "submitted" : "pending",
            marks: index === 0 ? 85 : index === 1 ? 92 : null,
            feedback: index === 0 ? "Good work!" : index === 1 ? "Excellent!" : null,
          })),
        },
        {
          title: `${course.code} - Assignment 2`,
          description: `Second assignment for ${course.title}`,
          course: course._id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          totalMarks: 100,
          createdBy: course.instructor,
          submissions: course.students.map((studentId) => ({
            student: studentId,
            submittedAt: null,
            fileUrl: null,
            status: "pending",
            marks: null,
            feedback: null,
          })),
        },
      ])
      assignments.push(...courseAssignments)
    }

    console.log(`✅ Created ${assignments.length} assignments`)

    // Create Attendance Records
    console.log("📊 Creating attendance records...")
    const attendanceRecords = []

    for (const course of courses) {
      // Create attendance for the last 10 days
      for (let i = 0; i < 10; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const attendance = await Attendance.create({
          course: course._id,
          date: date,
          markedBy: course.instructor,
          records: course.students.map((studentId, index) => ({
            student: studentId,
            status: Math.random() > 0.2 ? "present" : "absent", // 80% attendance rate
            remark: Math.random() > 0.8 ? "Late arrival" : "",
          })),
        })
        attendanceRecords.push(attendance)
      }
    }

    console.log(`✅ Created ${attendanceRecords.length} attendance records`)

    // Create Grades
    console.log("🎓 Creating grades...")
    const grades = []

    for (const course of courses) {
      for (const studentId of course.students) {
        const gradeValues = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"]
        const randomGrade = gradeValues[Math.floor(Math.random() * gradeValues.length)]

        const grade = await Grade.create({
          student: studentId,
          course: course._id,
          grade: randomGrade,
          semester: course.semester,
          year: course.year,
          gradedBy: course.instructor,
        })
        grades.push(grade)
      }
    }

    console.log(`✅ Created ${grades.length} grades`)

    // Create Events
    console.log("🎉 Creating events...")
    const events = await Event.create([
      {
        title: "Welcome Week",
        description: "Orientation for new students",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: "Main Auditorium",
        type: "orientation",
        createdBy: admin._id,
        attendees: [students[3]._id], // New student
      },
      {
        title: "Career Fair",
        description: "Meet with potential employers",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: "Student Center",
        type: "career",
        createdBy: admin._id,
        attendees: [students[0]._id, students[2]._id, students[4]._id],
      },
      {
        title: "Tech Talk: AI in Education",
        description: "Guest speaker on artificial intelligence",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: "CS Building Room 101",
        type: "academic",
        createdBy: johnSmith._id,
        attendees: [students[0]._id, students[1]._id, students[4]._id],
      },
      {
        title: "Math Competition",
        description: "Annual mathematics competition",
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: "Math Building",
        type: "competition",
        createdBy: sarahJohnson._id,
        attendees: [students[2]._id],
      },
      {
        title: "Physics Lab Open House",
        description: "Tour of physics laboratories",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: "Physics Lab",
        type: "academic",
        createdBy: michaelBrown._id,
        attendees: [students[3]._id, students[1]._id],
      },
    ])

    console.log(`✅ Created ${events.length} events`)

    // Create Notifications
    console.log("🔔 Creating notifications...")
    const notifications = []

    // Create notifications for each student
    for (const student of students) {
      const studentNotifications = await Notification.create([
        {
          recipient: student._id,
          sender: admin._id,
          title: "Welcome to Smart Campus Portal",
          message: "Welcome to the new academic year! Please check your course schedule.",
          type: "system",
          read: false,
        },
        {
          recipient: student._id,
          sender: johnSmith._id,
          title: "New Assignment Posted",
          message: "A new assignment has been posted for CS101. Due date: Next week.",
          type: "assignment",
          read: Math.random() > 0.5,
        },
        {
          recipient: student._id,
          sender: admin._id,
          title: "Upcoming Event",
          message: "Don't forget about the Career Fair next week!",
          type: "event",
          read: Math.random() > 0.5,
        },
        {
          recipient: student._id,
          sender: sarahJohnson._id,
          title: "Grade Posted",
          message: "Your grade for MATH201 Assignment 1 has been posted.",
          type: "grade",
          read: Math.random() > 0.3,
        },
        {
          recipient: student._id,
          sender: michaelBrown._id,
          title: "Attendance Alert",
          message: "Your attendance in PHYS101 is below 75%. Please attend regularly.",
          type: "attendance",
          read: false,
        },
      ])
      notifications.push(...studentNotifications)
    }

    console.log(`✅ Created ${notifications.length} notifications`)

    // Summary
    console.log("\n🎉 Database seeding completed successfully!")
    console.log("=" * 50)
    console.log(`👥 Users: ${users.length}`)
    console.log(`📚 Courses: ${courses.length}`)
    console.log(`📝 Assignments: ${assignments.length}`)
    console.log(`📊 Attendance Records: ${attendanceRecords.length}`)
    console.log(`🎓 Grades: ${grades.length}`)
    console.log(`🎉 Events: ${events.length}`)
    console.log(`🔔 Notifications: ${notifications.length}`)
    console.log("=" * 50)

    console.log("\n🔑 Test Login Credentials:")
    console.log("Student: alice.wilson@student.smartcampus.edu / password123")
    console.log("Faculty: john.smith@smartcampus.edu / password123")
    console.log("Admin: admin@smartcampus.edu / password123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
