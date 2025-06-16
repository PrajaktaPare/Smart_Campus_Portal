"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "react-bootstrap"
import { useNavigation } from "../../context/NavigationContext"

const BackButton = ({
  variant = "outline-secondary",
  size = "md",
  className = "",
  fallbackRoute = "/faculty-dashboard",
  showIcon = true,
  text = "Back",
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationContext = useNavigation()

  const handleBack = () => {
    console.log("🔙 Back button clicked from:", location.pathname)

    if (navigationContext) {
      navigationContext.goToPreviousPage(navigate, fallbackRoute)
    } else {
      // Simple fallback - just use browser back
      if (window.history.length > 1) {
        console.log("📱 Using browser back")
        window.history.back()
      } else {
        console.log("🏠 Going to fallback:", fallbackRoute)
        navigate(fallbackRoute)
      }
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`d-flex align-items-center gap-2 ${className}`}
      title="Go back to previous page"
    >
      {showIcon && <i className="fas fa-arrow-left"></i>}
      {text}
    </Button>
  )
}

export default BackButton
