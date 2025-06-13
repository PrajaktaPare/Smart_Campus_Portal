"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import { toast } from "react-toastify"
import { courseService, eventService, userService, assignmentService } from "../../services/api"
import "./FacultyDashboard.css"

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  // State variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Form states
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    location: "",
  })

  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    description: "",
    credits: 3,
    semester: "Fall",
    year: new Date().getFullYear(),
  })

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    totalMarks: 100,
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [coursesRes, eventsRes, studentsRes, assignmentsRes] = await Promise.all([
        courseService.getCourses(),
        eventService.getEvents(),
        userService.getStudents(),
        assignmentService.getAssignments(),
      ])

      setCourses(coursesRes.data || [])
      setEvents(eventsRes.data || [])
      setStudents(studentsRes.data || [])
      setAssignments(assignmentsRes.data || [])
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: new Date(`${eventForm.date}T${eventForm.time}`),
        location: eventForm.location,
      }

      const response = await eventService.createEvent(eventData)
      setEvents([...events, response.data])
      setShowEventModal(false)
      resetEventForm()
      toast.success("Event created successfully")
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event")
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      const courseData = {
        title: courseForm.title,
        code: courseForm.code,
        description: courseForm.description,
        credits: Number(courseForm.credits),
        semester: courseForm.semester,
        year: Number(courseForm.year),
      }

      const response = await courseService.createCourse(courseData)
      setCourses([...courses, response.data])
      setShowCourseModal(false)
      resetCourseForm()
      toast.success("Course created successfully")
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course")
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      if (!selectedCourse) {
        toast.error("Please select a course first.")
        return
      }

      const assignmentData = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        course: selectedCourse._id,
        dueDate: new Date(assignmentForm.dueDate),
        totalMarks: Number(assignmentForm.totalMarks),
      }

      const response = await assignmentService.createAssignment(assignmentData)
      setAssignments([...assignments, response.data])
      setShowAssignmentModal(false)
      resetAssignmentForm()
      toast.success("Assignment created successfully")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment")
    }
  }

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
      location: "",
    })
  }

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      code: "",
      description: "",
      credits: 3,
      semester: "Fall",
      year: new Date().getFullYear(),
    })
  }

  const resetAssignmentForm = () => {
    setAssignmentForm({
      title: "",
      description: "",
      courseId: "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalMarks: 100,
    })
  }

  return (
    <>
      <Navbar />
      <div className={`dashboard-container bg-${theme === "dark" ? "dark" : "light"}`}>
        <Container fluid className="py-4">
          {/* Welcome Section */}
          <Row className="mb-4">
            <Col>
              <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>
                Welcome, {user?.name || "Faculty"}!
              </h2>
              <p className="text-muted">Faculty Dashboard</p>
            </Col>
          </Row>

          {loading ? (
            <Row>
              <Col md={12} className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Col>
            </Row>
          ) : error ? (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : (
            <Row className="g-4">
              {/* Manage Courses Section */}
              <Col lg={6} className="mb-4">
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Header
                    className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom d-flex justify-content-between align-items-center`}
                  >
                    <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Manage Courses</h5>
                    <Button variant="primary" size="sm" onClick={() => setShowCourseModal(true)}>
                      Create Course
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Students</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.length > 0 ? (
                          courses.map((course) => (
                            <tr key={course._id}>
                              <td>{course.title}</td>
                              <td>{course.students?.length || 0}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCourse(course)
                                      setShowAssignmentModal(true)
                                    }}
                                  >
                                    Add Assignment
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => navigate(`/course/${course._id}/attendance`)}
                                  >
                                    Mark Attendance
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => navigate(`/course/${course._id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-3">
                              No courses found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                  <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                    <Button variant="primary" onClick={() => navigate("/manage-courses")}>
                      Manage All Courses
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>

              {/* Manage Events Section */}
              <Col lg={6} className="mb-4">
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Header
                    className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom d-flex justify-content-between align-items-center`}
                  >
                    <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Manage Events</h5>
                    <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
                      Create Event
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.length > 0 ? (
                          events.map((event) => (
                            <tr key={event._id}>
                              <td>{event.title}</td>
                              <td>{new Date(event.date).toLocaleDateString()}</td>
                              <td>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => navigate(`/event/${event._id}`)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-3">
                              No events found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                  <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                    <Button variant="primary" onClick={() => navigate("/events")}>
                      View All Events
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>

              {/* Manage Students Section */}
              <Col lg={12} className="mb-4">
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
                    <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Manage Students</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Courses</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length > 0 ? (
                          students.map((student) => (
                            <tr key={student._id}>
                              <td>{student.name}</td>
                              <td>{student.email}</td>
                              <td>{student.courses?.length || 0}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/student/${student._id}`)}
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => navigate(`/student/${student._id}/grades`)}
                                  >
                                    Grades
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-3">
                              No students found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                  <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                    <Button variant="primary" onClick={() => navigate("/manage-students")}>
                      Manage All Students
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Create Event Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEvent}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter event description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Event
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create Course Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCourse}>
            <Form.Group className="mb-3">
              <Form.Label>Course Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course code (e.g. CS101)"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter course description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Credits</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    min={new Date().getFullYear() - 10}
                    max={new Date().getFullYear() + 10}
                    value={courseForm.year}
                    onChange={(e) => setCourseForm({ ...courseForm, year: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Course
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal show={showAssignmentModal} onHide={() => setShowAssignmentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateAssignment}>
            <Form.Group className="mb-3">
              <Form.Label>Assignment Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter assignment title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter assignment description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Marks</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={assignmentForm.totalMarks}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Assignment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default FacultyDashboard
