"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import "./Events.css"

const Events = () => {
  const { user } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        console.log("🔄 Fetching events from database")

        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("http://localhost:8000/api/events", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("📊 Events API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ API Error:", errorText)
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        const eventsData = await response.json()
        console.log("✅ Events fetched from database:", eventsData)

        // Handle both array and object responses
        const events = Array.isArray(eventsData) ? eventsData : eventsData.data || []

        // Process events to add attendance info
        const processedEvents = events.map((event) => ({
          ...event,
          attendees: event.attendees?.length || 0,
          capacity: event.maxAttendees || 200,
          isRSVPed:
            event.attendees?.some((attendee) => (attendee._id || attendee) === (user?._id || user?.id)) || false,
          image: event.image || `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(event.title)}`,
        }))

        setEvents(processedEvents)
        setLoading(false)
      } catch (err) {
        console.error("❌ Error fetching events:", err)
        setError("Failed to fetch events: " + err.message)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  const handleRSVP = (eventId) => {
    setEvents(
      events.map((event) =>
        event._id === eventId
          ? {
              ...event,
              isRSVPed: !event.isRSVPed,
              attendees: event.isRSVPed ? event.attendees - 1 : event.attendees + 1,
            }
          : event,
      ),
    )
  }

  const filteredEvents = filter === "all" ? events : events.filter((event) => event.type === filter)

  if (loading) return <div className="loading">Loading events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Campus Events</h1>
        {user && (user.role === "admin" || user.role === "faculty") && (
          <button className="btn btn-primary">Create Event</button>
        )}
      </div>

      <div className="events-filter">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All Events
          </button>
          <button
            className={`filter-btn ${filter === "technical" ? "active" : ""}`}
            onClick={() => setFilter("technical")}
          >
            Technical
          </button>
          <button
            className={`filter-btn ${filter === "cultural" ? "active" : ""}`}
            onClick={() => setFilter("cultural")}
          >
            Cultural
          </button>
          <button
            className={`filter-btn ${filter === "placement" ? "active" : ""}`}
            onClick={() => setFilter("placement")}
          >
            Placement
          </button>
          <button
            className={`filter-btn ${filter === "workshop" ? "active" : ""}`}
            onClick={() => setFilter("workshop")}
          >
            Workshops
          </button>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-image">
              <img src={event.image || "/placeholder.svg"} alt={event.title} />
              <span className={`event-type ${event.type}`}>{event.type}</span>
            </div>
            <div className="event-content">
              <h3>{event.title}</h3>
              <div className="event-date-time">
                <div>
                  <i className="far fa-calendar"></i> {event.date}
                </div>
                <div>
                  <i className="far fa-clock"></i> {event.time}
                </div>
              </div>
              <div className="event-location">
                <i className="fas fa-map-marker-alt"></i> {event.location}
              </div>
              <p>{event.description}</p>
              <div className="event-attendance">
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="attendance-text">
                  {event.attendees} / {event.capacity} attending
                </div>
              </div>
              <div className="event-actions">
                <button
                  className={`btn ${event.isRSVPed ? "btn-success" : "btn-outline-primary"}`}
                  onClick={() => handleRSVP(event._id)}
                >
                  {event.isRSVPed ? "Attending" : "RSVP"}
                </button>
                <Link to={`/events/${event._id}`} className="btn btn-outline-secondary">
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Events
