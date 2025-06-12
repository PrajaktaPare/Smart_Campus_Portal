"use client"

import { Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../../context/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useContext(AuthContext)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}-dashboard`} replace />
  }

  return children
}

export default ProtectedRoute
