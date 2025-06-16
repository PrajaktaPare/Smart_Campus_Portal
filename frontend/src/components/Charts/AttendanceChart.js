"use client"

import { useContext } from "react"
import ThemeContext from "../../context/ThemeContext"

const AttendanceChart = ({ courses }) => {
  const { theme } = useContext(ThemeContext)

  // Mock data for demonstration
  const attendanceData = courses.map((course, index) => ({
    course: course.code,
    attendance: Math.floor(Math.random() * 30) + 70, // Random attendance between 70-100%
    color: `hsl(${index * 60}, 70%, 50%)`,
  }))

  return (
    <div className="attendance-chart">
      <div className="chart-container">
        {attendanceData.length > 0 ? (
          <div className="bar-chart">
            {attendanceData.map((data, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{data.course}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${data.attendance}%`,
                      backgroundColor: data.color,
                    }}
                  ></div>
                </div>
                <div className="bar-value">{data.attendance}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-chart">
            <p>No attendance data available</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .attendance-chart {
          width: 100%;
          height: 300px;
          padding: 1rem;
        }

        .chart-container {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bar-chart {
          display: flex;
          align-items: end;
          justify-content: space-around;
          width: 100%;
          height: 100%;
          gap: 1rem;
        }

        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 80px;
        }

        .bar-label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .bar-container {
          width: 40px;
          height: 200px;
          background-color: var(--bg-tertiary);
          border-radius: 4px;
          display: flex;
          align-items: end;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
          min-height: 10px;
        }

        .bar-value {
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
          color: var(--text-primary);
        }

        .empty-chart {
          text-align: center;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  )
}

export default AttendanceChart
