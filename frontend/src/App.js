"use client"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { useState, useEffect } from "react"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastContainer } from "react-toastify"
import LandingPage from "./pages/LandingPage/LandingPage"
import StudentDashboard from "./pages/Dashboards/StudentDashboard"
import FacultyDashboard from "./pages/Dashboards/FacultyDashboard"
import AdminDashboard from "./pages/Dashboards/AdminDashboard"
import CourseMaterials from "./components/Course/CourseMaterials"
import UpdatePlacement from "./components/Placement/UpdatePlacement"
import Profile from "./pages/Profile/Profile"
import AuthContext from "./context/AuthContext"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"
import "./index.css"

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }

    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty-dashboard"
              element={
                <ProtectedRoute role="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId/materials"
              element={
                <ProtectedRoute>
                  <CourseMaterials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placements"
              element={
                <ProtectedRoute>
                  <UpdatePlacement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  )
}

export default App
