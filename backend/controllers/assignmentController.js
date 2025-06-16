const Assignment = require("../models/Assignment")
const Course = require("../models/Course")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    console.log("📝 Getting all assignments for user:", req.user.email)

    const query = {}

    // Filter based on user role
    if (req.user.role === "student") {
      // Get courses the student is enrolled in
      const courses = await Course.find({ students: req.user.userId })
      const courseIds = courses.map((course) => course._id)
      query.course = { $in: courseIds }
    } else if (req.user.role === "faculty") {
      // Get courses the faculty teaches
      const courses = await Course.find({ instructor: req.user.userId })
      const courseIds = courses.map((course) => course._id)
      query.course = { $in: courseIds }
    }
    // Admin can see all assignments (no filter)

    const assignments = await Assignment.find(query)
      .populate("course", "code title")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 })

    console.log(`✅ Found ${assignments.length} assignments`)
    res.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, course, dueDate, maxPoints } = req.body

    const assignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      maxPoints: maxPoints || 100,
      createdBy: req.user.userId,
    })

    await assignment.save()

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("course", "code title")
      .populate("createdBy", "name")

    // Notify all students enrolled in this course
    try {
      const courseData = await Course.findById(course).populate("students", "_id name email")
      if (courseData && courseData.students) {
        const notifications = courseData.students.map((student) => ({
          recipient: student._id,
          title: `New Assignment: ${title}`,
          message: `A new assignment "${title}" has been posted for ${courseData.code}. Due: ${new Date(dueDate).toLocaleDateString()}`,
          type: "assignment",
          relatedTo: {
            model: "Assignment",
            id: assignment._id,
          },
        }))

        await Notification.insertMany(notifications)
        console.log(`✅ Created notifications for ${notifications.length} students`)
      }
    } catch (notifError) {
      console.warn("Failed to create notifications:", notifError)
    }

    console.log("✅ Assignment created:", populatedAssignment.title)
    res.status(201).json(populatedAssignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate("course", "code title")
      .populate("createdBy", "name")
      .populate("submissions.student", "name email")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const updates = req.body

    const assignment = await Assignment.findByIdAndUpdate(assignmentId, updates, { new: true })
      .populate("course", "code title")
      .populate("createdBy", "name")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json(assignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.assignmentId)

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json({ message: "Assignment deleted successfully" })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { content, fileUrl } = req.body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find((sub) => sub.student.toString() === req.user.userId)

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content
      existingSubmission.fileUrl = fileUrl
      existingSubmission.submittedAt = new Date()
    } else {
      // Create new submission
      assignment.submissions.push({
        student: req.user.userId,
        content,
        fileUrl,
        submittedAt: new Date(),
      })
    }

    await assignment.save()

    res.json({ message: "Assignment submitted successfully" })
  } catch (error) {
    console.error("Error submitting assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get assignment submissions (Faculty only)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate("course", "code title")
      .populate("submissions.student", "name email")

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    res.json({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        course: assignment.course,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
      },
      submissions: assignment.submissions,
    })
  } catch (error) {
    console.error("Error fetching assignment submissions:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Grade assignment submission (Faculty only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params
    const { grade, feedback } = req.body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    const submission = assignment.submissions.id(submissionId)
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    submission.grade = grade
    submission.feedback = feedback
    submission.gradedAt = new Date()

    await assignment.save()

    // Create notification for student
    try {
      await Notification.create({
        recipient: submission.student,
        title: `Assignment Graded: ${assignment.title}`,
        message: `Your assignment has been graded. Score: ${grade}/${assignment.maxPoints}`,
        type: "grade",
        relatedTo: {
          model: "Assignment",
          id: assignmentId,
        },
      })
    } catch (notifError) {
      console.warn("Failed to create notification:", notifError)
    }

    res.json({ message: "Assignment graded successfully" })
  } catch (error) {
    console.error("Error grading assignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
