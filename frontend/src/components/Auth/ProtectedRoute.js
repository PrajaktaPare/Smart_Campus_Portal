"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext)

  console.log("🛡️ ProtectedRoute check:", {
    isAuthenticated,
    userRole: user?.role,
    requiredRole: role,
    loading,
  })

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated || !user) {
    console.log("❌ ProtectedRoute: Not authenticated, redirecting to /")
    return <Navigate to="/" replace />
  }

  // Check role if specified
  if (role && user.role !== role) {
    console.log(`❌ ProtectedRoute: Role mismatch. Required: ${role}, User: ${user.role}`)
    return <Navigate to="/" replace />
  }

  console.log("✅ ProtectedRoute: Access granted")
  return children
}

export default ProtectedRoute
