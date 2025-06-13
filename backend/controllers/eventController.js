const Event = require("../models/Event")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email").sort({ date: 1 })

    res.status(200).json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
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
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body

    // Only faculty and admin can create events
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user.userId,
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await event.save()

    // Populate organizer details for response
    const populatedEvent = await Event.findById(event._id).populate("organizer", "name email")

    // Notify all users about the new event
    const users = await User.find({ role: "student" })

    for (const user of users) {
      await Notification.create({
        recipient: user._id,
        sender: req.user.userId,
        title: "New Event",
        message: `A new event "${title}" has been created`,
        type: "event",
        relatedTo: {
          model: "Event",
          id: event._id,
        },
      })
    }

    res.status(201).json(populatedEvent)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { title, description, date, location } = req.body

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is authorized to update this event
    if (
      req.user.role === "student" ||
      (req.user.role === "faculty" && event.organizer.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    // Update fields
    if (title) event.title = title
    if (description) event.description = description
    if (date) event.date = date
    if (location) event.location = location

    event.updatedAt = new Date()

    await event.save()

    // Populate organizer details for response
    const populatedEvent = await Event.findById(event._id).populate("organizer", "name email")

    // Notify attendees about the updated event
    for (const attendeeId of event.attendees) {
      await Notification.create({
        recipient: attendeeId,
        sender: req.user.userId,
        title: "Event Updated",
        message: `The event "${event.title}" has been updated`,
        type: "event",
        relatedTo: {
          model: "Event",
          id: event._id,
        },
      })
    }

    res.status(200).json(populatedEvent)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// RSVP to an event
exports.rsvpEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is already attending
    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ message: "You are already attending this event" })
    }

    // Add user to attendees
    event.attendees.push(req.user.userId)
    event.updatedAt = new Date()

    await event.save()

    // Notify event organizer
    await Notification.create({
      recipient: event.organizer,
      sender: req.user.userId,
      title: "Event RSVP",
      message: `${req.user.name} is attending your event "${event.title}"`,
      type: "event",
      relatedTo: {
        model: "Event",
        id: event._id,
      },
    })

    res.status(200).json({ message: "RSVP successful", event })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Cancel RSVP to an event
exports.cancelRsvp = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is attending
    if (!event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ message: "You are not attending this event" })
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter((attendeeId) => attendeeId.toString() !== req.user.userId)
    event.updatedAt = new Date()

    await event.save()

    res.status(200).json({ message: "RSVP cancelled successfully", event })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is authorized to delete this event
    if (
      req.user.role === "student" ||
      (req.user.role === "faculty" && event.organizer.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: "Unauthorized access" })
    }

    await event.deleteOne()

    // Notify attendees about the cancelled event
    for (const attendeeId of event.attendees) {
      await Notification.create({
        recipient: attendeeId,
        sender: req.user.userId,
        title: "Event Cancelled",
        message: `The event "${event.title}" has been cancelled`,
        type: "event",
        relatedTo: {
          model: "Event",
          id: event._id,
        },
      })
    }

    res.status(200).json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
