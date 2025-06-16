const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")

// Load environment variables
require("dotenv").config()

const testAvailableCourses = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Check if courses exist
    const totalCourses = await Course.countDocuments()
    console.log("📊 Total courses in database:", totalCourses)

    // Check courses with department field
    const coursesWithDept = await Course.countDocuments({ department: { $exists: true } })
    console.log("📊 Courses with department field:", coursesWithDept)

    // Get sample courses
    const sampleCourses = await Course.find().limit(3).lean()
    console.log("📚 Sample courses:")
    sampleCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.code}) - Department: ${course.department || "NOT SET"}`)
    })

    // Check users
    const totalUsers = await User.countDocuments()
    console.log("👥 Total users in database:", totalUsers)

    // Get sample student
    const sampleStudent = await User.findOne({ role: "student" }).lean()
    if (sampleStudent) {
      console.log("👨‍🎓 Sample student:", sampleStudent.name, "- Department:", sampleStudent.department || "NOT SET")
    }

    // Test the query that's failing
    console.log("\n🧪 Testing available courses query...")
    const filter = { department: "Computer Science" }
    const testCourses = await Course.find(filter).populate("instructor", "name email").lean()
    console.log("📚 Courses found with filter:", testCourses.length)

    if (testCourses.length === 0) {
      console.log("⚠️  No courses found with department 'Computer Science'")
      console.log("🔧 Let's check what departments exist...")

      const departments = await Course.distinct("department")
      console.log("🏢 Departments in database:", departments)
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

testAvailableCourses()
