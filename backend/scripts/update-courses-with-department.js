const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/smartcampus"
    await mongoose.connect(mongoURI)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

const updateCoursesWithDepartment = async () => {
  try {
    await connectDB()

    console.log("🔄 Updating courses with department information...")

    // Get all courses without department
    const coursesWithoutDepartment = await Course.find({
      $or: [{ department: { $exists: false } }, { department: null }, { department: "" }],
    }).populate("instructor", "department")

    console.log(`📚 Found ${coursesWithoutDepartment.length} courses without department`)

    // Department mapping based on course codes or titles
    const departmentMapping = {
      CS: "Computer Science",
      IT: "Information Technology",
      ECE: "Electronics and Communication",
      EEE: "Electrical and Electronics",
      MECH: "Mechanical Engineering",
      CIVIL: "Civil Engineering",
      CHEM: "Chemical Engineering",
      BIO: "Biotechnology",
      MBA: "Management",
      MATH: "Mathematics",
      PHY: "Physics",
      CHEM: "Chemistry",
    }

    for (const course of coursesWithoutDepartment) {
      let department = "Computer Science" // Default department

      // Try to get department from instructor
      if (course.instructor && course.instructor.department) {
        department = course.instructor.department
      } else {
        // Try to infer from course code
        const courseCode = course.code.toUpperCase()
        for (const [prefix, dept] of Object.entries(departmentMapping)) {
          if (courseCode.startsWith(prefix)) {
            department = dept
            break
          }
        }
      }

      // Update the course
      await Course.findByIdAndUpdate(course._id, { department })
      console.log(`✅ Updated course ${course.code} - ${course.title} with department: ${department}`)
    }

    console.log("🎉 All courses updated with department information!")

    // Verify the update
    const totalCourses = await Course.countDocuments()
    const coursesWithDepartment = await Course.countDocuments({
      department: { $exists: true, $ne: null, $ne: "" },
    })

    console.log(`📊 Total courses: ${totalCourses}`)
    console.log(`📊 Courses with department: ${coursesWithDepartment}`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error updating courses:", error)
    process.exit(1)
  }
}

updateCoursesWithDepartment()
