"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button, Form, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../utils/auth";
import { userService, eventService, announcementService, placementService } from "../../services/api";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, eventRes, announcementRes, placementRes] = await Promise.all([
          userService.getAllUsers(),
          eventService.getEvents(),
          announcementService.getAnnouncements(),
          placementService.getAllPlacements(),
        ]);
        setUsers(userRes.data);
        setEvents(eventRes.data);
        setAnnouncements(announcementRes.data);
        setPlacements(placementRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(formData);
      setAnnouncements([...announcements, formData]);
      setShowModal(false);
      setFormData({ title: "", content: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-5"><span className="spinner-border"></span></div>;

  return (
    <>
      <Navbar />
      <Container fluid className="min-vh-100 py-5">
        <Row className="mb-4">
          <Col>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="display-5 fw-bold"
            >
              Welcome, {user.name}!
            </motion.h1>
            <p className="text-muted">Admin Dashboard</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title>User Management</Card.Title>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <Button variant="outline-danger" size="sm">Block</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title>Announcements</Card.Title>
                <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
                  Create Announcement
                </Button>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(announcement => (
                      <tr key={announcement._id}>
                        <td>{announcement.title}</td>
                        <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title>Event Management</Card.Title>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title>Placement Overview</Card.Title>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placements.map(placement => (
                      <tr key={placement._id}>
                        <td>{placement.studentName}</td>
                        <td>{placement.company}</td>
                        <td>{placement.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Announcement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateAnnouncement}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
      <Footer />
    </>
  );
};

export default AdminDashboard;
