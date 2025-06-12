"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { motion } from "framer-motion"
import { authService } from "../../services/api"

const Login = () => {
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
      const response = await authService.login(formData)
      const { token, user } = response.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      navigate(`/${user.role}-dashboard`)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
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
    { email: "student@example.com", role: "Student", icon: "🎓", color: "#4facfe" },
    { email: "faculty@example.com", role: "Faculty", icon: "👨‍🏫", color: "#43e97b" },
    { email: "admin@example.com", role: "Admin", icon: "🔒", color: "#fa709a" },
  ]

  return (
    <div className="min-vh-100 animated-bg d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Card className="glass-card border-0 shadow-lg">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <span className="fs-1">🎓</span>
                    </div>
                    <h2 className="fw-bold text-white mb-2">Welcome Back!</h2>
                    <p className="text-white opacity-75">Sign in to your Smart Campus account</p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="border-0 rounded-3 mb-4">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="modern-form">
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
                        <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">📧</span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-white fw-semibold">Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="ps-5 pe-5"
                        />
                        <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔒</span>
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </Button>
                      </div>
                    </Form.Group>

                    <Button type="submit" className="btn-gradient w-100 mb-4" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="loading-spinner me-2"></span>
                          Signing in...
                        </>
                      ) : (
                        "🚀 Sign In"
                      )}
                    </Button>
                  </Form>

                  <hr className="my-4 border-light opacity-25" />

                  <div className="text-center mb-3">
                    <small className="text-white opacity-75">Quick Demo Access</small>
                  </div>

                  <Row className="g-2 mb-4">
                    {demoAccounts.map((account, index) => (
                      <Col key={index}>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="w-100 d-flex flex-column align-items-center p-3 border-2 rounded-3"
                          onClick={() => setFormData({ email: account.email, password: "student123" })}
                          style={{ borderColor: account.color }}
                        >
                          <span className="fs-4 mb-1">{account.icon}</span>
                          <small className="fw-semibold">{account.role}</small>
                        </Button>
                      </Col>
                    ))}
                  </Row>

                  <div className="text-center">
                    <p className="text-white opacity-75 mb-0">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-white fw-semibold text-decoration-none">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
