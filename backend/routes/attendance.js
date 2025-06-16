const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const attendanceController = require("../controllers/attendanceController")

console.log("📋 Attendance routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get attendance records
router.get("/", attendanceController.getAttendance)

// Mark attendance (Faculty only)
router.post("/", requireRole(["faculty"]), attendanceController.markAttendance)

// Get attendance by course
router.get("/course/:courseId", attendanceController.getAttendanceByCourse)

// Get attendance by student
router.get("/student/:studentId", attendanceController.getAttendanceByStudent)

// Update attendance (Faculty only)
router.put("/:attendanceId", requireRole(["faculty"]), attendanceController.updateAttendance)

module.exports = router
