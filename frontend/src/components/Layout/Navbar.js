"use client"

import { useContext } from "react"
import { Navbar as BootstrapNavbar, Nav, Container, Button } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import ThemeContext from "../../context/ThemeContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
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
                  </>
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

          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/notifications" className="position-relative me-3">
                  <i className="bi bi-bell"></i>
                  <span className="notification-badge">3</span>
                </Nav.Link>

                <div className="dropdown">
                  <Button
                    variant={theme === "dark" ? "outline-light" : "outline-dark"}
                    className="dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <div className="avatar-circle me-2">{user.name?.charAt(0)}</div>
                    <span>{user.name}</span>
                  </Button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="dropdown-item">
                        <i className="bi bi-gear me-2"></i>Settings
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="d-flex">
                <Button variant="outline-primary" className="me-2" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate("/register")}>
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
