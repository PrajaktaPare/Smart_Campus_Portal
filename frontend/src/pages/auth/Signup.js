"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { motion } from "framer-motion"
import { authService } from "../../services/api"

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
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
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      const { token, user } = response.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setSuccess("Account created successfully! Redirecting...")
      setTimeout(() => {
        navigate(`/${formData.role}-dashboard`)
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.")
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

  const roleOptions = [
    { value: "student", label: "Student", icon: "🎓", desc: "Access courses and resources", color: "#4facfe" },
    { value: "faculty", label: "Faculty", icon: "👨‍🏫", desc: "Manage courses and students", color: "#43e97b" },
    { value: "admin", label: "Admin", icon: "🔒", desc: "System administration", color: "#fa709a" },
  ]

  return (
    <div className="min-vh-100 animated-bg d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Card className="glass-card border-0 shadow-lg">
                <Row className="g-0">
                  <Col lg={5} className="d-flex align-items-center">
                    <div className="p-5 text-center">
                      <div className="mb-4">
                        <span className="fs-1">🎓</span>
                      </div>
                      <h3 className="fw-bold text-white mb-3">Join Smart Campus</h3>
                      <p className="text-white opacity-75 mb-4">
                        Start your journey towards academic excellence with our comprehensive platform.
                      </p>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center text-white opacity-75">
                          <span className="me-3">✅</span>
                          <span>Access to 500+ courses</span>
                        </div>
                        <div className="d-flex align-items-center text-white opacity-75">
                          <span className="me-3">✅</span>
                          <span>Real-time progress tracking</span>
                        </div>
                        <div className="d-flex align-items-center text-white opacity-75">
                          <span className="me-3">✅</span>
                          <span>Career placement support</span>
                        </div>
                        <div className="d-flex align-items-center text-white opacity-75">
                          <span className="me-3">✅</span>
                          <span>24/7 technical support</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={7}>
                    <Card.Body className="p-5">
                      <div className="text-center mb-4">
                        <h2 className="fw-bold text-white mb-2">Create Account</h2>
                        <p className="text-white opacity-75">Fill in your details to get started</p>
                      </div>

                      {error && (
                        <Alert variant="danger" className="border-0 rounded-3 mb-4">
                          {error}
                        </Alert>
                      )}

                      {success && (
                        <Alert variant="success" className="border-0 rounded-3 mb-4">
                          {success}
                        </Alert>
                      )}

                      <Form onSubmit={handleSubmit} className="modern-form">
                        <Form.Group className="mb-3">
                          <Form.Label className="text-white fw-semibold">Full Name</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="text"
                              name="name"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="ps-5"
                            />
                            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                              👤
                            </span>
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="text-white fw-semibold">Email Address</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="email"
                              name="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="ps-5"
                            />
                            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                              📧
                            </span>
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="text-white fw-semibold">Select Role</Form.Label>
                          <Row className="g-2">
                            {roleOptions.map((option) => (
                              <Col key={option.value}>
                                <Form.Check
                                  type="radio"
                                  name="role"
                                  value={option.value}
                                  checked={formData.role === option.value}
                                  onChange={handleChange}
                                  className="d-none"
                                  id={`role-${option.value}`}
                                />
                                <Form.Label
                                  htmlFor={`role-${option.value}`}
                                  className={`d-block p-3 rounded-3 text-center cursor-pointer transition-all ${
                                    formData.role === option.value
                                      ? "bg-white text-dark"
                                      : "bg-transparent text-white border border-light"
                                  }`}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="fs-4 mb-2">{option.icon}</div>
                                  <div className="fw-semibold">{option.label}</div>
                                  <small className="opacity-75">{option.desc}</small>
                                </Form.Label>
                              </Col>
                            ))}
                          </Row>
                        </Form.Group>

                        <Row className="g-3 mb-3">
                          <Col>
                            <Form.Group>
                              <Form.Label className="text-white fw-semibold">Password</Form.Label>
                              <div className="position-relative">
                                <Form.Control
                                  type={showPassword ? "text" : "password"}
                                  name="password"
                                  placeholder="Create password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  required
                                  className="ps-5 pe-5"
                                />
                                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                                  🔒
                                </span>
                                <Button
                                  variant="link"
                                  className="position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 text-muted"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? "🙈" : "👁️"}
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group>
                              <Form.Label className="text-white fw-semibold">Confirm</Form.Label>
                              <div className="position-relative">
                                <Form.Control
                                  type={showConfirmPassword ? "text" : "password"}
                                  name="confirmPassword"
                                  placeholder="Confirm password"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  required
                                  className="ps-5 pe-5"
                                />
                                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                                  🔒
                                </span>
                                <Button
                                  variant="link"
                                  className="position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 text-muted"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? "🙈" : "👁️"}
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-4">
                          <Form.Check
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            label={
                              <span className="text-white opacity-75">
                                I agree to the{" "}
                                <Link to="#" className="text-white fw-semibold text-decoration-none">
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="#" className="text-white fw-semibold text-decoration-none">
                                  Privacy Policy
                                </Link>
                              </span>
                            }
                          />
                        </Form.Group>

                        <Button type="submit" className="btn-gradient w-100 mb-4" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <span className="loading-spinner me-2"></span>
                              Creating Account...
                            </>
                          ) : (
                            "🚀 Create Account"
                          )}
                        </Button>
                      </Form>

                      <div className="text-center">
                        <p className="text-white opacity-75 mb-0">
                          Already have an account?{" "}
                          <Link to="/login" className="text-white fw-semibold text-decoration-none">
                            Sign in here
                          </Link>
                        </p>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Signup
