"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"
import MainLayout from "../../components/Layout/MainLayout"
import ResumeBuilder from "../../components/Resume/ResumeBuilder"
import { FaFileAlt, FaEdit, FaEye, FaDownload, FaShare, FaPrint, FaPlus, FaTrash } from "react-icons/fa"

const Resume = () => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState("view") // 'view', 'edit', 'builder'
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedResumes, setSavedResumes] = useState([])

  // Mock resume data
  const mockResumeData = {
    id: 1,
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    address: "123 University Ave, Campus City, CC 12345",
    objective:
      "Passionate Computer Science student seeking internship opportunities in software development with focus on full-stack web development and machine learning applications.",
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        institution: "University of Technology",
        year: "2021-2025",
        gpa: "8.5/10.0",
        relevant_courses: [
          "Data Structures",
          "Algorithms",
          "Database Systems",
          "Software Engineering",
          "Machine Learning",
        ],
      },
    ],
    experience: [
      {
        id: 1,
        title: "Software Development Intern",
        company: "Tech Solutions Inc.",
        duration: "June 2023 - August 2023",
        description:
          "Developed and maintained web applications using React.js and Node.js. Collaborated with senior developers on database optimization projects. Implemented responsive UI components that improved user engagement by 25%.",
      },
      {
        id: 2,
        title: "Teaching Assistant",
        company: "University of Technology",
        duration: "September 2023 - Present",
        description:
          "Assist students in Data Structures and Algorithms course. Conduct weekly lab sessions and grade assignments. Help students debug code and understand complex programming concepts.",
      },
    ],
    projects: [
      {
        id: 1,
        title: "E-Commerce Web Application",
        description:
          "Full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.",
        technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
        link: "https://github.com/johndoe/ecommerce-app",
      },
      {
        id: 2,
        title: "Machine Learning Stock Predictor",
        description:
          "Python application that uses LSTM neural networks to predict stock prices. Achieved 85% accuracy on test data using historical stock data from Yahoo Finance API.",
        technologies: ["Python", "TensorFlow", "Pandas", "NumPy", "Matplotlib"],
        link: "https://github.com/johndoe/stock-predictor",
      },
    ],
    skills: {
      programming: ["JavaScript", "Python", "Java", "C++", "SQL"],
      frameworks: ["React", "Node.js", "Express", "Django", "Flask"],
      databases: ["MongoDB", "MySQL", "PostgreSQL"],
      tools: ["Git", "Docker", "AWS", "Postman", "VS Code"],
    },
    certifications: ["AWS Cloud Practitioner", "Google Analytics Certified", "MongoDB Developer Associate"],
    languages: ["English (Native)", "Spanish (Intermediate)", "French (Basic)"],
    achievements: [
      "Dean's List - Fall 2023, Spring 2023",
      "1st Place - University Hackathon 2023",
      "Scholarship Recipient - Merit-based Academic Scholarship",
    ],
    lastUpdated: "2024-01-15T10:30:00Z",
  }

  useEffect(() => {
    loadResumeData()
  }, [])

  const loadResumeData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResumeData(mockResumeData)
      setSavedResumes([
        { id: 1, name: "Software Developer Resume", lastUpdated: "2024-01-15", isDefault: true },
        { id: 2, name: "Data Scientist Resume", lastUpdated: "2024-01-10", isDefault: false },
        { id: 3, name: "Internship Resume", lastUpdated: "2024-01-05", isDefault: false },
      ])
    } catch (error) {
      toast.error("Failed to load resume data")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResume = (data) => {
    setResumeData(data)
    toast.success("Resume saved successfully!")
    setViewMode("view")
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    toast.info("Generating PDF... This feature will be available soon.")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href)
    toast.success("Resume link copied to clipboard!")
  }

  const createNewResume = () => {
    setViewMode("builder")
  }

  const deleteResume = (resumeId) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setSavedResumes((prev) => prev.filter((resume) => resume.id !== resumeId))
      toast.success("Resume deleted successfully!")
    }
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
                <p className="resume-subtitle">Create, edit, and manage your professional resume</p>
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

                {(viewMode === "edit" || viewMode === "builder") && (
                  <button className="btn btn-outline-secondary" onClick={() => setViewMode("view")}>
                    <FaEye className="me-2" />
                    Preview Resume
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            {/* Sidebar - Resume Management */}
            <div className="col-lg-3">
              <div className="resume-sidebar">
                <div className="sidebar-section">
                  <div className="section-header">
                    <h5>My Resumes</h5>
                    <button className="btn btn-sm btn-primary" onClick={createNewResume}>
                      <FaPlus className="me-1" />
                      New
                    </button>
                  </div>

                  <div className="resume-list">
                    {savedResumes.map((resume) => (
                      <div key={resume.id} className={`resume-item ${resume.isDefault ? "active" : ""}`}>
                        <div className="resume-item-content">
                          <h6>{resume.name}</h6>
                          <small className="text-muted">
                            Updated: {new Date(resume.lastUpdated).toLocaleDateString()}
                          </small>
                          {resume.isDefault && <span className="badge badge-primary">Default</span>}
                        </div>
                        <div className="resume-item-actions">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteResume(resume.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sidebar-section">
                  <h5>Resume Tips</h5>
                  <div className="tips-list">
                    <div className="tip-item">
                      <strong>Keep it concise:</strong> Limit to 1-2 pages for entry-level positions.
                    </div>
                    <div className="tip-item">
                      <strong>Use action verbs:</strong> Start bullet points with strong action words.
                    </div>
                    <div className="tip-item">
                      <strong>Quantify achievements:</strong> Include numbers and percentages when possible.
                    </div>
                    <div className="tip-item">
                      <strong>Tailor for each job:</strong> Customize your resume for specific positions.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-9">
              {viewMode === "view" && resumeData && (
                <div className="resume-preview-container">
                  <div className="resume-preview" id="resume-content">
                    {/* Resume Header */}
                    <div className="resume-section resume-header-section">
                      <h1 className="resume-name">{resumeData.name}</h1>
                      <div className="resume-contact">
                        <span>{resumeData.email}</span>
                        <span>{resumeData.phone}</span>
                        <span>{resumeData.address}</span>
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
                    <div className="resume-section">
                      <h2 className="section-title">Education</h2>
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="education-item">
                          <div className="item-header">
                            <h3>{edu.degree}</h3>
                            <span className="item-date">{edu.year}</span>
                          </div>
                          <p className="institution">{edu.institution}</p>
                          <p className="gpa">GPA: {edu.gpa}</p>
                          {edu.relevant_courses && (
                            <div className="relevant-courses">
                              <strong>Relevant Courses:</strong> {edu.relevant_courses.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Experience */}
                    <div className="resume-section">
                      <h2 className="section-title">Experience</h2>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="experience-item">
                          <div className="item-header">
                            <h3>{exp.title}</h3>
                            <span className="item-date">{exp.duration}</span>
                          </div>
                          <p className="company">{exp.company}</p>
                          <p className="description">{exp.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div className="resume-section">
                      <h2 className="section-title">Projects</h2>
                      {resumeData.projects.map((project) => (
                        <div key={project.id} className="project-item">
                          <div className="item-header">
                            <h3>{project.title}</h3>
                            {project.link && (
                              <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                                View Project
                              </a>
                            )}
                          </div>
                          <p className="description">{project.description}</p>
                          <div className="technologies">
                            <strong>Technologies:</strong> {project.technologies.join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    <div className="resume-section">
                      <h2 className="section-title">Technical Skills</h2>
                      <div className="skills-grid">
                        <div className="skill-category">
                          <strong>Programming Languages:</strong>
                          <span>{resumeData.skills.programming.join(", ")}</span>
                        </div>
                        <div className="skill-category">
                          <strong>Frameworks & Libraries:</strong>
                          <span>{resumeData.skills.frameworks.join(", ")}</span>
                        </div>
                        <div className="skill-category">
                          <strong>Databases:</strong>
                          <span>{resumeData.skills.databases.join(", ")}</span>
                        </div>
                        <div className="skill-category">
                          <strong>Tools & Technologies:</strong>
                          <span>{resumeData.skills.tools.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    {resumeData.certifications.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Certifications</h2>
                        <ul className="certifications-list">
                          {resumeData.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Languages */}
                    {resumeData.languages.length > 0 && (
                      <div className="resume-section">
                        <h2 className="section-title">Languages</h2>
                        <p>{resumeData.languages.join(", ")}</p>
                      </div>
                    )}

                    {/* Achievements */}
                    {resumeData.achievements.length > 0 && (
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

              {(viewMode === "edit" || viewMode === "builder") && (
                <div className="resume-builder-container">
                  <ResumeBuilder initialData={resumeData} onSave={handleSaveResume} />
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

        .resume-sidebar {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h5 {
          margin: 0;
          font-weight: 600;
          color: #1e293b;
        }

        .resume-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .resume-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .resume-item:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .resume-item.active {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .resume-item-content h6 {
          margin: 0 0 0.25rem 0;
          font-weight: 500;
          color: #1e293b;
        }

        .resume-item-content small {
          display: block;
          margin-bottom: 0.5rem;
        }

        .badge {
          font-size: 0.625rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.75rem;
        }

        .badge-primary {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tip-item {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .tip-item strong {
          color: #1e293b;
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

        .resume-builder-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
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
          .resume-sidebar,
          .resume-actions {
            display: none !important;
          }

          .resume-preview {
            padding: 0;
            box-shadow: none;
            border: none;
          }

          .col-lg-9 {
            width: 100% !important;
            max-width: 100% !important;
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
