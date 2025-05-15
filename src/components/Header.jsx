import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Image, Modal, Form } from 'react-bootstrap';
import bcrypt from 'bcryptjs';
import { BiLogOut } from 'react-icons/bi';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.username);
    }
  }, []);

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    const storedUser = JSON.parse(localStorage.getItem('loggedUser'));
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    try {
      const res = await fetch(`http://localhost:4000/spoc/edit/${storedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: hashedNewPassword }),
      });

      if (!res.ok) throw new Error('Failed to update password');

      setSuccess("Password updated successfully.");
      setShowModal(false);
      localStorage.removeItem('loggedUser');
      window.location.href = '/Login';
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <>
      <Navbar
        fixed="top"
        expand="lg"
        className="px-3"
        style={{
          background: 'linear-gradient(to right, #00d2ff, #3a7bd5)',
          height: '60px',
          zIndex: '1050'
        }}
      >
        <Container fluid>
          <Navbar.Brand href="#">
            <Image
              src="https://proccms.jecc.ac.in/assets/images/logo.png"
              alt="Logo"
              height="40"
              style={{ backgroundColor: 'white', borderRadius: '4px' }}
              className="me-2"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-content" />

          <Navbar.Collapse id="navbar-content">
            <Nav className="ms-auto align-items-center">
              {userName && (
                <span className="fw-bold me-3 text-white username-md">{userName}</span>
              )}
              <Button
                variant="outline-light"
                size="sm"
                className="me-2 mb-1 mb-lg-0 reset-btn-md"
                onClick={() => setShowModal(true)}
              >
                Reset Password
              </Button>
              <Button
                variant="light"
                size="sm"
                className="d-flex align-items-center"
                onClick={() => {
                  localStorage.removeItem('loggedUser');
                  window.location.href = '/Login';
                }}
              >
                <BiLogOut size={18} className="me-1" /> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Password Reset Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handlePasswordReset}>Update</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header;
