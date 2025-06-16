const express = require("express")
const router = express.Router()
const resumeController = require("../controllers/resumeController")
const auth = require("../middleware/auth")

// Get user's resume
router.get("/user/:userId", auth, resumeController.getResume)

// Create or update resume
router.post("/", auth, resumeController.saveResume)

// Generate HTML resume for download
router.get("/user/:userId/html", auth, resumeController.generateHTML)

// Get resume data for PDF generation
router.get("/user/:userId/pdf-data", auth, resumeController.getResumeForPDF)

// Get all resumes (admin only)
router.get("/", auth, resumeController.getAllResumes)

// Delete resume
router.delete("/:resumeId", auth, resumeController.deleteResume)

module.exports = router
