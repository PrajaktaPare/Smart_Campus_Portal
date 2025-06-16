"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from "react-bootstrap"
import { useAuth } from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import { eventService } from "../../services/api"
import { toast } from "react-toastify"

const EventsPage = () => {
  const { user } = useAuth()
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, filterType, filterDepartment])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔍 Fetching all events...")

      const response = await eventService.getEvents()
      console.log("📅 Events response:", response)

      const eventsData = response.data?.data || response.data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      console.log(`✅ Loaded ${eventsData.length} events`)
    } catch (error) {
      console.error("❌ Error fetching events:", error)
      setError("Failed to load events")
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.type === filterType)
    }

    // Department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter((event) => event.department === filterDepartment)
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date))

    setFilteredEvents(filtered)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const isUpcoming = date > now
    const isPast = date < now
    const isToday = date.toDateString() === now.toDateString()

    return {
      formatted: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUpcoming,
      isPast,
      isToday,
    }
  }

  const getEventTypeColor = (type) => {
    const colors = {
      academic: "primary",
      cultural: "success",
      sports: "warning",
      workshop: "info",
      seminar: "secondary",
      general: "dark",
    }
    return colors[type] || "secondary"
  }

  const getEventStatusBadge = (date) => {
    const { isUpcoming, isPast, isToday } = formatDate(date)

    if (isToday) return <Badge bg="success">Today</Badge>
    if (isUpcoming) return <Badge bg="primary">Upcoming</Badge>
    if (isPast) return <Badge bg="secondary">Past</Badge>
    return null
  }

  const getDepartments = () => {
    const departments = [...new Set(events.map((event) => event.department).filter(Boolean))]
    return departments.sort()
  }

  const getEventTypes = () => {
    const types = [...new Set(events.map((event) => event.type).filter(Boolean))]
    return types.sort()
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="mt-4">
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading events...</p>
          </div>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="mb-2">🎉 Campus Events</h1>
            <p className="text-muted">Discover and participate in campus activities</p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-primary" onClick={fetchEvents}>
              🔄 Refresh
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Row className="mb-4">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {getEventTypes().map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              {getDepartments().map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("")
                setFilterType("all")
                setFilterDepartment("all")
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Row>
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <h4>No Events Found</h4>
                  <p className="text-muted">
                    {events.length === 0
                      ? "No events are currently scheduled."
                      : "No events match your current filters."}
                  </p>
                  {events.length > 0 && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSearchTerm("")
                        setFilterType("all")
                        setFilterDepartment("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            {filteredEvents.map((event) => {
              const dateInfo = formatDate(event.date)
              return (
                <Col key={event._id} lg={4} md={6}>
                  <Card className="h-100 shadow-sm hover-shadow">
                    <Card.Body className="d-flex flex-column">
                      {/* Event Header */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg={getEventTypeColor(event.type)} className="mb-2">
                          {event.type?.charAt(0).toUpperCase() + event.type?.slice(1) || "General"}
                        </Badge>
                        {getEventStatusBadge(event.date)}
                      </div>

                      {/* Event Title */}
                      <h5 className="mb-2">{event.title}</h5>

                      {/* Event Description */}
                      {event.description && (
                        <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                          {event.description.length > 100
                            ? `${event.description.substring(0, 100)}...`
                            : event.description}
                        </p>
                      )}

                      {/* Event Details */}
                      <div className="mb-3 flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-calendar text-primary me-2"></i>
                          <small>
                            {dateInfo.formatted} at {dateInfo.time}
                          </small>
                        </div>

                        {event.location && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-map-marker-alt text-success me-2"></i>
                            <small>{event.location}</small>
                          </div>
                        )}

                        {event.organizer && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-user text-info me-2"></i>
                            <small>Organized by {event.organizer.name}</small>
                          </div>
                        )}

                        {event.department && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-building text-warning me-2"></i>
                            <small>{event.department} Department</small>
                          </div>
                        )}

                        {event.attendees && (
                          <div className="d-flex align-items-center">
                            <i className="fas fa-users text-secondary me-2"></i>
                            <small>
                              {event.attendees.length} registered
                              {event.maxAttendees && ` / ${event.maxAttendees} max`}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/event/${event._id}`)}
                        className="mt-auto"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}

        {/* Summary */}
        <Row className="mt-4">
          <Col>
            <Card className="bg-light">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>
                      Showing {filteredEvents.length} of {events.length} events
                    </strong>
                    {searchTerm && <span className="text-muted"> • Filtered by: "{searchTerm}"</span>}
                  </div>
                  <div className="text-muted">
                    <small>
                      Upcoming: {filteredEvents.filter((e) => formatDate(e.date).isUpcoming).length} • Past:{" "}
                      {filteredEvents.filter((e) => formatDate(e.date).isPast).length}
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .hover-shadow {
          transition: box-shadow 0.2s ease-in-out;
        }
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </>
  )
}

export default EventsPage
