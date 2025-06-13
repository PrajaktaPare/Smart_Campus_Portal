const express = require("express")
const router = express.Router()
const courseController = require("../controllers/courseController")
const auth = require("../middleware/auth")

// Get all courses
router.get("/", auth, courseController.getAllCourses)

// Get course by ID
router.get("/:courseId", auth, courseController.getCourseById)

// Create a new course
router.post("/", auth, courseController.createCourse)

// Update a course
router.put("/:courseId", auth, courseController.updateCourse)

// Enroll students in a course
router.post("/:courseId/enroll", auth, courseController.enrollStudents)

// Remove students from a course
router.post("/:courseId/remove", auth, courseController.removeStudents)

// Add course material
router.post("/:courseId/material", auth, courseController.addCourseMaterial)

module.exports = router
