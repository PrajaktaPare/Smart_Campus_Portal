const express = require("express")
const router = express.Router()
const { auth, requireRole } = require("../middleware/auth")
const eventController = require("../controllers/eventController")
const Event = require("../models/Event")

console.log("📅 Event routes loaded")

// Apply auth middleware to all routes
router.use(auth)

// Get all events
router.get("/", eventController.getAllEvents)

// Create event (Faculty and Admin only)
router.post("/", requireRole(["faculty", "admin"]), eventController.createEvent)

// Get event by ID
router.get("/:eventId", eventController.getEventById)

// Update event (Faculty and Admin only)
router.put("/:eventId", requireRole(["faculty", "admin"]), eventController.updateEvent)

// Delete event (Faculty and Admin only)
router.delete("/:eventId", requireRole(["faculty", "admin"]), eventController.deleteEvent)

module.exports = router
