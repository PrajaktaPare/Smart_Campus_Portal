"use client"

import { useContext } from "react"
import ThemeContext from "../../context/ThemeContext"

const PerformanceChart = ({ courses }) => {
  const { theme } = useContext(ThemeContext)

  // Mock performance data
  const performanceData = courses.map((course, index) => ({
    course: course.code,
    title: course.title,
    avgGrade: Math.floor(Math.random() * 30) + 70,
    passRate: Math.floor(Math.random() * 20) + 80,
    engagement: Math.floor(Math.random() * 25) + 75,
  }))

  return (
    <div className="performance-chart">
      {performanceData.length > 0 ? (
        <div className="performance-grid">
          {performanceData.map((data, index) => (
            <div key={index} className="performance-item">
              <div className="course-info">
                <h6 className="course-code">{data.course}</h6>
                <p className="course-title">{data.title}</p>
              </div>
              <div className="metrics">
                <div className="metric">
                  <span className="metric-label">Avg Grade</span>
                  <div className="metric-bar">
                    <div className="metric-fill grade" style={{ width: `${data.avgGrade}%` }}></div>
                  </div>
                  <span className="metric-value">{data.avgGrade}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Pass Rate</span>
                  <div className="metric-bar">
                    <div className="metric-fill pass" style={{ width: `${data.passRate}%` }}></div>
                  </div>
                  <span className="metric-value">{data.passRate}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Engagement</span>
                  <div className="metric-bar">
                    <div className="metric-fill engagement" style={{ width: `${data.engagement}%` }}></div>
                  </div>
                  <span className="metric-value">{data.engagement}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-chart">
          <p>No performance data available</p>
        </div>
      )}

      <style jsx>{`
        .performance-chart {
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
        }

        .performance-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performance-item {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background-color: var(--bg-secondary);
        }

        .course-info {
          margin-bottom: 1rem;
        }

        .course-code {
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.25rem;
        }

        .course-title {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0;
        }

        .metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .metric-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 80px;
        }

        .metric-bar {
          flex: 1;
          height: 8px;
          background-color: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metric-fill.grade {
          background: linear-gradient(90deg, #4caf50, #8bc34a);
        }

        .metric-fill.pass {
          background: linear-gradient(90deg, #2196f3, #03a9f4);
        }

        .metric-fill.engagement {
          background: linear-gradient(90deg, #ff9800, #ffc107);
        }

        .metric-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 40px;
          text-align: right;
        }

        .empty-chart {
          text-align: center;
          padding: 2rem;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  )
}

export default PerformanceChart
