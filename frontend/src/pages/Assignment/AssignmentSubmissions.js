"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Modal, Form, Spinner } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { assignmentService, gradeService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import Navbar from "../../components/Layout/Navbar"
import BackButton from "../../components/UI/BackButton"

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gradingModal, setGradingModal] = useState({ show: false, submission: null })
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    fetchAssignmentAndSubmissions()
  }, [assignmentId])

  const fetchAssignmentAndSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const [assignmentData, submissionsData] = await Promise.all([
        assignmentService.getAssignmentById(assignmentId),
        assignmentService.getAssignmentSubmissions(assignmentId),
      ])

      setAssignment(assignmentData)
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : [])

      console.log("📝 AssignmentSubmissions: Data loaded", {
        assignment: assignmentData?.title,
        submissions: submissionsData?.length || 0,
      })
    } catch (error) {
      console.error("❌ AssignmentSubmissions: Error fetching data:", error)
      setError("Failed to load assignment submissions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (marks, feedback) => {
    try {
      setGrading(true)

      await gradeService.gradeAssignment({
        assignmentId,
        studentId: gradingModal.submission.student._id,
        marks: Number.parseInt(marks),
        feedback,
      })

      // Refresh submissions
      await fetchAssignmentAndSubmissions()

      setGradingModal({ show: false, submission: null })
    } catch (error) {
      console.error("❌ Error grading submission:", error)
      setError("Failed to grade submission. Please try again.")
    } finally {
      setGrading(false)
    }
  }

  const getSubmissionStatus = (submission) => {
    if (submission.marks !== undefined && submission.marks !== null) {
      return { status: "Graded", variant: "success" }
    }
    if (submission.submittedAt) {
      return { status: "Submitted", variant: "primary" }
    }
    return { status: "Not Submitted", variant: "secondary" }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="mt-4">
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading assignment submissions...</p>
          </div>
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchAssignmentAndSubmissions}>
              Try Again
            </Button>
          </Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <BackButton />
            <h2 className="mt-2">📝 Assignment Submissions</h2>
            {assignment && (
              <div>
                <h4 className="text-primary">{assignment.title}</h4>
                <p className="text-muted">
                  Course: {assignment.course?.title} • Due: {new Date(assignment.dueDate).toLocaleDateString()} • Total
                  Marks: {assignment.totalMarks || 100}
                </p>
              </div>
            )}
          </Col>
        </Row>

        {/* Submissions Summary */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{submissions.length}</h3>
                <p className="mb-0">Total Submissions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {submissions.filter((s) => s.marks !== undefined && s.marks !== null).length}
                </h3>
                <p className="mb-0">Graded</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {submissions.filter((s) => s.submittedAt && (s.marks === undefined || s.marks === null)).length}
                </h3>
                <p className="mb-0">Pending Review</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-secondary">{submissions.filter((s) => !s.submittedAt).length}</h3>
                <p className="mb-0">Not Submitted</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Submissions Table */}
        <Card>
          <Card.Header>
            <h5>📋 All Submissions</h5>
          </Card.Header>
          <Card.Body>
            {submissions.length > 0 ? (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Marks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => {
                    const statusInfo = getSubmissionStatus(submission)
                    return (
                      <tr key={submission._id || index}>
                        <td>
                          <strong>{submission.student?.name || "Unknown Student"}</strong>
                          <br />
                          <small className="text-muted">{submission.student?.email}</small>
                        </td>
                        <td>{submission.student?.studentId || "N/A"}</td>
                        <td>
                          {submission.submittedAt ? (
                            <>
                              {new Date(submission.submittedAt).toLocaleDateString()}
                              <br />
                              <small className="text-muted">
                                {new Date(submission.submittedAt).toLocaleTimeString()}
                              </small>
                            </>
                          ) : (
                            <span className="text-muted">Not submitted</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={statusInfo.variant}>{statusInfo.status}</Badge>
                        </td>
                        <td>
                          {submission.marks !== undefined && submission.marks !== null ? (
                            <strong className="text-success">
                              {submission.marks}/{assignment?.totalMarks || 100}
                            </strong>
                          ) : (
                            <span className="text-muted">Not graded</span>
                          )}
                        </td>
                        <td>
                          {submission.submittedAt && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setGradingModal({ show: true, submission })}
                            >
                              {submission.marks !== undefined ? "Update Grade" : "Grade"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No submissions yet for this assignment.</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Grading Modal */}
        <GradingModal
          show={gradingModal.show}
          submission={gradingModal.submission}
          assignment={assignment}
          onHide={() => setGradingModal({ show: false, submission: null })}
          onGrade={handleGradeSubmission}
          grading={grading}
        />
      </Container>
    </>
  )
}

// Grading Modal Component
const GradingModal = ({ show, submission, assignment, onHide, onGrade, grading }) => {
  const [marks, setMarks] = useState("")
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    if (submission) {
      setMarks(submission.marks !== undefined ? submission.marks.toString() : "")
      setFeedback(submission.feedback || "")
    }
  }, [submission])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (
      marks === "" ||
      isNaN(marks) ||
      Number.parseInt(marks) < 0 ||
      Number.parseInt(marks) > (assignment?.totalMarks || 100)
    ) {
      alert(`Please enter valid marks between 0 and ${assignment?.totalMarks || 100}`)
      return
    }
    onGrade(marks, feedback)
  }

  if (!submission) return null

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Grade Submission</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <strong>Student:</strong> {submission.student?.name}
            <br />
            <strong>Assignment:</strong> {assignment?.title}
            <br />
            <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
          </div>

          {submission.content && (
            <div className="mb-3">
              <Form.Label>
                <strong>Submission Content:</strong>
              </Form.Label>
              <div className="border p-3 bg-light rounded">{submission.content}</div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Marks (out of {assignment?.totalMarks || 100})</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max={assignment?.totalMarks || 100}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Feedback (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={grading}>
            {grading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Grade"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AssignmentSubmissions
