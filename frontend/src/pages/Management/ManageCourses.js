"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Form, Modal, Spinner, Badge } from "react-bootstrap"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import BackButton from "../../components/UI/BackButton"
import { courseService, userService } from "../../services/api"

const ManageCourses = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)

  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [students, setStudents] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [editForm, setEditForm] = useState({
    title: "",
    code: "",
    description: "",
    instructor: "",
    semester: "",
    year: "",
    credits: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, facultyRes, studentsRes] = await Promise.all([
        courseService.getAllCourses(),
        userService.getFaculty(),
        userService.getStudents(),
      ])

      setCourses(coursesRes.data)
      setFaculty(facultyRes.data)
      setStudents(studentsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setEditForm({
      title: course.title,
      code: course.code,
      description: course.description,
      instructor: course.instructor?._id || "",
      semester: course.semester,
      year: course.year,
      credits: course.credits,
    })
    setShowEditModal(true)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      await courseService.updateCourse(selectedCourse._id, editForm)
      toast.success("Course updated successfully")
      setShowEditModal(false)
      fetchData()
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course")
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.deleteCourse(courseId)
        toast.success("Course deleted successfully")
        fetchData()
      } catch (error) {
        console.error("Error deleting course:", error)
        toast.error("Failed to delete course")
      }
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <Spinner animation="border" variant="primary" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={`min-vh-100 bg-${theme === "dark" ? "dark" : "light"}`}>
        <Container fluid className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Manage Courses</h2>
                  <p className="text-muted">View and manage all courses</p>
                </div>
                <BackButton fallbackRoute="/faculty-dashboard" />
              </div>
            </Col>
          </Row>

          {/* Search */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search courses by title or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Courses Table */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Courses ({filteredCourses.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Instructor</th>
                    <th>Students</th>
                    <th>Semester</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <Badge bg="primary">{course.code}</Badge>
                        </td>
                        <td>{course.title}</td>
                        <td>{course.instructor?.name || "Not assigned"}</td>
                        <td>
                          <Badge bg="info">{course.students?.length || 0} students</Badge>
                        </td>
                        <td>
                          {course.semester} {course.year}
                        </td>
                        <td>{course.credits}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => handleEditCourse(course)}>
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCourse(course._id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm ? "No courses found matching your search." : "No courses found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Edit Course Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateCourse}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Course Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructor</Form.Label>
              <Form.Select
                value={editForm.instructor}
                onChange={(e) => setEditForm({ ...editForm, instructor: e.target.value })}
                required
              >
                <option value="">Select Instructor</option>
                {faculty.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
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
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: Number.parseInt(e.target.value) })}
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
                    value={editForm.credits}
                    onChange={(e) => setEditForm({ ...editForm, credits: Number.parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Course
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default ManageCourses
