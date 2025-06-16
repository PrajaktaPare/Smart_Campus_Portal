"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Alert, Form, Badge, Spinner } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { assignmentService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import Navbar from "../../components/Layout/Navbar"
import BackButton from "../../components/UI/BackButton"

const AssignmentDetails = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [submissionContent, setSubmissionContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchAssignmentDetails()
  }, [assignmentId])

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const assignmentData = await assignmentService.getAssignmentById(assignmentId)
      setAssignment(assignmentData)

      let userSubmission = null
      // Check if user has already submitted
      if (assignmentData.submissions) {
        userSubmission = assignmentData.submissions.find(
          (sub) => sub.student === user._id || sub.student._id === user._id,
        )
        if (userSubmission) {
          setSubmission(userSubmission)
          setSubmissionContent(userSubmission.content || "")
        }
      }

      console.log("📝 AssignmentDetails: Data loaded", {
        assignment: assignmentData?.title,
        hasSubmission: !!userSubmission,
      })
    } catch (error) {
      console.error("❌ AssignmentDetails: Error fetching data:", error)
      setError("Failed to load assignment details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmission = async (e) => {
    e.preventDefault()

    if (!submissionContent.trim()) {
      setError("Please enter your submission content.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await assignmentService.submitAssignment(assignmentId, {
        content: submissionContent,
      })

      setSuccess("Assignment submitted successfully!")

      // Refresh assignment data
      setTimeout(() => {
        fetchAssignmentDetails()
      }, 1500)
    } catch (error) {
      console.error("❌ Error submitting assignment:", error)
      setError(error.response?.data?.message || "Failed to submit assignment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = assignment && new Date(assignment.dueDate) < new Date()
  const canSubmit = assignment && !submission && !isOverdue

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="mt-4">
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading assignment details...</p>
          </div>
        </Container>
      </>
    )
  }

  if (error && !assignment) {
    return (
      <>
        <Navbar />
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchAssignmentDetails}>
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
        <Row>
          <Col>
            <BackButton />

            {error && (
              <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {assignment && (
              <>
                {/* Assignment Header */}
                <Card className="mt-3 mb-4">
                  <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">📝 {assignment.title}</h3>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <div className="mb-3">
                          <strong>Course:</strong> {assignment.course?.title || assignment.course?.code}
                        </div>
                        <div className="mb-3">
                          <strong>Description:</strong>
                          <p className="mt-2">{assignment.description || "No description provided."}</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-2">
                          <strong>Due Date:</strong>
                          <div className={`mt-1 ${isOverdue ? "text-danger" : "text-muted"}`}>
                            📅 {new Date(assignment.dueDate).toLocaleDateString()}
                            <br />🕐 {new Date(assignment.dueDate).toLocaleTimeString()}
                            {isOverdue && (
                              <Badge bg="danger" className="ms-2">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mb-2">
                          <strong>Total Marks:</strong>
                          <div className="text-muted mt-1">🎯 {assignment.totalMarks || 100} points</div>
                        </div>
                        <div className="mb-2">
                          <strong>Status:</strong>
                          <div className="mt-1">
                            {submission ? (
                              <Badge bg="success">Submitted</Badge>
                            ) : isOverdue ? (
                              <Badge bg="danger">Missing</Badge>
                            ) : (
                              <Badge bg="warning">Pending</Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Submission Status */}
                {submission && (
                  <Card className="mb-4 border-success">
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">✅ Your Submission</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong>Submitted on:</strong> {new Date(submission.submittedAt).toLocaleString()}
                      </div>

                      {submission.marks !== undefined && submission.marks !== null && (
                        <div className="mb-3">
                          <strong>Grade:</strong>
                          <span className="text-success ms-2 fs-5">
                            {submission.marks}/{assignment.totalMarks}(
                            {Math.round((submission.marks / assignment.totalMarks) * 100)}%)
                          </span>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="mb-3">
                          <strong>Instructor Feedback:</strong>
                          <div className="mt-2 p-3 bg-light border rounded">{submission.feedback}</div>
                        </div>
                      )}

                      <div>
                        <strong>Your Submission:</strong>
                        <div className="mt-2 p-3 bg-light border rounded">{submission.content}</div>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Submission Form */}
                {canSubmit && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">📤 Submit Assignment</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmission}>
                        <Form.Group className="mb-3">
                          <Form.Label>Your Submission</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={8}
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            placeholder="Enter your assignment submission here..."
                            required
                          />
                          <Form.Text className="text-muted">
                            Please provide your complete solution or answer to the assignment.
                          </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-muted">
                            <small>
                              ⏰ Time remaining:{" "}
                              {Math.max(
                                0,
                                Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
                              )}{" "}
                              days
                            </small>
                          </div>
                          <Button type="submit" variant="primary" disabled={submitting || !submissionContent.trim()}>
                            {submitting ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Assignment"
                            )}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                {/* Cannot Submit Messages */}
                {!canSubmit && !submission && (
                  <Alert variant={isOverdue ? "danger" : "info"}>
                    <Alert.Heading>{isOverdue ? "⏰ Assignment Overdue" : "ℹ️ Assignment Status"}</Alert.Heading>
                    <p>
                      {isOverdue
                        ? "This assignment is past its due date and can no longer be submitted."
                        : "You have already submitted this assignment."}
                    </p>
                  </Alert>
                )}

                {/* Faculty Actions */}
                {user.role === "faculty" && (
                  <Card className="mb-4 border-info">
                    <Card.Header className="bg-info text-white">
                      <h5 className="mb-0">👨‍🏫 Faculty Actions</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => navigate(`/assignment/${assignmentId}/submissions`)}>
                          📋 View All Submissions
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate(`/assignment/${assignmentId}/edit`)}
                        >
                          ✏️ Edit Assignment
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default AssignmentDetails
