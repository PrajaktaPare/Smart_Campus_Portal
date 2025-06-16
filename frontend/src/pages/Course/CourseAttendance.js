"use client"

import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner } from "react-bootstrap"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import BackButton from "../../components/UI/BackButton"
import { courseService, attendanceService } from "../../services/api"

const CourseAttendance = () => {
  const { courseId } = useParams()
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const courseResponse = await courseService.getCourseById(courseId)
      setCourse(courseResponse.data)
      setStudents(courseResponse.data.students || [])
    } catch (error) {
      console.error("Error fetching course data:", error)
      toast.error("Failed to load course data")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSubmitAttendance = async () => {
    try {
      const attendanceData = {
        courseId,
        date: selectedDate,
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      }

      await attendanceService.markAttendance(attendanceData)
      toast.success("Attendance marked successfully")
      setAttendance({})
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast.error("Failed to mark attendance")
    }
  }

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

  if (!course) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Alert variant="danger">Course not found</Alert>
        </Container>
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
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>
                    {course.code} - {course.title}
                  </h2>
                  <p className="text-muted">Mark Attendance</p>
                </div>
                <BackButton fallbackRoute="/faculty-dashboard" />
              </div>
            </Col>
          </Row>

          {/* Date Selection */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Date</Form.Label>
                <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          {/* Attendance Table */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Students ({students.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {students.length > 0 ? (
                <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Form.Check
                              type="radio"
                              name={`attendance-${student._id}`}
                              label="Present"
                              checked={attendance[student._id] === "present"}
                              onChange={() => handleAttendanceChange(student._id, "present")}
                            />
                            <Form.Check
                              type="radio"
                              name={`attendance-${student._id}`}
                              label="Absent"
                              checked={attendance[student._id] === "absent"}
                              onChange={() => handleAttendanceChange(student._id, "absent")}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p>No students enrolled in this course.</p>
                </div>
              )}
            </Card.Body>
            {students.length > 0 && (
              <Card.Footer className={`bg-${theme === "dark" ? "dark" : "white"} border-top`}>
                <Button
                  variant="primary"
                  onClick={handleSubmitAttendance}
                  disabled={Object.keys(attendance).length === 0}
                >
                  Submit Attendance
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Container>
      </div>

      <Footer />
    </>
  )
}

export default CourseAttendance
