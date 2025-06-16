"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Table, Badge, Form, Button, Spinner, Alert } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { Award, Calendar, BookOpen, TrendingUp, Filter } from "lucide-react"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import { toast } from "react-toastify"

const ViewGrades = () => {
  const { studentId } = useParams()
  const { user } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [grades, setGrades] = useState([])
  const [filteredGrades, setFilteredGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterSemester, setFilterSemester] = useState("all")

  useEffect(() => {
    fetchGradesData()
  }, [studentId])

  useEffect(() => {
    filterGrades()
  }, [grades, filterCourse, filterSemester])

  const fetchGradesData = async () => {
    try {
      setLoading(true)
      // Mock data since we don't have the actual API endpoint
      const mockStudent = {
        _id: studentId,
        name: "John Doe",
        studentId: "STU001",
        department: "Computer Science",
        gpa: 3.75,
      }

      const mockGrades = [
        {
          _id: "1",
          course: { code: "CS101", title: "Introduction to Computer Science", credits: 3 },
          assignment: "Assignment 1 - Hello World",
          type: "assignment",
          grade: 95,
          maxGrade: 100,
          weight: 10,
          date: "2024-10-15",
          semester: "Fall 2024",
          feedback: "Excellent work! Clean and well-commented code.",
        },
        {
          _id: "2",
          course: { code: "CS101", title: "Introduction to Computer Science", credits: 3 },
          assignment: "Midterm Exam",
          type: "exam",
          grade: 88,
          maxGrade: 100,
          weight: 30,
          date: "2024-11-01",
          semester: "Fall 2024",
          feedback: "Good understanding of concepts, minor errors in implementation.",
        },
        {
          _id: "3",
          course: { code: "CS101", title: "Introduction to Computer Science", credits: 3 },
          assignment: "Final Project",
          type: "project",
          grade: 92,
          maxGrade: 100,
          weight: 40,
          date: "2024-12-10",
          semester: "Fall 2024",
          feedback: "Creative solution with good documentation.",
        },
        {
          _id: "4",
          course: { code: "CS201", title: "Data Structures and Algorithms", credits: 4 },
          assignment: "Programming Project 1",
          type: "project",
          grade: 90,
          maxGrade: 100,
          weight: 25,
          date: "2024-10-20",
          semester: "Fall 2024",
          feedback: "Well-implemented algorithms with good time complexity analysis.",
        },
        {
          _id: "5",
          course: { code: "CS201", title: "Data Structures and Algorithms", credits: 4 },
          assignment: "Quiz 1 - Arrays and Linked Lists",
          type: "quiz",
          grade: 85,
          maxGrade: 100,
          weight: 15,
          date: "2024-10-10",
          semester: "Fall 2024",
          feedback: "Good grasp of basic concepts.",
        },
        {
          _id: "6",
          course: { code: "MATH201", title: "Discrete Mathematics", credits: 3 },
          assignment: "Problem Set 1",
          type: "homework",
          grade: 90,
          maxGrade: 100,
          weight: 20,
          date: "2024-10-12",
          semester: "Fall 2024",
          feedback: "Clear mathematical reasoning and proofs.",
        },
        {
          _id: "7",
          course: { code: "MATH201", title: "Discrete Mathematics", credits: 3 },
          assignment: "Midterm Exam",
          type: "exam",
          grade: 87,
          maxGrade: 100,
          weight: 35,
          date: "2024-11-05",
          semester: "Fall 2024",
          feedback: "Strong performance on proof techniques.",
        },
      ]

      setStudent(mockStudent)
      setGrades(mockGrades)
    } catch (error) {
      console.error("Error fetching grades data:", error)
      setError("Failed to load grades data")
      toast.error("Failed to load grades data")
    } finally {
      setLoading(false)
    }
  }

  const filterGrades = () => {
    let filtered = grades

    if (filterCourse !== "all") {
      filtered = filtered.filter((grade) => grade.course.code === filterCourse)
    }

    if (filterSemester !== "all") {
      filtered = filtered.filter((grade) => grade.semester === filterSemester)
    }

    setFilteredGrades(filtered)
  }

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 90) return "success"
    if (percentage >= 80) return "primary"
    if (percentage >= 70) return "warning"
    return "danger"
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "exam":
        return "📝"
      case "project":
        return "💻"
      case "assignment":
        return "📋"
      case "quiz":
        return "❓"
      case "homework":
        return "📚"
      default:
        return "📄"
    }
  }

  const calculateCourseGrade = (courseCode) => {
    const courseGrades = grades.filter((g) => g.course.code === courseCode)
    if (courseGrades.length === 0) return 0

    const totalWeight = courseGrades.reduce((sum, g) => sum + g.weight, 0)
    const weightedSum = courseGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * g.weight, 0)

    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0
  }

  const getUniqueCourses = () => {
    const courses = new Map()
    grades.forEach((grade) => {
      if (!courses.has(grade.course.code)) {
        courses.set(grade.course.code, grade.course)
      }
    })
    return Array.from(courses.values())
  }

  const getUniqueSemesters = () => {
    return [...new Set(grades.map((grade) => grade.semester))]
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
                  <h2 className={`fw-bold mb-1 text-${theme === "dark" ? "light" : "dark"}`}>Student Grades</h2>
                  <p className="text-muted">
                    {student.name} ({student.studentId}) • {student.department}
                  </p>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </Col>
          </Row>

          {/* GPA and Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <Award size={24} className="text-primary mb-2" />
                  <h3 className="text-primary">{student.gpa}</h3>
                  <p className="text-muted mb-0">Overall GPA</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <BookOpen size={24} className="text-success mb-2" />
                  <h3 className="text-success">{getUniqueCourses().length}</h3>
                  <p className="text-muted mb-0">Courses</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <TrendingUp size={24} className="text-info mb-2" />
                  <h3 className="text-info">{grades.length}</h3>
                  <p className="text-muted mb-0">Total Grades</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`text-center bg-${theme === "dark" ? "dark" : "white"} border-0 shadow-sm`}>
                <Card.Body>
                  <Calendar size={24} className="text-warning mb-2" />
                  <h3 className="text-warning">
                    {Math.round(grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / grades.length || 0)}%
                  </h3>
                  <p className="text-muted mb-0">Average</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Course Summary */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"} mb-4`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Course Summary</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Current Grade</th>
                    <th>Assignments</th>
                  </tr>
                </thead>
                <tbody>
                  {getUniqueCourses().map((course, index) => {
                    const courseGrade = calculateCourseGrade(course.code)
                    const assignmentCount = grades.filter((g) => g.course.code === course.code).length
                    return (
                      <tr key={course.code || index}>
                        <td>
                          <div>
                            <strong>{course.code}</strong>
                            <div className="text-muted small">{course.title}</div>
                          </div>
                        </td>
                        <td>{course.credits}</td>
                        <td>
                          <Badge bg={getGradeColor(courseGrade, 100)}>{Math.round(courseGrade)}%</Badge>
                        </td>
                        <td>{assignmentCount} assignments</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <Filter size={16} className="me-2" />
                  Filter by Course
                </Form.Label>
                <Form.Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                  <option value="all">All Courses</option>
                  {getUniqueCourses().map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Semester</Form.Label>
                <Form.Select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                  <option value="all">All Semesters</option>
                  {getUniqueSemesters().map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div className="text-muted">
                Showing {filteredGrades.length} of {grades.length} grades
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Detailed Grades */}
          <Card className={`border-0 shadow-sm bg-${theme === "dark" ? "dark" : "white"}`}>
            <Card.Header className={`bg-${theme === "dark" ? "dark" : "white"} border-bottom`}>
              <h5 className={`mb-0 text-${theme === "dark" ? "light" : "dark"}`}>Detailed Grades</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className={`align-middle mb-0 ${theme === "dark" ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Assignment</th>
                    <th>Type</th>
                    <th>Grade</th>
                    <th>Weight</th>
                    <th>Date</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((grade, index) => (
                      <tr key={grade._id || index}>
                        <td>
                          <div>
                            <strong>{grade.course.code}</strong>
                            <div className="text-muted small">{grade.course.title}</div>
                          </div>
                        </td>
                        <td>{grade.assignment}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2">{getTypeIcon(grade.type)}</span>
                            <Badge bg="secondary" className="text-capitalize">
                              {grade.type}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <div>
                            <Badge bg={getGradeColor(grade.grade, grade.maxGrade)} className="mb-1">
                              {grade.grade}/{grade.maxGrade}
                            </Badge>
                            <div className="text-muted small">{Math.round((grade.grade / grade.maxGrade) * 100)}%</div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{grade.weight}%</Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={16} className="text-muted me-2" />
                            {new Date(grade.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {grade.feedback ? (
                            <div className="text-truncate" style={{ maxWidth: "200px" }} title={grade.feedback}>
                              {grade.feedback}
                            </div>
                          ) : (
                            <span className="text-muted">No feedback</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div>
                          <Award size={48} className="text-muted mb-3" />
                          <h5 className={`text-${theme === "dark" ? "light" : "dark"}`}>No Grades Found</h5>
                          <p className="text-muted">
                            {filterCourse !== "all" || filterSemester !== "all"
                              ? "Try adjusting your filters to see more grades."
                              : "No grades have been recorded yet."}
                          </p>
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
      <Footer />
    </>
  )
}

export default ViewGrades
    