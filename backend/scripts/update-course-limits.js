const mongoose = require("mongoose")

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://pareprajakta3:mSQgBlLsZ45TfquL@cluster0.6j6ijnc.mongodb.net/smart_campus_portal?retryWrites=true&w=majority&appName=Cluster0"

// Course Schema
const courseSchema = new mongoose.Schema({
  title: String,
  code: String,
  description: String,
  instructor: mongoose.Schema.Types.ObjectId,
  department: String,
  credits: Number,
  semester: String,
  year: Number,
  isActive: Boolean,
  students: [mongoose.Schema.Types.ObjectId],
  maxStudents: Number,
})

const Course = mongoose.model("Course", courseSchema)

async function updateCourseLimits() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(MONGO_URI)
    console.log("✅ Connected to MongoDB")

    // Update all courses to have maxStudents: 20
    const result = await Course.updateMany(
      { maxStudents: { $ne: 20 } }, // Only update courses that don't already have 20
      { $set: { maxStudents: 20 } },
    )

    console.log(`✅ Updated ${result.modifiedCount} courses to have maxStudents: 20`)

    // Clear students array for courses that might be showing as "full"
    const clearResult = await Course.updateMany({ students: { $exists: true } }, { $set: { students: [] } })

    console.log(`✅ Cleared student enrollments from ${clearResult.modifiedCount} courses`)

    // Show current course status
    const courses = await Course.find({}).select("title code maxStudents students")
    console.log("\n📊 Current Course Status:")
    courses.forEach((course) => {
      console.log(`- ${course.code}: ${course.title} (${course.students.length}/${course.maxStudents} enrolled)`)
    })

    console.log("\n✅ Course limits updated successfully!")
  } catch (error) {
    console.error("❌ Error updating course limits:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

updateCourseLimits()
