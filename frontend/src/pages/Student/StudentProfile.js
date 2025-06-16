"use client"

import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge, Tab, Tabs } from "react-bootstrap"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import BackButton from "../../components/UI/BackButton"
import { userService, gradeService, attendanceService, assignmentService } from "../../services/api"

const StudentProfile = () => {
  const { studentId } = useParams()
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)

  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])
  const [assignments, setAssignments] = useState([])
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      const [studentRes, gradesRes, attendanceRes, assignmentsRes] = await Promise.all([
        userService.getUserById(studentId),
        gradeService.getStudentGrades(studentId),
        attendanceService.getStudentAttendanceStats(studentId),
        assignmentService.getStudentAssignments(studentId),
      ])

      setStudent(studentRes.data)
      setGrades(gradesRes.data)
      setAttendance(attendanceRes.data)
      setAssignments(assignmentsRes.data)
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to load student data")
    } finally {
      setLoading(false)
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
        <Container fluid className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>{student.name}</h2>
                  <p className="text-muted">{student.email}</p>
                </div>
                <BackButton fallbackRoute="/faculty-dashboard" />
              </div>
            </Col>
          </Row>

          {/* Student Profile Tabs */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="profile" title="Profile">
                  <Row>
                    <Col md={6}>
                      <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Student Information</h5>
                      <Table borderless className={theme === "dark" ? "table-dark" : ""}>
                        <tbody>
                          <tr>
                            <td>
                              <strong>Name:</strong>
                            </td>
                            <td>{student.name}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Email:</strong>
                            </td>
                            <td>{student.email}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Role:</strong>
                            </td>
                            <td>
                              <Badge bg="success">{student.role}</Badge>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Student ID:</strong>
                            </td>
                            <td>{student._id}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Academic Summary</h5>
                      <Table borderless className={theme === "dark" ? "table-dark" : ""}>
                        <tbody>
                          <tr>
                            <td>
                              <strong>Total Courses:</strong>
                            </td>
                            <td>{attendance.length}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Total Assignments:</strong>
                            </td>
                            <td>{assignments.length}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Completed Assignments:</strong>
                            </td>
                            <td>{assignments.filter((a) => a.submission).length}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Average Attendance:</strong>
                            </td>
                            <td>
                              {attendance.length > 0 ? (
                                <Badge
                                  bg={getAttendanceColor(
                                    Math.round(
                                      attendance.reduce((sum, record) => sum + record.percentage, 0) /
                                        attendance.length,
                                    ),
                                  )}
                                >
                                  {Math.round(
                                    attendance.reduce((sum, record) => sum + record.percentage, 0) / attendance.length,
                                  )}
                                  %
                                </Badge>
                              ) : (
                                <Badge bg="secondary">N/A</Badge>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="grades" title="Grades">
                  <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Academic Grades</h5>
                  {grades.length > 0 ? (
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Semester</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade) => (
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
                    <Alert variant="info">No grades available for this student.</Alert>
                  )}
                </Tab>

                <Tab eventKey="attendance" title="Attendance">
                  <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Attendance Records</h5>
                  {attendance.length > 0 ? (
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
                        {attendance.map((record) => (
                          <tr key={record.course._id}>
                            <td>{record.course.title}</td>
                            <td>{record.totalClasses}</td>
                            <td>{record.present}</td>
                            <td>{record.absent}</td>
                            <td>
                              <Badge bg={getAttendanceColor(record.percentage)}>{record.percentage}%</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">No attendance records available for this student.</Alert>
                  )}
                </Tab>

                <Tab eventKey="assignments" title="Assignments">
                  <h5 className={`mb-3 text-${theme === "dark" ? "light" : "dark"}`}>Assignment Status</h5>
                  {assignments.length > 0 ? (
                    <Table hover responsive className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Course</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment._id}>
                            <td>{assignment.title}</td>
                            <td>{assignment.course?.title}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">No assignments available for this student.</Alert>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Container>
      </div>

      <Footer />
    </>
  )
}

export default StudentProfile
