"use client"

import { useContext } from "react"
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    console.log("🚪 User logging out")
    logout()
    navigate("/")
  }

  return (
    <BootstrapNavbar
      bg={theme === "dark" ? "dark" : "white"}
      variant={theme === "dark" ? "dark" : "light"}
      expand="lg"
      className="py-2 shadow-sm"
      sticky="top"
    >
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="logo-circle">SC</div>
          <span className="ms-2 fw-bold text-primary">Smart Campus</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-1">
              Home
            </Nav.Link>

            {user && (
              <>
                <Nav.Link as={Link} to="/courses" className="mx-1">
                  Courses
                </Nav.Link>

                {(user.role === "admin" || user.role === "faculty") && (
                  <>
                    <Nav.Link as={Link} to="/manage-courses" className="mx-1">
                      Manage Courses
                    </Nav.Link>
                    <Nav.Link as={Link} to="/manage-students" className="mx-1">
                      Manage Students
                    </Nav.Link>
                    <Nav.Link as={Link} to="/placements" className="mx-1">
                      <i className="bi bi-briefcase me-1"></i>
                      Placements
                    </Nav.Link>
                  </>
                )}

                {user.role === "student" && (
                  <Nav.Link as={Link} to="/student/placements" className="mx-1">
                    <i className="bi bi-briefcase me-1"></i>
                    My Placements
                  </Nav.Link>
                )}

                <Nav.Link as={Link} to="/events" className="mx-1">
                  Events
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className="mx-1">
                  About
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className="mx-1">
                  Contact
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center">
            {/* Theme Toggle */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              className="me-3"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </Button>

            {user ? (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/notifications" className="position-relative me-3">
                  <i className="bi bi-bell"></i>
                  <span className="notification-badge">3</span>
                </Nav.Link>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant={theme === "dark" ? "outline-light" : "outline-dark"}
                    className="d-flex align-items-center"
                    id="user-dropdown"
                  >
                    <div className="avatar-circle me-2">{user.name?.charAt(0)}</div>
                    <span>{user.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Header>
                      <div className="fw-bold">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                      <div className="text-muted small text-capitalize">Role: {user.role}</div>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/settings">
                      <i className="bi bi-gear me-2"></i>Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex">
                <Button variant="outline-primary" className="me-2" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate("/signup")}>
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
