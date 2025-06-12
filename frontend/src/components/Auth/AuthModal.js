"use client"

import { useState, useContext } from "react"
import { Form, Button, Alert, Spinner } from "react-bootstrap"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import { authService } from "../../services/api"

const AuthModal = ({ show, onHide, mode = "login", switchMode }) => {
  const { login } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const isLogin = mode === "login"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        })

        const { token, user } = response.data
        login(user, token)
        toast.success("Login successful! Welcome back.")
        onHide()
      } else {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }

        if (!agreedToTerms) {
          setError("Please agree to the terms and conditions")
          setLoading(false)
          return
        }

        const response = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        })

        const { token, user } = response.data
        login(user, token)
        toast.success("Account created successfully! Welcome to Smart Campus.")
        onHide()
      }
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? "Login failed" : "Registration failed"))
      toast.error(err.response?.data?.message || (isLogin ? "Login failed" : "Registration failed"))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    })
    setError("")
    setShowPassword(false)
    setAgreedToTerms(false)
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  const handleSwitchMode = () => {
    resetForm()
    switchMode()
  }

  const demoAccounts = [
    { email: "student@example.com", password: "student123", role: "Student" },
    { email: "faculty@example.com", password: "student123", role: "Faculty" },
    { email: "admin@example.com", password: "student123", role: "Admin" },
  ]

  const handleDemoLogin = (account) => {
    setFormData({
      ...formData,
      email: account.email,
      password: account.password,
    })
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <h4 className="mb-0">{isLogin ? "Welcome Back" : "Create Account"}</h4>
              <p className="mb-0 small">{isLogin ? "Sign in to your account" : "Join Smart Campus Portal"}</p>
            </div>

            <div className="auth-modal-body">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {!isLogin && (
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="form-control-blue"
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="form-control-blue"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="form-control-blue"
                      required
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 5 }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </Form.Group>

                {!isLogin && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="form-control-blue"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-control-blue"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="terms"
                        label="I agree to the Terms of Service and Privacy Policy"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                    </Form.Group>
                  </>
                )}

                <Button type="submit" className="btn-blue w-100 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Form>

              {isLogin && (
                <>
                  <div className="text-center mb-4">
                    <small className="text-muted">Or sign in with demo accounts</small>
                  </div>

                  <div className="d-flex gap-2 mb-4">
                    {demoAccounts.map((account, index) => (
                      <Button
                        key={index}
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleDemoLogin(account)}
                      >
                        {account.role}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              <div className="text-center">
                <p className="mb-0">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button variant="link" className="p-0 ms-2" onClick={handleSwitchMode}>
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
