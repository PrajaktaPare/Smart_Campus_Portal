"use client"

import { useState, useEffect, useContext } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Eye, Trash2, Calendar, Users } from "lucide-react"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import { assignmentService, courseService } from "../../services/api"
import { toast } from "react-toastify"

const ManageAllAssignments = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Create assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxPoints: 100,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchTerm, filterCourse, filterStatus])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assignmentsRes, coursesRes] = await Promise.all([
        assignmentService.getAllAssignments(),
        courseService.getAllCourses(),
      ])

      const assignmentsData = assignmentsRes.data?.data || assignmentsRes.data || []
      const coursesData = coursesRes.data?.data || coursesRes.data || []

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setCourses(Array.isArray(coursesData) ? coursesData : [])

      // Set default course for form
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        setAssignmentForm((prev) => ({ ...prev, course: coursesData[0]._id }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load assignments")
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = assignments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Course filter
    if (filterCourse !== "all") {
      filtered = filtered.filter((assignment) => assignment.course?._id === filterCourse)
    }

    // Status filter
    if (filterStatus !== "all") {
      const now = new Date()
      if (filterStatus === "upcoming") {
        filtered = filtered.filter((assignment) => new Date(assignment.dueDate) > now)
      } else if (filterStatus === "overdue") {
        filtered = filtered.filter((assignment) => new Date(assignment.dueDate) < now)
      }
    }

    setFilteredAssignments(filtered)
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      console.log("📝 Creating new assignment:", assignmentForm.title)
      const response = await assignmentService.createAssignment(assignmentForm)

      // Add the new assignment to the list
      const newAssignment = response.data || response
      setAssignments([...assignments, newAssignment])

      setShowCreateModal(false)
      resetForm()

      toast.success(`Assignment "${assignmentForm.title}" created successfully! Students will be notified.`)
      console.log("✅ Assignment created and students notified")

      // Refresh the assignments list to ensure we have the latest data
      setTimeout(() => {
        fetchData()
      }, 1000)
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment: " + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteAssignment = async () => {
    try {
      await assignmentService.deleteAssignment(selectedAssignment._id)
      setAssignments(assignments.filter((a) => a._id !== selectedAssignment._id))
      setShowDeleteModal(false)
      setSelectedAssignment(null)
      toast.success("Assignment deleted successfully")
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast.error("Failed to delete assignment")
    }
  }

  const resetForm = () => {
    setAssignmentForm({
      title: "",
      description: "",
      course: courses.length > 0 ? courses[0]._id : "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      maxPoints: 100,
    })
  }

  const getStatusBadge = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Badge bg="danger">Overdue</Badge>
    } else if (diffDays === 0) {
      return <Badge bg="warning">Due Today</Badge>
    } else if (diffDays <= 3) {
      return <Badge bg="warning">Due Soon</Badge>
    } else {
      return <Badge bg="success">Upcoming</Badge>
    }
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
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Manage Assignments</h2>
                  <p className="text-muted">Create, edit, and manage all assignments</p>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="me-2" />
                    Create Assignment
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    Back to Dashboard
                  </Button>
                </div>
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
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} className="mb-3">
              <Form.Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={3} className="mb-3">
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
              </Form.Select>
            </Col>
            <Col lg={2} className="mb-3">
              <div className="d-flex align-items-center">
                <span className="text-muted small">{filteredAssignments.length} assignments</span>
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Assignments Table */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Submissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment, index) => (
                      <tr key={assignment._id || index}>
                        <td>
                          <div>
                            <strong>{assignment.title}</strong>
                            <div className="text-muted small">
                              Max Points: {assignment.maxPoints || 100}
                              {assignment.description && (
                                <div className="text-truncate" style={{ maxWidth: "200px" }}>
                                  {assignment.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{assignment.course?.code || "N/A"}</strong>
                            <div className="text-muted small">{assignment.course?.title || "Unknown Course"}</div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={16} className="text-muted me-2" />
                            <div>
                              <div>{new Date(assignment.dueDate).toLocaleDateString()}</div>
                              <div className="text-muted small">
                                {new Date(assignment.dueDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(assignment.dueDate)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Users size={16} className="text-muted me-2" />
                            <Badge bg="info">{assignment.submissions?.length || 0} submissions</Badge>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/assignment/${assignment._id}`)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => navigate(`/assignment/${assignment._id}/submissions`)}
                            >
                              View Submissions
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigate(`/assignment/${assignment._id}/grade`)}
                            >
                              Grade
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedAssignment(assignment)
                                setShowDeleteModal(true)
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div>
                          <Calendar size={48} className="text-muted mb-3" />
                          <h5 className={`text-${theme === "dark" ? "light" : "dark"}`}>No Assignments Found</h5>
                          <p className="text-muted">
                            {searchTerm || filterCourse !== "all" || filterStatus !== "all"
                              ? "Try adjusting your filters to see more assignments."
                              : "No assignments have been created yet."}
                          </p>
                          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            Create Your First Assignment
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Create Assignment Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
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
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={assignmentForm.course}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Max Points</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Assignment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the assignment "{selectedAssignment?.title}"?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAssignment}>
            Delete Assignment
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  )
}

export default ManageAllAssignments
