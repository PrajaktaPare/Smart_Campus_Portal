"use client"

import { useContext } from "react"
import { Card, ProgressBar, Badge } from "react-bootstrap"
import { FaUsers, FaBook } from "react-icons/fa"
import ThemeContext from "../../context/ThemeContext"

const CourseProgressCard = ({ course, onClick }) => {
  const { theme } = useContext(ThemeContext)

  // Mock progress data
  const progress = {
    completion: Math.floor(Math.random() * 40) + 60,
    attendance: Math.floor(Math.random() * 20) + 80,
    assignments: Math.floor(Math.random() * 30) + 70,
  }

  const getProgressColor = (value) => {
    if (value >= 80) return "success"
    if (value >= 60) return "warning"
    return "danger"
  }

  return (
    <Card className="course-progress-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <Card.Body>
        <div className="course-header">
          <div className="course-info">
            <div className="course-code">{course.code}</div>
            <h6 className="course-title">{course.title}</h6>
          </div>
          <Badge bg={getBadgeColor(course.semester)}>
            {course.semester} {course.year}
          </Badge>
        </div>

        <div className="course-stats">
          <div className="stat-item">
            <FaUsers className="stat-icon" />
            <span>{course.students?.length || 0} Students</span>
          </div>
          <div className="stat-item">
            <FaBook className="stat-icon" />
            <span>{course.credits} Credits</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Course Completion</span>
              <span className="progress-value">{progress.completion}%</span>
            </div>
            <ProgressBar
              variant={getProgressColor(progress.completion)}
              now={progress.completion}
              className="custom-progress"
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Avg Attendance</span>
              <span className="progress-value">{progress.attendance}%</span>
            </div>
            <ProgressBar
              variant={getProgressColor(progress.attendance)}
              now={progress.attendance}
              className="custom-progress"
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Assignment Completion</span>
              <span className="progress-value">{progress.assignments}%</span>
            </div>
            <ProgressBar
              variant={getProgressColor(progress.assignments)}
              now={progress.assignments}
              className="custom-progress"
            />
          </div>
        </div>
      </Card.Body>

      <style jsx>{`
        .course-progress-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          background-color: var(--bg-secondary);
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .course-progress-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--card-shadow);
          border-color: var(--accent-primary);
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .course-code {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .course-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0;
          margin-top: 0.25rem;
        }

        .course-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stat-icon {
          color: var(--accent-primary);
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .progress-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .custom-progress {
          height: 6px;
          border-radius: 3px;
          background-color: var(--bg-tertiary);
        }
      `}</style>
    </Card>
  )
}

const getBadgeColor = (semester) => {
  switch (semester) {
    case "Fall":
      return "warning"
    case "Spring":
      return "success"
    case "Summer":
      return "info"
    default:
      return "secondary"
  }
}

export default CourseProgressCard
