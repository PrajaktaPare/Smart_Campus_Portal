const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoUri.includes("/smart_campus_portal")) {
      mongoUri = mongoUri.replace("mongodb.net/", "mongodb.net/smart_campus_portal")
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

const createDepartmentData = async () => {
  try {
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

    const notificationSchema = new mongoose.Schema(
      {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: "general" },
        read: { type: Boolean, default: false },
        relatedTo: {
          model: String,
          id: mongoose.Schema.Types.ObjectId,
        },
      },
      { timestamps: true },
    )

    const User = mongoose.models.User || mongoose.model("User", userSchema)
    const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
    const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)
    const Event = mongoose.models.Event || mongoose.model("Event", eventSchema)
    const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema)

    console.log("🔄 Creating department-specific sample data...")

    // Create users for Computer Science department
    const hashedPassword = await bcrypt.hash("student123", 10)

    // Create CS students
    const csStudents = []
    for (let i = 1; i <= 5; i++) {
      const student = new User({
        name: `CS Student ${i}`,
        email: `cs.student${i}@example.com`,
        password: hashedPassword,
        role: "student",
        department: "Computer Science",
        studentId: `STU31537${i}`,
      })
      await student.save()
      csStudents.push(student)
    }

    // Create CS faculty
    const csFaculty = new User({
      name: "Dr. CS Professor",
      email: "cs.faculty@example.com",
      password: hashedPassword,
      role: "faculty",
      department: "Computer Science",
      employeeId: "FAC001",
    })
    await csFaculty.save()

    // Create CS courses
    const csCourses = [
      {
        title: "Introduction to Programming",
        code: "CS101",
        description: "Basic programming concepts using Python",
        department: "Computer Science",
        credits: 3,
        instructor: csFaculty._id,
        students: csStudents.slice(0, 3).map((s) => s._id),
      },
      {
        title: "Data Structures and Algorithms",
        code: "CS201",
        description: "Advanced data structures and algorithm design",
        department: "Computer Science",
        credits: 4,
        instructor: csFaculty._id,
        students: csStudents.slice(1, 4).map((s) => s._id),
      },
      {
        title: "Web Development",
        code: "CS301",
        description: "Full-stack web development with modern frameworks",
        department: "Computer Science",
        credits: 3,
        instructor: csFaculty._id,
        students: csStudents.slice(2, 5).map((s) => s._id),
      },
    ]

    const createdCourses = []
    for (const courseData of csCourses) {
      const course = new Course(courseData)
      await course.save()
      createdCourses.push(course)
    }

    // Create assignments for CS courses
    const assignments = []
    for (const course of createdCourses) {
      const assignment1 = new Assignment({
        title: `${course.code} Assignment 1`,
        description: `First assignment for ${course.title}`,
        course: course._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        maxPoints: 100,
        createdBy: csFaculty._id,
        submissions: course.students.map((studentId) => ({
          student: studentId,
          content: "Sample submission content",
          submittedAt: new Date(),
          grade: Math.floor(Math.random() * 30) + 70, // Random grade 70-100
          feedback: "Good work!",
          gradedAt: new Date(),
        })),
      })
      await assignment1.save()
      assignments.push(assignment1)

      const assignment2 = new Assignment({
        title: `${course.code} Assignment 2`,
        description: `Second assignment for ${course.title}`,
        course: course._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        maxPoints: 100,
        createdBy: csFaculty._id,
        submissions: [],
      })
      await assignment2.save()
      assignments.push(assignment2)
    }

    // Create CS department events
    const csEvents = [
      {
        title: "CS Department Seminar",
        description: "Latest trends in Computer Science",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: "CS Building, Room 101",
        type: "seminar",
        organizer: csFaculty._id,
        department: "Computer Science",
      },
      {
        title: "Programming Contest",
        description: "Annual programming competition",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: "Computer Lab",
        type: "competition",
        organizer: csFaculty._id,
        department: "Computer Science",
      },
      {
        title: "Tech Talk: AI and Machine Learning",
        description: "Industry expert talk on AI trends",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: "Auditorium",
        type: "talk",
        organizer: csFaculty._id,
        department: "Computer Science",
      },
    ]

    const createdEvents = []
    for (const eventData of csEvents) {
      const event = new Event(eventData)
      await event.save()
      createdEvents.push(event)
    }

    // Create notifications for CS students
    for (const student of csStudents) {
      // Assignment notifications
      for (const assignment of assignments.slice(0, 2)) {
        const notification = new Notification({
          recipient: student._id,
          title: `New Assignment: ${assignment.title}`,
          message: `A new assignment has been posted for your course. Due date: ${assignment.dueDate.toLocaleDateString()}`,
          type: "assignment",
          read: Math.random() > 0.5, // Randomly mark some as read
          relatedTo: {
            model: "Assignment",
            id: assignment._id,
          },
        })
        await notification.save()
      }

      // Event notifications
      for (const event of createdEvents.slice(0, 2)) {
        const notification = new Notification({
          recipient: student._id,
          title: `Upcoming Event: ${event.title}`,
          message: `Don't miss this event on ${event.date.toLocaleDateString()} at ${event.location}`,
          type: "event",
          read: Math.random() > 0.7, // Most event notifications unread
          relatedTo: {
            model: "Event",
            id: event._id,
          },
        })
        await notification.save()
      }
    }

    console.log("✅ Sample department-specific data created successfully!")
    console.log(`📊 Created:`)
    console.log(`   - ${csStudents.length} CS students`)
    console.log(`   - 1 CS faculty member`)
    console.log(`   - ${createdCourses.length} CS courses`)
    console.log(`   - ${assignments.length} assignments`)
    console.log(`   - ${createdEvents.length} CS events`)
    console.log(`   - Multiple notifications`)

    console.log("\n🔐 Test Login Credentials:")
    console.log("   Student: cs.student1@example.com / student123")
    console.log("   Faculty: cs.faculty@example.com / student123")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  } finally {
    mongoose.connection.close()
  }
}

connectDB().then(() => {
  createDepartmentData()
})
