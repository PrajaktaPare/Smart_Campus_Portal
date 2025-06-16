"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Modal, Table } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import { courseService } from "../../services/api"
import "./Courses.css"

const Courses = () => {
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("enrolled") // "enrolled", "available", "assignments"

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching courses data from database")

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("🔑 Using token:", token.substring(0, 20) + "...")

      if (user.role === "student") {
        // Fetch all courses and assignments for students
        const [allCoursesRes, assignmentsRes] = await Promise.all([
          fetch("http://localhost:8000/api/courses", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://localhost:8000/api/assignments", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ])

        console.log("📊 API Response Status:", {
          courses: allCoursesRes.status,
          assignments: assignmentsRes.status,
        })

        if (!allCoursesRes.ok) {
          const errorText = await allCoursesRes.text()
          console.error("❌ Courses API Error:", errorText)
          throw new Error(`Failed to fetch courses: ${allCoursesRes.status} - ${errorText}`)
        }

        if (!assignmentsRes.ok) {
          const errorText = await assignmentsRes.text()
          console.error("❌ Assignments API Error:", errorText)
          throw new Error(`Failed to fetch assignments: ${assignmentsRes.status} - ${errorText}`)
        }

        const allCoursesData = await allCoursesRes.json()
        const assignmentsData = await assignmentsRes.json()

        console.log("✅ Raw data:", { courses: allCoursesData, assignments: assignmentsData })

        // Handle both array and object responses
        const courses = Array.isArray(allCoursesData) ? allCoursesData : allCoursesData.data || []
        const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || []

        console.log("✅ Courses fetched:", courses.length)
        console.log("✅ Assignments fetched:", assignments.length)

        // Filter courses by department if user has department
        const departmentCourses = user.department
          ? courses.filter((course) => course.department === user.department)
          : courses

        // Separate enrolled and available courses
        const enrolledCourseIds = user.enrolledCourses || []
        const enrolled = departmentCourses.filter(
          (course) =>
            enrolledCourseIds.includes(course._id) ||
            course.students?.some((student) => (student._id || student) === user._id),
        )

        const available = departmentCourses.filter(
          (course) =>
            !enrolledCourseIds.includes(course._id) &&
            !course.students?.some((student) => (student._id || student) === user._id) &&
            course.isActive !== false,
        )

        setEnrolledCourses(enrolled)
        setAvailableCourses(available)
        setCourses(enrolled)
        setAssignments(assignments)
      } else {
        // Fetch all courses for faculty/admin
        const [coursesRes, assignmentsRes] = await Promise.all([
          fetch("http://localhost:8000/api/courses", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://localhost:8000/api/assignments", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ])

        if (!coursesRes.ok) throw new Error("Failed to fetch courses")
        if (!assignmentsRes.ok) throw new Error("Failed to fetch assignments")

        const coursesData = await coursesRes.json()
        const assignmentsData = await assignmentsRes.json()

        // Handle both array and object responses
        const courses = Array.isArray(coursesData) ? coursesData : coursesData.data || []
        const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || []

        console.log("✅ Courses fetched:", courses.length)
        console.log("✅ Assignments fetched:", assignments.length)

        setCourses(courses)
        setAssignments(assignments)
      }

      console.log("✅ Data loaded successfully")
    } catch (error) {
      console.error("❌ Error fetching data:", error)
      setError("Failed to load data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = (course) => {
    setSelectedCourse(course)
    setShowEnrollModal(true)
  }

  const handleEnrollConfirm = async () => {
    if (!selectedCourse) return

    try {
      setEnrolling(true)
      setError(null)

      await courseService.enrollInCourse(selectedCourse._id || selectedCourse.id)

      setSuccess(`Successfully enrolled in ${selectedCourse.title || selectedCourse.name}!`)
      setShowEnrollModal(false)
      setSelectedCourse(null)

      // Refresh data
      setTimeout(() => {
        fetchData()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      console.error("❌ Error enrolling in course:", error)
      setError(error.message || "Failed to enroll in course")
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) {
      return
    }

    try {
      setError(null)
      await courseService.unenrollFromCourse(courseId)
      setSuccess("Successfully unenrolled from course!")

      // Refresh data
      setTimeout(() => {
        fetchData()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      console.error("❌ Error unenrolling from course:", error)
      setError(error.message || "Failed to unenroll from course")
    }
  }

  const getAssignmentsForCourse = (courseId) => {
    return assignments.filter((assignment) => (assignment.course?._id || assignment.course?.id) === courseId)
  }

  const getAllAssignmentsForStudent = () => {
    const enrolledCourseIds = enrolledCourses.map((course) => course._id || course.id)
    return assignments.filter((assignment) =>
      enrolledCourseIds.includes(assignment.course?._id || assignment.course?.id),
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading courses...</p>
            </Col>
          </Row>
        </Container>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container className={`mt-4 ${theme === "dark" ? "text-light" : ""}`}>
        <Row className="mb-4">
          <Col>
            <h2>
              <i className="bi bi-book me-2"></i>
              {user.role === "student" ? "My Courses" : "Course Management"}
            </h2>
            <p className="text-muted">
              {user.role === "student"
                ? "Manage your course enrollments and view assignments"
                : "Manage courses and assignments"}
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        {user.role === "student" && (
          <Row className="mb-4">
            <Col>
              <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Course Dashboard</h5>
                    <div>
                      <Button
                        variant={activeTab === "enrolled" ? "primary" : "outline-primary"}
                        size="sm"
                        className="me-2"
                        onClick={() => setActiveTab("enrolled")}
                      >
                        Enrolled ({enrolledCourses.length})
                      </Button>
                      <Button
                        variant={activeTab === "available" ? "primary" : "outline-primary"}
                        size="sm"
                        className="me-2"
                        onClick={() => setActiveTab("available")}
                      >
                        Available ({availableCourses.length})
                      </Button>
                      <Button
                        variant={activeTab === "assignments" ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setActiveTab("assignments")}
                      >
                        All Assignments ({getAllAssignmentsForStudent().length})
                      </Button>
                    </div>
                  </div>
                </Card.Header>
              </Card>
            </Col>
          </Row>
        )}

        {/* Enrolled Courses Tab */}
        {(user.role !== "student" || activeTab === "enrolled") && (
          <Row>
            <Col>
              <h4 className="mb-3">{user.role === "student" ? "Enrolled Courses" : "All Courses"}</h4>
              {(user.role === "student" ? enrolledCourses : courses).length > 0 ? (
                <Row>
                  {(user.role === "student" ? enrolledCourses : courses).map((course) => (
                    <Col md={6} lg={4} key={course._id || course.id} className="mb-4">
                      <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title">{course.title || course.name}</h5>
                            <Badge bg="primary">{course.code}</Badge>
                          </div>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-person me-1"></i>
                            {course.instructor?.name || course.instructorName || "TBA"}
                          </p>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-building me-1"></i>
                            {course.department}
                          </p>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-calendar me-1"></i>
                            {course.semester} {course.year} • {course.credits} Credits
                          </p>

                          <p className="text-muted small mb-3">
                            <i className="bi bi-people me-1"></i>
                            {course.enrolledCount || (course.enrolledStudents || course.students || []).length} students
                            enrolled
                          </p>

                          {course.description && <p className="card-text small mb-3">{course.description}</p>}

                          <div className="mt-auto">
                            {user.role === "student" && (
                              <div className="d-grid gap-2">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleUnenroll(course._id || course.id)}
                                >
                                  <i className="bi bi-box-arrow-right me-1"></i>
                                  Unenroll
                                </Button>
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => navigate(`/courses/${course._id || course.id}`)}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View Details
                                </Button>
                              </div>
                            )}

                            {user.role !== "student" && (
                              <div className="d-grid gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/courses/${course._id || course.id}`)}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Manage Course
                                </Button>
                              </div>
                            )}

                            {/* Show assignments for this course */}
                            {getAssignmentsForCourse(course._id || course.id).length > 0 && (
                              <div className="mt-2">
                                <small className="text-success">
                                  <i className="bi bi-file-earmark-text me-1"></i>
                                  {getAssignmentsForCourse(course._id || course.id).length} assignment(s)
                                </small>
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  {user.role === "student"
                    ? "You are not enrolled in any courses yet. Check the 'Available' tab to enroll in courses."
                    : "No courses found."}
                </Alert>
              )}
            </Col>
          </Row>
        )}

        {/* Available Courses Tab (Students Only) */}
        {user.role === "student" && activeTab === "available" && (
          <Row>
            <Col>
              <h4 className="mb-3">Available Courses for Enrollment</h4>
              {availableCourses.length > 0 ? (
                <Row>
                  {availableCourses.map((course) => (
                    <Col md={6} lg={4} key={course._id || course.id} className="mb-4">
                      <Card className={`h-100 ${theme === "dark" ? "bg-dark text-light" : ""}`}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title">{course.title || course.name}</h5>
                            <Badge bg="success">{course.code}</Badge>
                          </div>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-person me-1"></i>
                            {course.instructor?.name || course.instructorName || "TBA"}
                          </p>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-building me-1"></i>
                            {course.department}
                          </p>

                          <p className="text-muted small mb-2">
                            <i className="bi bi-calendar me-1"></i>
                            {course.semester} {course.year} • {course.credits} Credits
                          </p>

                          <p className="text-muted small mb-3">
                            <i className="bi bi-people me-1"></i>
                            {course.enrolledCount || 0}/{course.maxStudents || 50} students
                          </p>

                          {course.description && <p className="card-text small mb-3">{course.description}</p>}

                          <div className="mt-auto">
                            <div className="d-grid">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleEnrollClick(course)}
                                disabled={course.enrolledCount >= (course.maxStudents || 50)}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                {course.enrolledCount >= (course.maxStudents || 50) ? "Course Full" : "Enroll Now"}
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No courses available for enrollment in your department.
                </Alert>
              )}
            </Col>
          </Row>
        )}

        {/* All Assignments Tab (Students Only) */}
        {user.role === "student" && activeTab === "assignments" && (
          <Row>
            <Col>
              <h4 className="mb-3">All Assignments from Enrolled Courses</h4>
              {getAllAssignmentsForStudent().length > 0 ? (
                <Card className={`${theme === "dark" ? "bg-dark text-light" : ""}`}>
                  <Card.Body className="p-0">
                    <Table hover responsive className={`mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Course</th>
                          <th>Due Date</th>
                          <th>Total Marks</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAllAssignmentsForStudent().map((assignment) => {
                          const studentSubmission = assignment.submissions?.find(
                            (sub) => sub.student?._id === user.id || sub.student?.id === user.id,
                          )
                          const isOverdue = new Date(assignment.dueDate) < new Date()
                          const hasSubmitted = !!studentSubmission

                          return (
                            <tr key={assignment._id || assignment.id}>
                              <td>
                                <div>
                                  <strong>{assignment.title}</strong>
                                  {assignment.description && (
                                    <small className="text-muted d-block">
                                      {assignment.description.substring(0, 100)}...
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{assignment.course?.code}</strong>
                                  <small className="text-muted d-block">
                                    {assignment.course?.title || assignment.course?.name}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div>
                                  {new Date(assignment.dueDate).toLocaleDateString()}
                                  <small className={`d-block ${isOverdue ? "text-danger" : "text-muted"}`}>
                                    {isOverdue ? "Overdue" : "Upcoming"}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <Badge bg="info">{assignment.totalMarks || assignment.maxMarks || 100} pts</Badge>
                              </td>
                              <td>
                                {hasSubmitted ? (
                                  studentSubmission.status === "graded" ? (
                                    <Badge bg="success">
                                      Graded ({studentSubmission.marks}/
                                      {assignment.totalMarks || assignment.maxMarks || 100})
                                    </Badge>
                                  ) : (
                                    <Badge bg="warning" text="dark">
                                      Submitted
                                    </Badge>
                                  )
                                ) : isOverdue ? (
                                  <Badge bg="danger">Not Submitted</Badge>
                                ) : (
                                  <Badge bg="secondary">Pending</Badge>
                                )}
                              </td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/assignments/${assignment._id || assignment.id}`)}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No assignments found from your enrolled courses.
                </Alert>
              )}
            </Col>
          </Row>
        )}

        {/* Enrollment Confirmation Modal */}
        <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Course Enrollment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCourse && (
              <div>
                <h5>{selectedCourse.title || selectedCourse.name}</h5>
                <p>
                  <strong>Code:</strong> {selectedCourse.code}
                </p>
                <p>
                  <strong>Instructor:</strong>{" "}
                  {selectedCourse.instructor?.name || selectedCourse.instructorName || "TBA"}
                </p>
                <p>
                  <strong>Credits:</strong> {selectedCourse.credits}
                </p>
                <p>
                  <strong>Department:</strong> {selectedCourse.department}
                </p>
                <p>
                  <strong>Semester:</strong> {selectedCourse.semester} {selectedCourse.year}
                </p>

                {selectedCourse.description && (
                  <div>
                    <strong>Description:</strong>
                    <p className="text-muted">{selectedCourse.description}</p>
                  </div>
                )}

                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  Are you sure you want to enroll in this course?
                </Alert>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleEnrollConfirm} disabled={enrolling}>
              {enrolling ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enrolling...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Confirm Enrollment
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <Footer />
    </>
  )
}

export default Courses
