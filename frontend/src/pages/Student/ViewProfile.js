"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Table, Spinner, Alert } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Edit } from "lucide-react"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import { toast } from "react-toastify"

const ViewProfile = () => {
  const { studentId } = useParams()
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      // Mock data since we don't have the actual API endpoint
      const mockStudent = {
        _id: studentId,
        name: "John Doe",
        email: "john.doe@example.com",
        studentId: "STU001",
        department: "Computer Science",
        phone: "+1 (555) 123-4567",
        address: "123 Campus Drive, University City, UC 12345",
        enrollmentDate: "2023-09-01T00:00:00.000Z",
        year: "Sophomore",
        gpa: 3.75,
        totalCredits: 45,
        status: "Active",
      }

      const mockCourses = [
        {
          _id: "1",
          code: "CS101",
          title: "Introduction to Computer Science",
          credits: 3,
          semester: "Fall 2024",
          instructor: "Dr. Smith",
          grade: "A",
        },
        {
          _id: "2",
          code: "CS201",
          title: "Data Structures and Algorithms",
          credits: 4,
          semester: "Fall 2024",
          instructor: "Dr. Johnson",
          grade: "B+",
        },
        {
          _id: "3",
          code: "MATH201",
          title: "Discrete Mathematics",
          credits: 3,
          semester: "Fall 2024",
          instructor: "Dr. Wilson",
          grade: "A-",
        },
      ]

      const mockGrades = [
        { course: "CS101", assignment: "Assignment 1", grade: 95, maxGrade: 100, date: "2024-10-15" },
        { course: "CS101", assignment: "Midterm Exam", grade: 88, maxGrade: 100, date: "2024-11-01" },
        { course: "CS201", assignment: "Programming Project", grade: 92, maxGrade: 100, date: "2024-10-20" },
        { course: "CS201", assignment: "Quiz 1", grade: 85, maxGrade: 100, date: "2024-10-10" },
        { course: "MATH201", assignment: "Problem Set 1", grade: 90, maxGrade: 100, date: "2024-10-12" },
      ]

      setStudent(mockStudent)
      setCourses(mockCourses)
      setGrades(mockGrades)
      setEditForm({
        name: mockStudent.name,
        email: mockStudent.email,
        phone: mockStudent.phone,
        address: mockStudent.address,
      })
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load student data")
      toast.error("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      // Mock update - in real app, this would call the API
      setStudent({ ...student, ...editForm })
      setShowEditModal(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 90) return "success"
    if (percentage >= 80) return "primary"
    if (percentage >= 70) return "warning"
    return "danger"
  }

  const getLetterGradeColor = (grade) => {
    if (grade.startsWith("A")) return "success"
    if (grade.startsWith("B")) return "primary"
    if (grade.startsWith("C")) return "warning"
    return "danger"
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

  if (!student) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Alert variant="danger">Student not found</Alert>
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
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Student Profile</h2>
                  <p className="text-muted">View and manage student information</p>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Profile Information */}
            <Col lg={4} className="mb-4">
              <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom text-center`}>
                  <div className="py-3">
                    <div
                      className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <User size={40} className="text-white" />
                    </div>
                    <h4 className={`mb-1 text-${theme === "dark" ? "light" : "dark"}`}>{student.name}</h4>
                    <p className="text-muted mb-2">{student.studentId}</p>
                    <Badge bg="success">{student.status}</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Mail size={16} className="text-muted me-2" />
                      <span className="text-muted small">Email</span>
                    </div>
                    <p className="mb-0">{student.email}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <BookOpen size={16} className="text-muted me-2" />
                      <span className="text-muted small">Department</span>
                    </div>
                    <p className="mb-0">{student.department}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Phone size={16} className="text-muted me-2" />
                      <span className="text-muted small">Phone</span>
                    </div>
                    <p className="mb-0">{student.phone}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="text-muted me-2" />
                      <span className="text-muted small">Address</span>
                    </div>
                    <p className="mb-0">{student.address}</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar size={16} className="text-muted me-2" />
                      <span className="text-muted small">Enrollment Date</span>
                    </div>
                    <p className="mb-0">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                  </div>

                  {(user?.role === "faculty" || user?.role === "admin") && (
                    <Button variant="primary" className="w-100" onClick={() => setShowEditModal(true)}>
                      <Edit size={16} className="me-2" />
                      Edit Profile
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Academic Information */}
            <Col lg={8}>
              {/* Academic Stats */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                    <Card.Body>
                      <h3 className="text-primary">{student.gpa}</h3>
                      <p className="text-muted mb-0">GPA</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                    <Card.Body>
                      <h3 className="text-success">{student.totalCredits}</h3>
                      <p className="text-muted mb-0">Credits</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                    <Card.Body>
                      <h3 className="text-info">{courses.length}</h3>
                      <p className="text-muted mb-0">Courses</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                    <Card.Body>
                      <h3 className="text-warning">{student.year}</h3>
                      <p className="text-muted mb-0">Year</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Current Courses */}
              <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"} mb-4`}>
                <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
                  <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Current Courses</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Credits</th>
                        <th>Instructor</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={course._id || index}>
                          <td>
                            <div>
                              <strong>{course.code}</strong>
                              <div className="text-muted small">{course.title}</div>
                            </div>
                          </td>
                          <td>{course.credits}</td>
                          <td>{course.instructor}</td>
                          <td>
                            <Badge bg={getLetterGradeColor(course.grade)}>{course.grade}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Recent Grades */}
              <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
                <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
                  <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Recent Grades</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Assignment</th>
                        <th>Grade</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{grade.course}</strong>
                          </td>
                          <td>{grade.assignment}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge bg={getGradeColor(grade.grade, grade.maxGrade)} className="me-2">
                                {grade.grade}/{grade.maxGrade}
                              </Badge>
                              <span className="text-muted small">
                                {Math.round((grade.grade / grade.maxGrade) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Calendar size={16} className="text-muted me-2" />
                              {new Date(grade.date).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Student Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default ViewProfile
