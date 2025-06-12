"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button, Form, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../utils/auth";
import { courseService, assignmentService, eventService, notificationService } from "../../services/api";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", date: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "faculty") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [courseRes, eventRes] = await Promise.all([
          courseService.getCourses(),
          eventService.getEvents(),
        ]);
        setCourses(courseRes.data);
        setEvents(eventRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(formData);
      setEvents([...events, formData]);
      setShowModal(false);
      setFormData({ title: "", description: "", date: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (courseId) => {
    try {
      const assignment = { title: "New Assignment", courseId };
      await assignmentService.createAssignment(assignment);
      setAssignments([...assignments, assignment]);
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
            <p className="text-muted">Faculty Dashboard</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title>Manage Courses</Card.Title>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course._id}>
                        <td>{course.title}</td>
                        <td>{course.students?.length || 0}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleCreateAssignment(course._id)}
                          >
                            Add Assignment
                          </Button>
                          <Button variant="outline-secondary" size="sm">Add Material</Button>
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
                <Card.Title>Manage Events</Card.Title>
                <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
                  Create Event
                </Button>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
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
            <Modal.Title>Create Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateEvent}>
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
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

export default FacultyDashboard;
