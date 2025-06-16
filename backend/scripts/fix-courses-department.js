const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")

// Load environment variables
require("dotenv").config()

const fixCoursesDepartment = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Check existing courses
    const coursesWithoutDept = await Course.find({
      $or: [{ department: { $exists: false } }, { department: null }, { department: "" }],
    })

    console.log(`📊 Found ${coursesWithoutDept.length} courses without department`)

    if (coursesWithoutDept.length > 0) {
      // Update courses with default departments based on course codes
      for (const course of coursesWithoutDept) {
        let department = "General Studies" // Default

        // Assign departments based on course code patterns
        if (course.code.startsWith("CS") || course.code.startsWith("COMP")) {
          department = "Computer Science"
        } else if (course.code.startsWith("MATH") || course.code.startsWith("MTH")) {
          department = "Mathematics"
        } else if (course.code.startsWith("ENG") || course.code.startsWith("ENGL")) {
          department = "English"
        } else if (course.code.startsWith("PHYS") || course.code.startsWith("PHY")) {
          department = "Physics"
        } else if (course.code.startsWith("CHEM") || course.code.startsWith("CHM")) {
          department = "Chemistry"
        } else if (course.code.startsWith("BIO") || course.code.startsWith("BIOL")) {
          department = "Biology"
        } else if (course.code.startsWith("HIST") || course.code.startsWith("HIS")) {
          department = "History"
        }

        await Course.findByIdAndUpdate(course._id, { department })
        console.log(`✅ Updated ${course.code} - ${course.title} with department: ${department}`)
      }
    }

    // Create some sample courses if none exist
    const totalCourses = await Course.countDocuments()
    if (totalCourses === 0) {
      console.log("📚 No courses found, creating sample courses...")

      const sampleCourses = [
        {
          title: "Introduction to Programming",
          code: "CS101",
          description: "Basic programming concepts and problem-solving techniques",
          credits: 3,
          department: "Computer Science",
          semester: "Fall",
          year: 2024,
          instructor: null, // Will be set later
          students: [],
          isActive: true,
        },
        {
          title: "Data Structures and Algorithms",
          code: "CS201",
          description: "Advanced data structures and algorithmic techniques",
          credits: 4,
          department: "Computer Science",
          semester: "Spring",
          year: 2024,
          instructor: null,
          students: [],
          isActive: true,
        },
        {
          title: "Calculus I",
          code: "MATH101",
          description: "Differential and integral calculus",
          credits: 4,
          department: "Mathematics",
          semester: "Fall",
          year: 2024,
          instructor: null,
          students: [],
          isActive: true,
        },
      ]

      // Find a faculty member to assign as instructor
      const faculty = await User.findOne({ role: "faculty" })
      if (faculty) {
        sampleCourses.forEach((course) => {
          course.instructor = faculty._id
        })
      }

      await Course.insertMany(sampleCourses)
      console.log("✅ Created sample courses")
    }

    console.log("🎉 Course department fix completed!")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

fixCoursesDepartment()
