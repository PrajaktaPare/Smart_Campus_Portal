"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "./EventDetail.css"

const EventDetail = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRSVPed, setIsRSVPed] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Mock data for now
        const mockEvent = {
          _id: id,
          title: "Tech Symposium 2023",
          description:
            "Join us for the annual technology symposium featuring industry experts and the latest innovations in technology. This event will include keynote speeches, panel discussions, and interactive workshops on emerging technologies like AI, blockchain, and quantum computing.",
          date: "2023-11-15",
          time: "10:00 AM - 4:00 PM",
          location: "Main Auditorium",
          type: "technical",
          organizer: "Computer Science Department",
          contact: "symposium@example.edu",
          image: "https://via.placeholder.com/800x400?text=Tech+Symposium",
          attendees: 45,
          capacity: 200,
          isRSVPed: false,
          schedule: [
            { time: "10:00 AM - 10:30 AM", activity: "Registration and Welcome" },
            { time: "10:30 AM - 12:00 PM", activity: "Keynote: Future of Technology" },
            { time: "12:00 PM - 1:00 PM", activity: "Lunch Break" },
            { time: "1:00 PM - 2:30 PM", activity: "Panel Discussion: Industry Trends" },
            { time: "2:30 PM - 3:30 PM", activity: "Interactive Workshops" },
            { time: "3:30 PM - 4:00 PM", activity: "Closing Remarks and Networking" },
          ],
          speakers: [
            { name: "Dr. Jane Smith", role: "CTO, Tech Innovations Inc.", image: "https://via.placeholder.com/100" },
            { name: "Prof. Robert Johnson", role: "AI Research Lead", image: "https://via.placeholder.com/100" },
            { name: "Sarah Williams", role: "Blockchain Expert", image: "https://via.placeholder.com/100" },
          ],
        }

        setEvent(mockEvent)
        setIsRSVPed(mockEvent.isRSVPed)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch event details")
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleRSVP = () => {
    setIsRSVPed(!isRSVPed)
    setEvent({
      ...event,
      attendees: isRSVPed ? event.attendees - 1 : event.attendees + 1,
    })
  }

  if (loading) return <div className="loading">Loading event details...</div>
  if (error) return <div className="error">{error}</div>
  if (!event) return <div className="error">Event not found</div>

  return (
    <div className="event-detail-container">
      <div className="event-banner" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="event-banner-overlay">
          <div className="event-banner-content">
            <span className={`event-type ${event.type}`}>{event.type}</span>
            <h1>{event.title}</h1>
            <div className="event-meta">
              <div className="meta-item">
                <i className="far fa-calendar"></i> {event.date}
              </div>
              <div className="meta-item">
                <i className="far fa-clock"></i> {event.time}
              </div>
              <div className="meta-item">
                <i className="fas fa-map-marker-alt"></i> {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="event-detail-content">
        <div className="event-main">
          <div className="event-description">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          <div className="event-schedule">
            <h2>Event Schedule</h2>
            <div className="schedule-timeline">
              {event.schedule.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-content">
                    <div className="timeline-activity">{item.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="event-speakers">
            <h2>Featured Speakers</h2>
            <div className="speakers-grid">
              {event.speakers.map((speaker, index) => (
                <div key={index} className="speaker-card">
                  <div className="speaker-image">
                    <img src={speaker.image || "/placeholder.svg"} alt={speaker.name} />
                  </div>
                  <div className="speaker-info">
                    <h3>{speaker.name}</h3>
                    <p>{speaker.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="event-sidebar">
          <div className="sidebar-card">
            <h3>Event Details</h3>
            <div className="sidebar-item">
              <div className="sidebar-label">Organizer</div>
              <div className="sidebar-value">{event.organizer}</div>
            </div>
            <div className="sidebar-item">
              <div className="sidebar-label">Contact</div>
              <div className="sidebar-value">{event.contact}</div>
            </div>
            <div className="sidebar-item">
              <div className="sidebar-label">Attendance</div>
              <div className="sidebar-value">
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
            </div>
            <button className={`btn btn-lg btn-block ${isRSVPed ? "btn-success" : "btn-primary"}`} onClick={handleRSVP}>
              {isRSVPed ? "You're Attending" : "RSVP Now"}
            </button>
            {isRSVPed && (
              <button className="btn btn-outline-danger btn-block mt-2" onClick={handleRSVP}>
                Cancel RSVP
              </button>
            )}
            <button className="btn btn-outline-secondary btn-block mt-2">Add to Calendar</button>
          </div>

          <div className="sidebar-card">
            <h3>Share Event</h3>
            <div className="share-buttons">
              <button className="btn btn-outline-primary">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="btn btn-outline-info">
                <i className="fab fa-twitter"></i>
              </button>
              <button className="btn btn-outline-danger">
                <i className="fab fa-google"></i>
              </button>
              <button className="btn btn-outline-secondary">
                <i className="fas fa-envelope"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
