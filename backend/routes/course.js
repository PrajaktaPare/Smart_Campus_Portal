const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const courseController = require("../controllers/courseController")

console.log("📚 Course routes loaded")

// Test route without auth to verify basic functionality
router.get("/test", (req, res) => {
  res.json({ message: "Course routes working", timestamp: new Date() })
})

// Apply auth middleware to protected routes
router.use(auth)

// Simple available courses route
router.get("/available", async (req, res) => {
  try {
    console.log("🔍 Available courses route hit directly")
    console.log("Query:", req.query)

    // Simple response for testing
    const testCourses = [
      {
        _id: "test1",
        title: "Introduction to Programming",
        code: "CS101",
        department: "Computer Science",
        credits: 3,
        description: "Basic programming concepts",
      },
      {
        _id: "test2",
        title: "Data Structures",
        code: "CS201",
        department: "Computer Science",
        credits: 4,
        description: "Advanced data structures",
      },
    ]

    const { department } = req.query
    let filteredCourses = testCourses

    if (department) {
      filteredCourses = testCourses.filter((course) => course.department === department)
    }

    console.log(`✅ Returning ${filteredCourses.length} test courses`)
    res.json(filteredCourses)
  } catch (error) {
    console.error("❌ Error in available route:", error)
    res.status(500).json({ error: error.message })
  }
})

// Get all courses
router.get("/", courseController.getAllCourses)

// Create course (Faculty and Admin only)
router.post("/", requireRole(["faculty", "admin"]), courseController.createCourse)

// Get course by ID
router.get("/:courseId", courseController.getCourseById)

// Update course (Faculty and Admin only)
router.put("/:courseId", requireRole(["faculty", "admin"]), courseController.updateCourse)

// Delete course (Admin only)
router.delete("/:courseId", requireRole(["admin"]), courseController.deleteCourse)

// Enroll student in course (Faculty and Admin only)
router.post("/:courseId/enroll", requireRole(["faculty", "admin"]), courseController.enrollStudent)

// Remove student from course (Faculty and Admin only)
router.delete("/:courseId/students/:studentId", requireRole(["faculty", "admin"]), courseController.removeStudent)

// Get course students (Faculty and Admin only)
router.get("/:courseId/students", requireRole(["faculty", "admin"]), courseController.getCourseStudents)

module.exports = router
