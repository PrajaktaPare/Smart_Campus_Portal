import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, ProgressBar, ListGroup, Nav } from 'react-bootstrap';
import jwtDecode from 'jwt-decode';

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [placements, setPlacements] = useState([]);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    };

    const fetchPlacements = async () => {
      const res = await axios.get('http://localhost:5000/api/placements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlacements(res.data);
    };

    fetchEvents();
    fetchPlacements();
  }, [token]);

  return (
    <Container fluid className="min-vh-100">
      <Row>
        <Col md={2} className="bg-primary text-white p-3">
          <Nav className="flex-column">
            <Nav.Link href="#" className="text-white">Dashboard</Nav.Link>
            <Nav.Link href="#" className="text-white">Courses</Nav.Link>
            <Nav.Link href="#" className="text-white">Placements</Nav.Link>
            <Nav.Link href="#" className="text-white">Events</Nav.Link>
            <Nav.Link href="/" className="text-white">Logout</Nav.Link>
          </Nav>
        </Col>
        <Col md={10} className="p-4">
          <h2>Welcome back, {user?.name}</h2>
          <p>Here is your learning activity</p>
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Your Learning Progress</Card.Title>
                  <ProgressBar now={40} label="40 Credits Completed" />
                  <p className="mt-2">80 Credits Goal</p>
                  <p>3 Ongoing Courses</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Your Daily Workplan</Card.Title>
                  <ListGroup>
                    <ListGroup.Item>2 Assignments Due: Late</ListGroup.Item>
                    <ListGroup.Item>3 Programs Due: Today</ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>What's Coming Next</Card.Title>
                  {events.map(event => (
                    <div key={event._id} className="mb-2">
                      <strong>{event.title}</strong>
                      <p>{new Date(event.date).toLocaleDateString()} | {event.time}</p>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Placement Tracking</Card.Title>
                  <ListGroup>
                    {placements.map(placement => (
                      <ListGroup.Item key={placement._id}>
                        {placement.company} - {placement.status} ({new Date(placement.date).toLocaleDateString()})
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;