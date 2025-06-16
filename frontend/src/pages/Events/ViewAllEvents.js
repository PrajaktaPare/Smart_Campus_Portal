"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { Search, Calendar, MapPin, Users, Filter } from "lucide-react"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import { eventService } from "../../services/api"
import { toast } from "react-toastify"

const ViewAllEvents = () => {
  const { user } = useContext(AuthContext)
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
      const response = await eventService.getEvents()
      const eventsData = response.data?.data || response.data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to load events")
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

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

    setFilteredEvents(filtered)
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
    return colors[type] || "dark"
  }

  const isEventUpcoming = (date) => {
    return new Date(date) > new Date()
  }

  const isEventToday = (date) => {
    const today = new Date()
    const eventDate = new Date(date)
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={`min-vh-100 bg-${theme === "dark" ? "dark" : "light"}`}>
        <Container className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>All Events</h2>
                  <p className="text-muted">Discover and manage campus events</p>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  Back to Dashboard
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col lg={4} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} className="mb-3">
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="general">General</option>
              </Form.Select>
            </Col>
            <Col lg={3} className="mb-3">
              <Form.Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="General">General</option>
              </Form.Select>
            </Col>
            <Col lg={2} className="mb-3">
              <div className="d-flex align-items-center">
                <Filter size={16} className="me-2" />
                <span className="text-muted small">{filteredEvents.length} events</span>
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Events Grid */}
          <Row>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <Col lg={6} xl={4} className="mb-4" key={event._id || index}>
                  <Card className={`h-100 border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
                    <Card.Header
                      className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom d-flex justify-content-between align-items-start`}
                    >
                      <div>
                        <Badge bg={getEventTypeColor(event.type)} className="mb-2">
                          {event.type || "General"}
                        </Badge>
                        {isEventToday(event.date) && (
                          <Badge bg="danger" className="ms-2 mb-2">
                            Today
                          </Badge>
                        )}
                        {isEventUpcoming(event.date) && !isEventToday(event.date) && (
                          <Badge bg="success" className="ms-2 mb-2">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <h5 className={`card-title text-${theme === "dark" ? "light" : "dark"}`}>{event.title}</h5>
                      <p className="text-muted small mb-3">{event.description || "No description available"}</p>

                      <div className="d-flex align-items-center mb-2">
                        <Calendar size={16} className="text-muted me-2" />
                        <span className="text-muted small">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {event.location && (
                        <div className="d-flex align-items-center mb-2">
                          <MapPin size={16} className="text-muted me-2" />
                          <span className="text-muted small">{event.location}</span>
                        </div>
                      )}

                      <div className="d-flex align-items-center mb-3">
                        <Users size={16} className="text-muted me-2" />
                        <span className="text-muted small">
                          {event.attendees?.length || 0} attendees • {event.department || "General"}
                        </span>
                      </div>
                    </Card.Body>
                    <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/event/${event._id}`)}
                          className="flex-fill"
                        >
                          View Details
                        </Button>
                        {user?.role === "student" && isEventUpcoming(event.date) && (
                          <Button variant="outline-success" size="sm">
                            RSVP
                          </Button>
                        )}
                        {(user?.role === "faculty" || user?.role === "admin") && (
                          <Button variant="outline-secondary" size="sm">
                            Manage
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Card className={`text-center py-5 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Body>
                    <Calendar size={48} className="text-muted mb-3" />
                    <h5 className={`text-${theme === "dark" ? "light" : "dark"}`}>No Events Found</h5>
                    <p className="text-muted">
                      {searchTerm || filterType !== "all" || filterDepartment !== "all"
                        ? "Try adjusting your filters to see more events."
                        : "No events are currently scheduled."}
                    </p>
                    {(user?.role === "faculty" || user?.role === "admin") && (
                      <Button variant="primary" onClick={() => navigate("/faculty-dashboard")}>
                        Create New Event
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  )
}

export default ViewAllEvents
