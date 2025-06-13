"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, ProgressBar, Spinner, Nav } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { BsBook, BsCalendarCheck, BsClipboardCheck, BsGraphUp } from "react-icons/bs"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import {
  courseService,
  attendanceService,
  assignmentService,
  gradeService,
  eventService,
  notificationService,
} from "../../services/api"

const StudentDashboard = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    attendance: [],
    assignments: [],
    grades: [],
    events: [],
    notifications: [],
    stats: {
      totalCourses: 0,
      averageGrade: 0,
      attendanceRate: 0,
      completedAssignments: 0,
    },
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [
        coursesResponse,
        attendanceResponse,
        assignmentsResponse,
        gradesResponse,
        eventsResponse,
        notificationsResponse,
      ] = await Promise.all([
        courseService.getCourses(),
        attendanceService.getStudentAttendanceStats(user?.id),
        assignmentService.getStudentAssignments(user?.id),
        gradeService.getStudentGrades(user?.id),
        eventService.getEvents(),
        notificationService.getUserNotifications(),
      ])

      // Calculate stats
      const courses = coursesResponse.data
      const attendance = attendanceResponse.data
      const assignments = assignmentsResponse.data
      const grades = gradesResponse.data
      const events = eventsResponse.data
      const notifications = notificationsResponse.data

      // Calculate average attendance rate
      const attendanceRate =
        attendance.length > 0
          ? Math.round(attendance.reduce((sum, record) => sum + record.percentage, 0) / attendance.length)
          : 0

      // Calculate average GPA
      const gradePoints = {
        "A+": 4.0,
        A: 4.0,
        "A-": 3.7,
        "B+": 3.3,
        B: 3.0,
        "B-": 2.7,
        "C+": 2.3,
        C: 2.0,
        "C-": 1.7,
        "D+": 1.3,
        D: 1.0,
        "D-": 0.7,
        F: 0.0,
      }

      const totalGradePoints = grades.reduce((sum, grade) => {
        return sum + (gradePoints[grade.grade] || 0)
      }, 0)

      const averageGrade = grades.length > 0 ? (totalGradePoints / grades.length).toFixed(1) : 0

      // Count completed assignments
      const completedAssignments = assignments.filter(
        (assignment) => assignment.submission && assignment.submission.status !== "pending",
      ).length

      setDashboardData({
        courses,
        attendance,
        assignments,
        grades,
        events: events.filter((event) => new Date(event.date) >= new Date()).slice(0, 3),
        notifications: notifications.slice(0, 5),
        stats: {
          totalCourses: courses.length,
          averageGrade,
          attendanceRate,
          completedAssignments,
        },
      })

      toast.success("Dashboard loaded successfully")
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (eventId) => {
    try {
      await eventService.rsvpEvent(eventId)

      // Update local state
      setDashboardData((prev) => ({
        ...prev,
        events: prev.events.map((event) => (event._id === eventId ? { ...event, rsvped: true } : event)),
      }))

      toast.success("Successfully RSVPed to event")
    } catch (error) {
      console.error("Error RSVPing to event:", error)
      toast.error("Failed to RSVP to event")
    }
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)

      // Update local state
      setDashboardData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      }))

      toast.success("Notification marked as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to mark notification as read")
    }
  }

  const getGradeColor = (grade) => {
    if (grade.startsWith("A")) return "success"
    if (grade.startsWith("B")) return "info"
    if (grade.startsWith("C")) return "warning"
    return "danger"
  }

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return "success"
    if (percentage >= 75) return "warning"
    return "danger"
  }

  const getAssignmentStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return <Badge bg="info">Submitted</Badge>
      case "graded":
        return <Badge bg="success">Graded</Badge>
      case "late":
        return <Badge bg="warning">Late</Badge>
      case "overdue":
        return <Badge bg="danger">Overdue</Badge>
      default:
        return <Badge bg="secondary">Pending</Badge>
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "assignment":
        return "📝"
      case "attendance":
        return "📊"
      case "grade":
        return "🎓"
      case "announcement":
        return "📢"
      case "event":
        return "🎉"
      case "message":
        return "💬"
      default:
        return "⚙️"
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-muted">Here's what's happening in your academic journey</p>
              </motion.div>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Body className="d-flex flex-column align-items-center p-4">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                      <BsBook className="fs-3 text-primary" />
                    </div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {dashboardData.stats.totalCourses}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Active Courses</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Body className="d-flex flex-column align-items-center p-4">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                      <BsGraphUp className="fs-3 text-success" />
                    </div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {dashboardData.stats.averageGrade}/4.0
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Average GPA</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Body className="d-flex flex-column align-items-center p-4">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 mb-3">
                      <BsCalendarCheck className="fs-3 text-info" />
                    </div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {dashboardData.stats.attendanceRate}%
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Attendance Rate</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                  <Card.Body className="d-flex flex-column align-items-center p-4">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 mb-3">
                      <BsClipboardCheck className="fs-3 text-warning" />
                    </div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {dashboardData.stats.completedAssignments}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Assignments Done</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Dashboard Tabs */}
          <Card className={`border-0 shadow-sm mb-4 bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    className={activeTab === "overview" ? "border-primary border-top-3" : ""}
                  >
                    Overview
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "courses"}
                    onClick={() => setActiveTab("courses")}
                    className={activeTab === "courses" ? "border-primary border-top-3" : ""}
                  >
                    Courses
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "assignments"}
                    onClick={() => setActiveTab("assignments")}
                    className={activeTab === "assignments" ? "border-primary border-top-3" : ""}
                  >
                    Assignments
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "attendance"}
                    onClick={() => setActiveTab("attendance")}
                    className={activeTab === "attendance" ? "border-primary border-top-3" : ""}
                  >
                    Attendance
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "grades"}
                    onClick={() => setActiveTab("grades")}
                    className={activeTab === "grades" ? "border-primary border-top-3" : ""}
                  >
                    Grades
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <Row>
                  <Col lg={8}>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Recent Assignments</h5>
                    {dashboardData.assignments.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Assignment</th>
                            <th>Course</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.assignments.slice(0, 5).map((assignment) => (
                            <tr key={assignment._id}>
                              <td>{assignment.title}</td>
                              <td>{assignment.course.title}</td>
                              <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                              <td>
                                {getAssignmentStatusBadge(
                                  assignment.submission ? assignment.submission.status : "pending",
                                )}
                              </td>
                              <td>
                                {assignment.submission ? (
                                  <Button variant="outline-success" size="sm" disabled>
                                    Submitted
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/assignment/${assignment._id}`)}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No recent assignments.</p>
                    )}
                  </Col>
                  <Col lg={4}>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Upcoming Events</h5>
                    {dashboardData.events.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.events.map((event) => (
                            <tr key={event._id}>
                              <td>{event.title}</td>
                              <td>{new Date(event.date).toLocaleDateString()}</td>
                              <td>
                                {event.rsvped ? (
                                  <Button variant="outline-success" size="sm" disabled>
                                    RSVPed
                                  </Button>
                                ) : (
                                  <Button variant="outline-primary" size="sm" onClick={() => handleRSVP(event._id)}>
                                    RSVP
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No upcoming events.</p>
                    )}

                    <h5 className={`mb-3 mt-4 text-${theme === "dark" ? "light" : "dark"}`}>Notifications</h5>
                    {dashboardData.notifications.length > 0 ? (
                      <div className={`list-group ${theme === "dark" ? "list-group-dark" : ""}`}>
                        {dashboardData.notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`list-group-item list-group-item-action d-flex gap-3 py-3 ${
                              !notification.read ? "bg-light-subtle" : ""
                            } ${theme === "dark" ? "bg-dark text-light border-secondary" : ""}`}
                            onClick={() => handleMarkNotificationAsRead(notification._id)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="fs-4">{getNotificationIcon(notification.type)}</div>
                            <div className="d-flex gap-2 w-100 justify-content-between">
                              <div>
                                <h6 className="mb-0">{notification.title}</h6>
                                <p className="mb-0 opacity-75">{notification.message}</p>
                                <small className="opacity-50 text-nowrap">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </small>
                              </div>
                              {!notification.read && (
                                <small className="opacity-50 text-nowrap">
                                  <Badge bg="primary" pill>
                                    New
                                  </Badge>
                                </small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No notifications.</p>
                    )}
                  </Col>
                </Row>
              )}

              {/* Courses Tab */}
              {activeTab === "courses" && (
                <Row>
                  <Col>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Enrolled Courses</h5>
                    {dashboardData.courses.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Course Code</th>
                            <th>Title</th>
                            <th>Instructor</th>
                            <th>Semester</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.courses.map((course) => (
                            <tr key={course._id}>
                              <td>{course.code}</td>
                              <td>{course.title}</td>
                              <td>{course.instructor?.name || "Not assigned"}</td>
                              <td>
                                {course.semester} {course.year}
                              </td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/course/${course._id}`)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No courses enrolled.</p>
                    )}
                  </Col>
                </Row>
              )}

              {/* Assignments Tab */}
              {activeTab === "assignments" && (
                <Row>
                  <Col>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>All Assignments</h5>
                    {dashboardData.assignments.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Assignment</th>
                            <th>Course</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.assignments.map((assignment) => (
                            <tr key={assignment._id}>
                              <td>{assignment.title}</td>
                              <td>{assignment.course.title}</td>
                              <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                              <td>
                                {getAssignmentStatusBadge(
                                  assignment.submission ? assignment.submission.status : "pending",
                                )}
                              </td>
                              <td>
                                {assignment.submission && assignment.submission.marks ? (
                                  <Badge bg="success">
                                    {assignment.submission.marks}/{assignment.totalMarks}
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary">Not graded</Badge>
                                )}
                              </td>
                              <td>
                                {assignment.submission ? (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => navigate(`/assignment/${assignment._id}`)}
                                  >
                                    View
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/assignment/${assignment._id}`)}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No assignments available.</p>
                    )}
                  </Col>
                </Row>
              )}

              {/* Attendance Tab */}
              {activeTab === "attendance" && (
                <Row>
                  <Col>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Attendance Records</h5>
                    {dashboardData.attendance.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Total Classes</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.attendance.map((record) => (
                            <tr key={record.course._id}>
                              <td>{record.course.title}</td>
                              <td>{record.totalClasses}</td>
                              <td>{record.present}</td>
                              <td>{record.absent}</td>
                              <td>
                                <ProgressBar
                                  now={record.percentage}
                                  variant={getAttendanceColor(record.percentage)}
                                  label={`${record.percentage}%`}
                                  style={{ height: "20px" }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No attendance records available.</p>
                    )}
                  </Col>
                </Row>
              )}

              {/* Grades Tab */}
              {activeTab === "grades" && (
                <Row>
                  <Col>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Grades</h5>
                    {dashboardData.grades.length > 0 ? (
                      <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.grades.map((grade) => (
                            <tr key={grade._id}>
                              <td>{grade.course}</td>
                              <td>{grade.semester}</td>
                              <td>
                                <Badge bg={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className={`text-${theme === "dark" ? "light" : "dark"}`}>No grades available.</p>
                    )}
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  )
}

export default StudentDashboard
