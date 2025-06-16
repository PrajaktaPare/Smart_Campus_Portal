const mongoose = require("mongoose")
require("dotenv").config()

const createSampleEvents = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")

    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoUri.includes("/smart_campus_portal")) {
      mongoUri = mongoUri.replace("mongodb.net/", "mongodb.net/smart_campus_portal")
    }

    await mongoose.connect(mongoUri)
    console.log("✅ Connected to MongoDB")

    // Define schemas
    const userSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
        department: String,
        studentId: String,
        employeeId: String,
      },
      { timestamps: true },
    )

    const eventSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        date: { type: Date, required: true },
        location: String,
        type: { type: String, default: "general" },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        department: String,
      },
      { timestamps: true },
    )

    const courseSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        description: String,
        department: String,
        credits: { type: Number, default: 3 },
        semester: { type: String, default: "Fall" },
        year: { type: Number, default: new Date().getFullYear() },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true },
    )

    const assignmentSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        dueDate: { type: Date, required: true },
        maxPoints: { type: Number, default: 100 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        submissions: [
          {
            student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: String,
            fileUrl: String,
            submittedAt: { type: Date, default: Date.now },
            grade: Number,
            feedback: String,
            gradedAt: Date,
          },
        ],
      },
      { timestamps: true },
    )

    const User = mongoose.models.User || mongoose.model("User", userSchema)
    const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)
    const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
    const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)

    // Get faculty user
    const faculty = await User.findOne({ role: "faculty" })
    if (!faculty) {
      console.log("❌ No faculty user found. Please create users first.")
      return
    }

    // Create sample courses
    const sampleCourses = [
      {
        title: "Introduction to Computer Science",
        code: "CS101",
        description: "Basic concepts of computer science and programming",
        department: "Computer Science",
        credits: 3,
        instructor: faculty._id,
        students: [],
      },
      {
        title: "Data Structures and Algorithms",
        code: "CS201",
        description: "Advanced data structures and algorithm design",
        department: "Computer Science",
        credits: 4,
        instructor: faculty._id,
        students: [],
      },
      {
        title: "Database Management Systems",
        code: "CS301",
        description: "Design and implementation of database systems",
        department: "Computer Science",
        credits: 3,
        instructor: faculty._id,
        students: [],
      },
    ]

    console.log("📚 Creating sample courses...")
    for (const courseData of sampleCourses) {
      const existingCourse = await Course.findOne({ code: courseData.code })
      if (!existingCourse) {
        await Course.create(courseData)
        console.log(`✅ Created course: ${courseData.title}`)
      }
    }

    // Get courses for assignments
    const courses = await Course.find({ instructor: faculty._id })

    // Create sample assignments
    if (courses.length > 0) {
      const sampleAssignments = [
        {
          title: "Programming Assignment 1",
          description: "Write a simple calculator program using basic programming concepts",
          course: courses[0]._id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxPoints: 100,
          createdBy: faculty._id,
        },
        {
          title: "Data Structure Implementation",
          description: "Implement a binary search tree with insert, delete, and search operations",
          course: courses[1]?._id || courses[0]._id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          maxPoints: 150,
          createdBy: faculty._id,
        },
        {
          title: "Database Design Project",
          description: "Design and implement a database for a library management system",
          course: courses[2]?._id || courses[0]._id,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          maxPoints: 200,
          createdBy: faculty._id,
        },
      ]

      console.log("📝 Creating sample assignments...")
      for (const assignmentData of sampleAssignments) {
        const existingAssignment = await Assignment.findOne({
          title: assignmentData.title,
          course: assignmentData.course,
        })
        if (!existingAssignment) {
          await Assignment.create(assignmentData)
          console.log(`✅ Created assignment: ${assignmentData.title}`)
        }
      }
    }

    // Create sample events
    const sampleEvents = [
      {
        title: "Computer Science Department Orientation",
        description: "Welcome event for new students in the Computer Science department",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: "Main Auditorium",
        type: "academic",
        organizer: faculty._id,
        department: "Computer Science",
      },
      {
        title: "Tech Talk: AI and Machine Learning",
        description: "Guest speaker discussing the latest trends in AI and ML",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: "Conference Room A",
        type: "seminar",
        organizer: faculty._id,
        department: "Computer Science",
      },
      {
        title: "Programming Competition",
        description: "Annual programming contest for all CS students",
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        location: "Computer Lab 1",
        type: "competition",
        organizer: faculty._id,
        department: "Computer Science",
      },
      {
        title: "Career Fair",
        description: "Meet with potential employers and learn about career opportunities",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: "Student Center",
        type: "career",
        organizer: faculty._id,
        department: "General",
      },
    ]

    console.log("🎉 Creating sample events...")
    for (const eventData of sampleEvents) {
      const existingEvent = await Event.findOne({
        title: eventData.title,
        date: eventData.date,
      })
      if (!existingEvent) {
        await Event.create(eventData)
        console.log(`✅ Created event: ${eventData.title}`)
      }
    }

    console.log("✅ Sample data creation completed!")
    console.log("📊 Summary:")
    console.log(`   - Courses: ${await Course.countDocuments()}`)
    console.log(`   - Assignments: ${await Assignment.countDocuments()}`)
    console.log(`   - Events: ${await Event.countDocuments()}`)
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("📦 Disconnected from MongoDB")
  }
}

createSampleEvents()
