import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Form, Button,
  InputGroup, FormControl, Spinner
} from 'react-bootstrap';
import { AiOutlineCheck } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { getSpocUsers } from '../services/allapi';
import bcrypt from 'bcryptjs';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getSpocUsers();
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const username = formData.username.trim();
      const password = formData.password.trim();

      const matchedUser = users.find(user => user.username === username);
      if (!matchedUser) return setError('Invalid username');

      const isMatch = await bcrypt.compare(password, matchedUser.password);
      if (!isMatch) return setError('Incorrect password');

      localStorage.setItem('loggedUser', JSON.stringify(matchedUser));
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <Container fluid>
        <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Col xs={12} md={6} lg={4} className="d-flex align-items-center justify-content-center">
            <div className="login-form p-4 shadow-sm w-100">
              <h4 className="text-center mb-4">Computer Center Management System</h4>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <InputGroup>
                    <FormControl
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text>
                      {formData.username && <AiOutlineCheck color="green" />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group controlId="password" className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <FormControl
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                      {showPassword ? '🙈' : '👁️'}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {error && <p className="text-danger text-center">{error}</p>}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0 text-muted small">
                &copy; 2025 tbi@jec, Jyothi Engineering College. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
