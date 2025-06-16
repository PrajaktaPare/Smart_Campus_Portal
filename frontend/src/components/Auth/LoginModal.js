"use client"

import { useState } from "react"
import { Modal, Button, Form, Spinner, Alert, Tabs, Tab } from "react-bootstrap"
import { useAuth } from "../../context/AuthContext"
import "./AuthModal.css"

const LoginModal = ({ show, onHide }) => {
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState("student")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      onHide()
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    let email
    switch (role) {
      case "admin":
        email = "admin@example.com"
        break
      case "faculty":
        email = "faculty@example.com"
        break
      case "student":
      default:
        email = "student@example.com"
        break
    }

    setFormData({
      email,
      password: "password",
    })
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    })
    setError("")
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} centered className="auth-modal">
      <Modal.Header closeButton>
        <Modal.Title>Welcome to Smart Campus</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 auth-tabs" justify>
          <Tab eventKey="student" title="Student">
            <div className="tab-content-wrapper">
              <div className="text-center mb-4">
                <div className="auth-icon">👨‍🎓</div>
                <h4>Student Login</h4>
                <p className="text-muted">Access your student dashboard</p>
              </div>
              {renderLoginForm()}
            </div>
          </Tab>
          <Tab eventKey="faculty" title="Faculty">
            <div className="tab-content-wrapper">
              <div className="text-center mb-4">
                <div className="auth-icon">👨‍🏫</div>
                <h4>Faculty Login</h4>
                <p className="text-muted">Access your faculty dashboard</p>
              </div>
              {renderLoginForm()}
            </div>
          </Tab>
          <Tab eventKey="admin" title="Admin">
            <div className="tab-content-wrapper">
              <div className="text-center mb-4">
                <div className="auth-icon">👨‍💼</div>
                <h4>Admin Login</h4>
                <p className="text-muted">Access your admin dashboard</p>
              </div>
              {renderLoginForm()}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  )

  function renderLoginForm() {
    return (
      <>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <div className="input-with-icon">
              <i className="input-icon">📧</i>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <div className="input-with-icon">
              <i className="input-icon">🔒</i>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <Button variant="link" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </Button>
            </div>
          </Form.Group>

          <Button type="submit" className="btn-primary w-100 mb-3" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center mb-3">
            <a href="#" className="text-decoration-none">
              Forgot password?
            </a>
          </div>

          <div className="demo-login-section">
            <p className="text-center text-muted small mb-2">Quick Demo Access</p>
            <div className="demo-buttons">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleDemoLogin(activeTab)}
                className="w-100"
              >
                Use Demo Account
              </Button>
            </div>
          </div>
        </Form>
      </>
    )
  }
}

export default LoginModal
