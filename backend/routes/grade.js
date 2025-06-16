const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const gradeController = require("../controllers/gradeController")

console.log("🎯 Grade routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get grades
router.get("/", gradeController.getGrades)

// Create/Update grade (Faculty only)
router.post("/", requireRole(["faculty"]), gradeController.createGrade)

// Get grades by student
router.get("/student/:studentId", gradeController.getGradesByStudent)

// Get grades by course
router.get("/course/:courseId", gradeController.getGradesByCourse)

// Update grade (Faculty only)
router.put("/:gradeId", requireRole(["faculty"]), gradeController.updateGrade)

module.exports = router
