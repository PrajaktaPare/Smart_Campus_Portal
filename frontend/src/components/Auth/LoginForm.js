"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"
import "./LoginForm.css"

const LoginForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { email, password } = formData
      console.log("Submitting login with:", { email })

      const response = await login(email, password)
      console.log("Login successful:", response)

      // Redirect based on user role
      if (response.user.role === "student") {
        navigate("/student/dashboard")
      } else if (response.user.role === "faculty") {
        navigate("/faculty/dashboard")
      } else if (response.user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard")
      }

      if (onClose) onClose()
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role) => {
    setIsLoading(true)
    let email, password

    switch (role) {
      case "admin":
        email = "admin@example.com"
        password = "password"
        break
      case "faculty":
        email = "faculty@example.com"
        password = "password"
        break
      case "student":
        email = "student@example.com"
        password = "password"
        break
      default:
        email = "student@example.com"
        password = "password"
    }

    try {
      const response = await login(email, password)

      // Redirect based on user role
      if (response.user.role === "student") {
        navigate("/student/dashboard")
      } else if (response.user.role === "faculty") {
        navigate("/faculty/dashboard")
      } else if (response.user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard")
      }

      if (onClose) onClose()
    } catch (error) {
      toast.error(error.message || "Demo login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="form-control"
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="form-control"
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="btn-login" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div className="demo-login-section">
          <p className="demo-login-title">Quick Demo Login</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo btn-student"
              onClick={() => handleDemoLogin("student")}
              disabled={isLoading}
            >
              Student
            </button>
            <button
              type="button"
              className="btn-demo btn-faculty"
              onClick={() => handleDemoLogin("faculty")}
              disabled={isLoading}
            >
              Faculty
            </button>
            <button
              type="button"
              className="btn-demo btn-admin"
              onClick={() => handleDemoLogin("admin")}
              disabled={isLoading}
            >
              Admin
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
