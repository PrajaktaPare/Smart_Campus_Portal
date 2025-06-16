"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { NavigationProvider } from "./context/NavigationContext"
import ThemeContext from "./context/ThemeContext"

// Components
import ProtectedRoute from "./components/Auth/ProtectedRoute"

// Pages
import LandingPage from "./pages/LandingPage/LandingPage"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import StudentDashboard from "./pages/Dashboards/StudentDashboard"
import FacultyDashboard from "./pages/Dashboards/FacultyDashboard"
import AdminDashboard from "./pages/Dashboards/AdminDashboard"
import Profile from "./pages/Profile/Profile"
import StudentProfile from "./pages/Student/StudentProfile"
import ManageCourses from "./pages/Management/ManageCourses"
import ManageStudents from "./pages/Management/ManageStudents"
import CourseAttendance from "./pages/Course/CourseAttendance"
import EventsPage from "./pages/Events/EventsPage"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <NavigationProvider>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route
                  path="/student-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["faculty"]}>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
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
                <Route
                  path="/student/:studentId"
                  element={
                    <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-courses"
                  element={
                    <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-students"
                  element={
                    <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                      <ManageStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/course/:courseId/attendance"
                  element={
                    <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                      <CourseAttendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/event/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </NavigationProvider>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Event Details Component
const EventDetailsPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useContext(ThemeContext)

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching event details for ID:", eventId)

      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }

      const data = await response.json()
      console.log("📅 Event details response:", data)

      setEvent(data)

      // Check if user is already registered
      if (data.attendees && user) {
        setIsRegistered(data.attendees.some((attendee) => attendee._id === user._id || attendee === user._id))
      }
    } catch (error) {
      console.error("❌ Error fetching event details:", error)
      setError("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error || "Event not found"}</p>
          <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { date, time } = formatDate(event.date)

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Back Button */}
          <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {/* Event Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row align-items-start">
                <div className="col">
                  <h1 className="mb-2">{event.title}</h1>
                  {event.type && (
                    <span className={`badge bg-primary mb-3`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  )}
                  <div className="text-muted mb-3">
                    <i className="fas fa-user me-2"></i>
                    Organized by {event.organizer?.name || "Unknown"}
                    {event.department && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{event.department} Department</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="row g-4 mb-4">
            {/* Date & Time */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-calendar text-primary me-2"></i>
                    <h6 className="mb-0">Date & Time</h6>
                  </div>
                  <p className="mb-1 fw-semibold">{date}</p>
                  <p className="mb-0 text-muted">{time}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-map-marker-alt text-success me-2"></i>
                    <h6 className="mb-0">Location</h6>
                  </div>
                  <p className="mb-0">{event.location || "Location TBA"}</p>
                </div>
              </div>
            </div>

            {/* Duration */}
            {event.duration && (
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-clock text-warning me-2"></i>
                      <h6 className="mb-0">Duration</h6>
                    </div>
                    <p className="mb-0">{event.duration}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendees */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-users text-info me-2"></i>
                    <h6 className="mb-0">Attendees</h6>
                  </div>
                  <p className="mb-0">
                    {event.attendees?.length || 0} registered
                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="mb-3">About This Event</h5>
                <p className="mb-0">{event.description}</p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Event Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Event ID:</strong>
                    <br />
                    <code>{event._id}</code>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Created:</strong>
                    <br />
                    {new Date(event.createdAt || event.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
