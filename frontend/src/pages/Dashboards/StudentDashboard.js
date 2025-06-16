"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Table } from "react-bootstrap"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import { courseService, notificationService } from "../../services/api"

const StudentDashboard = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [grades, setGrades] = useState([])

  const [placementStats, setPlacementStats] = useState({
    activePlacements: 0,
    applications: 0,
    selected: 0,
  })

  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [departmentAssignments, setDepartmentAssignments] = useState([])
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    } else {
      // Get user from localStorage or sessionStorage
      const storedUserLS = localStorage.getItem("user")
      const storedUserSS = sessionStorage.getItem("user")

      console.log("🔍 Checking for user data in storage:", {
        localStorage: !!storedUserLS,
        sessionStorage: !!storedUserSS,
      })

      if (storedUserLS) {
        const userData = JSON.parse(storedUserLS)
        console.log("✅ User loaded from localStorage:", userData)
        fetchDashboardData(userData)
      } else if (storedUserSS) {
        const userData = JSON.parse(storedUserSS)
        console.log("✅ User loaded from sessionStorage:", userData)
        fetchDashboardData(userData)
      } else {
        console.log("❌ No user found in storage")
        setError("Please login to view dashboard")
        setLoading(false)
      }
    }
  }, [user])

  const fetchDashboardData = async (userData = user) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching dashboard data for student:", userData?.email)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      console.log("🔑 Using token:", token.substring(0, 20) + "...")

      // Fetch all data from database with correct endpoints
      const [coursesRes, assignmentsRes, eventsRes, notificationsRes] = await Promise.all([
        fetch("http://localhost:8000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("❌ Courses fetch error:", err)
          return { ok: false, json: () => [] }
        }),

        fetch("http://localhost:8000/api/assignments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("❌ Assignments fetch error:", err)
          return { ok: false, json: () => [] }
        }),

        fetch("http://localhost:8000/api/events", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("❌ Events fetch error:", err)
          return { ok: false, json: () => [] }
        }),

        fetch("http://localhost:8000/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("❌ Notifications fetch error:", err)
          return { ok: false, json: () => [] }
        }),
      ])

      console.log("📊 API Response Status:", {
        courses: coursesRes.ok,
        assignments: assignmentsRes.ok,
        events: eventsRes.ok,
        notifications: notificationsRes.ok,
      })

      // Process courses
      let coursesData = []
      if (coursesRes.ok) {
        try {
          const rawCoursesData = await coursesRes.json()
          console.log("✅ Raw courses data:", rawCoursesData)

          // Handle different response formats
          if (Array.isArray(rawCoursesData)) {
            coursesData = rawCoursesData
          } else if (rawCoursesData.data && Array.isArray(rawCoursesData.data)) {
            coursesData = rawCoursesData.data
          } else if (rawCoursesData.courses && Array.isArray(rawCoursesData.courses)) {
            coursesData = rawCoursesData.courses
          } else {
            console.warn("⚠️ Unexpected courses data format:", rawCoursesData)
            coursesData = []
          }
        } catch (err) {
          console.error("❌ Error parsing courses JSON:", err)
          coursesData = []
        }
      } else {
        console.error("❌ Courses API failed with status:", coursesRes.status)
      }

      const departmentCourses =
        userData?.department && coursesData.length > 0
          ? coursesData.filter((course) => course.department === userData.department)
          : coursesData
      setCourses(departmentCourses)
      console.log("✅ Courses loaded:", departmentCourses.length)

      // Process assignments
      let assignmentsData = []
      if (assignmentsRes.ok) {
        try {
          const rawAssignmentsData = await assignmentsRes.json()
          console.log("✅ Raw assignments data:", rawAssignmentsData)

          // Handle different response formats
          if (Array.isArray(rawAssignmentsData)) {
            assignmentsData = rawAssignmentsData
          } else if (rawAssignmentsData.data && Array.isArray(rawAssignmentsData.data)) {
            assignmentsData = rawAssignmentsData.data
          } else if (rawAssignmentsData.assignments && Array.isArray(rawAssignmentsData.assignments)) {
            assignmentsData = rawAssignmentsData.assignments
          } else {
            console.warn("⚠️ Unexpected assignments data format:", rawAssignmentsData)
            assignmentsData = []
          }
        } catch (err) {
          console.error("❌ Error parsing assignments JSON:", err)
          assignmentsData = []
        }
      } else {
        console.error("❌ Assignments API failed with status:", assignmentsRes.status)
      }

      const departmentAssignmentsData =
        userData?.department && assignmentsData.length > 0
          ? assignmentsData.filter(
              (assignment) =>
                assignment.course?.department === userData.department ||
                assignment.createdBy?.department === userData.department,
            )
          : assignmentsData
      setAssignments(departmentAssignmentsData)
      console.log("✅ Assignments loaded:", departmentAssignmentsData.length)

      // Process events
      let eventsData = []
      if (eventsRes.ok) {
        try {
          const rawEventsData = await eventsRes.json()
          console.log("✅ Raw events data:", rawEventsData)

          // Handle different response formats
          if (Array.isArray(rawEventsData)) {
            eventsData = rawEventsData
          } else if (rawEventsData.data && Array.isArray(rawEventsData.data)) {
            eventsData = rawEventsData.data
          } else if (rawEventsData.events && Array.isArray(rawEventsData.events)) {
            eventsData = rawEventsData.events
          } else {
            console.warn("⚠️ Unexpected events data format:", rawEventsData)
            eventsData = []
          }
        } catch (err) {
          console.error("❌ Error parsing events JSON:", err)
          eventsData = []
        }
      } else {
        console.error("❌ Events API failed with status:", eventsRes.status)
      }

      const departmentEvents =
        userData?.department && eventsData.length > 0
          ? eventsData.filter((event) => !event.department || event.department === userData.department)
          : eventsData
      setEvents(departmentEvents)
      console.log("✅ Events loaded:", departmentEvents.length)

      // Process notifications
      let notificationsData = []
      if (notificationsRes.ok) {
        try {
          const rawNotificationsData = await notificationsRes.json()
          console.log("✅ Raw notifications data:", rawNotificationsData)

          // Handle different response formats
          if (Array.isArray(rawNotificationsData)) {
            notificationsData = rawNotificationsData
          } else if (rawNotificationsData.data && Array.isArray(rawNotificationsData.data)) {
            notificationsData = rawNotificationsData.data
          } else if (rawNotificationsData.notifications && Array.isArray(rawNotificationsData.notifications)) {
            notificationsData = rawNotificationsData.notifications
          } else {
            console.warn("⚠️ Unexpected notifications data format:", rawNotificationsData)
            notificationsData = []
          }
        } catch (err) {
          console.error("❌ Error parsing notifications JSON:", err)
          notificationsData = []
        }
      } else {
        console.error("❌ Notifications API failed with status:", notificationsRes.status)
      }

      setNotifications(notificationsData)
      console.log("✅ Notifications loaded:", notificationsData.length)

      // Extract grades from assignments
      const studentGrades = []
      departmentAssignmentsData.forEach((assignment) => {
        const studentSubmission = (assignment.submissions || []).find(
          (sub) => (sub.student?._id || sub.student?.id) === (userData?._id || userData?.id),
        )
        if (studentSubmission && (studentSubmission.grade !== undefined || studentSubmission.marks !== undefined)) {
          studentGrades.push({
            assignmentId: assignment._id || assignment.id,
            assignmentTitle: assignment.title,
            course: assignment.course?.title || assignment.course?.name || "Unknown Course",
            courseCode: assignment.course?.code || "N/A",
            marks: studentSubmission.marks || studentSubmission.grade,
            totalMarks: assignment.totalMarks || assignment.maxMarks || 100,
            feedback: studentSubmission.feedback,
            gradedAt: studentSubmission.gradedAt,
          })
        }
      })
      setGrades(studentGrades)
      console.log("✅ Grades extracted:", studentGrades.length)

      // Set available courses for enrollment
      const enrolledCourseIds = userData?.enrolledCourses || []
      const availableForEnrollment = departmentCourses.filter(
        (course) =>
          !enrolledCourseIds.includes(course._id) &&
          !course.students?.some((student) => (student._id || student) === userData._id) &&
          course.isActive !== false,
      )
      setAvailableCourses(availableForEnrollment)

      // Set enrolled courses
      const enrolled = departmentCourses.filter(
        (course) =>
          enrolledCourseIds.includes(course._id) ||
          course.students?.some((student) => (student._id || student) === userData._id),
      )
      setEnrolledCourses(enrolled)

      console.log("🎉 Dashboard data loaded successfully!")
    } catch (err) {
      console.error("💥 Error fetching dashboard data:", err)
      setError("Failed to load dashboard data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          (notification._id || notification.id) === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleQuickEnroll = async (course) => {
    try {
      setEnrolling(true)
      setError(null)

      await courseService.enrollInCourse(course._id || course.id)

      // Create enrollment notification
      const enrollmentNotification = {
        title: `Successfully Enrolled in ${course.title}`,
        message: `You have been enrolled in ${course.title} (${course.code}) taught by ${course.instructor?.name || "TBA"}. Welcome to the course!`,
        type: "enrollment",
        relatedTo: {
          model: "Course",
          id: course._id || course.id,
        },
      }

      try {
        await notificationService.createNotification(enrollmentNotification)
      } catch (notifError) {
        console.warn("Failed to create enrollment notification:", notifError)
      }

      setSuccess(`Successfully enrolled in ${course.title}!`)

      // Refresh data
      setTimeout(() => {
        fetchDashboardData()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      console.error("❌ Error enrolling in course:", error)
      setError(error.message || "Failed to enroll in course")
    } finally {
      setEnrolling(false)
    }
  }

  const getAvailableCoursesForEnrollment = () => {
    return courses.filter((course) => {
      // Filter out courses student is already enrolled in
      const isEnrolled = enrolledCourses.some((enrolled) => (enrolled._id || enrolled.id) === (course._id || course.id))
      return !isEnrolled && course.isActive !== false
    })
  }

  const getDepartmentAssignments = () => {
    return assignments.filter((assignment) => {
      // Show all assignments from department faculty
      return assignment.course?.department === user?.department || assignment.createdBy?.department === user?.department
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading dashboard data...</p>
            </Col>
          </Row>
        </Container>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <div className="mt-3">
              <Button variant="outline-danger" onClick={() => fetchDashboardData()} className="me-2">
                Try Again
              </Button>
              <Button variant="primary" onClick={() => navigate("/")}>
                Go to Login
              </Button>
            </div>
          </Alert>
        </Container>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Alert variant="warning">
            <i className="bi bi-info-circle me-2"></i>
            User not logged in. Please log in to view this page.
            <div className="mt-3">
              <Button variant="primary" onClick={() => navigate("/")}>
                Go to Login
              </Button>
            </div>
          </Alert>
        </Container>
        <Footer />
      </>
    )
  }

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <>
      <Navbar />
      <Container className={`mt-4 ${theme === "dark" ? "text-light" : ""}`}>
        <h2>Student Dashboard</h2>
        <p className="text-muted">
          Welcome, {user.name}! Department: {user.department}
        </p>

        {unreadNotifications.length > 0 && (
          <Alert variant="info" className="mb-4">
            <h5>
              <i className="bi bi-bell me-2"></i>
              You have {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? "s" : ""}
            </h5>
            <div className="notification-list">
              {unreadNotifications.slice(0, 3).map((notification) => (
                <div key={notification._id || notification.id} className="notification-item p-2 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{notification.title}</strong>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => markNotificationAsRead(notification._id || notification.id)}
                    >
                      Mark as read
                    </Button>
                  </div>
                </div>
              ))}
              {unreadNotifications.length > 3 && (
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => navigate("/notifications")}>
                    View all notifications
                  </Button>
                </div>
              )}
            </div>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        <Row>
          {/* Stats Cards */}
          <Col md={6} lg={3} className="mb-4">
            <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Body className="text-center">
                <div className="display-4 text-primary mb-2">
                  <i className="bi bi-book"></i>
                </div>
                <h3 className="mb-1">{courses.length}</h3>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-0`}>Available Courses</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Body className="text-center">
                <div className="display-4 text-success mb-2">
                  <i className="bi bi-check-circle"></i>
                </div>
                <h3 className="mb-1">{assignments.filter((a) => a.status === "Completed").length}</h3>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-0`}>Completed Assignments</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Body className="text-center">
                <div className="display-4 text-warning mb-2">
                  <i className="bi bi-briefcase"></i>
                </div>
                <h3 className="mb-1">{placementStats.activePlacements}</h3>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-0`}>Active Placements</p>
                <small className="text-success">
                  {placementStats.applications} Applied • {placementStats.selected} Selected
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className={`h-100 border-0 shadow-sm ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Body className="text-center">
                <div className="display-4 text-info mb-2">
                  <i className="bi bi-clock"></i>
                </div>
                <h3 className="mb-1">{assignments.filter((a) => new Date(a.dueDate) > new Date()).length}</h3>
                <p className={`${theme === "dark" ? "text-light" : "text-muted"} mb-0`}>Upcoming Deadlines</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Courses Section */}
          <Col lg={6} className="mb-4">
            <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-book me-2"></i>
                  Available Courses
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/courses")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {courses.length > 0 ? (
                  courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id || course._id}
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <div>
                        <p className="mb-1">
                          <strong>{course.title || course.name}</strong>
                        </p>
                        <p className={`${theme === "dark" ? "text-light" : "text-muted"} small mb-0`}>
                          {course.code} • {course.credits} Credits • {course.instructor?.name || "TBA"}
                        </p>
                      </div>
                      <div className="text-end">
                        <Badge bg="primary">{course.department}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No courses available for your department.
                  </Alert>
                )}
                <div className="d-grid mt-3">
                  <Button variant="primary" onClick={() => navigate("/courses")}>
                    <i className="bi bi-book me-2"></i>
                    View All Courses
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Assignments Section */}
          <Col lg={6} className="mb-4">
            <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-list-task me-2"></i>
                  Recent Assignments
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/assignments")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {assignments.length > 0 ? (
                  assignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id || assignment._id}
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <div>
                        <p className="mb-1">
                          <strong>{assignment.title}</strong>
                        </p>
                        <p className={`${theme === "dark" ? "text-light" : "text-muted"} small mb-0`}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} •{" "}
                          {assignment.totalMarks || assignment.maxMarks || 100} marks
                        </p>
                      </div>
                      <div className="text-end">
                        {assignment.status === "Completed" ? (
                          <Badge bg="success">Completed</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No assignments found.
                  </Alert>
                )}
                <div className="d-grid mt-3">
                  <Button variant="primary" onClick={() => navigate("/assignments")}>
                    <i className="bi bi-list-task me-2"></i>
                    View All Assignments
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Grades Section */}
          <Col lg={12} className="mb-4">
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-award me-2"></i>
                  Recent Grades
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/grades")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className={`mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Course</th>
                      <th>Marks</th>
                      <th>Feedback</th>
                      <th>Grade Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.length > 0 ? (
                      grades.slice(0, 5).map((grade, index) => (
                        <tr key={grade.assignmentId || index}>
                          <td>{grade.assignmentTitle}</td>
                          <td>
                            <div>
                              <strong>{grade.courseCode}</strong>
                              <small className="text-muted d-block">{grade.course}</small>
                            </div>
                          </td>
                          <td>
                            <Badge
                              bg={
                                grade.marks >= grade.totalMarks * 0.8
                                  ? "success"
                                  : grade.marks >= grade.totalMarks * 0.6
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {grade.marks}/{grade.totalMarks}
                            </Badge>
                          </td>
                          <td>
                            <small>{grade.feedback || "No feedback"}</small>
                          </td>
                          <td>
                            <small>{grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : "N/A"}</small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-3">
                          No grades available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Events Section */}
          <Col lg={12} className="mb-4">
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  Upcoming Events
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/events")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {events.length > 0 ? (
                  events.slice(0, 3).map((event) => (
                    <div key={event.id || event._id} className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <p className="mb-1">
                          <strong>{event.title}</strong>
                        </p>
                        <p className={`${theme === "dark" ? "text-light" : "text-muted"} small mb-0`}>
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <div className="text-end">
                        <Badge bg="info">{event.category || "Event"}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No upcoming events.
                  </Alert>
                )}
                <div className="d-grid mt-3">
                  <Button variant="primary" onClick={() => navigate("/events")}>
                    <i className="bi bi-calendar-event me-2"></i>
                    View All Events
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Department Assignments Section */}
          <Col lg={6} className="mb-4">
            <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-building me-2"></i>
                  Department Assignments
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/assignments")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {departmentAssignments.length > 0 ? (
                  departmentAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id || assignment._id}
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <div>
                        <p className="mb-1">
                          <strong>{assignment.title}</strong>
                        </p>
                        <p className={`${theme === "dark" ? "text-light" : "text-muted"} small mb-0`}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} •{" "}
                          {assignment.totalMarks || assignment.maxMarks || 100} marks
                        </p>
                      </div>
                      <div className="text-end">
                        {assignment.status === "Completed" ? (
                          <Badge bg="success">Completed</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No department assignments found.
                  </Alert>
                )}
                <div className="d-grid mt-3">
                  <Button variant="primary" onClick={() => navigate("/assignments")}>
                    <i className="bi bi-list-task me-2"></i>
                    View All Assignments
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Course Enrollment Section */}
          <Col lg={6} className="mb-4">
            <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Quick Course Enrollment
                </h5>
              </Card.Header>
              <Card.Body>
                {availableCourses.length > 0 ? (
                  availableCourses.slice(0, 3).map((course) => (
                    <div
                      key={course.id || course._id}
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <div>
                        <p className="mb-1">
                          <strong>{course.title || course.name}</strong>
                        </p>
                        <p className={`${theme === "dark" ? "text-light" : "text-muted"} small mb-0`}>
                          {course.code} • {course.credits} Credits • {course.instructor?.name || "TBA"}
                        </p>
                      </div>
                      <div className="text-end">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleQuickEnroll(course)}
                          disabled={enrolling}
                        >
                          {enrolling ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Enrolling...
                            </>
                          ) : (
                            "Enroll"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No courses available for quick enrollment.
                  </Alert>
                )}
                <div className="d-grid mt-3">
                  <Button variant="primary" onClick={() => navigate("/courses")}>
                    <i className="bi bi-plus-circle me-2"></i>
                    View All Courses
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Department Assignments Section */}
        <Row className="mb-4">
          <Col>
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Department Assignments ({getDepartmentAssignments().length})
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/assignments")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {getDepartmentAssignments().length > 0 ? (
                  <Row>
                    {getDepartmentAssignments()
                      .slice(0, 6)
                      .map((assignment) => {
                        const studentSubmission = assignment.submissions?.find(
                          (sub) => (sub.student?._id || sub.student?.id) === (user?._id || user?.id),
                        )
                        const isOverdue = new Date(assignment.dueDate) < new Date()
                        const hasSubmitted = !!studentSubmission
                        const isEnrolledInCourse = enrolledCourses.some(
                          (course) => (course._id || course.id) === (assignment.course?._id || assignment.course?.id),
                        )

                        return (
                          <Col md={6} lg={4} key={assignment._id || assignment.id} className="mb-3">
                            <Card
                              className={`h-100 border-start border-4 ${
                                hasSubmitted ? "border-success" : isOverdue ? "border-danger" : "border-warning"
                              } ${theme === "dark" ? "bg-dark text-light" : ""}`}
                            >
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-1">{assignment.title}</h6>
                                  <Badge bg={isEnrolledInCourse ? "primary" : "secondary"} className="ms-2">
                                    {isEnrolledInCourse ? "Enrolled" : "Not Enrolled"}
                                  </Badge>
                                </div>

                                <p className="text-muted small mb-2">
                                  <i className="bi bi-book me-1"></i>
                                  {assignment.course?.code} - {assignment.course?.title}
                                </p>

                                <p className="text-muted small mb-2">
                                  <i className="bi bi-person me-1"></i>
                                  {assignment.createdBy?.name || assignment.instructor?.name || "Faculty"}
                                </p>

                                <p className="text-muted small mb-2">
                                  <i className="bi bi-calendar me-1"></i>
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </p>

                                <p className="text-muted small mb-3">
                                  <i className="bi bi-award me-1"></i>
                                  {assignment.totalMarks || assignment.maxMarks || 100} marks
                                </p>

                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    {hasSubmitted ? (
                                      studentSubmission.status === "graded" ? (
                                        <Badge bg="success">
                                          Graded ({studentSubmission.marks}/
                                          {assignment.totalMarks || assignment.maxMarks || 100})
                                        </Badge>
                                      ) : (
                                        <Badge bg="warning" text="dark">
                                          Submitted
                                        </Badge>
                                      )
                                    ) : isOverdue ? (
                                      <Badge bg="danger">Overdue</Badge>
                                    ) : (
                                      <Badge bg="info">Pending</Badge>
                                    )}
                                  </div>

                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/assignments/${assignment._id || assignment.id}`)}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    View
                                  </Button>
                                </div>

                                {!isEnrolledInCourse && (
                                  <div className="mt-2">
                                    <small className="text-info">
                                      <i className="bi bi-info-circle me-1"></i>
                                      Enroll in course to submit assignments
                                    </small>
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                  </Row>
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No assignments available from your department faculty.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Course Enrollment Section */}
        <Row className="mb-4">
          <Col>
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Quick Course Enrollment
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/courses")}>
                  View All Courses
                </Button>
              </Card.Header>
              <Card.Body>
                {getAvailableCoursesForEnrollment().length > 0 ? (
                  <Row>
                    {getAvailableCoursesForEnrollment()
                      .slice(0, 3)
                      .map((course) => (
                        <Col md={4} key={course._id || course.id} className="mb-3">
                          <Card className={`h-100 border-success ${theme === "dark" ? "bg-dark text-light" : ""}`}>
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-1">{course.title}</h6>
                                <Badge bg="success">{course.code}</Badge>
                              </div>

                              <p className="text-muted small mb-2">
                                <i className="bi bi-person me-1"></i>
                                {course.instructor?.name || "TBA"}
                              </p>

                              <p className="text-muted small mb-2">
                                <i className="bi bi-calendar me-1"></i>
                                {course.semester} {course.year} • {course.credits} Credits
                              </p>

                              <p className="text-muted small mb-3">
                                <i className="bi bi-people me-1"></i>
                                {course.enrolledCount || 0}/{course.maxStudents || 50} students
                              </p>

                              <div className="d-grid">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleQuickEnroll(course)}
                                  disabled={enrolling || course.enrolledCount >= (course.maxStudents || 50)}
                                >
                                  {enrolling ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Enrolling...
                                    </>
                                  ) : course.enrolledCount >= (course.maxStudents || 50) ? (
                                    "Course Full"
                                  ) : (
                                    <>
                                      <i className="bi bi-plus-circle me-1"></i>
                                      Quick Enroll
                                    </>
                                  )}
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No courses available for enrollment in your department, or you're already enrolled in all available
                    courses.
                    <div className="mt-2">
                      <Button variant="outline-primary" size="sm" onClick={() => navigate("/courses")}>
                        Browse All Courses
                      </Button>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Notifications Section */}
        <Row className="mb-4">
          <Col>
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  Recent Notifications ({notifications.length})
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/notifications")}>
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification._id || notification.id}
                        className={`notification-item p-3 mb-2 border rounded ${
                          !notification.read ? "border-primary bg-light" : "border-secondary"
                        } ${theme === "dark" ? "bg-dark text-light" : ""}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <span className="me-2">
                                {notification.type === "enrollment" && "🎓"}
                                {notification.type === "assignment" && "📝"}
                                {notification.type === "grade" && "📊"}
                                {notification.type === "event" && "🎉"}
                                {notification.type === "announcement" && "📢"}
                                {!["enrollment", "assignment", "grade", "event", "announcement"].includes(
                                  notification.type,
                                ) && "📌"}
                              </span>
                              <strong className={notification.read ? "text-muted" : "text-primary"}>
                                {notification.title}
                              </strong>
                              {!notification.read && (
                                <Badge bg="primary" className="ms-2">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="mb-1 small">{notification.message}</p>
                            <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                          <div className="ms-3">
                            {!notification.read && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => markNotificationAsRead(notification._id || notification.id)}
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    No notifications yet. You'll see updates about assignments, grades, enrollments, and events here.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-lightning me-2"></i>
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <div className="d-grid">
                      <Button variant="outline-primary" onClick={() => navigate("/attendance")}>
                        <i className="bi bi-calendar-check me-2"></i>
                        Mark Attendance
                      </Button>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="d-grid">
                      <Button variant="outline-success" onClick={() => navigate("/assignments")}>
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Submit Assignment
                      </Button>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="d-grid">
                      <Button variant="outline-info" onClick={() => navigate("/placements")}>
                        <i className="bi bi-briefcase me-2"></i>
                        View Placements
                      </Button>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="d-grid">
                      <Button variant="outline-warning" onClick={() => navigate("/profile")}>
                        <i className="bi bi-person me-2"></i>
                        Update Profile
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default StudentDashboard
