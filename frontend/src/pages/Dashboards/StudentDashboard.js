"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, ProgressBar, Spinner } from "react-bootstrap"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"

const StudentDashboard = () => {
  const { user } = useContext(AuthContext)
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    events: [],
    attendance: [],
    grades: [],
    placements: [],
    notifications: [],
    stats: {
      totalCourses: 0,
      averageGrade: 0,
      attendanceRate: 0,
      completedAssignments: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For now, using mock data for demonstration

        const mockData = {
          courses: [
            { _id: "1", title: "Introduction to Programming", instructor: "Dr. Smith", progress: 75 },
            { _id: "2", title: "Data Structures", instructor: "Prof. Johnson", progress: 60 },
            { _id: "3", title: "Web Development", instructor: "Dr. Brown", progress: 90 },
          ],
          events: [
            {
              _id: "1",
              title: "Tech Workshop",
              date: "2025-06-20",
              description: "Learn modern technologies",
              rsvped: false,
            },
            { _id: "2", title: "Career Fair", date: "2025-06-25", description: "Meet top companies", rsvped: true },
            {
              _id: "3",
              title: "Coding Competition",
              date: "2025-07-01",
              description: "Show your skills",
              rsvped: false,
            },
          ],
          attendance: [
            { _id: "1", course: "Introduction to Programming", percentage: 85 },
            { _id: "2", course: "Data Structures", percentage: 78 },
            { _id: "3", course: "Web Development", percentage: 92 },
          ],
          grades: [
            { _id: "1", course: "Introduction to Programming", grade: "A", semester: "Spring 2025" },
            { _id: "2", course: "Data Structures", grade: "B+", semester: "Spring 2025" },
            { _id: "3", course: "Web Development", grade: "A-", semester: "Spring 2025" },
          ],
          placements: [
            { _id: "1", company: "Tech Corp", role: "Software Engineer", status: "Applied" },
            { _id: "2", company: "Innovation Labs", role: "Frontend Developer", status: "Interview Scheduled" },
          ],
          notifications: [
            { _id: "1", message: "New assignment posted in Web Development", read: false, type: "assignment" },
            { _id: "2", message: "Career Fair registration is now open", read: false, type: "event" },
            { _id: "3", message: "Grade updated for Data Structures", read: true, type: "grade" },
          ],
        }

        setDashboardData({
          ...mockData,
          stats: {
            totalCourses: mockData.courses.length,
            averageGrade: 3.7,
            attendanceRate: Math.round(
              mockData.attendance.reduce((acc, att) => acc + att.percentage, 0) / mockData.attendance.length,
            ),
            completedAssignments: 12,
          },
        })

        toast.success("Dashboard loaded successfully")
      } catch (err) {
        console.error(err)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleRSVP = async (eventId) => {
    try {
      // In a real application, this would be an API call
      // await eventService.rsvpEvent(eventId)

      setDashboardData((prev) => ({
        ...prev,
        events: prev.events.map((event) => (event._id === eventId ? { ...event, rsvped: true } : event)),
      }))

      toast.success("Successfully RSVPed to event")
    } catch (err) {
      console.error(err)
      toast.error("Failed to RSVP to event")
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      // In a real application, this would be an API call
      // await notificationService.markAsRead(notificationId)

      setDashboardData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      }))

      toast.info("Notification marked as read")
    } catch (err) {
      console.error(err)
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <Container fluid className="py-4">
          {/* Welcome Section */}
          <Row className="mb-4">
            <Col>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2 className="fw-bold mb-1">Welcome back, {user?.name}!</h2>
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
                <div className="stats-card">
                  <div className="stats-icon">📚</div>
                  <div className="stats-number">{dashboardData.stats.totalCourses}</div>
                  <div className="stats-label">Active Courses</div>
                </div>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="stats-card">
                  <div className="stats-icon">📊</div>
                  <div className="stats-number">{dashboardData.stats.averageGrade}/4.0</div>
                  <div className="stats-label">Average GPA</div>
                </div>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="stats-card">
                  <div className="stats-icon">📅</div>
                  <div className="stats-number">{dashboardData.stats.attendanceRate}%</div>
                  <div className="stats-label">Attendance Rate</div>
                </div>
              </motion.div>
            </Col>

            <Col lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="stats-card">
                  <div className="stats-icon">✅</div>
                  <div className="stats-number">{dashboardData.stats.completedAssignments}</div>
                  <div className="stats-label">Assignments Done</div>
                </div>
              </motion.div>
            </Col>
          </Row>

          {/* Main Content */}
          <Row className="g-4">
            {/* Courses */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="dashboard-card h-100">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">My Courses</h5>
                  </div>
                  <div className="dashboard-card-body">
                    {dashboardData.courses.map((course) => (
                      <div key={course._id} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">{course.title}</h6>
                          <span className="text-muted small">{course.progress}% Complete</span>
                        </div>
                        <p className="text-muted small mb-2">Instructor: {course.instructor}</p>
                        <ProgressBar now={course.progress} className="progress-blue mb-3" />
                        <Button variant="outline-primary" size="sm" href={`/course/${course._id}/materials`}>
                          View Materials
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Upcoming Events */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="dashboard-card h-100">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">Upcoming Events</h5>
                  </div>
                  <div className="dashboard-card-body">
                    {dashboardData.events.map((event) => (
                      <div
                        key={event._id}
                        className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3 bg-light"
                      >
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="text-muted small mb-1">{new Date(event.date).toLocaleDateString()}</p>
                          <p className="mb-0 small">{event.description}</p>
                        </div>
                        <Button
                          variant={event.rsvped ? "success" : "primary"}
                          size="sm"
                          onClick={() => handleRSVP(event._id)}
                          disabled={event.rsvped}
                        >
                          {event.rsvped ? "RSVPed" : "RSVP"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Attendance */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">Attendance Tracker</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <Table className="table-blue">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Attendance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.attendance.map((record) => (
                          <tr key={record._id}>
                            <td>{record.course}</td>
                            <td>{record.percentage}%</td>
                            <td>
                              <Badge bg={getAttendanceColor(record.percentage)}>
                                {record.percentage >= 85 ? "Excellent" : record.percentage >= 75 ? "Good" : "Low"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Grades */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">Recent Grades</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <Table className="table-blue">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Grade</th>
                          <th>Semester</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.grades.map((grade) => (
                          <tr key={grade._id}>
                            <td>{grade.course}</td>
                            <td>
                              <Badge bg={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                            </td>
                            <td>{grade.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Notifications */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">Notifications</h5>
                  </div>
                  <div className="dashboard-card-body">
                    {dashboardData.notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`d-flex align-items-center p-3 mb-3 rounded-3 ${
                          notification.read ? "bg-light" : "bg-primary bg-opacity-10"
                        }`}
                      >
                        <div className="me-3 fs-4">
                          {notification.type === "assignment" && "📝"}
                          {notification.type === "event" && "🎉"}
                          {notification.type === "grade" && "📊"}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Placements */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h5 className="mb-0">Placement Tracker</h5>
                  </div>
                  <div className="dashboard-card-body">
                    <Table className="table-blue">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.placements.map((placement) => (
                          <tr key={placement._id}>
                            <td>{placement.company}</td>
                            <td>{placement.role}</td>
                            <td>
                              <Badge bg={placement.status === "Placed" ? "success" : "warning"}>
                                {placement.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Button variant="primary" href="/placements" className="mt-3">
                      Update Placement Status
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  )
}

export default StudentDashboard
