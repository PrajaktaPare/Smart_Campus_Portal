"use client"

import { useState, useEffect, useContext } from "react"
import AuthContext from "../../context/AuthContext"
import "./Analytics.css"

const Analytics = () => {
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    attendance: [],
    performance: [],
    events: [],
    placements: [],
  })

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Mock data for now
        const mockData = {
          overview: {
            totalStudents: 1250,
            totalFaculty: 85,
            totalCourses: 120,
            activeEvents: 15,
            placementRate: 92,
            averageAttendance: 85,
            averageGrade: 78,
          },
          attendance: [
            { month: "Jan", attendance: 88 },
            { month: "Feb", attendance: 85 },
            { month: "Mar", attendance: 82 },
            { month: "Apr", attendance: 78 },
            { month: "May", attendance: 75 },
            { month: "Jun", attendance: 80 },
            { month: "Jul", attendance: 82 },
            { month: "Aug", attendance: 87 },
            { month: "Sep", attendance: 89 },
            { month: "Oct", attendance: 86 },
            { month: "Nov", attendance: 84 },
            { month: "Dec", attendance: 80 },
          ],
          performance: [
            { course: "CS101", assignments: 85, exams: 78, projects: 90, overall: 84 },
            { course: "CS201", assignments: 82, exams: 75, projects: 88, overall: 82 },
            { course: "CS301", assignments: 90, exams: 85, projects: 92, overall: 89 },
            { course: "CS401", assignments: 78, exams: 72, projects: 85, overall: 78 },
            { course: "CS501", assignments: 88, exams: 80, projects: 95, overall: 88 },
          ],
          events: [
            { name: "Technical", value: 35 },
            { name: "Cultural", value: 25 },
            { name: "Sports", value: 20 },
            { name: "Workshops", value: 15 },
            { name: "Seminars", value: 5 },
          ],
          placements: [
            { year: "2018", placed: 88, total: 100 },
            { year: "2019", placed: 92, total: 100 },
            { year: "2020", placed: 85, total: 100 },
            { year: "2021", placed: 90, total: 100 },
            { year: "2022", placed: 94, total: 100 },
          ],
        }

        setAnalyticsData(mockData)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch analytics data")
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Helper function to render progress bars
  const renderProgressBar = (value, maxValue = 100) => {
    const percentage = (value / maxValue) * 100
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}>
          <span className="progress-value">{value}%</span>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading analytics data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          Performance
        </button>
        <button className={`tab-btn ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
          Events
        </button>
        <button
          className={`tab-btn ${activeTab === "placements" ? "active" : ""}`}
          onClick={() => setActiveTab("placements")}
        >
          Placements
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <div className="stat-content">
                  <div className="stat-value">{analyticsData.overview.totalStudents}</div>
                  <div className="stat-label">Total Students</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-content">
                  <div className="stat-value">{analyticsData.overview.totalFaculty}</div>
                  <div className="stat-label">Faculty Members</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-value">{analyticsData.overview.totalCourses}</div>
                  <div className="stat-label">Active Courses</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎭</div>
                <div className="stat-content">
                  <div className="stat-value">{analyticsData.overview.activeEvents}</div>
                  <div className="stat-label">Active Events</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Attendance Trend</h3>
                <div className="chart-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Attendance</th>
                        <th>Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.attendance.map((item, index) => (
                        <tr key={index}>
                          <td>{item.month}</td>
                          <td>{item.attendance}%</td>
                          <td>{renderProgressBar(item.attendance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="chart-card">
                <h3>Performance by Course</h3>
                <div className="chart-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Overall</th>
                        <th>Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.performance.map((item, index) => (
                        <tr key={index}>
                          <td>{item.course}</td>
                          <td>{item.overall}%</td>
                          <td>{renderProgressBar(item.overall)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="chart-card">
                <h3>Event Distribution</h3>
                <div className="chart-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Type</th>
                        <th>Percentage</th>
                        <th>Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.events.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.value}%</td>
                          <td>{renderProgressBar(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="chart-card">
                <h3>Placement Rates</h3>
                <div className="chart-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Placement Rate</th>
                        <th>Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.placements.map((item, index) => (
                        <tr key={index}>
                          <td>{item.year}</td>
                          <td>{item.placed}%</td>
                          <td>{renderProgressBar(item.placed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-section">
            <div className="section-header">
              <h2>Attendance Analytics</h2>
              <div className="section-actions">
                <button className="btn btn-outline-primary">Export Data</button>
                <button className="btn btn-outline-secondary">Print Report</button>
              </div>
            </div>

            <div className="attendance-summary">
              <div className="summary-card">
                <div className="summary-title">Average Attendance</div>
                <div className="summary-value">{analyticsData.overview.averageAttendance}%</div>
                {renderProgressBar(analyticsData.overview.averageAttendance)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Highest Month</div>
                <div className="summary-value">September (89%)</div>
                {renderProgressBar(89)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Lowest Month</div>
                <div className="summary-value">May (75%)</div>
                {renderProgressBar(75)}
              </div>
            </div>

            <div className="chart-card full-width">
              <h3>Monthly Attendance Trend</h3>
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Attendance</th>
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.attendance.map((item, index) => (
                      <tr key={index}>
                        <td>{item.month}</td>
                        <td>{item.attendance}%</td>
                        <td>{renderProgressBar(item.attendance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="performance-section">
            <div className="section-header">
              <h2>Performance Analytics</h2>
              <div className="section-actions">
                <button className="btn btn-outline-primary">Export Data</button>
                <button className="btn btn-outline-secondary">Print Report</button>
              </div>
            </div>

            <div className="performance-summary">
              <div className="summary-card">
                <div className="summary-title">Average Grade</div>
                <div className="summary-value">{analyticsData.overview.averageGrade}%</div>
                {renderProgressBar(analyticsData.overview.averageGrade)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Top Course</div>
                <div className="summary-value">CS301 (89%)</div>
                {renderProgressBar(89)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Lowest Course</div>
                <div className="summary-value">CS401 (78%)</div>
                {renderProgressBar(78)}
              </div>
            </div>

            <div className="chart-card full-width">
              <h3>Performance Breakdown by Course</h3>
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Assignments</th>
                      <th>Exams</th>
                      <th>Projects</th>
                      <th>Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.performance.map((item, index) => (
                      <tr key={index}>
                        <td>{item.course}</td>
                        <td>
                          {item.assignments}%<div className="mini-progress">{renderProgressBar(item.assignments)}</div>
                        </td>
                        <td>
                          {item.exams}%<div className="mini-progress">{renderProgressBar(item.exams)}</div>
                        </td>
                        <td>
                          {item.projects}%<div className="mini-progress">{renderProgressBar(item.projects)}</div>
                        </td>
                        <td>
                          {item.overall}%<div className="mini-progress">{renderProgressBar(item.overall)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="events-section">
            <div className="section-header">
              <h2>Events Analytics</h2>
              <div className="section-actions">
                <button className="btn btn-outline-primary">Export Data</button>
                <button className="btn btn-outline-secondary">Print Report</button>
              </div>
            </div>

            <div className="events-summary">
              <div className="summary-card">
                <div className="summary-title">Total Events</div>
                <div className="summary-value">{analyticsData.events.reduce((sum, event) => sum + event.value, 0)}</div>
              </div>

              <div className="summary-card">
                <div className="summary-title">Most Popular</div>
                <div className="summary-value">Technical (35%)</div>
                {renderProgressBar(35)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Least Popular</div>
                <div className="summary-value">Seminars (5%)</div>
                {renderProgressBar(5)}
              </div>
            </div>

            <div className="chart-card full-width">
              <h3>Event Type Distribution</h3>
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Percentage</th>
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.events.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.value}%</td>
                        <td>{renderProgressBar(item.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "placements" && (
          <div className="placements-section">
            <div className="section-header">
              <h2>Placement Analytics</h2>
              <div className="section-actions">
                <button className="btn btn-outline-primary">Export Data</button>
                <button className="btn btn-outline-secondary">Print Report</button>
              </div>
            </div>

            <div className="placements-summary">
              <div className="summary-card">
                <div className="summary-title">Average Placement Rate</div>
                <div className="summary-value">{analyticsData.overview.placementRate}%</div>
                {renderProgressBar(analyticsData.overview.placementRate)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Best Year</div>
                <div className="summary-value">2022 (94%)</div>
                {renderProgressBar(94)}
              </div>

              <div className="summary-card">
                <div className="summary-title">Lowest Year</div>
                <div className="summary-value">2020 (85%)</div>
                {renderProgressBar(85)}
              </div>
            </div>

            <div className="chart-card full-width">
              <h3>Placement Trends (2018-2022)</h3>
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Placement Rate</th>
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.placements.map((item, index) => (
                      <tr key={index}>
                        <td>{item.year}</td>
                        <td>{item.placed}%</td>
                        <td>{renderProgressBar(item.placed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
