const Attendance = require("../models/Attendance")
const Course = require("../models/Course")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Get attendance for a specific student
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== studentId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const attendanceRecords = await Attendance.find({ "records.student": studentId })
      .populate("course", "code title")
      .populate("markedBy", "name")
      .sort({ date: -1 })

    // Format the response
    const formattedRecords = attendanceRecords.map((record) => {
      const studentRecord = record.records.find((r) => r.student.toString() === studentId)
      return {
        _id: record._id,
        course: record.course,
        date: record.date,
        status: studentRecord.status,
        remark: studentRecord.remark,
        markedBy: record.markedBy,
      }
    })

    res.status(200).json(formattedRecords)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get attendance for a specific course
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params
    const { date } = req.query

    const query = { course: courseId }

    if (date) {
      const selectedDate = new Date(date)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(selectedDate.getDate() + 1)

      query.date = {
        $gte: selectedDate,
        $lt: nextDay,
      }
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("records.student", "name email")
      .populate("markedBy", "name")
      .sort({ date: -1 })

    res.status(200).json(attendanceRecords)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Mark attendance for a course
exports.markAttendance = async (req, res) => {
  try {
    const { courseId } = req.params
    const { date, records } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if faculty is assigned to this course
    if (req.user.role === "faculty" && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to mark attendance for this course" })
    }

    // Format the date
    const attendanceDate = date ? new Date(date) : new Date()

    // Check if attendance already marked for this date
    let attendance = await Attendance.findOne({
      course: courseId,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
      },
    })

    if (attendance) {
      // Update existing attendance
      attendance.records = records
      attendance.markedBy = req.user.userId
    } else {
      // Create new attendance record
      attendance = new Attendance({
        course: courseId,
        date: attendanceDate,
        markedBy: req.user.userId,
        records,
      })
    }

    await attendance.save()

    // Create notifications for absent students
    const absentRecords = records.filter((record) => record.status === "absent")

    for (const record of absentRecords) {
      await Notification.create({
        recipient: record.student,
        sender: req.user.userId,
        title: "Attendance Marked as Absent",
        message: `You were marked absent for ${course.title} on ${attendanceDate.toDateString()}`,
        type: "attendance",
        relatedTo: {
          model: "Attendance",
          id: attendance._id,
        },
      })
    }

    res.status(200).json(attendance)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get attendance statistics for a student
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== studentId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    // Get courses the student is enrolled in
    const courses = await Course.find({ students: studentId })

    const stats = []

    for (const course of courses) {
      const attendanceRecords = await Attendance.find({
        course: course._id,
        "records.student": studentId,
      })

      const totalClasses = attendanceRecords.length
      const presentCount = attendanceRecords.filter((record) => {
        const studentRecord = record.records.find((r) => r.student.toString() === studentId)
        return studentRecord && studentRecord.status === "present"
      }).length

      const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

      stats.push({
        course: {
          _id: course._id,
          code: course.code,
          title: course.title,
        },
        totalClasses,
        present: presentCount,
        absent: totalClasses - presentCount,
        percentage,
      })
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
