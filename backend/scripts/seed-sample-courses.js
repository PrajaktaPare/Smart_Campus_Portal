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

const seedSampleCourses = async () => {
  try {
    await connectDB()

    console.log("🌱 Seeding sample courses with departments...")

    // Get a faculty member to assign as instructor
    const faculty = await User.findOne({ role: "faculty" })
    if (!faculty) {
      console.log("❌ No faculty found. Please create faculty users first.")
      process.exit(1)
    }

    const sampleCourses = [
      {
        title: "Data Structures and Algorithms",
        code: "CS101",
        description: "Introduction to fundamental data structures and algorithms",
        credits: 4,
        semester: "Fall",
        year: 2024,
        department: "Computer Science",
        instructor: faculty._id,
        isActive: true,
        schedule: {
          days: ["Monday", "Wednesday", "Friday"],
          startTime: "09:00 AM",
          endTime: "10:00 AM",
          room: "CS-101",
        },
      },
      {
        title: "Database Management Systems",
        code: "CS201",
        description: "Comprehensive study of database design and management",
        credits: 3,
        semester: "Fall",
        year: 2024,
        department: "Computer Science",
        instructor: faculty._id,
        isActive: true,
        schedule: {
          days: ["Tuesday", "Thursday"],
          startTime: "11:00 AM",
          endTime: "12:30 PM",
          room: "CS-102",
        },
      },
      {
        title: "Web Development",
        code: "CS301",
        description: "Modern web development using HTML, CSS, JavaScript, and frameworks",
        credits: 3,
        semester: "Fall",
        year: 2024,
        department: "Computer Science",
        instructor: faculty._id,
        isActive: true,
        schedule: {
          days: ["Monday", "Wednesday"],
          startTime: "02:00 PM",
          endTime: "03:30 PM",
          room: "CS-Lab1",
        },
      },
      {
        title: "Machine Learning",
        code: "CS401",
        description: "Introduction to machine learning algorithms and applications",
        credits: 4,
        semester: "Fall",
        year: 2024,
        department: "Computer Science",
        instructor: faculty._id,
        isActive: true,
        schedule: {
          days: ["Tuesday", "Thursday"],
          startTime: "09:00 AM",
          endTime: "10:30 AM",
          room: "CS-103",
        },
      },
      {
        title: "Software Engineering",
        code: "CS501",
        description: "Software development lifecycle and engineering practices",
        credits: 3,
        semester: "Fall",
        year: 2024,
        department: "Computer Science",
        instructor: faculty._id,
        isActive: true,
        schedule: {
          days: ["Monday", "Wednesday", "Friday"],
          startTime: "01:00 PM",
          endTime: "02:00 PM",
          room: "CS-104",
        },
      },
    ]

    // Clear existing courses (optional)
    // await Course.deleteMany({})
    // console.log("🗑️ Cleared existing courses")

    // Insert sample courses
    for (const courseData of sampleCourses) {
      const existingCourse = await Course.findOne({ code: courseData.code })
      if (!existingCourse) {
        const course = new Course(courseData)
        await course.save()
        console.log(`✅ Created course: ${courseData.code} - ${courseData.title}`)
      } else {
        console.log(`⚠️ Course ${courseData.code} already exists, skipping...`)
      }
    }

    console.log("🎉 Sample courses seeded successfully!")

    // Display summary
    const totalCourses = await Course.countDocuments()
    const csCourses = await Course.countDocuments({ department: "Computer Science" })

    console.log(`📊 Total courses: ${totalCourses}`)
    console.log(`📊 Computer Science courses: ${csCourses}`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding courses:", error)
    process.exit(1)
  }
}

seedSampleCourses()
