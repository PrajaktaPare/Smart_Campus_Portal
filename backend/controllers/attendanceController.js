const Attendance = require("../models/Attendance")
const Course = require("../models/Course")
const User = require("../models/User")

// Get attendance
exports.getAttendance = async (req, res) => {
  try {
    console.log("📋 Getting attendance for user:", req.user.email)

    const query = {}

    // Filter based on user role
    if (req.user.role === "student") {
      query["records.student"] = req.user.userId
    } else if (req.user.role === "faculty") {
      // Get courses the faculty teaches
      const courses = await Course.find({ instructor: req.user.userId })
      const courseIds = courses.map((course) => course._id)
      query.course = { $in: courseIds }
    }
    // Admin can see all attendance (no filter)

    const attendance = await Attendance.find(query)
      .populate("course", "code title")
      .populate("markedBy", "name")
      .populate("records.student", "name email")
      .sort({ date: -1 })

    res.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body

    const attendance = new Attendance({
      course: courseId,
      date: date || new Date(),
      markedBy: req.user.userId,
      records,
    })

    await attendance.save()

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("course", "code title")
      .populate("markedBy", "name")
      .populate("records.student", "name email")

    res.status(201).json(populatedAttendance)
  } catch (error) {
    console.error("Error marking attendance:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get attendance by course
exports.getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const attendance = await Attendance.find({ course: courseId })
      .populate("course", "code title")
      .populate("markedBy", "name")
      .populate("records.student", "name email")
      .sort({ date: -1 })

    res.json(attendance)
  } catch (error) {
    console.error("Error fetching course attendance:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get attendance by student
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params

    const attendance = await Attendance.find({ "records.student": studentId })
      .populate("course", "code title")
      .populate("markedBy", "name")
      .sort({ date: -1 })

    // Format the response to show only the student's records
    const formattedAttendance = attendance.map((record) => {
      const studentRecord = record.records.find((r) => r.student.toString() === studentId)
      return {
        _id: record._id,
        course: record.course,
        date: record.date,
        status: studentRecord?.status,
        remark: studentRecord?.remark,
        markedBy: record.markedBy,
      }
    })

    res.json(formattedAttendance)
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params
    const updates = req.body

    const attendance = await Attendance.findByIdAndUpdate(attendanceId, updates, { new: true })
      .populate("course", "code title")
      .populate("markedBy", "name")
      .populate("records.student", "name email")

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" })
    }

    res.json(attendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
