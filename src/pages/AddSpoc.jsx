import React, { useState, useEffect } from 'react';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Table
} from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  addspoc,
  getSpocUsers,
  editSpocUser,
  deleteSpocUser
} from '../services/allapi';

function AddSpoc() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [spocs, setSpocs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSpocs();
  }, []);

  const fetchSpocs = async () => {
    try {
      const response = await getSpocUsers();
      const spocList = Array.isArray(response) ? response : response?.data;
      if (Array.isArray(spocList)) {
        setSpocs(spocList);
      } else {
        console.error('Expected array from getSpocUsers');
        setSpocs([]);
      }
    } catch (error) {
      console.error('Error fetching SPOC data:', error);
      setSpocs([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      if (isEditMode) {
        await editSpocUser(editId, formData);
        toast.success('SPOC updated successfully!');
      } else {
        await addspoc(formData);
        toast.success('SPOC added successfully!');
      }

      clearForm();
      fetchSpocs();
    } catch (error) {
      console.error('Error submitting SPOC data:', error);
      toast.error('Failed to add/update SPOC');
    }
  };

  const handleEdit = (spoc) => {
    setIsEditMode(true);
    setFormData({
      username: spoc.username,
      email: spoc.email,
      password: '',
      name: spoc.name
    });
    setEditId(spoc._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteSpocUser(id);
      if (response?.status === 200 || response?.success) {
        toast.success('SPOC deleted successfully!');
        fetchSpocs();
      } else {
        toast.error('Failed to delete SPOC on server');
      }
    } catch (error) {
      console.error('Error deleting SPOC:', error);
      toast.error('Failed to delete SPOC');
    }
  };

  const clearForm = () => {
    setFormData({ username: '', email: '', password: '', name: '' });
    setIsEditMode(false);
    setEditId(null);
    setValidated(false);
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col md={6} className="p-4 rounded shadow-sm mb-5" style={{ backgroundColor: '#f8f9fa' }}>
          <h4 className="text-center text-primary mb-4">
            {isEditMode ? 'Edit SPOC User' : 'Add SPOC User'}
          </h4>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Floating className="mb-3">
              <Form.Control
                required
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="border-primary"
              />
              <label>Username</label>
              <Form.Control.Feedback type="invalid">Username is required</Form.Control.Feedback>
            </Form.Floating>

            <Form.Floating className="mb-3">
              <Form.Control
                required
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border-primary"
              />
              <label>Email</label>
              <Form.Control.Feedback type="invalid">Valid email is required</Form.Control.Feedback>
            </Form.Floating>

            <Form.Floating className="mb-3">
              <Form.Control
                required
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="border-primary"
              />
              <label>Full Name</label>
              <Form.Control.Feedback type="invalid">Name is required</Form.Control.Feedback>
            </Form.Floating>

            <Form.Label>Password</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="border-primary"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">Password is required</Form.Control.Feedback>
            </InputGroup>

            <div className="d-grid gap-2">
              <Button type="submit" variant="primary" size="lg">
                {isEditMode ? 'Update SPOC' : 'Add SPOC'}
              </Button>
              <Button variant="danger" size="lg" onClick={clearForm}>
                Clear
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={10}>
          <h5 className="text-center mb-4">SPOC Users</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spocs.length > 0 ? (
                spocs.map((spoc) => (
                  <tr key={spoc._id}>
                    <td>{spoc.username}</td>
                    <td>{spoc.email}</td>
                    <td>{spoc.name}</td>

                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2 mt-1"
                        onClick={() => handleEdit(spoc)}
                      >
                        Edit
                      </Button>
                      <Button
                                              className=" mt-1"

                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(spoc._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No SPOC users found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <ToastContainer />
    </Container>
  );
}

export default AddSpoc;
