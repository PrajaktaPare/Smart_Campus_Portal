const Grade = require("../models/Grade")
const Course = require("../models/Course")
const User = require("../models/User")

// Get grades
exports.getGrades = async (req, res) => {
  try {
    console.log("🎯 Getting grades for user:", req.user.email)

    const query = {}

    // Filter based on user role
    if (req.user.role === "student") {
      query.student = req.user.userId
    } else if (req.user.role === "faculty") {
      // Get courses the faculty teaches
      const courses = await Course.find({ instructor: req.user.userId })
      const courseIds = courses.map((course) => course._id)
      query.course = { $in: courseIds }
    }
    // Admin can see all grades (no filter)

    const grades = await Grade.find(query)
      .populate("student", "name email")
      .populate("course", "code title")
      .populate("gradedBy", "name")
      .sort({ createdAt: -1 })

    res.json(grades)
  } catch (error) {
    console.error("Error fetching grades:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create grade
exports.createGrade = async (req, res) => {
  try {
    const { student, course, grade, semester, year } = req.body

    const newGrade = new Grade({
      student,
      course,
      grade,
      semester,
      year,
      gradedBy: req.user.userId,
    })

    await newGrade.save()

    const populatedGrade = await Grade.findById(newGrade._id)
      .populate("student", "name email")
      .populate("course", "code title")
      .populate("gradedBy", "name")

    res.status(201).json(populatedGrade)
  } catch (error) {
    console.error("Error creating grade:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get grades by student
exports.getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params

    const grades = await Grade.find({ student: studentId })
      .populate("course", "code title")
      .populate("gradedBy", "name")
      .sort({ createdAt: -1 })

    res.json(grades)
  } catch (error) {
    console.error("Error fetching student grades:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get grades by course
exports.getGradesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const grades = await Grade.find({ course: courseId })
      .populate("student", "name email")
      .populate("gradedBy", "name")
      .sort({ createdAt: -1 })

    res.json(grades)
  } catch (error) {
    console.error("Error fetching course grades:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const { gradeId } = req.params
    const updates = req.body

    const grade = await Grade.findByIdAndUpdate(gradeId, updates, { new: true })
      .populate("student", "name email")
      .populate("course", "code title")
      .populate("gradedBy", "name")

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" })
    }

    res.json(grade)
  } catch (error) {
    console.error("Error updating grade:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
