import { Container, Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white py-5 border-top">
      <Container>
        <Row className="mb-4">
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <div
                className="me-2 d-flex align-items-center justify-content-center text-white rounded-circle"
                style={{ width: "40px", height: "40px", background: "#3b82f6" }}
              >
                <span className="fw-bold">SC</span>
              </div>
              <span className="fw-bold text-primary fs-5">Smart Campus</span>
            </div>
            <p className="text-muted">
              Your complete academic management solution. Access courses, track progress, and achieve your educational
              goals with ease.
            </p>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4 mb-lg-0">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#features" className="text-decoration-none text-muted">
                  Features
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#about" className="text-decoration-none text-muted">
                  About
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#contact" className="text-decoration-none text-muted">
                  Contact
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4 mb-lg-0">
            <h5 className="fw-bold mb-3">Resources</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="#" className="text-decoration-none text-muted">
                  Documentation
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#" className="text-decoration-none text-muted">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#" className="text-decoration-none text-muted">
                  FAQs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="#" className="text-decoration-none text-muted">
                  Blog
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={4} md={4}>
            <h5 className="fw-bold mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-muted">
                <i className="bi bi-geo-alt me-2"></i> 123 Education Street, Academic City
              </li>
              <li className="mb-2 text-muted">
                <i className="bi bi-envelope me-2"></i> info@smartcampus.edu
              </li>
              <li className="mb-2 text-muted">
                <i className="bi bi-telephone me-2"></i> +1 (123) 456-7890
              </li>
            </ul>
          </Col>
        </Row>

        <hr />

        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">&copy; {currentYear} Smart Campus Portal. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
