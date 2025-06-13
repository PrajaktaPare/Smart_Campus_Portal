"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "../../services/api"
import { toast } from "react-toastify"

const SignupModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      // Use the authService to register
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      const { token, user } = response.data

      // Store user data in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setSuccess("Account created successfully! Redirecting...")
      toast.success("Account created successfully!")

      setTimeout(() => {
        onClose()
        navigate(`/${formData.role}-dashboard`)
      }, 2000)
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.response?.data?.message || "Signup failed. Please try again.")
      toast.error("Signup failed. Please try again.")
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
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
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
                    background: "linear-gradient(135deg, #6f42c1, #007bff)",
                  }}
                >
                  🎓
                </div>
                <h3 className="fw-bold text-dark mb-1">Create Account</h3>
                <p className="text-muted">Join our academic community</p>
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

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert alert-success border-0 rounded-3 mb-4"
                  style={{ background: "rgba(25, 135, 84, 0.1)" }}
                >
                  {success}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-medium text-dark">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "rgba(111, 66, 193, 0.1)" }}>
                      👤
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 py-3"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        background: "rgba(111, 66, 193, 0.05)",
                        borderRadius: "0 8px 8px 0",
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-medium text-dark">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "rgba(111, 66, 193, 0.1)" }}>
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
                        background: "rgba(111, 66, 193, 0.05)",
                        borderRadius: "0 8px 8px 0",
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark">Role</label>
                  <div className="row g-2">
                    {[
                      { value: "student", label: "Student", icon: "🎓", desc: "Access courses" },
                      { value: "faculty", label: "Faculty", icon: "👨‍🏫", desc: "Manage courses" },
                      { value: "admin", label: "Admin", icon: "🔒", desc: "Administration" },
                    ].map((option) => (
                      <div key={option.value} className="col-12">
                        <label className="form-check-label w-100 cursor-pointer">
                          <input
                            type="radio"
                            className="form-check-input d-none"
                            name="role"
                            value={option.value}
                            checked={formData.role === option.value}
                            onChange={handleChange}
                          />
                          <div
                            className={`card border-2 h-100 transition-all ${
                              formData.role === option.value ? "border-primary" : "border-light"
                            }`}
                            style={{
                              background:
                                formData.role === option.value ? "rgba(111, 66, 193, 0.1)" : "rgba(248, 249, 250, 0.8)",
                              cursor: "pointer",
                            }}
                          >
                            <div className="card-body p-3 d-flex align-items-center">
                              <span className="me-3 fs-5">{option.icon}</span>
                              <div className="flex-grow-1">
                                <div className="fw-medium text-dark">{option.label}</div>
                                <small className="text-muted">{option.desc}</small>
                              </div>
                              {formData.role === option.value && <span className="text-primary">✓</span>}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label htmlFor="password" className="form-label fw-medium text-dark">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "rgba(111, 66, 193, 0.1)" }}>
                        🔒
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-0 py-3"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ background: "rgba(111, 66, 193, 0.05)" }}
                        required
                      />
                      <button
                        type="button"
                        className="btn border-0"
                        style={{ background: "rgba(111, 66, 193, 0.1)" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="col-6">
                    <label htmlFor="confirmPassword" className="form-label fw-medium text-dark">
                      Confirm
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "rgba(111, 66, 193, 0.1)" }}>
                        🔒
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-0 py-3"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{ background: "rgba(111, 66, 193, 0.05)" }}
                        required
                      />
                      <button
                        type="button"
                        className="btn border-0"
                        style={{ background: "rgba(111, 66, 193, 0.1)" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ accentColor: "#6f42c1" }}
                  />
                  <label className="form-check-label text-muted small" htmlFor="terms">
                    I agree to the{" "}
                    <a href="#" className="text-decoration-none text-primary">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-decoration-none text-primary">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="btn btn-lg w-100 text-white fw-semibold border-0"
                  style={{
                    background: "linear-gradient(135deg, #6f42c1, #007bff)",
                    borderRadius: "12px",
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SignupModal
