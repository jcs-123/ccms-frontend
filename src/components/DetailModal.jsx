import React from 'react'
import { Modal, Button, Row, Col } from "react-bootstrap";
function DetailModal({ show, handleClose, item }) {
  return (
    <div>   <Modal show={show} onHide={handleClose} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>Hardware Inventory Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Row>
        {/* Inventory Details */}
        <Col md={8}>
          <h5 className="mb-3">Inventory Details</h5>
          <ul className="list-unstyled small">
            <li><strong>JECC Device Id:</strong> {item.jeccid}</li>
            <li><strong>CPU SI No:</strong> {item.cpusino}</li>
            <li><strong>Monitor SI No:</strong> {item.monitorsino}</li>
            <li><strong>Keyboard SI No:</strong> {item.keyboardsino}</li>
            <li><strong>Mouse SI No:</strong> {item.mousesino}</li>
            <li><strong>Printer SI No:</strong> {item.printersino || '-'}</li>
            <li><strong>Brand:</strong> {item.brand}</li>
            <li><strong>Department:</strong> {item.department}</li>
            <li><strong>Room:</strong> {item.room}</li>
            <li><strong>Location:</strong> {item.locationid}</li>
            <li><strong>SPOC:</strong> {item.spoc}</li>
            <li><strong>Status:</strong> {item.status}</li>
            <li><strong>Purchased On:</strong> {item.purchasedon}</li>
            <li><strong>AMC Expiry:</strong> {item.amcexpdata}</li>
            <li><strong>AMC Vendor:</strong> {item.amcvendor}</li>
            <li><strong>Operating Systems:</strong> {item.operatingsystems}</li>
            <li><strong>Remarks:</strong> {item.remarks || '-'}</li>
          </ul>
        </Col>

        {/* Complaint Details */}
        <Col md={4}>
          <h5 className="mb-3">Complaint Details</h5>
          <div className="border-top pt-2 text-muted">
            {item.complaintdetails || "No complaints registered."}
          </div>
        </Col>
      </Row>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal></div>
  )
}

export default DetailModal