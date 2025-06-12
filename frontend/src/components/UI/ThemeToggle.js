"use client"

import { useContext } from "react"
import { ThemeContext } from "../../context/ThemeContext"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const enabled = theme === "dark"

  return (
    <div className="d-flex align-items-center">
      <span className={`me-2 ${enabled ? "text-muted" : "text-warning"}`}>☀️</span>
      <button
        onClick={toggleTheme}
        className={`btn btn-sm rounded-pill ${enabled ? "bg-secondary" : "bg-light"} border-0 position-relative`}
        style={{ width: "44px", height: "24px" }}
      >
        <span
          className={`position-absolute bg-white rounded-circle transition-all ${enabled ? "start-50" : "start-0"}`}
          style={{
            width: "20px",
            height: "20px",
            top: "2px",
            transform: enabled ? "translateX(50%)" : "translateX(2px)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
      <span className={`ms-2 ${enabled ? "text-info" : "text-muted"}`}>🌙</span>
    </div>
  )
}

export default ThemeToggle
