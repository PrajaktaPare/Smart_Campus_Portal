import "./LeaderboardCard.css"

const LeaderboardCard = ({ leaderboard, currentUserId }) => {
  return (
    <div className="leaderboard-card">
      <h3 className="leaderboard-title">Top Performers</h3>

      <div className="leaderboard-list">
        {leaderboard.map((user, index) => (
          <div key={user._id} className={`leaderboard-item ${user._id === currentUserId ? "current-user" : ""}`}>
            <div className="rank">
              {index < 3 ? (
                <div className={`top-rank rank-${index + 1}`}>{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
              ) : (
                `#${index + 1}`
              )}
            </div>

            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-level">Level {user.level}</div>
            </div>

            <div className="user-points">{user.points}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-outline-primary btn-sm view-all-btn">View Full Leaderboard</button>
    </div>
  )
}

export default LeaderboardCard
