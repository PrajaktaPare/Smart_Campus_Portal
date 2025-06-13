const Assignment = require("../models/Assignment")
const Course = require("../models/Course")
const Notification = require("../models/Notification")

// Get all assignments for a course
exports.getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params

    const assignments = await Assignment.find({ course: courseId })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    res.status(200).json(assignments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get assignments for a student
exports.getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params

    // Verify permissions
    if (req.user.role === "student" && req.user.userId !== studentId) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    // Get courses the student is enrolled in
    const courses = await Course.find({ students: studentId })
    const courseIds = courses.map((course) => course._id)

    // Get assignments for these courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate("course", "code title")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 })

    // Format assignments with submission status
    const formattedAssignments = assignments.map((assignment) => {
      const submission = assignment.submissions.find((sub) => sub.student && sub.student.toString() === studentId)

      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        course: assignment.course,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        createdBy: assignment.createdBy,
        createdAt: assignment.createdAt,
        submission: submission || null,
        status: submission ? submission.status : new Date() > assignment.dueDate ? "overdue" : "pending",
      }
    })

    res.status(200).json(formattedAssignments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, totalMarks, attachments } = req.body

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
      return res.status(403).json({ message: "You are not authorized to create assignments for this course" })
    }

    const assignment = new Assignment({
      title,
      description,
      course: courseId,
      dueDate,
      totalMarks,
      attachments: attachments || [],
      createdBy: req.user.userId,
    })

    await assignment.save()

    // Create notifications for all students in the course
    for (const studentId of course.students) {
      await Notification.create({
        recipient: studentId,
        sender: req.user.userId,
        title: "New Assignment",
        message: `A new assignment "${title}" has been posted for ${course.title}`,
        type: "assignment",
        relatedTo: {
          model: "Assignment",
          id: assignment._id,
        },
      })
    }

    res.status(201).json(assignment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Submit an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { content, attachments } = req.body

    // Verify permissions
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit assignments" })
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Check if assignment is overdue
    const isOverdue = new Date() > assignment.dueDate

    // Check if student has already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student && sub.student.toString() === req.user.userId,
    )

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex] = {
        ...assignment.submissions[existingSubmissionIndex],
        content,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: isOverdue ? "late" : "submitted",
      }
    } else {
      // Add new submission
      assignment.submissions.push({
        student: req.user.userId,
        content,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: isOverdue ? "late" : "submitted",
      })
    }

    await assignment.save()

    // Get course details
    const course = await Course.findById(assignment.course)

    // Notify instructor
    await Notification.create({
      recipient: course.instructor,
      sender: req.user.userId,
      title: "Assignment Submission",
      message: `A student has submitted the assignment "${assignment.title}"`,
      type: "assignment",
      relatedTo: {
        model: "Assignment",
        id: assignment._id,
      },
    })

    res.status(200).json({ message: "Assignment submitted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Grade an assignment submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params
    const { marks, feedback } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    // Find the submission
    const submissionIndex = assignment.submissions.findIndex((sub) => sub._id.toString() === submissionId)

    if (submissionIndex === -1) {
      return res.status(404).json({ message: "Submission not found" })
    }

    // Update the submission
    assignment.submissions[submissionIndex].marks = marks
    assignment.submissions[submissionIndex].feedback = feedback
    assignment.submissions[submissionIndex].status = "graded"

    await assignment.save()

    // Notify student
    const studentId = assignment.submissions[submissionIndex].student

    await Notification.create({
      recipient: studentId,
      sender: req.user.userId,
      title: "Assignment Graded",
      message: `Your submission for "${assignment.title}" has been graded`,
      type: "assignment",
      relatedTo: {
        model: "Assignment",
        id: assignment._id,
      },
    })

    res.status(200).json({ message: "Submission graded successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
