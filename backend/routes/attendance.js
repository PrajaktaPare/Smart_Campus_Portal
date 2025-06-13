const express = require("express")
const router = express.Router()
const attendanceController = require("../controllers/attendanceController")
const auth = require("../middleware/auth")

// Get attendance for a specific student
router.get("/student/:studentId", auth, attendanceController.getStudentAttendance)

// Get attendance for a specific course
router.get("/course/:courseId", auth, attendanceController.getCourseAttendance)

// Mark attendance for a course
router.post("/course/:courseId", auth, attendanceController.markAttendance)

// Get attendance statistics for a student
router.get("/stats/:studentId", auth, attendanceController.getStudentAttendanceStats)

module.exports = router
