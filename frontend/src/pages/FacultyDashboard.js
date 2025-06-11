import React from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import jwtDecode from 'jwt-decode';

const FacultyDashboard = () => {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  return (
    <Container fluid className="min-vh-100">
      <Row>
        <Col md={2} className="bg-primary text-white p-3">
          <Nav className="flex-column">
            <Nav.Link href="#" className="text-white">Dashboard</Nav.Link>
            <Nav.Link href="#" className="text-white">Courses</Nav.Link>
            <Nav.Link href="#" className="text-white">Students</Nav.Link>
            <Nav.Link href="/" className="text-white">Logout</Nav.Link>
          </Nav>
        </Col>
        <Col md={10} className="p-4">
          <h2>Welcome back, {user?.name}</h2>
          <p>Faculty Dashboard</p>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Course Management</Card.Title>
                  <p>Manage your course materials and assignments here.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Student Performance</Card.Title>
                  <p>View and analyze student performance insights.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default FacultyDashboard;