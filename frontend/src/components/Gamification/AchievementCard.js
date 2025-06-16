"use client"
import "./AchievementCard.css"

const AchievementCard = ({ achievement, onView }) => {
  const { title, description, icon, progress, completed, points, category } = achievement

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "#007bff"
      case "attendance":
        return "#28a745"
      case "participation":
        return "#fd7e14"
      case "social":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }

  return (
    <div className={`achievement-card ${completed ? "completed" : ""}`}>
      <div className="achievement-icon" style={{ backgroundColor: getCategoryColor(category) }}>
        {icon}
      </div>

      <div className="achievement-content">
        <div className="achievement-header">
          <h3 className="achievement-title">{title}</h3>
          <div className="achievement-points">{points} pts</div>
        </div>

        <p className="achievement-description">{description}</p>

        <div className="achievement-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            {progress}% {completed ? "Completed" : "Progress"}
          </div>
        </div>

        <button className="btn btn-sm btn-outline-primary view-btn" onClick={() => onView(achievement)}>
          View Details
        </button>
      </div>
    </div>
  )
}

export default AchievementCard
