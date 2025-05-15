import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { AiOutlineCheck } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { getSpocUsers } from '../services/allapi'; // Adjust the path to your API file
import bcrypt from 'bcryptjs'; // For comparing hashed passwords

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getSpocUsers();
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
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

    const matchedUser = users.find(user => user.username === formData.username);
    if (!matchedUser) {
      return setError('Invalid username');
    }

    const isMatch = await bcrypt.compare(formData.password, matchedUser.password);
    if (!isMatch) {
      return setError('Incorrect password');
    }

    // Login success – redirect
    localStorage.setItem('loggedUser', JSON.stringify(matchedUser)); // Optional
    navigate('/'); // Replace with your dashboard route
  };

  return (
    <div className="login-page">
      <Container fluid>
        <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Col xs={12} md={6} lg={4} className="d-flex align-items-center justify-content-center">
            <div className="login-form p-4 shadow-sm">
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
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <InputGroup.Text>
                      {formData.password && <AiOutlineCheck color="green" />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {error && <p className="text-danger text-center">{error}</p>}

                <Button variant="primary" type="submit" className="w-100">
                  Sign In
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
