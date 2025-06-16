const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const assignmentController = require("../controllers/assignmentController")

console.log("📝 Assignment routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get all assignments
router.get("/", assignmentController.getAllAssignments)

// Create assignment (Faculty only)
router.post("/", requireRole(["faculty"]), assignmentController.createAssignment)

// Get assignment by ID
router.get("/:assignmentId", assignmentController.getAssignmentById)

// Update assignment (Faculty only)
router.put("/:assignmentId", requireRole(["faculty"]), assignmentController.updateAssignment)

// Delete assignment (Faculty only)
router.delete("/:assignmentId", requireRole(["faculty"]), assignmentController.deleteAssignment)

// Submit assignment (Student only)
router.post("/:assignmentId/submit", requireRole(["student"]), assignmentController.submitAssignment)

// Get assignment submissions (Faculty only)
router.get("/:assignmentId/submissions", requireRole(["faculty"]), assignmentController.getAssignmentSubmissions)

// Grade assignment submission (Faculty only)
router.put(
  "/:assignmentId/submissions/:submissionId/grade",
  requireRole(["faculty"]),
  assignmentController.gradeSubmission,
)

module.exports = router
