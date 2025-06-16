"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import MainLayout from "../../components/Layout/MainLayout"
import ApiService from "../../services/api"
import { toast } from "react-toastify"
import {
  FaCalendarAlt,
  FaUser,
  FaDownload,
  FaUpload,
  FaCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaPaperclip,
} from "react-icons/fa"
import "./AssignmentDetail.css"

const AssignmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState({
    files: [],
    content: "",
  })

  useEffect(() => {
    fetchAssignment()
  }, [id])

  const fetchAssignment = async () => {
    setLoading(true)
    try {
      const assignmentData = await ApiService.getAssignment(id)
      setAssignment(assignmentData)
    } catch (error) {
      console.error("Error fetching assignment:", error)
      setError("Failed to fetch assignment details")
      toast.error("Failed to load assignment")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSubmission((prev) => ({
      ...prev,
      files: files,
    }))
  }

  const handleContentChange = (e) => {
    setSubmission((prev) => ({
      ...prev,
      content: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submission.files.length === 0 && !submission.content.trim()) {
      toast.error("Please add files or content to submit")
      return
    }

    setSubmitting(true)
    try {
      await ApiService.submitAssignment(id, submission)
      toast.success("Assignment submitted successfully!")
      fetchAssignment() // Refresh assignment data
      setSubmission({ files: [], content: "" })
      // Reset file input
      const fileInput = document.getElementById("files")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Error submitting assignment:", error)
      toast.error("Failed to submit assignment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadAttachment = (attachment) => {
    // In a real app, this would download the file from the server
    const link = document.createElement("a")
    link.href = attachment.fileUrl
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
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

  const getStudentSubmission = () => {
    if (!assignment || !user) return null
    return assignment.submissions.find((sub) => sub.student._id === user._id)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Loading assignment...</h4>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !assignment) {
    return (
      <MainLayout>
        <div className="error-container">
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h4>Assignment Not Found</h4>
            <p>{error || "The assignment you're looking for doesn't exist."}</p>
            <button className="btn btn-primary" onClick={() => navigate("/assignments")}>
              <FaArrowLeft className="me-2" />
              Back to Assignments
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const studentSubmission = getStudentSubmission()
  const isOverdue = new Date() > new Date(assignment.dueDate)
  const canSubmit = user?.role === "student" && (!studentSubmission || studentSubmission.status !== "graded")

  return (
    <MainLayout>
      <div className="assignment-detail-page">
        <div className="container-fluid">
          {/* Header */}
          <div className="assignment-header">
            <div className="header-navigation">
              <button className="btn btn-outline-secondary" onClick={() => navigate("/assignments")}>
                <FaArrowLeft className="me-2" />
                Back to Assignments
              </button>
            </div>

            <div className="header-content">
              <div className="header-main">
                <div className="course-info">
                  <span className="course-code">{assignment.course.code}</span>
                  <span className="course-name">{assignment.course.title}</span>
                </div>
                <h1 className="assignment-title">{assignment.title}</h1>

                <div className="assignment-meta-header">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <div>
                      <span className="meta-label">Due Date:</span>
                      <span className="meta-value">{formatDate(assignment.dueDate)}</span>
                      <span className={`time-remaining ${isOverdue ? "overdue" : ""}`}>
                        ({getDaysRemaining(assignment.dueDate)})
                      </span>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Points:</span>
                    <span className="meta-value points">{assignment.totalMarks}</span>
                  </div>

                  <div className="meta-item">
                    <FaUser className="meta-icon" />
                    <div>
                      <span className="meta-label">Instructor:</span>
                      <span className="meta-value">{assignment.createdBy.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {studentSubmission && (
                <div className="submission-status-card">
                  <h4>Your Submission</h4>
                  <div className="status-info">
                    <span className={`status-badge ${studentSubmission.status}`}>
                      {studentSubmission.status.charAt(0).toUpperCase() + studentSubmission.status.slice(1)}
                    </span>
                    <span className="submission-date">Submitted: {formatDate(studentSubmission.submittedAt)}</span>
                  </div>
                  {studentSubmission.marks !== undefined && (
                    <div className="grade-info">
                      <span className="grade">
                        Grade: {studentSubmission.marks} / {assignment.totalMarks}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="assignment-content">
            <div className="row">
              {/* Main Content */}
              <div className="col-lg-8">
                <div className="content-section">
                  <h2>Description</h2>
                  <div className="description-content">
                    <p>{assignment.description}</p>
                  </div>
                </div>

                {assignment.instructions && (
                  <div className="content-section">
                    <h2>Instructions</h2>
                    <div className="instructions-content">
                      <p>{assignment.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Submission Form */}
                {canSubmit && (
                  <div className="content-section">
                    <h2>Submit Assignment</h2>
                    <form onSubmit={handleSubmit} className="submission-form">
                      <div className="form-group">
                        <label htmlFor="files" className="form-label">
                          <FaUpload className="me-2" />
                          Upload Files:
                        </label>
                        <input
                          type="file"
                          id="files"
                          className="form-control"
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                        />
                        <div className="form-text">
                          Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG. Max size: 10MB per file.
                        </div>
                        {submission.files.length > 0 && (
                          <div className="selected-files">
                            <h6>Selected Files:</h6>
                            <ul>
                              {submission.files.map((file, index) => (
                                <li key={index}>
                                  <FaPaperclip className="me-2" />
                                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="content" className="form-label">
                          Additional Comments (Optional):
                        </label>
                        <textarea
                          id="content"
                          className="form-control"
                          rows="4"
                          value={submission.content}
                          onChange={handleContentChange}
                          placeholder="Add any comments or notes about your submission..."
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting || (submission.files.length === 0 && !submission.content.trim())}
                        >
                          {submitting ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FaCheck className="me-2" />
                              Submit Assignment
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Previous Submission */}
                {studentSubmission && (
                  <div className="content-section">
                    <h2>Your Submission</h2>
                    <div className="submission-details">
                      {studentSubmission.content && (
                        <div className="submission-content">
                          <h4>Comments:</h4>
                          <p>{studentSubmission.content}</p>
                        </div>
                      )}

                      {studentSubmission.attachments && studentSubmission.attachments.length > 0 && (
                        <div className="submission-files">
                          <h4>Submitted Files:</h4>
                          <div className="files-list">
                            {studentSubmission.attachments.map((file, index) => (
                              <div key={index} className="file-item">
                                <FaPaperclip className="file-icon" />
                                <span className="file-name">{file.fileName}</span>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleDownloadAttachment(file)}
                                >
                                  <FaDownload className="me-1" />
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {studentSubmission.feedback && (
                        <div className="submission-feedback">
                          <h4>Instructor Feedback:</h4>
                          <div className="feedback-content">
                            <p>{studentSubmission.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                <div className="sidebar">
                  {/* Assignment Resources */}
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="sidebar-section">
                      <h3>Resources</h3>
                      <div className="resources-list">
                        {assignment.attachments.map((attachment, index) => (
                          <div key={index} className="resource-item">
                            <FaPaperclip className="resource-icon" />
                            <div className="resource-info">
                              <span className="resource-name">{attachment.fileName}</span>
                              <span className="resource-type">{attachment.fileType}</span>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <FaDownload />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignment Details */}
                  <div className="sidebar-section">
                    <h3>Assignment Details</h3>
                    <div className="details-list">
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{formatDate(assignment.createdAt)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Points:</span>
                        <span className="detail-value">{assignment.totalMarks}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Submissions:</span>
                        <span className="detail-value">{assignment.submissions.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Guidelines */}
                  <div className="sidebar-section">
                    <h3>Submission Guidelines</h3>
                    <div className="guidelines-list">
                      <div className="guideline-item">
                        <FaCheck className="guideline-icon success" />
                        <span>Submit before the due date</span>
                      </div>
                      <div className="guideline-item">
                        <FaCheck className="guideline-icon success" />
                        <span>Include all required files</span>
                      </div>
                      <div className="guideline-item">
                        <FaCheck className="guideline-icon success" />
                        <span>Follow naming conventions</span>
                      </div>
                      <div className="guideline-item">
                        <FaCheck className="guideline-icon success" />
                        <span>Check file size limits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AssignmentDetail
