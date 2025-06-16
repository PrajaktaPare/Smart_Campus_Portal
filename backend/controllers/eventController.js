const Event = require("../models/Event")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("attendees", "name email")
      .sort({ date: 1 })

    res.status(200).json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId).populate("organizer", "name email").populate("attendees", "name email")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.status(200).json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, type } = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      type: type || "general",
      organizer: req.user.userId,
    })

    await event.save()

    const populatedEvent = await Event.findById(event._id).populate("organizer", "name email")

    res.status(201).json(populatedEvent)
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const updates = req.body

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const event = await Event.findByIdAndUpdate(eventId, updates, { new: true }).populate("organizer", "name email")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.status(200).json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    // Verify permissions
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const event = await Event.findByIdAndDelete(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.status(200).json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// RSVP to event
exports.rsvpEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user already RSVP'd
    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ message: "Already RSVP'd to this event" })
    }

    event.attendees.push(req.user.userId)
    await event.save()

    res.status(200).json({ message: "RSVP successful" })
  } catch (error) {
    console.error("Error RSVP'ing to event:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Cancel RSVP
exports.cancelRsvp = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    event.attendees = event.attendees.filter((attendee) => attendee.toString() !== req.user.userId)
    await event.save()

    res.status(200).json({ message: "RSVP cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling RSVP:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
