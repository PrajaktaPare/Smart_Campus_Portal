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

const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]

const seedDepartmentData = async () => {
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

    // 2. Create Faculty for each department
    const facultyUsers = []
    for (let i = 0; i < departments.length; i++) {
      const faculty = await User.create({
        name: `Dr. ${["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "Robert Wilson", "Lisa Anderson", "David Miller"][i]}`,
        email: `faculty${i + 1}@smartcampus.edu`,
        password: hashedPassword,
        role: "faculty",
        department: departments[i],
        employeeId: `FAC00${i + 1}`,
        isFirstLogin: false,
      })
      facultyUsers.push(faculty)
    }

    // 3. Create Students for each department
    const studentUsers = []
    for (let i = 0; i < departments.length; i++) {
      for (let j = 0; j < 3; j++) {
        const student = await User.create({
          name: `${["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"][j]} ${departments[i].split(" ")[0]}`,
          email: `student${i * 3 + j + 1}@student.smartcampus.edu`,
          password: hashedPassword,
          role: "student",
          department: departments[i],
          studentId: `STU${String(i * 3 + j + 1).padStart(3, "0")}`,
          isFirstLogin: j === 0, // First student in each department has first login true
          enrolledCourses: [],
        })
        studentUsers.push(student)
      }
    }

    // Create your specific user
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
    studentUsers.push(yourUser)

    console.log("👥 Created users")

    // 4. Create Courses for each department
    const courses = []
    const courseTemplates = {
      "Computer Science": [
        { code: "CS101", title: "Introduction to Programming", description: "Learn the basics of programming" },
        { code: "CS201", title: "Data Structures", description: "Advanced programming concepts" },
        { code: "CS301", title: "Database Systems", description: "Database design and management" },
      ],
      Mathematics: [
        { code: "MATH101", title: "Calculus I", description: "Introduction to differential calculus" },
        { code: "MATH201", title: "Linear Algebra", description: "Vectors, matrices, and linear transformations" },
        { code: "MATH301", title: "Statistics", description: "Probability and statistical analysis" },
      ],
      Physics: [
        { code: "PHYS101", title: "General Physics I", description: "Mechanics and thermodynamics" },
        { code: "PHYS201", title: "Electromagnetism", description: "Electric and magnetic fields" },
      ],
      Chemistry: [
        { code: "CHEM101", title: "General Chemistry", description: "Basic chemical principles" },
        { code: "CHEM201", title: "Organic Chemistry", description: "Carbon-based compounds" },
      ],
      Biology: [
        { code: "BIO101", title: "General Biology", description: "Introduction to life sciences" },
        { code: "BIO201", title: "Genetics", description: "Heredity and gene expression" },
      ],
      English: [
        { code: "ENG101", title: "English Composition", description: "Writing and communication skills" },
        { code: "ENG201", title: "Literature", description: "Analysis of literary works" },
      ],
      History: [
        { code: "HIST101", title: "World History", description: "Global historical perspectives" },
        { code: "HIST201", title: "Modern History", description: "19th and 20th century events" },
      ],
    }

    for (let i = 0; i < departments.length; i++) {
      const department = departments[i]
      const faculty = facultyUsers[i]
      const departmentCourses = courseTemplates[department] || []

      for (const courseTemplate of departmentCourses) {
        const course = await Course.create({
          ...courseTemplate,
          department,
          instructor: faculty._id,
          students: [], // Will be populated when students enroll
          semester: "Fall 2024",
          year: 2024,
          credits: 3,
          maxStudents: 30,
          isActive: true,
        })
        courses.push(course)
      }
    }

    console.log("📚 Created courses")

    // 5. Auto-enroll some students (except first-login students)
    for (const course of courses) {
      const departmentStudents = studentUsers.filter(
        (student) => student.department === course.department && !student.isFirstLogin,
      )

      // Enroll 1-2 students per course
      const studentsToEnroll = departmentStudents.slice(0, Math.min(2, departmentStudents.length))

      for (const student of studentsToEnroll) {
        course.students.push(student._id)
        student.enrolledCourses.push(course._id)
        await student.save()
      }

      await course.save()
    }

    console.log("🎓 Auto-enrolled students")

    // 6. Create Assignments for courses with enrolled students - FIX: Add createdBy field
    const assignments = []
    for (const course of courses) {
      if (course.students.length > 0) {
        const assignment = await Assignment.create({
          title: `${course.code} Assignment 1`,
          description: `Complete the exercises for ${course.title}`,
          course: course._id,
          createdBy: course.instructor, // FIX: Added the required createdBy field
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalMarks: 100,
          submissions: [],
        })
        assignments.push(assignment)
      }
    }

    console.log("📝 Created assignments")

    // 7. Create some grades
    for (const assignment of assignments.slice(0, 3)) {
      const course = await Course.findById(assignment.course)
      for (const studentId of course.students.slice(0, 2)) {
        const student = await User.findById(studentId)
        const gradeValue = Math.floor(Math.random() * 30) + 70 // Random grade between 70-100

        await Grade.create({
          student: studentId,
          studentId: student.studentId, // Add the required studentId field
          course: course._id,
          assignment: assignment._id,
          marks: gradeValue,
          grade: gradeValue >= 90 ? "A" : gradeValue >= 80 ? "B" : gradeValue >= 70 ? "C" : "D", // Add letter grade
          totalMarks: assignment.totalMarks,
          semester: "Fall 2024", // Add required semester field
          feedback: "Good work!",
          gradedBy: course.instructor,
        })
      }
    }

    console.log("🎯 Created grades")

    // 8. Create Events
    await Event.create({
      title: "Computer Science Seminar",
      description: "Latest trends in AI and Machine Learning",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Auditorium A",
      organizer: facultyUsers[0]._id,
      attendees: studentUsers.filter((s) => s.department === "Computer Science").map((s) => s._id),
    })

    await Event.create({
      title: "Science Fair",
      description: "Annual science exhibition for all departments",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: "Main Hall",
      organizer: admin._id,
      attendees: studentUsers.map((s) => s._id),
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

    console.log("\n🎉 Database seeded successfully with department-based data!")
    console.log("\n👤 Test Users Created:")
    console.log("📧 Admin: admin@smartcampus.edu / password123")
    console.log("📧 Your User: lion@gmail.com / password123 (First Login)")

    console.log("\n🏫 Faculty by Department:")
    for (let i = 0; i < departments.length; i++) {
      console.log(`📧 ${departments[i]}: faculty${i + 1}@smartcampus.edu / password123`)
    }

    console.log("\n🎓 Students by Department:")
    for (let i = 0; i < departments.length; i++) {
      console.log(`📧 ${departments[i]}: student${i * 3 + 1}@student.smartcampus.edu / password123 (First Login)`)
      console.log(`📧 ${departments[i]}: student${i * 3 + 2}@student.smartcampus.edu / password123`)
      console.log(`📧 ${departments[i]}: student${i * 3 + 3}@student.smartcampus.edu / password123`)
    }

    console.log("\n📊 Data Summary:")
    console.log(`👥 Users: ${await User.countDocuments()}`)
    console.log(`📚 Courses: ${await Course.countDocuments()}`)
    console.log(`📝 Assignments: ${await Assignment.countDocuments()}`)
    console.log(`🎯 Grades: ${await Grade.countDocuments()}`)
    console.log(`🎉 Events: ${await Event.countDocuments()}`)
    console.log(`📢 Announcements: ${await Announcement.countDocuments()}`)
  } catch (error) {
    console.error("💥 Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

seedDepartmentData()
