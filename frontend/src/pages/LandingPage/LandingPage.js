"use client"

import { useState, useContext } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import AuthModal from "../../components/Auth/AuthModal"
import AuthContext from "../../context/AuthContext"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(AuthContext)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")

  const handleShowLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const handleShowSignup = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
  }

  const features = [
    {
      icon: "📚",
      title: "Course Management",
      description: "Access all your courses, materials, and assignments in one place.",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your academic progress with detailed analytics and insights.",
    },
    {
      icon: "🗓️",
      title: "Event Calendar",
      description: "Stay updated with campus events, workshops, and important dates.",
    },
    {
      icon: "🎯",
      title: "Placement Portal",
      description: "Connect with top companies and track your placement journey.",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Students" },
    { number: "500+", label: "Courses" },
    { number: "95%", label: "Placement Rate" },
    { number: "100+", label: "Partner Companies" },
  ]

  return (
    <>
      <Navbar onLogin={handleShowLogin} onSignup={handleShowSignup} />

      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-5 mb-lg-0">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="display-4 fw-bold mb-4">Smart Campus Portal</h1>
                  <p className="lead mb-5">
                    Your complete academic management solution. Access courses, track progress, and achieve your
                    educational goals with ease.
                  </p>
                  {isAuthenticated ? (
                    <Button className="btn-blue btn-lg px-5 py-3" onClick={() => navigate(`/${user.role}-dashboard`)}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <div className="d-flex gap-3">
                      <Button className="btn-blue btn-lg px-5 py-3" onClick={handleShowLogin}>
                        Login
                      </Button>
                      <Button className="btn-outline-blue btn-lg px-5 py-3" onClick={handleShowSignup}>
                        Sign Up
                      </Button>
                    </div>
                  )}
                </motion.div>
              </Col>
              <Col lg={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Smart Campus Portal"
                    className="img-fluid rounded-4"
                  />
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-5">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="fw-bold">Why Choose Smart Campus?</h2>
                <p className="text-muted">Discover the features that make learning extraordinary</p>
              </Col>
            </Row>
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} className="mb-4" key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="feature-card h-100">
                      <div className="feature-icon">{feature.icon}</div>
                      <h4 className="fw-bold mb-3">{feature.title}</h4>
                      <p className="text-muted mb-0">{feature.description}</p>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-5 bg-light">
          <Container>
            <Row>
              {stats.map((stat, index) => (
                <Col lg={3} md={6} className="mb-4" key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="stats-card">
                      <h2 className="display-4 fw-bold text-primary mb-2">{stat.number}</h2>
                      <p className="text-muted text-uppercase fw-semibold mb-0">{stat.label}</p>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-5">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card className="card-blue p-5">
                    <h2 className="fw-bold mb-4">Ready to Transform Your Education?</h2>
                    <p className="mb-4">
                      Join thousands of students and faculty members who are already experiencing the future of
                      education.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      {isAuthenticated ? (
                        <Button
                          className="btn-light btn-lg px-5 py-3"
                          onClick={() => navigate(`/${user.role}-dashboard`)}
                        >
                          Go to Dashboard
                        </Button>
                      ) : (
                        <>
                          <Button className="btn-light btn-lg px-5 py-3" onClick={handleShowSignup}>
                            Get Started
                          </Button>
                          <Button variant="outline-light" className="btn-lg px-5 py-3" onClick={handleShowLogin}>
                            Learn More
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>

      <Footer />

      <AuthModal
        show={showAuthModal}
        onHide={handleCloseAuthModal}
        mode={authMode}
        switchMode={() => setAuthMode(authMode === "login" ? "signup" : "login")}
      />
    </>
  )
}

export default LandingPage
