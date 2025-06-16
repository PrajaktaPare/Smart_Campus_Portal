"use client"

import { useState, useEffect, useContext } from "react"
import AuthContext from "../../context/AuthContext"
import "./Placements.css"

const Placements = () => {
  const { user } = useContext(AuthContext)
  const [placements, setPlacements] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [resumeData, setResumeData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    education: [
      {
        degree: "Bachelor of Technology",
        institution: "Example University",
        year: "2020-2024",
        gpa: "3.8/4.0",
      },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Git"],
    experience: [
      {
        title: "Web Development Intern",
        company: "Tech Solutions Inc.",
        duration: "May 2023 - Aug 2023",
        description: "Developed and maintained web applications using React and Node.js.",
      },
    ],
    projects: [
      {
        title: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform with React, Node.js, and MongoDB.",
        link: "https://github.com/johndoe/ecommerce",
      },
    ],
  })

  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        // Mock data for now
        const mockPlacements = [
          {
            _id: "1",
            company: {
              _id: "101",
              name: "Tech Innovations Inc.",
              logo: "https://via.placeholder.com/150?text=TI",
              industry: "Software Development",
            },
            position: "Software Engineer",
            description:
              "Looking for talented software engineers to join our team. Strong knowledge of JavaScript, React, and Node.js required.",
            location: "New York, NY",
            type: "Full-time",
            salary: "$80,000 - $100,000",
            deadline: "2023-11-15",
            requirements: [
              "Bachelor's degree in Computer Science or related field",
              "2+ years of experience with JavaScript and React",
              "Knowledge of Node.js and Express",
              "Experience with SQL and NoSQL databases",
            ],
            status: "upcoming",
            createdAt: "2023-10-01T10:00:00",
          },
          {
            _id: "2",
            company: {
              _id: "102",
              name: "Global Finance Group",
              logo: "https://via.placeholder.com/150?text=GFG",
              industry: "Finance",
            },
            position: "Financial Analyst",
            description:
              "Seeking financial analysts to join our growing team. Strong analytical skills and attention to detail required.",
            location: "Chicago, IL",
            type: "Full-time",
            salary: "$70,000 - $85,000",
            deadline: "2023-11-10",
            requirements: [
              "Bachelor's degree in Finance, Economics, or related field",
              "Strong analytical and problem-solving skills",
              "Proficiency in Excel and financial modeling",
              "Knowledge of financial markets and instruments",
            ],
            status: "upcoming",
            createdAt: "2023-10-05T14:30:00",
          },
          {
            _id: "3",
            company: {
              _id: "103",
              name: "Creative Design Studios",
              logo: "https://via.placeholder.com/150?text=CDS",
              industry: "Design",
            },
            position: "UI/UX Designer",
            description: "Looking for creative UI/UX designers to help design intuitive and engaging user experiences.",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$75,000 - $95,000",
            deadline: "2023-10-25",
            requirements: [
              "Bachelor's degree in Design, HCI, or related field",
              "Portfolio demonstrating UI/UX design skills",
              "Proficiency in design tools like Figma, Sketch, or Adobe XD",
              "Understanding of user-centered design principles",
            ],
            status: "ongoing",
            createdAt: "2023-09-28T11:15:00",
          },
          {
            _id: "4",
            company: {
              _id: "104",
              name: "Data Insights Corp",
              logo: "https://via.placeholder.com/150?text=DIC",
              industry: "Data Science",
            },
            position: "Data Scientist",
            description: "Seeking data scientists to analyze complex datasets and derive meaningful insights.",
            location: "Boston, MA",
            type: "Full-time",
            salary: "$90,000 - $110,000",
            deadline: "2023-10-20",
            requirements: [
              "Master's or PhD in Computer Science, Statistics, or related field",
              "Experience with Python, R, and SQL",
              "Knowledge of machine learning algorithms and statistical analysis",
              "Experience with data visualization tools",
            ],
            status: "ongoing",
            createdAt: "2023-09-25T09:45:00",
          },
          {
            _id: "5",
            company: {
              _id: "105",
              name: "Cloud Systems Inc.",
              logo: "https://via.placeholder.com/150?text=CSI",
              industry: "Cloud Computing",
            },
            position: "Cloud Solutions Architect",
            description: "Looking for experienced cloud architects to design and implement scalable cloud solutions.",
            location: "Seattle, WA",
            type: "Full-time",
            salary: "$100,000 - $130,000",
            deadline: "2023-09-30",
            requirements: [
              "Bachelor's degree in Computer Science or related field",
              "5+ years of experience with cloud platforms (AWS, Azure, GCP)",
              "Knowledge of infrastructure as code and DevOps practices",
              "Experience with containerization and orchestration",
            ],
            status: "completed",
            createdAt: "2023-09-15T13:20:00",
          },
        ]

        const uniqueCompanies = Array.from(new Set(mockPlacements.map((p) => p.company._id))).map((id) => {
          const placement = mockPlacements.find((p) => p.company._id === id)
          return placement.company
        })

        setPlacements(mockPlacements)
        setCompanies(uniqueCompanies)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch placement data")
        setLoading(false)
      }
    }

    fetchPlacementData()
  }, [])

  const handleApply = (placementId) => {
    // Simulate applying for a placement
    alert(`Applied for placement ID: ${placementId}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getDaysRemaining = (deadline) => {
    const now = new Date()
    const due = new Date(deadline)
    const diffTime = due - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "Expired"
    } else if (diffDays === 0) {
      return "Last day"
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`
    }
  }

  const filteredPlacements = placements.filter((placement) => {
    const matchesFilter = filter === "all" || placement.status === filter
    const matchesSearch =
      placement.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      placement.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      placement.location.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  if (loading) return <div className="loading">Loading placement data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="placements-container">
      <div className="placements-header">
        <h1>Placements & Career Opportunities</h1>
      </div>

      <div className="placements-content">
        <div className="placements-main">
          <div className="placements-controls">
            <div className="filter-buttons">
              <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                All Opportunities
              </button>
              <button
                className={`filter-btn ${filter === "upcoming" ? "active" : ""}`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`filter-btn ${filter === "ongoing" ? "active" : ""}`}
                onClick={() => setFilter("ongoing")}
              >
                Ongoing
              </button>
              <button
                className={`filter-btn ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search companies, positions, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="placements-list">
            {filteredPlacements.length === 0 ? (
              <div className="no-placements">
                <div className="no-placements-icon">🔍</div>
                <p>No placement opportunities found</p>
              </div>
            ) : (
              filteredPlacements.map((placement) => (
                <div key={placement._id} className="placement-card">
                  <div className="placement-header">
                    <div className="company-logo">
                      <img src={placement.company.logo || "/placeholder.svg"} alt={placement.company.name} />
                    </div>
                    <div className="placement-info">
                      <div className="placement-position">{placement.position}</div>
                      <div className="company-name">{placement.company.name}</div>
                      <div className="placement-location">{placement.location}</div>
                    </div>
                    <div className="placement-type">
                      <span className="badge">{placement.type}</span>
                    </div>
                  </div>

                  <div className="placement-description">{placement.description}</div>

                  <div className="placement-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      {placement.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="placement-footer">
                    <div className="placement-details">
                      <div className="salary">{placement.salary}</div>
                      <div className="deadline">
                        Deadline: {formatDate(placement.deadline)}
                        <span
                          className={`days-remaining ${getDaysRemaining(placement.deadline) === "Expired" ? "expired" : ""}`}
                        >
                          ({getDaysRemaining(placement.deadline)})
                        </span>
                      </div>
                    </div>

                    <div className="placement-actions">
                      {placement.status !== "completed" && (
                        <button className="btn btn-primary" onClick={() => handleApply(placement._id)}>
                          Apply Now
                        </button>
                      )}
                      <button className="btn btn-outline-secondary">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="placements-sidebar">
          <div className="sidebar-card resume-builder">
            <h3>Resume Builder</h3>
            <p>Create and manage your professional resume</p>
            <button className="btn btn-primary btn-block">Build Resume</button>
            <button className="btn btn-outline-secondary btn-block mt-2">Download PDF</button>
          </div>

          <div className="sidebar-card">
            <h3>Top Recruiting Companies</h3>
            <div className="companies-list">
              {companies.map((company) => (
                <div key={company._id} className="company-item">
                  <div className="company-logo">
                    <img src={company.logo || "/placeholder.svg"} alt={company.name} />
                  </div>
                  <div className="company-info">
                    <div className="company-name">{company.name}</div>
                    <div className="company-industry">{company.industry}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Placement Statistics</h3>
            <div className="stats-item">
              <div className="stats-label">Average Package</div>
              <div className="stats-value">$85,000</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Highest Package</div>
              <div className="stats-value">$130,000</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Placement Rate</div>
              <div className="stats-value">92%</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Companies Visited</div>
              <div className="stats-value">45</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Placements
