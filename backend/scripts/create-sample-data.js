const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")
const bcrypt = require("bcryptjs")

// Load environment variables
require("dotenv").config()

const createSampleData = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await Course.deleteMany({})
    await User.deleteMany({})

    // Create sample users
    console.log("👥 Creating sample users...")
    const hashedPassword = await bcrypt.hash("password123", 10)

    const users = [
      {
        name: "John Student",
        email: "student@test.com",
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        studentId: "CS2024001",
      },
      {
        name: "Dr. Jane Faculty",
        email: "faculty@test.com",
        password: hashedPassword,
        role: "faculty",
        department: "Computer Science",
        employeeId: "FAC001",
      },
      {
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        department: "Administration",
      },
    ]

    const createdUsers = await User.insertMany(users)
    console.log("✅ Created", createdUsers.length, "users")

    const faculty = createdUsers.find((user) => user.role === "faculty")

    // Create sample courses
    console.log("📚 Creating sample courses...")
    const courses = [
      {
        title: "Introduction to Programming",
        code: "CS101",
        description: "Basic programming concepts using Python",
        credits: 3,
        department: "Computer Science",
        semester: "Fall",
        year: 2024,
        instructor: faculty._id,
        students: [],
        isActive: true,
      },
      {
        title: "Data Structures",
        code: "CS201",
        description: "Advanced data structures and algorithms",
        credits: 4,
        department: "Computer Science",
        semester: "Spring",
        year: 2024,
        instructor: faculty._id,
        students: [],
        isActive: true,
      },
      {
        title: "Web Development",
        code: "CS301",
        description: "Full-stack web development with modern frameworks",
        credits: 3,
        department: "Computer Science",
        semester: "Fall",
        year: 2024,
        instructor: faculty._id,
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
        instructor: faculty._id,
        students: [],
        isActive: true,
      },
    ]

    const createdCourses = await Course.insertMany(courses)
    console.log("✅ Created", createdCourses.length, "courses")

    console.log("\n🎉 Sample data created successfully!")
    console.log("📧 Login credentials:")
    console.log("Student: student@test.com / password123")
    console.log("Faculty: faculty@test.com / password123")
    console.log("Admin: admin@test.com / password123")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

createSampleData()
