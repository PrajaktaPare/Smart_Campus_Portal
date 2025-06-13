const express = require("express")
const router = express.Router()
const assignmentController = require("../controllers/assignmentController")
const auth = require("../middleware/auth")

// Get all assignments for a course
router.get("/course/:courseId", auth, assignmentController.getCourseAssignments)

// Get assignments for a student
router.get("/student/:studentId", auth, assignmentController.getStudentAssignments)

// Create a new assignment
router.post("/", auth, assignmentController.createAssignment)

// Submit an assignment
router.post("/:assignmentId/submit", auth, assignmentController.submitAssignment)

// Grade an assignment submission
router.put("/:assignmentId/submission/:submissionId/grade", auth, assignmentController.gradeSubmission)

module.exports = router
