"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner, Alert } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { Download, Eye, MessageSquare, Award, Calendar, User } from "lucide-react"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import { toast } from "react-toastify"

const ViewSubmissions = () => {
  const { assignmentId } = useParams()
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
  })

  useEffect(() => {
    fetchAssignmentData()
  }, [assignmentId])

  const fetchAssignmentData = async () => {
    try {
      setLoading(true)
      // Mock data since we don't have the actual API endpoint
      const mockAssignment = {
        _id: assignmentId,
        title: "CS101 Assignment 1 - Hello World",
        description: "Create a simple Hello World program using your preferred programming language",
        course: { code: "CS101", title: "Introduction to Computer Science" },
        dueDate: "2025-06-23T23:59:59.000Z",
        maxPoints: 100,
        submissions: [
          {
            _id: "1",
            student: { _id: "s1", name: "John Doe", email: "john@example.com", studentId: "STU001" },
            submittedAt: "2025-06-20T14:30:00.000Z",
            content: "console.log('Hello, World!');",
            grade: 95,
            feedback: "Excellent work! Clean and well-commented code.",
            status: "graded",
          },
          {
            _id: "2",
            student: { _id: "s2", name: "Jane Smith", email: "jane@example.com", studentId: "STU002" },
            submittedAt: "2025-06-21T10:15:00.000Z",
            content: "print('Hello, World!')",
            grade: null,
            feedback: "",
            status: "submitted",
          },
          {
            _id: "3",
            student: { _id: "s3", name: "Bob Johnson", email: "bob@example.com", studentId: "STU003" },
            submittedAt: "2025-06-22T16:45:00.000Z",
            content: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }',
            grade: 88,
            feedback: "Good work, but could use better formatting.",
            status: "graded",
          },
        ],
      }

      setAssignment(mockAssignment)
      setSubmissions(mockAssignment.submissions)
    } catch (error) {
      console.error("Error fetching assignment data:", error)
      setError("Failed to load assignment data")
      toast.error("Failed to load assignment data")
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    try {
      // Mock grading - in real app, this would call the API
      const updatedSubmissions = submissions.map((sub) =>
        sub._id === selectedSubmission._id
          ? {
              ...sub,
              grade: Number.parseInt(gradeForm.grade),
              feedback: gradeForm.feedback,
              status: "graded",
              gradedAt: new Date().toISOString(),
            }
          : sub,
      )

      setSubmissions(updatedSubmissions)
      setShowGradeModal(false)
      setSelectedSubmission(null)
      setGradeForm({ grade: "", feedback: "" })
      toast.success("Submission graded successfully")
    } catch (error) {
      console.error("Error grading submission:", error)
      toast.error("Failed to grade submission")
    }
  }

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission)
    setGradeForm({
      grade: submission.grade || "",
      feedback: submission.feedback || "",
    })
    setShowGradeModal(true)
  }

  const getSubmissionStatus = (submission) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return <Badge bg="success">Graded</Badge>
    }
    return <Badge bg="warning">Pending</Badge>
  }

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100
    if (percentage >= 90) return "success"
    if (percentage >= 80) return "primary"
    if (percentage >= 70) return "warning"
    return "danger"
  }

  const isLateSubmission = (submittedAt, dueDate) => {
    return new Date(submittedAt) > new Date(dueDate)
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

  if (!assignment) {
    return (
      <>
        <Navbar />
        <Container className="py-5">
          <Alert variant="danger">Assignment not found</Alert>
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
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Assignment Submissions</h2>
                  <p className="text-muted mb-2">{assignment.title}</p>
                  <div className="d-flex gap-3 text-muted small">
                    <span>Course: {assignment.course.code}</span>
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span>Max Points: {assignment.maxPoints}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={() => navigate(`/assignment/${assignmentId}`)}>
                    View Assignment
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>
              </div>
            </Col>
          </Row>

          {/* Statistics */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <h3 className="text-primary">{submissions.length}</h3>
                  <p className="text-muted mb-0">Total Submissions</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <h3 className="text-success">{submissions.filter((s) => s.grade !== null).length}</h3>
                  <p className="text-muted mb-0">Graded</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <h3 className="text-warning">{submissions.filter((s) => s.grade === null).length}</h3>
                  <p className="text-muted mb-0">Pending</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <h3 className="text-info">
                    {submissions.length > 0
                      ? Math.round(
                          submissions.filter((s) => s.grade !== null).reduce((acc, s) => acc + s.grade, 0) /
                            submissions.filter((s) => s.grade !== null).length || 0,
                        )
                      : 0}
                  </h3>
                  <p className="text-muted mb-0">Average Grade</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Submissions Table */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Submissions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length > 0 ? (
                    submissions.map((submission, index) => (
                      <tr key={submission._id || index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <User size={16} className="text-muted me-2" />
                            <div>
                              <strong>{submission.student.name}</strong>
                              <div className="text-muted small">
                                {submission.student.studentId} • {submission.student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={16} className="text-muted me-2" />
                            <div>
                              <div>{new Date(submission.submittedAt).toLocaleDateString()}</div>
                              <div className="text-muted small">
                                {new Date(submission.submittedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {isLateSubmission(submission.submittedAt, assignment.dueDate) && (
                                  <Badge bg="danger" className="ms-2">
                                    Late
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{getSubmissionStatus(submission)}</td>
                        <td>
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <div>
                              <Badge bg={getGradeColor(submission.grade, assignment.maxPoints)}>
                                {submission.grade}/{assignment.maxPoints}
                              </Badge>
                              <div className="text-muted small">
                                {Math.round((submission.grade / assignment.maxPoints) * 100)}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">Not graded</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" title="View Submission">
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => openGradeModal(submission)}
                              title="Grade Submission"
                            >
                              <Award size={14} />
                            </Button>
                            {submission.feedback && (
                              <Button variant="outline-info" size="sm" title="View Feedback">
                                <MessageSquare size={14} />
                              </Button>
                            )}
                            <Button variant="outline-secondary" size="sm" title="Download">
                              <Download size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div>
                          <Eye size={48} className="text-muted mb-3" />
                          <h5 className={`text-${theme === "dark" ? "light" : "dark"}`}>No Submissions Yet</h5>
                          <p className="text-muted">Students haven't submitted their work for this assignment yet.</p>
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

      {/* Grade Submission Modal */}
      <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Grade Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <>
              <div className="mb-3">
                <h6>Student: {selectedSubmission.student.name}</h6>
                <p className="text-muted small">
                  Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="mb-3">
                <h6>Submission Content:</h6>
                <Card className="bg-light">
                  <Card.Body>
                    <pre className="mb-0" style={{ whiteSpace: "pre-wrap", fontSize: "0.9em" }}>
                      {selectedSubmission.content}
                    </pre>
                  </Card.Body>
                </Card>
              </div>

              <Form onSubmit={handleGradeSubmission}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Grade (out of {assignment.maxPoints})</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max={assignment.maxPoints}
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Percentage</Form.Label>
                      <Form.Control
                        type="text"
                        value={gradeForm.grade ? Math.round((gradeForm.grade / assignment.maxPoints) * 100) + "%" : ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Provide feedback to the student..."
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Grade
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  )
}

export default ViewSubmissions
