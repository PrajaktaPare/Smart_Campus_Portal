"use client"

import { useState, useEffect } from "react"
import { Modal, Button, Form, Alert, Card, Badge, Spinner } from "react-bootstrap"
import { courseService } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

const CourseEnrollment = ({ show, onHide, onEnrollmentComplete }) => {
  const { user } = useAuth()
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [selectedCourses, setSelectedCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (show) {
      fetchCourses()
    }
  }, [show])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch available courses and enrolled courses
      const [availableResponse, enrolledResponse] = await Promise.all([
        courseService.getAvailableCourses().catch(() => ({ data: [] })),
        courseService.getStudentCourses().catch(() => []),
      ])

      const available = Array.isArray(availableResponse.data) ? availableResponse.data : availableResponse
      const enrolled = Array.isArray(enrolledResponse) ? enrolledResponse : []

      // Filter out already enrolled courses
      const enrolledIds = enrolled.map((course) => course._id || course.id)
      const filteredAvailable = available.filter((course) => !enrolledIds.includes(course._id || course.id))

      setAvailableCourses(filteredAvailable)
      setEnrolledCourses(enrolled)

      console.log("📚 CourseEnrollment: Loaded courses", {
        available: filteredAvailable.length,
        enrolled: enrolled.length,
      })
    } catch (error) {
      console.error("❌ CourseEnrollment: Error fetching courses:", error)
      setError("Failed to load courses. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSelection = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleEnrollment = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course to enroll.")
      return
    }

    try {
      setEnrolling(true)
      setError(null)
      setSuccess(null)

      // Enroll in selected courses
      const enrollmentPromises = selectedCourses.map((courseId) => courseService.enrollInCourse(courseId))

      await Promise.all(enrollmentPromises)

      setSuccess(`Successfully enrolled in ${selectedCourses.length} course(s)!`)
      setSelectedCourses([])

      // Refresh courses after enrollment
      setTimeout(() => {
        fetchCourses()
        if (onEnrollmentComplete) {
          onEnrollmentComplete()
        }
      }, 1500)
    } catch (error) {
      console.error("❌ CourseEnrollment: Error enrolling:", error)
      setError(error.response?.data?.message || "Failed to enroll in courses. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleClose = () => {
    setSelectedCourses([])
    setError(null)
    setSuccess(null)
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>📚 Course Enrollment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Currently Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-4">
            <h6 className="text-muted mb-3">📖 Currently Enrolled ({enrolledCourses.length})</h6>
            <div className="row">
              {enrolledCourses.map((course) => (
                <div key={course._id || course.id} className="col-md-6 mb-2">
                  <Card className="border-success">
                    <Card.Body className="py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-success">{course.title}</strong>
                          <small className="text-muted d-block">{course.code}</small>
                        </div>
                        <Badge bg="success">Enrolled</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        <div>
          <h6 className="text-muted mb-3">
            🎯 Available Courses ({availableCourses.length})
            {selectedCourses.length > 0 && <span className="text-primary"> • {selectedCourses.length} selected</span>}
          </h6>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading available courses...</p>
            </div>
          ) : availableCourses.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>No Courses Available</Alert.Heading>
              <p>There are no courses available for enrollment at this time.</p>
              {enrolledCourses.length > 0 && (
                <p className="mb-0">You are currently enrolled in {enrolledCourses.length} course(s).</p>
              )}
            </Alert>
          ) : (
            <div className="row">
              {availableCourses.map((course) => {
                const isSelected = selectedCourses.includes(course._id || course.id)
                const isFullyEnrolled = course.enrolledStudents >= course.maxStudents

                return (
                  <div key={course._id || course.id} className="col-md-6 mb-3">
                    <Card
                      className={`h-100 ${isSelected ? "border-primary" : ""} ${isFullyEnrolled ? "border-warning" : ""}`}
                      style={{ cursor: isFullyEnrolled ? "not-allowed" : "pointer" }}
                    >
                      <Card.Body>
                        <Form.Check
                          type="checkbox"
                          id={`course-${course._id || course.id}`}
                          checked={isSelected}
                          onChange={() => !isFullyEnrolled && handleCourseSelection(course._id || course.id)}
                          disabled={isFullyEnrolled}
                          className="mb-2"
                          label={
                            <div>
                              <strong>{course.title}</strong>
                              <small className="text-muted d-block">{course.code}</small>
                            </div>
                          }
                        />

                        <div className="mt-2">
                          <small className="text-muted d-block">👨‍🏫 {course.instructor?.name || "TBA"}</small>
                          <small className="text-muted d-block">🏢 {course.department || "General"}</small>
                          <small className="text-muted d-block">⭐ {course.credits || 3} Credits</small>
                          <small className="text-muted d-block">
                            👥 {course.enrolledStudents || 0}/{course.maxStudents || 50} Students
                          </small>
                        </div>

                        <div className="mt-2">
                          {isFullyEnrolled ? (
                            <Badge bg="warning">Course Full</Badge>
                          ) : (
                            <Badge bg={isSelected ? "primary" : "outline-secondary"}>
                              {isSelected ? "Selected" : "Available"}
                            </Badge>
                          )}
                        </div>

                        {course.description && (
                          <small
                            className="text-muted d-block mt-2"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {course.description}
                          </small>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            {selectedCourses.length > 0 && (
              <small className="text-muted">{selectedCourses.length} course(s) selected for enrollment</small>
            )}
          </div>
          <div>
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEnrollment} disabled={selectedCourses.length === 0 || enrolling}>
              {enrolling ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enrolling...
                </>
              ) : (
                `Enroll in ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default CourseEnrollment
