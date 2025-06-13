"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "../../services/api"
import { toast } from "react-toastify"

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Use the authService to login
      const response = await authService.login(formData)
      const { token, user } = response.data

      // Store user data in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      toast.success("Login successful! Welcome back.")
      onClose()
      navigate(`/${user.role}-dashboard`)
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Invalid email or password. Please try again.")
      toast.error("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const demoAccounts = [
    { email: "student@edu.com", role: "Student", icon: "🎓" },
    { email: "faculty@edu.com", role: "Faculty", icon: "👨‍🏫" },
    { email: "admin@edu.com", role: "Admin", icon: "🔒" },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          zIndex: 1050,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="position-relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              width: "400px",
              maxWidth: "90vw",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="btn-close position-absolute top-0 end-0 m-3"
              style={{ zIndex: 10 }}
              aria-label="Close"
            ></button>

            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center text-white fw-bold rounded-4 mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "linear-gradient(135deg, #007bff, #6f42c1)",
                  }}
                >
                  🎓
                </div>
                <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert alert-danger border-0 rounded-3 mb-4"
                  style={{ background: "rgba(220, 53, 69, 0.1)" }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-medium text-dark">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "rgba(0, 123, 255, 0.1)" }}>
                      📧
                    </span>
                    <input
                      type="email"
                      className="form-control border-0 py-3"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        background: "rgba(0, 123, 255, 0.05)",
                        borderRadius: "0 8px 8px 0",
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-medium text-dark">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "rgba(0, 123, 255, 0.1)" }}>
                      🔒
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-0 py-3"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ background: "rgba(0, 123, 255, 0.05)" }}
                      required
                    />
                    <button
                      type="button"
                      className="btn border-0"
                      style={{ background: "rgba(0, 123, 255, 0.1)" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label text-muted small" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small text-primary">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  className="btn btn-lg w-100 text-white fw-semibold mb-4 border-0"
                  style={{
                    background: "linear-gradient(135deg, #007bff, #6f42c1)",
                    borderRadius: "12px",
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              {/* Demo Accounts */}
              <hr className="my-4" />
              <div className="text-center mb-3">
                <small className="text-muted">Quick Demo Access</small>
              </div>
              <div className="row g-2">
                {demoAccounts.map((account, index) => (
                  <div key={index} className="col-4">
                    <button
                      onClick={() => setFormData({ email: account.email, password: "password" })}
                      className="btn btn-sm w-100 d-flex flex-column align-items-center p-2 border-0"
                      style={{
                        background: "rgba(0, 123, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                    >
                      <span className="mb-1">{account.icon}</span>
                      <small className="fw-medium text-dark">{account.role}</small>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModal
