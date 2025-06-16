"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Form, Modal, Spinner, Badge } from "react-bootstrap"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import BackButton from "../../components/UI/BackButton"
import { userService } from "../../services/api"

const ManageStudents = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await userService.getStudents()
      console.log("Students API response:", response) // Debug log

      // Handle the response structure - the data is in response.data.data
      const studentsData = response.data?.data || response.data || []

      console.log("Extracted students data:", studentsData) // Debug log

      // Ensure it's an array
      if (Array.isArray(studentsData)) {
        setStudents(studentsData)
        console.log(`✅ Loaded ${studentsData.length} students`)
      } else {
        console.error("Students data is not an array:", studentsData)
        setStudents([])
        toast.error("Invalid students data format")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([]) // Set empty array on error
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setEditForm({
      name: student.name,
      email: student.email,
      department: student.department || "",
    })
    setShowEditModal(true)
  }

  const handleUpdateStudent = async (e) => {
    e.preventDefault()
    try {
      await userService.updateUser(selectedStudent._id, editForm)
      toast.success("Student updated successfully")
      setShowEditModal(false)
      fetchStudents()
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error("Failed to update student")
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await userService.deleteUser(studentId)
        toast.success("Student deleted successfully")
        fetchStudents()
      } catch (error) {
        console.error("Error deleting student:", error)
        toast.error("Failed to delete student")
      }
    }
  }

  const filteredStudents = Array.isArray(students)
    ? students.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

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
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Manage Students</h2>
                  <p className="text-muted">
                    {user?.role === "faculty"
                      ? `Students in ${user.department} Department`
                      : "View and manage all students"}
                  </p>
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
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Students Table */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>
                Students ({filteredStudents.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.department || "Not assigned"}</td>
                        <td>
                          <Badge bg="success">{student.role}</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => handleEditStudent(student)}>
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteStudent(student._id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {searchTerm ? "No students found matching your search." : "No students found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Edit Student Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateStudent}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
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
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Student
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default ManageStudents
