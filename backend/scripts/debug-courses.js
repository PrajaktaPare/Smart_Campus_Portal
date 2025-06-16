const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")

require("dotenv").config()

const debugCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Check total courses
    const totalCourses = await Course.countDocuments()
    console.log(`📊 Total courses in database: ${totalCourses}`)

    if (totalCourses > 0) {
      // Get all courses
      const courses = await Course.find().lean()
      console.log("\n📚 Existing courses:")
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course.code})`)
        console.log(`   Department: ${course.department || "NOT SET"}`)
        console.log(`   Instructor: ${course.instructor || "NOT SET"}`)
        console.log(`   Students: ${course.students?.length || 0}`)
        console.log("")
      })
    } else {
      console.log("❌ No courses found in database")

      // Create sample courses
      console.log("🆕 Creating sample courses...")
      const sampleCourses = [
        {
          title: "Introduction to Programming",
          code: "CS101",
          description: "Basic programming concepts using Python",
          department: "Computer Science",
          credits: 3,
          semester: "Fall",
          year: 2024,
          isActive: true,
          students: [],
        },
        {
          title: "Data Structures and Algorithms",
          code: "CS201",
          description: "Advanced data structures and algorithm design",
          department: "Computer Science",
          credits: 4,
          semester: "Spring",
          year: 2024,
          isActive: true,
          students: [],
        },
        {
          title: "Database Management Systems",
          code: "CS301",
          description: "Relational databases and SQL",
          department: "Computer Science",
          credits: 3,
          semester: "Fall",
          year: 2024,
          isActive: true,
          students: [],
        },
        {
          title: "Calculus I",
          code: "MATH101",
          description: "Differential and integral calculus",
          department: "Mathematics",
          credits: 4,
          semester: "Fall",
          year: 2024,
          isActive: true,
          students: [],
        },
        {
          title: "Physics I",
          code: "PHYS101",
          description: "Classical mechanics and thermodynamics",
          department: "Physics",
          credits: 4,
          semester: "Fall",
          year: 2024,
          isActive: true,
          students: [],
        },
      ]

      await Course.insertMany(sampleCourses)
      console.log(`✅ Created ${sampleCourses.length} sample courses`)
    }

    // Check users
    const totalUsers = await User.countDocuments()
    console.log(`\n👥 Total users in database: ${totalUsers}`)

    if (totalUsers > 0) {
      const students = await User.find({ role: "student" }).lean()
      console.log(`👨‍🎓 Students: ${students.length}`)
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email})`)
        console.log(`   Department: ${student.department || "NOT SET"}`)
        console.log("")
      })
    }

    console.log("✅ Debug complete!")
  } catch (error) {
    console.error("❌ Error:", error.message)
    console.error(error.stack)
  } finally {
    await mongoose.disconnect()
  }
}

debugCourses()
