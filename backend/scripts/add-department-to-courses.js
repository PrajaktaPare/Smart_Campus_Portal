const mongoose = require("mongoose")
const Course = require("../models/Course")

require("dotenv").config()

const addDepartmentToCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Update all courses without department
    const result = await Course.updateMany(
      { department: { $exists: false } },
      { $set: { department: "Computer Science" } },
    )

    console.log(`Updated ${result.modifiedCount} courses`)

    // Create some sample courses if none exist
    const courseCount = await Course.countDocuments()
    if (courseCount === 0) {
      const sampleCourses = [
        {
          title: "Introduction to Programming",
          code: "CS101",
          description: "Basic programming concepts",
          department: "Computer Science",
          credits: 3,
          isActive: true,
        },
        {
          title: "Data Structures",
          code: "CS201",
          description: "Advanced data structures",
          department: "Computer Science",
          credits: 4,
          isActive: true,
        },
        {
          title: "Calculus I",
          code: "MATH101",
          description: "Differential calculus",
          department: "Mathematics",
          credits: 4,
          isActive: true,
        },
      ]

      await Course.insertMany(sampleCourses)
      console.log("Created sample courses")
    }

    console.log("Done!")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await mongoose.disconnect()
  }
}

addDepartmentToCourses()
