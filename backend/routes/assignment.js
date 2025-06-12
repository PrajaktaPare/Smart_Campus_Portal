const express = require("express")
const Assignment = require("../models/Assignment")
const auth = require("../middleware/auth")
const router = express.Router()

// Get assignments
router.get("/", auth, async (req, res) => {
  try {
    let assignments
    if (req.user.role === "student") {
      assignments = await Assignment.find({ students: req.user.userId })
    } else {
      assignments = await Assignment.find()
    }
    res.json(assignments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create assignment (faculty/admin only)
router.post("/", auth, async (req, res) => {
  if (req.user.role === "student") {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const assignment = new Assignment({
      ...req.body,
      createdBy: req.user.userId,
    })
    await assignment.save()
    res.status(201).json(assignment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Submit assignment
router.post("/:id/submit", auth, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students can submit assignments" })
  }

  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }

    assignment.submissions.push({
      student: req.user.userId,
      submittedAt: new Date(),
      content: req.body.content,
    })

    await assignment.save()
    res.json({ message: "Assignment submitted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
