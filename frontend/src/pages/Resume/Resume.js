"use client"

import { useState, useEffect, useContext } from "react"
import AuthContext from "../../context/AuthContext"
import MainLayout from "../../components/Layout/MainLayout"
import ApiService from "../../services/api"
import { toast } from "react-toastify"
import {
  FaFileAlt,
  FaEdit,
  FaDownload,
  FaShare,
  FaPrint,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa"

const Resume = () => {
  const { user } = useContext(AuthContext)
  const [viewMode, setViewMode] = useState("view") // 'view', 'edit'
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    if (user) {
      loadResumeData()
    }
  }, [user])

  const loadResumeData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const resume = await ApiService.getResume(user._id)
      setResumeData(resume)
      setEditData(resume)
    } catch (error) {
      console.error("Error loading resume:", error)
      // If no resume exists, create a default structure
      const defaultResume = {
        user: user._id,
        personalInfo: {
          name: user.name || "",
          email: user.email || "",
          phone: "",
          address: "",
          linkedin: "",
          github: "",
          website: "",
        },
        objective: "",
        education: [],
        experience: [],
        projects: [],
        skills: {
          programming: [],
          frameworks: [],
          databases: [],
          tools: [],
          languages: [],
        },
        certifications: [],
        achievements: [],
        languages: [],
      }
      setResumeData(defaultResume)
      setEditData(defaultResume)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResume = async () => {
    setSaving(true)
    try {
      const savedResume = await ApiService.saveResume(editData)
      setResumeData(savedResume)
      setViewMode("view")
      toast.success("Resume saved successfully!")
    } catch (error) {
      console.error("Error saving resume:", error)
      toast.error("Failed to save resume")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      toast.info("Generating PDF...")
      const blob = await ApiService.downloadResumePDF(user._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${user.name.replace(/\s+/g, "_")}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Resume downloaded successfully!")
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast.error("Failed to download resume")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Resume link copied to clipboard!")
  }

  const updateEditData = (path, value) => {
    setEditData((prev) => {
      const newData = { ...prev }
      const keys = path.split(".")
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const addArrayItem = (path, item) => {
    setEditData((prev) => {
      const newData = { ...prev }
      const keys = path.split(".")
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      if (!current[keys[keys.length - 1]]) current[keys[keys.length - 1]] = []
      current[keys[keys.length - 1]].push(item)
      return newData
    })
  }

  const removeArrayItem = (path, index) => {
    setEditData((prev) => {
      const newData = { ...prev }
      const keys = path.split(".")
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]].splice(index, 1)
      return newData
    })
  }

  const updateArrayItem = (path, index, field, value) => {
    setEditData((prev) => {
      const newData = { ...prev }
      const keys = path.split(".")
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]][index][field] = value
      return newData
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Loading Resume...</h4>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="resume-page">
        <div className="container-fluid">
          {/* Resume Header */}
          <div className="resume-header">
            <div className="resume-header-content">
              <div className="resume-title-section">
                <h1>
                  <FaFileAlt className="me-3 text-primary" />
                  My Resume
                </h1>
                <p className="resume-subtitle">Create and manage your professional resume</p>
              </div>

              <div className="resume-actions">
                {viewMode === "view" && (
                  <>
                    <button className="btn btn-outline-primary me-2" onClick={() => setViewMode("edit")}>
                      <FaEdit className="me-2" />
                      Edit Resume
                    </button>
                    <button className="btn btn-outline-secondary me-2" onClick={handleDownloadPDF}>
                      <FaDownload className="me-2" />
                      Download PDF
                    </button>
                    <button className="btn btn-outline-info me-2" onClick={handlePrint}>
                      <FaPrint className="me-2" />
                      Print
                    </button>
                    <button className="btn btn-outline-success" onClick={handleShare}>
                      <FaShare className="me-2" />
                      Share
                    </button>
                  </>
                )}

                {viewMode === "edit" && (
                  <>
                    <button className="btn btn-success me-2" onClick={handleSaveResume} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Save Resume
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setViewMode("view")
                        setEditData(resumeData)
                      }}
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            {/* Main Content */}
            <div className="col-lg-12">
              {viewMode === "view" && resumeData && (
                <div className="resume-preview-container">
                  <div className="resume-preview" id="resume-content">
                    {/* Resume Header */}
                    <div className="resume-section resume-header-section">
                      <h1 className="resume-name">{resumeData.personalInfo?.name || user?.name}</h1>
                      <div className="resume-contact">
                        {resumeData.personalInfo?.email && (
                          <span>
                            <FaEnvelope className="me-1" />
                            {resumeData.personalInfo.email}
                          </span>
                        )}
                        {resumeData.personalInfo?.phone && (
                          <span>
                            <FaPhone className="me-1" />
                            {resumeData.personalInfo.phone}
                          </span>
                        )}
                        {resumeData.personalInfo?.address && (
                          <span>
                            <FaMapMarkerAlt className="me-1" />
                            {resumeData.personalInfo.address}
                          </span>
                        )}
                        {resumeData.personalInfo?.linkedin && (
                          <span>
                            <FaLinkedin className="me-1" />
                            {resumeData.personalInfo.linkedin}
                          </span>
                        )}
                        {resumeData.personalInfo?.github && (
                          <span>
                            <FaGithub className="me-1" />
                            {resumeData.personalInfo.github}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Objective */}
                    {resumeData.objective && (
                      <div className="resume-section">
                        <h2 className="section-title">Objective</h2>
                        <p className="objective-text">{resumeData.objective}</p>
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education && resumeData.education.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Education</h2>
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="education-item">
                            <div className="item-header">
                              <h3>{edu.degree}</h3>
                              <span className="item-date">{edu.year}</span>
                            </div>
                            <p className="institution">{edu.institution}</p>
                            {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                            {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                              <div className="relevant-courses">
                                <strong>Relevant Courses:</strong> {edu.relevantCourses.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Experience</h2>
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="experience-item">
                            <div className="item-header">
                              <h3>{exp.title}</h3>
                              <span className="item-date">{exp.duration}</span>
                            </div>
                            <p className="company">{exp.company}</p>
                            <p className="description">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects && resumeData.projects.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Projects</h2>
                        {resumeData.projects.map((project, index) => (
                          <div key={index} className="project-item">
                            <div className="item-header">
                              <h3>{project.title}</h3>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="project-link"
                                >
                                  View Project
                                </a>
                              )}
                            </div>
                            <p className="description">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="technologies">
                                <strong>Technologies:</strong> {project.technologies.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills && (
                      <div className="resume-section">
                        <h2 className="section-title">Technical Skills</h2>
                        <div className="skills-grid">
                          {resumeData.skills.programming && resumeData.skills.programming.length > 0 && (
                            <div className="skill-category">
                              <strong>Programming Languages:</strong>
                              <span>{resumeData.skills.programming.join(", ")}</span>
                            </div>
                          )}
                          {resumeData.skills.frameworks && resumeData.skills.frameworks.length > 0 && (
                            <div className="skill-category">
                              <strong>Frameworks & Libraries:</strong>
                              <span>{resumeData.skills.frameworks.join(", ")}</span>
                            </div>
                          )}
                          {resumeData.skills.databases && resumeData.skills.databases.length > 0 && (
                            <div className="skill-category">
                              <strong>Databases:</strong>
                              <span>{resumeData.skills.databases.join(", ")}</span>
                            </div>
                          )}
                          {resumeData.skills.tools && resumeData.skills.tools.length > 0 && (
                            <div className="skill-category">
                              <strong>Tools & Technologies:</strong>
                              <span>{resumeData.skills.tools.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications && resumeData.certifications.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Certifications</h2>
                        <ul className="certifications-list">
                          {resumeData.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Achievements */}
                    {resumeData.achievements && resumeData.achievements.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Achievements</h2>
                        <ul className="achievements-list">
                          {resumeData.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === "edit" && editData && (
                <div className="resume-edit-container">
                  <div className="edit-form">
                    {/* Personal Information */}
                    <div className="edit-section">
                      <h3>Personal Information</h3>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.personalInfo?.name || ""}
                              onChange={(e) => updateEditData("personalInfo.name", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={editData.personalInfo?.email || ""}
                              onChange={(e) => updateEditData("personalInfo.email", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.personalInfo?.phone || ""}
                              onChange={(e) => updateEditData("personalInfo.phone", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.personalInfo?.address || ""}
                              onChange={(e) => updateEditData("personalInfo.address", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>LinkedIn</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.personalInfo?.linkedin || ""}
                              onChange={(e) => updateEditData("personalInfo.linkedin", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>GitHub</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.personalInfo?.github || ""}
                              onChange={(e) => updateEditData("personalInfo.github", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Objective */}
                    <div className="edit-section">
                      <h3>Objective</h3>
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editData.objective || ""}
                          onChange={(e) => updateEditData("objective", e.target.value)}
                          placeholder="Write your career objective..."
                        />
                      </div>
                    </div>

                    {/* Education */}
                    <div className="edit-section">
                      <div className="section-header">
                        <h3>Education</h3>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            addArrayItem("education", {
                              degree: "",
                              institution: "",
                              year: "",
                              gpa: "",
                              relevantCourses: [],
                            })
                          }
                        >
                          <FaPlus className="me-1" />
                          Add Education
                        </button>
                      </div>
                      {editData.education?.map((edu, index) => (
                        <div key={index} className="array-item">
                          <div className="array-item-header">
                            <h5>Education {index + 1}</h5>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeArrayItem("education", index)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Degree</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={edu.degree}
                                  onChange={(e) => updateArrayItem("education", index, "degree", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Institution</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={edu.institution}
                                  onChange={(e) => updateArrayItem("education", index, "institution", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Year</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={edu.year}
                                  onChange={(e) => updateArrayItem("education", index, "year", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>GPA</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={edu.gpa}
                                  onChange={(e) => updateArrayItem("education", index, "gpa", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Experience */}
                    <div className="edit-section">
                      <div className="section-header">
                        <h3>Experience</h3>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            addArrayItem("experience", {
                              title: "",
                              company: "",
                              duration: "",
                              description: "",
                            })
                          }
                        >
                          <FaPlus className="me-1" />
                          Add Experience
                        </button>
                      </div>
                      {editData.experience?.map((exp, index) => (
                        <div key={index} className="array-item">
                          <div className="array-item-header">
                            <h5>Experience {index + 1}</h5>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeArrayItem("experience", index)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Job Title</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={exp.title}
                                  onChange={(e) => updateArrayItem("experience", index, "title", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Company</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={exp.company}
                                  onChange={(e) => updateArrayItem("experience", index, "company", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label>Duration</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={exp.duration}
                                  onChange={(e) => updateArrayItem("experience", index, "duration", e.target.value)}
                                  placeholder="e.g., June 2023 - August 2023"
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label>Description</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={exp.description}
                                  onChange={(e) => updateArrayItem("experience", index, "description", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div className="edit-section">
                      <div className="section-header">
                        <h3>Projects</h3>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            addArrayItem("projects", {
                              title: "",
                              description: "",
                              technologies: [],
                              link: "",
                            })
                          }
                        >
                          <FaPlus className="me-1" />
                          Add Project
                        </button>
                      </div>
                      {editData.projects?.map((project, index) => (
                        <div key={index} className="array-item">
                          <div className="array-item-header">
                            <h5>Project {index + 1}</h5>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeArrayItem("projects", index)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Project Title</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={project.title}
                                  onChange={(e) => updateArrayItem("projects", index, "title", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Project Link</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={project.link}
                                  onChange={(e) => updateArrayItem("projects", index, "link", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label>Description</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={project.description}
                                  onChange={(e) => updateArrayItem("projects", index, "description", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="form-group">
                                <label>Technologies (comma-separated)</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={project.technologies?.join(", ") || ""}
                                  onChange={(e) =>
                                    updateArrayItem(
                                      "projects",
                                      index,
                                      "technologies",
                                      e.target.value.split(",").map((t) => t.trim()),
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    <div className="edit-section">
                      <h3>Skills</h3>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Programming Languages</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.skills?.programming?.join(", ") || ""}
                              onChange={(e) =>
                                updateEditData(
                                  "skills.programming",
                                  e.target.value.split(",").map((s) => s.trim()),
                                )
                              }
                              placeholder="JavaScript, Python, Java..."
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Frameworks & Libraries</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.skills?.frameworks?.join(", ") || ""}
                              onChange={(e) =>
                                updateEditData(
                                  "skills.frameworks",
                                  e.target.value.split(",").map((s) => s.trim()),
                                )
                              }
                              placeholder="React, Node.js, Django..."
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Databases</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.skills?.databases?.join(", ") || ""}
                              onChange={(e) =>
                                updateEditData(
                                  "skills.databases",
                                  e.target.value.split(",").map((s) => s.trim()),
                                )
                              }
                              placeholder="MongoDB, MySQL, PostgreSQL..."
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Tools & Technologies</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editData.skills?.tools?.join(", ") || ""}
                              onChange={(e) =>
                                updateEditData(
                                  "skills.tools",
                                  e.target.value.split(",").map((s) => s.trim()),
                                )
                              }
                              placeholder="Git, Docker, AWS..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="edit-section">
                      <h3>Certifications</h3>
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editData.certifications?.join("\n") || ""}
                          onChange={(e) =>
                            updateEditData(
                              "certifications",
                              e.target.value.split("\n").filter((c) => c.trim()),
                            )
                          }
                          placeholder="Enter each certification on a new line..."
                        />
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="edit-section">
                      <h3>Achievements</h3>
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editData.achievements?.join("\n") || ""}
                          onChange={(e) =>
                            updateEditData(
                              "achievements",
                              e.target.value.split("\n").filter((a) => a.trim()),
                            )
                          }
                          placeholder="Enter each achievement on a new line..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .resume-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 2rem 0;
        }

        .resume-header {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .resume-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .resume-title-section h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .resume-subtitle {
          color: #64748b;
          margin: 0;
        }

        .resume-actions {
          display: flex;
          gap: 0.5rem;
        }

        .resume-preview-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .resume-preview {
          padding: 3rem;
          max-width: 8.5in;
          margin: 0 auto;
          background: white;
          color: #1e293b;
          line-height: 1.6;
        }

        .resume-section {
          margin-bottom: 2rem;
        }

        .resume-section:last-child {
          margin-bottom: 0;
        }

        .resume-header-section {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .resume-name {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .resume-contact {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          color: #64748b;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .objective-text {
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .education-item,
        .experience-item,
        .project-item {
          margin-bottom: 1.5rem;
        }

        .education-item:last-child,
        .experience-item:last-child,
        .project-item:last-child {
          margin-bottom: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .item-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .item-date {
          color: #64748b;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .institution,
        .company {
          color: #374151;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .gpa {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #374151;
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .relevant-courses,
        .technologies {
          color: #64748b;
          font-size: 0.9rem;
        }

        .project-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .project-link:hover {
          text-decoration: underline;
        }

        .skills-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skill-category {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .skill-category strong {
          color: #1e293b;
          font-size: 0.95rem;
        }

        .skill-category span {
          color: #374151;
          font-size: 0.9rem;
        }

        .certifications-list,
        .achievements-list {
          margin: 0;
          padding-left: 1.5rem;
        }

        .certifications-list li,
        .achievements-list li {
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .resume-edit-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
        }

        .edit-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .edit-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .edit-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          margin-bottom: 0;
        }

        .array-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .array-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .array-item-header h5 {
          margin: 0;
          color: #1e293b;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-outline-primary {
          background: white;
          border: 1px solid #3b82f6;
          color: #3b82f6;
        }

        .btn-outline-primary:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-outline-secondary {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .btn-outline-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-outline-info {
          background: white;
          border: 1px solid #06b6d4;
          color: #06b6d4;
        }

        .btn-outline-info:hover {
          background: #06b6d4;
          color: white;
        }

        .btn-outline-success {
          background: white;
          border: 1px solid #10b981;
          color: #10b981;
        }

        .btn-outline-success:hover {
          background: #10b981;
          color: white;
        }

        .btn-outline-danger {
          background: white;
          border: 1px solid #ef4444;
          color: #ef4444;
        }

        .btn-outline-danger:hover {
          background: #ef4444;
          color: white;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          flex-direction: column;
        }

        .loading-spinner h4 {
          color: #64748b;
          font-weight: 500;
        }

        @media print {
          .resume-page {
            background: white;
            padding: 0;
          }

          .resume-header,
          .resume-actions {
            display: none !important;
          }

          .resume-preview {
            padding: 0;
            box-shadow: none;
            border: none;
          }
        }

        @media (max-width: 768px) {
          .resume-page {
            padding: 1rem 0;
          }

          .resume-header {
            padding: 1.5rem;
          }

          .resume-header-content {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }

          .resume-actions {
            flex-wrap: wrap;
            width: 100%;
          }

          .resume-actions .btn {
            flex: 1;
            min-width: 120px;
          }

          .resume-preview {
            padding: 1.5rem;
          }

          .resume-name {
            font-size: 2rem;
          }

          .resume-contact {
            flex-direction: column;
            gap: 0.5rem;
          }

          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </MainLayout>
  )
}

export default Resume
