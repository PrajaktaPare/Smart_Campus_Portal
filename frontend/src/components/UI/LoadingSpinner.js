"use client"

import "./LoadingSpinner.css"

const LoadingSpinner = ({
  size = "medium",
  message = "Loading...",
  color = "primary",
  overlay = false,
  fullScreen = false,
}) => {
  const spinnerClasses = `loading-spinner ${size} ${color} ${overlay ? "overlay" : ""} ${fullScreen ? "fullscreen" : ""}`

  return (
    <div className={spinnerClasses}>
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && (
          <div className="spinner-message">
            <span>{message}</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
