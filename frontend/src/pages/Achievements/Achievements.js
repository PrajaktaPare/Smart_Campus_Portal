"use client"

import { useState, useEffect } from "react"
import "./Achievements.css"

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userPoints, setUserPoints] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [userRank, setUserRank] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Mock data for now
        const mockAchievements = [
          {
            _id: "1",
            title: "Perfect Attendance",
            description: "Attend all classes for a month",
            category: "attendance",
            points: 100,
            icon: "🏆",
            progress: 80,
            completed: false,
            completedDate: null,
          },
          {
            _id: "2",
            title: "Assignment Master",
            description: "Submit 10 assignments on time",
            category: "academic",
            points: 150,
            icon: "📝",
            progress: 100,
            completed: true,
            completedDate: "2023-10-05T14:30:00",
          },
          {
            _id: "3",
            title: "Event Enthusiast",
            description: "Attend 5 campus events",
            category: "participation",
            points: 75,
            icon: "🎭",
            progress: 60,
            completed: false,
            completedDate: null,
          },
          {
            _id: "4",
            title: "Quiz Champion",
            description: "Score 90% or above in 3 quizzes",
            category: "academic",
            points: 200,
            icon: "🧠",
            progress: 66,
            completed: false,
            completedDate: null,
          },
          {
            _id: "5",
            title: "Team Player",
            description: "Participate in 3 group projects",
            category: "participation",
            points: 125,
            icon: "👥",
            progress: 100,
            completed: true,
            completedDate: "2023-09-20T10:15:00",
          },
          {
            _id: "6",
            title: "Early Bird",
            description: "Arrive early to class 10 times",
            category: "attendance",
            points: 50,
            icon: "🕒",
            progress: 100,
            completed: true,
            completedDate: "2023-08-15T08:30:00",
          },
        ]

        const mockLeaderboard = [
          { _id: "101", name: "John Smith", points: 850, level: 5, rank: 1 },
          { _id: "102", name: "Sarah Johnson", points: 720, level: 4, rank: 2 },
          { _id: "103", name: "Michael Brown", points: 685, level: 4, rank: 3 },
          { _id: "104", name: "Emily Davis", points: 650, level: 3, rank: 4 },
          { _id: "105", name: "Current User", points: 575, level: 3, rank: 5 },
          { _id: "106", name: "David Wilson", points: 510, level: 3, rank: 6 },
          { _id: "107", name: "Jessica Lee", points: 490, level: 2, rank: 7 },
          { _id: "108", name: "Robert Taylor", points: 450, level: 2, rank: 8 },
          { _id: "109", name: "Amanda White", points: 420, level: 2, rank: 9 },
          { _id: "110", name: "Thomas Martin", points: 380, level: 2, rank: 10 },
        ]

        setAchievements(mockAchievements)
        setLeaderboard(mockLeaderboard)
        setUserPoints(575)
        setUserLevel(3)
        setUserRank(5)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch achievements")
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  const calculateLevelProgress = () => {
    const pointsPerLevel = 200
    const pointsInCurrentLevel = userPoints % pointsPerLevel
    const progressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100
    return progressPercentage
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const filteredAchievements =
    filter === "all"
      ? achievements
      : filter === "completed"
        ? achievements.filter((a) => a.completed)
        : filter === "in-progress"
          ? achievements.filter((a) => !a.completed)
          : achievements.filter((a) => a.category === filter)

  if (loading) return <div className="loading">Loading achievements...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h1>Achievements & Gamification</h1>
      </div>

      <div className="user-stats">
        <div className="user-level-card">
          <div className="level-header">
            <div className="level-title">Level {userLevel}</div>
            <div className="level-points">{userPoints} Points</div>
          </div>
          <div className="level-progress">
            <div className="level-progress-bar" style={{ width: `${calculateLevelProgress()}%` }}></div>
          </div>
          <div className="level-info">
            {Math.round(calculateLevelProgress())}% to Level {userLevel + 1}
          </div>
        </div>

        <div className="user-rank-card">
          <div className="rank-icon">🏅</div>
          <div className="rank-info">
            <div className="rank-title">Current Rank</div>
            <div className="rank-value">#{userRank}</div>
          </div>
        </div>

        <div className="user-badges-card">
          <div className="badges-title">Recent Badges</div>
          <div className="badges-list">
            {achievements
              .filter((a) => a.completed)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement._id} className="badge-item">
                  <div className="badge-icon">{achievement.icon}</div>
                  <div className="badge-name">{achievement.title}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="achievements-content">
        <div className="achievements-section">
          <div className="section-header">
            <h2>Achievements</h2>
            <div className="filter-buttons">
              <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                All
              </button>
              <button
                className={`filter-btn ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
              <button
                className={`filter-btn ${filter === "in-progress" ? "active" : ""}`}
                onClick={() => setFilter("in-progress")}
              >
                In Progress
              </button>
              <button
                className={`filter-btn ${filter === "academic" ? "active" : ""}`}
                onClick={() => setFilter("academic")}
              >
                Academic
              </button>
              <button
                className={`filter-btn ${filter === "attendance" ? "active" : ""}`}
                onClick={() => setFilter("attendance")}
              >
                Attendance
              </button>
              <button
                className={`filter-btn ${filter === "participation" ? "active" : ""}`}
                onClick={() => setFilter("participation")}
              >
                Participation
              </button>
            </div>
          </div>

          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => (
              <div key={achievement._id} className={`achievement-card ${achievement.completed ? "completed" : ""}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                    <div className="progress-text">{achievement.progress}%</div>
                  </div>
                  <div className="achievement-footer">
                    <div className="achievement-points">{achievement.points} Points</div>
                    {achievement.completed && (
                      <div className="achievement-date">Completed on {formatDate(achievement.completedDate)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard-section">
          <div className="section-header">
            <h2>Leaderboard</h2>
          </div>

          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="rank-col">Rank</div>
              <div className="name-col">Name</div>
              <div className="level-col">Level</div>
              <div className="points-col">Points</div>
            </div>

            {leaderboard.map((user, index) => (
              <div key={user._id} className={`leaderboard-row ${user._id === "105" ? "current-user" : ""}`}>
                <div className="rank-col">
                  {index < 3 ? (
                    <span className={`top-rank rank-${index + 1}`}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    `#${user.rank}`
                  )}
                </div>
                <div className="name-col">{user.name}</div>
                <div className="level-col">Level {user.level}</div>
                <div className="points-col">{user.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements
