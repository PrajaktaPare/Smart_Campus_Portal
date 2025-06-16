"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Spinner } from "react-bootstrap"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import { toast } from "react-toastify"
import {
  courseService,
  eventService,
  userService,
  assignmentService,
  authService,
  notificationService,
} from "../../services/api"
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
    department: user?.department || "Computer Science",
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
      // Check if user is authenticated before making requests
      if (!authService.isAuthenticated()) {
        setError("Please log in to access the dashboard")
        navigate("/")
        return
      }

      console.log("🔄 Fetching dashboard data for user:", user?.email, "Department:", user?.department)

      const [coursesRes, eventsRes, studentsRes, assignmentsRes] = await Promise.all([
        courseService.getCourses().catch(() => ({ data: { data: [] } })),
        eventService.getEvents().catch(() => ({ data: { data: [] } })),
        userService.getStudents().catch(() => ({ data: { data: [] } })),
        assignmentService.getAllAssignments().catch(() => ({ data: { data: [] } })),
      ])

      console.log("📚 Courses response:", coursesRes)
      console.log("📅 Events response:", eventsRes)
      console.log("👥 Students response:", studentsRes)
      console.log("📝 Assignments response:", assignmentsRes)

      // Handle courses with proper error checking
      const coursesData = coursesRes?.data?.data || coursesRes?.data || []
      setCourses(Array.isArray(coursesData) ? coursesData : [])

      // Handle events with proper error checking
      const eventsData = eventsRes?.data?.data || eventsRes?.data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])

      // Handle students with proper error checking
      const studentsData = studentsRes?.data?.data || studentsRes?.data || []
      console.log("👥 Extracted students data:", studentsData)

      if (Array.isArray(studentsData)) {
        // Filter students by department if user has department
        const filteredStudents = user?.department
          ? studentsData.filter((student) => student.department === user.department)
          : studentsData
        setStudents(filteredStudents)
        console.log(`✅ Loaded ${filteredStudents.length} students for faculty dashboard`)
      } else {
        console.error("❌ Students data is not an array:", studentsData)
        setStudents([])
      }

      // Handle assignments with proper error checking
      const assignmentsData = assignmentsRes?.data?.data || assignmentsRes?.data || []
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])

      // Set default course for assignment form if courses exist
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        setAssignmentForm((prev) => ({
          ...prev,
          courseId: coursesData[0]._id || coursesData[0].id,
        }))
      }

      console.log("✅ Dashboard data loaded successfully")
    } catch (err) {
      console.error("❌ Failed to load dashboard data:", err)

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
        authService.logout()
        navigate("/")
      } else {
        setError("Failed to load dashboard data")
        toast.error("Failed to load dashboard data")
      }
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
        organizer: user?.name || "Faculty",
        category: "academic",
      }

      console.log("📅 Creating event:", eventData)
      const response = await eventService.createEvent(eventData)

      // Add the new event to the list
      const newEvent = response.data || response
      setEvents((prevEvents) => [...prevEvents, newEvent])

      setShowEventModal(false)
      resetEventForm()
      toast.success("Event created successfully")
      console.log("✅ Event created successfully")
    } catch (error) {
      console.error("❌ Error creating event:", error)
      toast.error("Failed to create event: " + (error.response?.data?.message || error.message))
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      const courseData = {
        title: courseForm.title,
        name: courseForm.title, // Add name field for compatibility
        code: courseForm.code,
        description: courseForm.description,
        credits: Number(courseForm.credits),
        semester: courseForm.semester,
        year: Number(courseForm.year),
        department: courseForm.department,
        instructor: user?.name || "Faculty",
      }

      console.log("📚 Creating course:", courseData)
      const response = await courseService.createCourse(courseData)

      // Add the new course to the list
      const newCourse = response.data || response
      setCourses((prevCourses) => [...prevCourses, newCourse])

      setShowCourseModal(false)
      resetCourseForm()
      toast.success("Course created successfully")
      console.log("✅ Course created successfully")
    } catch (error) {
      console.error("❌ Error creating course:", error)
      toast.error("Failed to create course: " + (error.response?.data?.message || error.message))
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const assignmentData = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        course: assignmentForm.courseId,
        dueDate: new Date(assignmentForm.dueDate),
        totalMarks: Number(assignmentForm.totalMarks),
        maxMarks: Number(assignmentForm.totalMarks),
      }

      console.log("📝 Creating assignment:", assignmentData)
      const response = await assignmentService.createAssignment(assignmentData)

      // Add the new assignment to the list
      const newAssignment = response.data || response
      setAssignments((prevAssignments) => [...prevAssignments, newAssignment])

      setShowAssignmentModal(false)
      resetAssignmentForm()

      // Send notifications to enrolled students
      try {
        const selectedCourse = courses.find((c) => (c._id || c.id) === assignmentForm.courseId)
        if (selectedCourse && (selectedCourse.students || selectedCourse.enrolledStudents)) {
          const studentIds = selectedCourse.students || selectedCourse.enrolledStudents || []
          for (const studentId of studentIds) {
            await notificationService.createNotification({
              recipient: studentId,
              title: `New Assignment: ${assignmentForm.title}`,
              message: `A new assignment has been posted for ${selectedCourse.title || selectedCourse.name}. Due date: ${new Date(assignmentForm.dueDate).toLocaleDateString()}`,
              type: "assignment",
              relatedTo: {
                model: "Assignment",
                id: (response.data || response)._id || (response.data || response).id,
              },
            })
          }
        }
      } catch (notifError) {
        console.warn("Failed to send notifications:", notifError)
      }

      toast.success("Assignment created successfully")
      console.log("✅ Assignment created successfully")
    } catch (error) {
      console.error("❌ Error creating assignment:", error)
      toast.error("Failed to create assignment: " + (error.response?.data?.message || error.message))
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
      department: user?.department || "Computer Science",
    })
  }

  const resetAssignmentForm = () => {
    setAssignmentForm({
      title: "",
      description: "",
      courseId: courses.length > 0 ? courses[0]._id || courses[0].id : "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalMarks: 100,
    })
  }

  // Safe render function for course data
  const renderCourseRow = (course, index) => {
    const courseId = course._id || course.id || `course-${index}`
    const courseTitle = course.title || course.name || "Untitled Course"
    const studentCount = (course.students || course.enrolledStudents || []).length

    return (
      <tr key={courseId}>
        <td>{courseTitle}</td>
        <td>{studentCount}</td>
        <td>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setSelectedCourse(course)
                setAssignmentForm((prev) => ({
                  ...prev,
                  courseId: courseId,
                }))
                setShowAssignmentModal(true)
              }}
            >
              Add Assignment
            </Button>
            <Button variant="outline-info" size="sm" onClick={() => navigate(`/course/${courseId}/attendance`)}>
              Mark Attendance
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/course/${courseId}`)}>
              View
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  // Safe render function for event data
  const renderEventRow = (event, index) => {
    const eventId = event._id || event.id || `event-${index}`
    const eventTitle = event.title || "Untitled Event"
    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : "No date"

    return (
      <tr key={eventId}>
        <td>{eventTitle}</td>
        <td>{eventDate}</td>
        <td>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/event/${eventId}`)}>
            View
          </Button>
        </td>
      </tr>
    )
  }

  // Safe render function for assignment data
  const renderAssignmentRow = (assignment, index) => {
    const assignmentId = assignment._id || assignment.id || `assignment-${index}`
    const assignmentTitle = assignment.title || "Untitled Assignment"
    const courseName = assignment.course?.code || assignment.course?.title || assignment.course?.name || "N/A"
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : new Date()
    const isOverdue = dueDate < new Date()
    const submissionCount = (assignment.submissions || []).length

    return (
      <tr key={assignmentId}>
        <td>
          <div>
            <strong>{assignmentTitle}</strong>
            <small className="text-muted d-block">
              Total Marks: {assignment.totalMarks || assignment.maxMarks || 100}
            </small>
          </div>
        </td>
        <td>{courseName}</td>
        <td>
          <span className={`badge ${isOverdue ? "bg-danger" : "bg-success"}`}>{dueDate.toLocaleDateString()}</span>
        </td>
        <td>
          <span className="badge bg-info">{submissionCount} submissions</span>
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/assignment/${assignmentId}/submissions`)}
            >
              View Submissions
            </Button>
            <Button variant="outline-success" size="sm" onClick={() => navigate(`/assignment/${assignmentId}/grade`)}>
              Grade
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/assignment/${assignmentId}`)}>
              View Details
            </Button>
          </div>
        </td>
      </tr>
    )
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
              <p className="text-muted">Faculty Dashboard - {user?.department || "Computer Science"} Department</p>
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
                          courses.map((course, index) => renderCourseRow(course, index))
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
                          events.map((event, index) => renderEventRow(event, index))
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

              {/* Manage Assignments Section */}
              <Col lg={12} className="mb-4">
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Header
                    className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom d-flex justify-content-between align-items-center`}
                  >
                    <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      Manage Assignments ({assignments.length})
                    </h5>
                    <Button variant="primary" size="sm" onClick={() => setShowAssignmentModal(true)}>
                      Create Assignment
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Course</th>
                          <th>Due Date</th>
                          <th>Submissions</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.length > 0 ? (
                          assignments.map((assignment, index) => renderAssignmentRow(assignment, index))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-3">
                              No assignments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                  <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                    <Button variant="primary" onClick={() => navigate("/assignments")}>
                      Manage All Assignments
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>

              {/* Manage Students Section */}
              <Col lg={12} className="mb-4">
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
                    <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      Manage Students ({students.length})
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length > 0 ? (
                          students.slice(0, 5).map((student, index) => (
                            <tr key={student._id || student.id || `student-${index}`}>
                              <td>{student.name || "Unknown"}</td>
                              <td>{student.email || "No email"}</td>
                              <td>{student.department || "Not assigned"}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/student/${student._id || student.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => navigate(`/student/${student._id || student.id}/grades`)}
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
                              No students found in {user?.department || "this"} department
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

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter department"
                value={courseForm.department}
                onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
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
              <Form.Label>Course</Form.Label>
              <Form.Select
                value={assignmentForm.courseId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id || course.id} value={course._id || course.id}>
                    {course.code} - {course.title || course.name}
                  </option>
                ))}
              </Form.Select>
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
