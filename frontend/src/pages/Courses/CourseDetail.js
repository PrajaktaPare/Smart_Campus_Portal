"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import "./CourseDetail.css"

const CourseDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Mock data for now
        const mockCourse = {
          _id: id,
          name: "Introduction to Computer Science",
          code: "CS101",
          description:
            "This course provides a comprehensive introduction to computer science and programming. Students will learn fundamental concepts of computing, problem-solving strategies, and basic programming techniques.",
          instructor: "Dr. John Smith",
          credits: 3,
          schedule: "Mon, Wed 10:00 AM - 11:30 AM",
          location: "Science Building, Room 301",
          enrollmentStatus: "Open",
          capacity: 50,
          enrolled: 35,
          startDate: "2023-09-01",
          endDate: "2023-12-15",
          prerequisites: ["None"],
          syllabus: [
            { week: 1, topic: "Introduction to Computing", description: "History and basic concepts" },
            { week: 2, topic: "Problem Solving", description: "Algorithms and flowcharts" },
            { week: 3, topic: "Variables and Data Types", description: "Understanding different data types" },
            { week: 4, topic: "Control Structures", description: "Conditionals and loops" },
            { week: 5, topic: "Functions", description: "Creating and using functions" },
            { week: 6, topic: "Arrays and Lists", description: "Working with collections" },
          ],
          assignments: [
            { id: "a1", title: "Problem Set 1", dueDate: "2023-09-15", points: 100 },
            { id: "a2", title: "Programming Project", dueDate: "2023-10-20", points: 150 },
            { id: "a3", title: "Final Project", dueDate: "2023-12-10", points: 200 },
          ],
          materials: [
            { id: "m1", title: "Introduction to Programming", type: "PDF" },
            { id: "m2", title: "Algorithm Design Basics", type: "PDF" },
            { id: "m3", title: "Code Examples", type: "ZIP" },
          ],
          image: "https://via.placeholder.com/800x400?text=CS101",
        }

        setCourse(mockCourse)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch course details")
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  if (loading) return <div className="loading">Loading course details...</div>
  if (error) return <div className="error">{error}</div>
  if (!course) return <div className="error">Course not found</div>

  return (
    <div className="course-detail-container">
      <div className="course-header" style={{ backgroundImage: `url(${course.image})` }}>
        <div className="course-header-overlay">
          <div className="course-header-content">
            <h1>{course.name}</h1>
            <div className="course-code">{course.code}</div>
            <div className="course-instructor">Instructor: {course.instructor}</div>
          </div>
        </div>
      </div>

      <div className="course-actions">
        {user && user.role === "student" && <button className="btn btn-primary">Enroll in Course</button>}
        {user && (user.role === "admin" || user.role === "faculty") && (
          <>
            <button className="btn btn-primary">Edit Course</button>
            <button className="btn btn-danger">Delete Course</button>
          </>
        )}
      </div>

      <div className="course-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "syllabus" ? "active" : ""}`}
          onClick={() => setActiveTab("syllabus")}
        >
          Syllabus
        </button>
        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          Assignments
        </button>
        <button
          className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          Materials
        </button>
      </div>

      <div className="course-content">
        {activeTab === "overview" && (
          <div className="course-overview">
            <div className="course-description">
              <h3>Description</h3>
              <p>{course.description}</p>
            </div>

            <div className="course-details">
              <div className="detail-item">
                <span className="detail-label">Credits:</span>
                <span className="detail-value">{course.credits}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Schedule:</span>
                <span className="detail-value">{course.schedule}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{course.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${course.enrollmentStatus.toLowerCase()}`}>
                  {course.enrollmentStatus}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Enrollment:</span>
                <span className="detail-value">
                  {course.enrolled} / {course.capacity}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">
                  {course.startDate} to {course.endDate}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Prerequisites:</span>
                <span className="detail-value">{course.prerequisites.join(", ")}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "syllabus" && (
          <div className="course-syllabus">
            <h3>Course Syllabus</h3>
            <table className="syllabus-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Topic</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {course.syllabus.map((item) => (
                  <tr key={item.week}>
                    <td>{item.week}</td>
                    <td>{item.topic}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="course-assignments">
            <h3>Assignments</h3>
            <div className="assignments-list">
              {course.assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-title">{assignment.title}</div>
                  <div className="assignment-details">
                    <div className="assignment-due">Due: {assignment.dueDate}</div>
                    <div className="assignment-points">{assignment.points} points</div>
                  </div>
                  <Link to={`/assignments/${assignment.id}`} className="btn btn-outline-primary">
                    View Assignment
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="course-materials">
            <h3>Course Materials</h3>
            <div className="materials-list">
              {course.materials.map((material) => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">
                    {material.type === "PDF" ? "📄" : material.type === "ZIP" ? "📦" : "📁"}
                  </div>
                  <div className="material-details">
                    <div className="material-title">{material.title}</div>
                    <div className="material-type">{material.type}</div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail
