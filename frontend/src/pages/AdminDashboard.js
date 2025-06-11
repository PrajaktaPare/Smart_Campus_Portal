import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Nav } from 'react-bootstrap';
import jwtDecode from 'jwt-decode';

const AdminDashboard = () => {
  const [event, setEvent] = useState({ title: '', date: '', time: '', duration: '', description: '' });
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', event, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Event created successfully');
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <Container fluid className="min-vh-100">
      <Row>
        <Col md={2} className="bg-primary text-white p-3">
          <Nav className="flex-column">
            <Nav.Link href="#" className="text-white">Dashboard</Nav.Link>
            <Nav.Link href="#" className="text-white">Users</Nav.Link>
            <Nav.Link href="#" className="text-white">Events</Nav.Link>
            <Nav.Link href="/" className="text-white">Logout</Nav.Link>
          </Nav>
        </Col>
        <Col md={10} className="p-4">
          <h2>Welcome back, {user?.name}</h2>
          <p>Admin Dashboard</p>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Create Event</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={event.title}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={event.date}
                        onChange={(e) => setEvent({ ...event, date: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="text"
                        value={event.time}
                        onChange={(e) => setEvent({ ...event, time: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration</Form.Label>
                      <Form.Control
                        type="text"
                        value={event.duration}
                        onChange={(e) => setEvent({ ...event, duration: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={event.description}
                        onChange={(e) => setEvent({ ...event, description: e.target.value })}
                      />
                    </Form.Group>
                    <Button type="submit">Create Event</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;