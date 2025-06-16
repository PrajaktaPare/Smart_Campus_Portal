"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import MainLayout from "../../components/Layout/MainLayout"
import ApiService from "../../services/api"
import { toast } from "react-toastify"
import {
  FaFileAlt,
  FaCalendarAlt,
  FaUser,
  FaFilter,
  FaSort,
  FaPlus,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa"
import "./Assignments.css"

const Assignments = () => {
  const { user } = useContext(AuthContext)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")

  useEffect(() => {
    fetchAssignments()
  }, [user])

  const fetchAssignments = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log("🔄 Fetching assignments for user:", user.email, "Role:", user.role)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Fetch assignments from API with correct endpoint
      const response = await fetch("http://localhost:8000/api/assignments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📊 Assignments API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error:", errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const assignmentsData = await response.json()
      console.log("✅ Assignments fetched:", assignmentsData)

      // Handle both array and object responses
      const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || []

      console.log("✅ Processed assignments:", assignments.length)

      // Process assignments to add status and submission info
      const processedAssignments = assignments.map((assignment) => {
        const now = new Date()
        const dueDate = new Date(assignment.dueDate)

        // Find student's submission if exists
        const studentSubmission = assignment.submissions?.find(
          (sub) => sub.student?._id === user._id || sub.student?.id === user._id,
        )

        let status = "pending"
        if (studentSubmission) {
          if (studentSubmission.grade !== undefined) {
            status = "graded"
          } else {
            status = "submitted"
          }
        } else if (dueDate < now) {
          status = "overdue"
        }

        return {
          ...assignment,
          status,
          submission: studentSubmission,
        }
      })

      setAssignments(processedAssignments)
    } catch (error) {
      console.error("❌ Error fetching assignments:", error)
      setError("Failed to fetch assignments: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (assignmentId) => {
    try {
      await ApiService.markAssignmentComplete(assignmentId)
      toast.success("Assignment marked as completed!")
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error("Error marking assignment complete:", error)
      toast.error("Failed to mark assignment as completed")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning"
      case "submitted":
        return "badge-primary"
      case "graded":
        return "badge-success"
      case "completed":
        return "badge-success"
      case "late":
        return "badge-danger"
      case "overdue":
        return "badge-danger"
      default:
        return "badge-secondary"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysRemaining = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "Overdue"
    } else if (diffDays === 0) {
      return "Due today"
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true
    return assignment.status === filter
  })

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate) - new Date(b.dueDate)
    } else if (sortBy === "points") {
      return b.totalMarks - a.totalMarks
    } else if (sortBy === "course") {
      return a.course.title.localeCompare(b.course.title)
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Loading assignments...</h4>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h4>Error Loading Assignments</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchAssignments}>
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="assignments-page">
        <div className="container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-title">
                <h1>
                  <FaFileAlt className="me-3 text-primary" />
                  Assignments
                </h1>
                <p className="header-subtitle">
                  {user?.role === "student" ? "View and submit your assignments" : "Manage course assignments"}
                </p>
              </div>
              {user?.role === "faculty" && (
                <Link to="/assignments/create" className="btn btn-primary">
                  <FaPlus className="me-2" />
                  Create Assignment
                </Link>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="assignments-controls">
            <div className="controls-row">
              <div className="filter-group">
                <label htmlFor="filter" className="control-label">
                  <FaFilter className="me-2" />
                  Filter by Status:
                </label>
                <select id="filter" className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All Assignments</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="sort-group">
                <label htmlFor="sort" className="control-label">
                  <FaSort className="me-2" />
                  Sort by:
                </label>
                <select id="sort" className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="dueDate">Due Date</option>
                  <option value="points">Points</option>
                  <option value="course">Course</option>
                  <option value="createdAt">Date Created</option>
                </select>
              </div>
            </div>

            <div className="assignments-stats">
              <div className="stat-item">
                <span className="stat-number">{assignments.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{assignments.filter((a) => a.status === "pending").length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{assignments.filter((a) => a.status === "submitted").length}</span>
                <span className="stat-label">Submitted</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{assignments.filter((a) => a.status === "completed").length}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="assignments-grid">
            {sortedAssignments.length === 0 ? (
              <div className="no-assignments">
                <div className="no-assignments-content">
                  <FaFileAlt className="no-assignments-icon" />
                  <h3>No assignments found</h3>
                  <p>
                    {filter === "all"
                      ? "You don't have any assignments yet."
                      : `No assignments with status "${filter}".`}
                  </p>
                </div>
              </div>
            ) : (
              sortedAssignments.map((assignment) => (
                <div key={assignment._id} className="assignment-card">
                  <div className="assignment-header">
                    <div className="assignment-title-section">
                      <h3 className="assignment-title">{assignment.title}</h3>
                      <div className="assignment-course">
                        <span className="course-code">{assignment.course.code}</span>
                        <span className="course-name">{assignment.course.title}</span>
                      </div>
                    </div>
                    <div className={`assignment-status badge ${getStatusBadgeClass(assignment.status)}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </div>
                  </div>

                  <div className="assignment-description">
                    <p>{assignment.description}</p>
                  </div>

                  <div className="assignment-meta">
                    <div className="meta-row">
                      <div className="meta-item">
                        <FaCalendarAlt className="meta-icon" />
                        <div className="meta-content">
                          <span className="meta-label">Due Date:</span>
                          <span className="meta-value">{formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Points:</span>
                        <span className="meta-value points">{assignment.totalMarks}</span>
                      </div>
                    </div>

                    <div className="meta-row">
                      <div className="meta-item">
                        <FaUser className="meta-icon" />
                        <div className="meta-content">
                          <span className="meta-label">Instructor:</span>
                          <span className="meta-value">{assignment.createdBy.name}</span>
                        </div>
                      </div>
                      {assignment.submission && assignment.submission.marks !== undefined && (
                        <div className="meta-item">
                          <span className="meta-label">Grade:</span>
                          <span className="meta-value grade">
                            {assignment.submission.marks} / {assignment.totalMarks}
                          </span>
                        </div>
                      )}
                    </div>

                    {assignment.submission?.submittedAt && (
                      <div className="meta-row">
                        <div className="meta-item">
                          <span className="meta-label">Submitted:</span>
                          <span className="meta-value">{formatDate(assignment.submission.submittedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="assignment-footer">
                    <div className="time-remaining">
                      {assignment.status === "pending" && (
                        <span
                          className={`time-badge ${getDaysRemaining(assignment.dueDate) === "Overdue" ? "overdue" : ""}`}
                        >
                          {getDaysRemaining(assignment.dueDate)}
                        </span>
                      )}
                    </div>

                    <div className="assignment-actions">
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <span className="attachments-count">
                          {assignment.attachments.length} attachment{assignment.attachments.length !== 1 ? "s" : ""}
                        </span>
                      )}

                      {user?.role === "student" && assignment.status === "submitted" && (
                        <button className="btn btn-sm btn-success" onClick={() => handleMarkComplete(assignment._id)}>
                          <FaCheck className="me-1" />
                          Mark Complete
                        </button>
                      )}

                      <Link to={`/assignments/${assignment._id}`} className="btn btn-sm btn-primary">
                        {assignment.status === "pending" ? "Submit" : "View Details"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Assignments
