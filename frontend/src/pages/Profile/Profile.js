"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { motion } from "framer-motion"
import { getCurrentUser } from "../../utils/auth"
import { userService } from "../../services/api"
import Navbar from "../../components/Layout/Navbar"
import Footer from "../../components/Layout/Footer"

const Profile = () => {
  const user = getCurrentUser()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      await userService.updateProfile(formData)
      setMessage("Profile updated successfully!")
      // Update local storage
      const updatedUser = { ...user, ...formData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
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

  return (
    <>
      <Navbar />
      <div className="min-vh-100 animated-bg">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={6} md={8}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Card className="modern-card">
                  <Card.Header>
                    <h4 className="mb-0">👤 My Profile</h4>
                  </Card.Header>
                  <Card.Body>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit} className="modern-form">
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control type="text" value={user?.role || ""} disabled className="bg-light" />
                      </Form.Group>

                      <Button type="submit" className="btn-gradient w-100" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="loading-spinner me-2"></span>
                            Updating...
                          </>
                        ) : (
                          "💾 Update Profile"
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  )
}

export default Profile
