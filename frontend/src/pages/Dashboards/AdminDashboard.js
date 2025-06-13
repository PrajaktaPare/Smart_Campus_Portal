"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Nav } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { BsPersonPlus, BsBook, BsCalendarEvent } from "react-icons/bs"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import { userService, courseService, eventService, announcementService } from "../../services/api"

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalEvents: 0,
  })

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  })

  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    description: "",
    instructor: "",
    semester: "Spring 2025",
    year: 2025,
    credits: 3,
  })

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [usersResponse, coursesResponse, eventsResponse, announcementsResponse] = await Promise.all([
        userService.getAllUsers(),
        courseService.getAllCourses(),
        eventService.getEvents(),
        announcementService.getAnnouncements(),
      ])

      const users = usersResponse.data
      const courses = coursesResponse.data
      const events = eventsResponse.data
      const announcements = announcementsResponse.data

      setUsers(users)
      setCourses(courses)
      setEvents(events)
      setAnnouncements(announcements)

      // Calculate stats
      const totalStudents = users.filter((user) => user.role === "student").length
      const totalFaculty = users.filter((user) => user.role === "faculty").length

      setStats({
        totalStudents,
        totalFaculty,
        totalCourses: courses.length,
        totalEvents: events.length,
      })

      // Set default instructor for course form if faculty exists
      const facultyMembers = users.filter((user) => user.role === "faculty")
      if (facultyMembers.length > 0) {
        setCourseForm((prev) => ({
          ...prev,
          instructor: facultyMembers[0]._id,
        }))
      }

      toast.success("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const response = await userService.createUser(userForm)
      setUsers([...users, response.data])
      setShowUserModal(false)
      resetUserForm()
      toast.success(`${userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)} created successfully`)
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(`Failed to create ${userForm.role}`)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      const response = await courseService.createCourse(courseForm)
      setCourses([...courses, response.data])
      setShowCourseModal(false)
      resetCourseForm()
      toast.success("Course created successfully")
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course")
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      const response = await announcementService.createAnnouncement(announcementForm)
      setAnnouncements([...announcements, response.data])
      setShowAnnouncementModal(false)
      resetAnnouncementForm()
      toast.success("Announcement created successfully")
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast.error("Failed to create announcement")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId)
        setUsers(users.filter((user) => user._id !== userId))
        toast.success("User deleted successfully")
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Failed to delete user")
      }
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.deleteCourse(courseId)
        setCourses(courses.filter((course) => course._id !== courseId))
        toast.success("Course deleted successfully")
      } catch (error) {
        console.error("Error deleting course:", error)
        toast.error("Failed to delete course")
      }
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementService.deleteAnnouncement(announcementId)
        setAnnouncements(announcements.filter((announcement) => announcement._id !== announcementId))
        toast.success("Announcement deleted successfully")
      } catch (error) {
        console.error("Error deleting announcement:", error)
        toast.error("Failed to delete announcement")
      }
    }
  }

  const resetUserForm = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    })
  }

  const resetCourseForm = () => {
    setCourseForm({
      code: "",
      title: "",
      description: "",
      instructor: users.find((user) => user.role === "faculty")?._id || "",
      semester: "Spring 2025",
      year: 2025,
      credits: 3,
    })
  }

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
    })
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
              <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Welcome, {user?.name}!</h2>
              <p className="text-muted">Admin Dashboard</p>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <BsPersonPlus className="fs-3 text-primary" />
                  </div>
                  <div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {stats.totalStudents}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Students</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <BsPersonPlus className="fs-3 text-success" />
                  </div>
                  <div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {stats.totalFaculty}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Faculty</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                    <BsBook className="fs-3 text-info" />
                  </div>
                  <div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {stats.totalCourses}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Courses</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className={`border-0 shadow-sm h-100 bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Body className="d-flex align-items-center p-4">
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <BsCalendarEvent className="fs-3 text-warning" />
                  </div>
                  <div>
                    <h3 className={`display-6 fw-bold mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                      {stats.totalEvents}
                    </h3>
                    <p className="text-muted text-uppercase small fw-semibold mb-0">Events</p>
                  </div>
                </Card.Body>
              </Card>
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
                    active={activeTab === "users"}
                    onClick={() => setActiveTab("users")}
                    className={activeTab === "users" ? "border-primary border-top-3" : ""}
                  >
                    Users
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
                    active={activeTab === "announcements"}
                    onClick={() => setActiveTab("announcements")}
                    className={activeTab === "announcements" ? "border-primary border-top-3" : ""}
                  >
                    Announcements
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <Row>
                  <Col lg={6} className="mb-4">
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Recent Users</h5>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge
                                bg={user.role === "admin" ? "danger" : user.role === "faculty" ? "info" : "success"}
                              >
                                {user.role}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="mt-3">
                      <Button variant="primary" onClick={() => setShowUserModal(true)}>
                        Add New User
                      </Button>
                    </div>
                  </Col>
                  <Col lg={6} className="mb-4">
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Recent Courses</h5>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Instructor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.slice(0, 5).map((course) => (
                          <tr key={course._id}>
                            <td>{course.code}</td>
                            <td>{course.title}</td>
                            <td>{course.instructor?.name || "Not assigned"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="mt-3">
                      <Button variant="primary" onClick={() => setShowCourseModal(true)}>
                        Add New Course
                      </Button>
                    </div>
                  </Col>
                  <Col lg={12}>
                    <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Recent Announcements</h5>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {announcements.slice(0, 5).map((announcement) => (
                          <tr key={announcement._id}>
                            <td>{announcement.title}</td>
                            <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button variant="outline-secondary" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="mt-3">
                      <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                        Create Announcement
                      </Button>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <Row>
                  <Col lg={12} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>All Users</h5>
                      <Button variant="primary" onClick={() => setShowUserModal(true)}>
                        Add New User
                      </Button>
                    </div>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge
                                bg={user.role === "admin" ? "danger" : user.role === "faculty" ? "info" : "success"}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/user/${user._id}`)}
                                >
                                  View
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user._id)}>
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}

              {/* Courses Tab */}
              {activeTab === "courses" && (
                <Row>
                  <Col lg={12} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>All Courses</h5>
                      <Button variant="primary" onClick={() => setShowCourseModal(true)}>
                        Add New Course
                      </Button>
                    </div>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Instructor</th>
                          <th>Students</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course._id}>
                            <td>{course.code}</td>
                            <td>{course.title}</td>
                            <td>{course.instructor?.name || "Not assigned"}</td>
                            <td>{course.students?.length || 0}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/course/${course._id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteCourse(course._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}

              {/* Announcements Tab */}
              {activeTab === "announcements" && (
                <Row>
                  <Col lg={12} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>All Announcements</h5>
                      <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                        Create Announcement
                      </Button>
                    </div>
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Content</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {announcements.map((announcement) => (
                          <tr key={announcement._id}>
                            <td>{announcement.title}</td>
                            <td>{announcement.content.substring(0, 50)}...</td>
                            <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => console.log("View announcement", announcement._id)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteAnnouncement(announcement._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Create User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create User
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
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Course Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. CS101"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter course title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

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
              <Form.Label>Instructor</Form.Label>
              <Form.Select
                value={courseForm.instructor}
                onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                required
              >
                <option value="">Select Instructor</option>
                {users
                  .filter((user) => user.role === "faculty")
                  .map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    required
                  >
                    <option value="Spring 2025">Spring 2025</option>
                    <option value="Summer 2025">Summer 2025</option>
                    <option value="Fall 2025">Fall 2025</option>
                    <option value="Winter 2025">Winter 2025</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="2023"
                    max="2030"
                    value={courseForm.year}
                    onChange={(e) => setCourseForm({ ...courseForm, year: Number.parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Credits</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number.parseInt(e.target.value) })}
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

      {/* Create Announcement Modal */}
      <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateAnnouncement}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter announcement title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter announcement content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Announcement
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default AdminDashboard
