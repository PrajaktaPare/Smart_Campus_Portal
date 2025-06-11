import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      if (res.data.user.role === 'student') navigate('/student');
      else if (res.data.user.role === 'faculty') navigate('/faculty');
      else if (res.data.user.role === 'admin') navigate('/admin');
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="w-100">
        <Col md={6} className="d-flex justify-content-center">
          <Card style={{ width: '400px', padding: '20px' }}>
            <Card.Body>
              <h3 className="text-center mb-4">Smart Campus Portal</h3>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Log In
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="bg-primary text-white d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h2>Connect with Smart Campus</h2>
            <p>Everything you need in one dashboard.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;