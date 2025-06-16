const express = require("express")
const router = express.Router()
const eventController = require("../controllers/eventController")
const auth = require("../middleware/auth")

// Get all events
router.get("/", auth, eventController.getEvents)

// Get event by ID
router.get("/:eventId", auth, eventController.getEventById)

// Create a new event
router.post("/", auth, eventController.createEvent)

// Update an event
router.put("/:eventId", auth, eventController.updateEvent)

// RSVP to an event
router.post("/:eventId/rsvp", auth, eventController.rsvpEvent)

// Cancel RSVP to an event
router.delete("/:eventId/rsvp", auth, eventController.cancelRsvp)

// Delete an event
router.delete("/:eventId", auth, eventController.deleteEvent)

module.exports = router
