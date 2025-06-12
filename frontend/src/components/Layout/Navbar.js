"use client"

import { useContext, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Navbar as BSNavbar, Nav, Container, Button, Dropdown } from "react-bootstrap"
import { toast } from "react-toastify"
import AuthContext from "../../context/AuthContext"
import AuthModal from "../Auth/AuthModal"

const Navbar = ({ onLogin, onSignup }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")

  const handleShowLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      setAuthMode("login")
      setShowAuthModal(true)
    }
  }

  const handleShowSignup = () => {
    if (onSignup) {
      onSignup()
    } else {
      setAuthMode("signup")
      setShowAuthModal(true)
    }
  }

  const handleLogout = () => {
    logout()
    toast.info("You have been logged out")
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/"

    switch (user.role) {
      case "student":
        return "/student-dashboard"
      case "faculty":
        return "/faculty-dashboard"
      case "admin":
        return "/admin-dashboard"
      default:
        return "/"
    }
  }

  return (
    <>
      <BSNavbar expand="lg" className="navbar-blue py-3">
        <Container>
          <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div
              className="me-2 d-flex align-items-center justify-content-center text-white rounded-circle"
              style={{ width: "40px", height: "40px", background: "#3b82f6" }}
            >
              <span className="fw-bold">SC</span>
            </div>
            <span className="fw-bold text-primary">Smart Campus</span>
          </BSNavbar.Brand>

          <BSNavbar.Toggle aria-controls="navbar-nav" />
          <BSNavbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className={location.pathname === "/" ? "fw-semibold text-primary" : ""}>
                Home
              </Nav.Link>
              <Nav.Link
                href="#features"
                className={location.pathname === "/#features" ? "fw-semibold text-primary" : ""}
              >
                Features
              </Nav.Link>
              <Nav.Link href="#about" className={location.pathname === "/#about" ? "fw-semibold text-primary" : ""}>
                About
              </Nav.Link>
              <Nav.Link href="#contact" className={location.pathname === "/#contact" ? "fw-semibold text-primary" : ""}>
                Contact
              </Nav.Link>
            </Nav>

            <Nav>
              {isAuthenticated ? (
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-user">
                    <span className="me-2">{user?.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to={getDashboardLink()}>
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={handleShowLogin}>
                    Login
                  </Button>
                  <Button className="btn-blue" onClick={handleShowSignup}>
                    Sign Up
                  </Button>
                </div>
              )}
            </Nav>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>

      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        mode={authMode}
        switchMode={() => setAuthMode(authMode === "login" ? "signup" : "login")}
      />
    </>
  )
}

export default Navbar
