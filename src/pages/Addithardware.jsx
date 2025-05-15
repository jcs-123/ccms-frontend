import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row, ToastContainer } from 'react-bootstrap';
import { addhardwareAPI } from '../services/allapi';
import { toast } from 'react-toastify';
import axios from 'axios';

function Addithardware() {
  const [formData, setFormData] = useState({});
  const [bulkData, setBulkData] = useState([]);
  const fileInputRef = useRef(null);
  const [spocOptions, setSpocOptions] = useState([]); // Store fetched SPOC names
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const fetchSpocs = async () => {
      try {
        // Make the GET request using axios
        const response = await axios.get('http://localhost:4000/get-spoc-users');
        
        // Assuming the response contains an array of SPOC names
        setSpocOptions(response.data); // Set fetched SPOC names in state
        console.log(response.data); // Log the response data to verify the format
      } catch (error) {
        console.error("Error fetching SPOCs:", error);
      }
    };

    fetchSpocs();
  }, []); // Empty dependency array to run only once on component mount

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (Array.isArray(json)) {
          setBulkData(json);
          toast.success('Bulk data uploaded successfully!');
        } else {
          toast.warning('JSON should be an array of records.');
        }
      } catch (err) {
        toast.error('Invalid JSON format!');
      }
    };
    reader.readAsText(file);
  };

  const handleadd = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      toast.info('Please fill the form before submitting!');
      return;
    }

    try {
      const response = await addhardwareAPI(formData);
      if (response.status >= 200 && response.status < 300) {
        toast.success('Data added successfully!');
        clearData();
      } else {
        toast.warning('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Server error. Could not add data.');
    }
  };

  const handleBulkSubmit = async () => {
    if (bulkData.length === 0) {
      toast.info('No bulk data to submit.');
      return;
    }

    try {
      for (const item of bulkData) {
        await addhardwareAPI(item);
      }
      toast.success('Bulk data added successfully!');
      setBulkData([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      console.error('Bulk add error:', error);
      toast.error('Failed to add bulk data.');
    }
  };

  const clearData = () => {
    setFormData({});
    setBulkData([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <Container fluid className="py-4">
        <h4 className="mb-4 text-center">Add IT Hardware</h4>
        <Form>
          {/* Text Fields */}
          <Row className="mb-3">
  <Col md={4}>
    <Form.Group>
      <Form.Label>JECC ID <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="jeccid"
        value={formData.jeccid || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>CPU Serial No <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="cpusino"
        value={formData.cpusino || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Monitor Serial No <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="monitorsino"
        value={formData.monitorsino || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Keyboard Serial No <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="keyboardsino"
        value={formData.keyboardsino || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Mouse Serial No <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="mousesino"
        value={formData.mousesino || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Printer Serial No <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="printersino"
        value={formData.printersino || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Location ID <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="text"
        name="locationid"
        value={formData.locationid || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>Purchased On <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="date"
        name="purchasedon"
        value={formData.purchasedon || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>

  <Col md={4}>
    <Form.Group>
      <Form.Label>AMC Expiry Date <span className="text-danger">*</span></Form.Label>
      <Form.Control
        type="date"
        name="amcexpdata"
        value={formData.amcexpdata || ""}
        onChange={handleInputChange}
      />
    </Form.Group>
  </Col>
</Row>


          {/* Dropdown Fields */}
          <Row className="mb-3">
            {/* Brand */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Brand <span className="text-danger">*</span></Form.Label>
                <Form.Select name="brand" value={formData.brand || ""} onChange={handleInputChange}>
                  <option value="">--- Select ---</option>
                  <option value="ACER POWER SERIES">ACER POWER SERIES</option>
                  <option value="ACER VERSION">ACER VERSION</option>
                  <option value="DELL/HCL UPGRADED PC'S">DELL/HCL UPGRADED PC'S</option>
                  <option value="ASSEMBLED">ASSEMBLED</option>
                  <option value="LENOVO THINK CENTRE EDGE 72">LENOVO THINK CENTRE EDGE 72</option>
                  <option value="DELL OPTIPLEX 755">DELL OPTIPLEX 755</option>
                  <option value="HCL PRO BL">HCL PRO BL</option>
                  <option value="HP COMPAQ DX2480">HP COMPAQ DX2480</option>
                  <option value="HP ELITE 7100 MT">HP ELITE 7100 MT</option>
                  <option value="INTEL NUC KIT">INTEL NUC KIT</option>
                  <option value="HCL">HCL</option>
                  <option value="ASUS">ASUS</option>
                  <option value="ACER VERITON">ACER VERITON</option>

                  <option value="HP ALL IN ONE">HP ALL IN ONE</option>
                  <option value="DELL T30">DELL T30</option>
                  <option value="DELL OPTIPLEX 5060 MINI TOWER">DELL OPTIPLEX 5060 MINI TOWER</option>
                  <option value="DELL OPTIPLEX 3060 MONI TOWER">DELL OPTIPLEX 3060 MONI TOWER</option>
                  <option value="DELL OPTIPLEX 390">DELL OPTIPLEX 390</option>
                  <option value="HP LAP 15-AC 122TU">HP LAP 15-AC 122TU</option>
                  <option value="TOSIBA SATELLITE">TOSIBA SATELLITE</option>
                  <option value="MSI NOTEBOOK">MSI NOTEBOOK</option>
                  <option value="HP LAP 15-AC 184TU">HP LAP 15-AC 184TU</option>
                  <option value="HP LAP 15-BS576TX">HP LAP 15-BS576TX</option>
                  <option value="ACER LAP N16C1 (AspireES1-572)">ACER LAP N16C1 (AspireES1-572)</option>
                  <option value="DELL LATITUDE 74002">DELL LATITUDE 74002</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Department */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                <Form.Select name="department" value={formData.department || ""} onChange={handleInputChange}>
                  <option value="">--- Select Department ---</option>
                  <option value="TBI">TBI</option>
                  <option value="Office">Office</option>
                  <option value="Research And Development">Research And Development</option>
                  <option value="Computer Centre">Computer Centre</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Room */}
            <Col md={4}>
            <Form.Group>
    <Form.Label>Room <span className="text-danger">*</span></Form.Label>
    <Form.Control
      type="text"
      name="room"
      value={formData.room || ""}
      onChange={handleInputChange}
      placeholder="Enter room number or name"
    />
  </Form.Group>
            </Col>

            {/* SPOC */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>SPOC <span className="text-danger">*</span></Form.Label>
                <Form.Select name="spoc" value={formData.spoc || ""} onChange={handleInputChange}>
                <option value="">----Select----</option>
        {spocOptions.map((spoc, index) => (
          <option key={index} value={spoc.name}>
            {spoc.name}
          </option>
        ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Status */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                <Form.Select name="status" value={formData.status || ""} onChange={handleInputChange}>
                  <option value="">--- Select Status ---</option>
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* AMC Vendor */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>AMC Vendor <span className="text-danger">*</span></Form.Label>
                <Form.Select name="amcvendor" value={formData.amcvendor || ""} onChange={handleInputChange}>
                  <option value="">--- Select Vendor ---</option>
                  <option value="ACCEL">ACCEL</option>
                  <option value="ACER/PC CLINIC">ACER/PC CLINIC</option>
                  <option value="ARTECH">ARTECH</option>
                  <option value="FRONTIER">FRONTIER</option>
                  <option value="HALCYON">HALCYON</option>
                  <option value="HP">HP</option>
                  <option value="PC CLINIC">PC CLINIC</option>
                  <option value="TELECOM">TELECOM</option>
                  <option value="VERTEX">VERTEX</option>
                  <option value="ZETA">ZETA</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Operating Systems */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Operating Systems <span className="text-danger">*</span></Form.Label>
                <Form.Select name="operatingsystems" value={formData.operatingsystems || ""} onChange={handleInputChange}>
                  <option value="">--- Select OS ---</option>
                  <option value="Windows XP">Windows XP</option>
                  <option value="Windows 7">Windows 7</option>
                  <option value="Windows 8">Windows 8</option>
                  <option value="Windows 10">Windows 10</option>
                  <option value="Ubuntu 16">Ubuntu 16</option>
                  <option value="Ubuntu 18">Ubuntu 18</option>
                  <option value="JOSS">JOSS</option>
                  <option value="TCS ion">TCS ion</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Remarks */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Remarks</Form.Label>
                <Form.Control as="textarea" rows={3} name="remarks" value={formData.remarks || ""} onChange={handleInputChange} />
              </Form.Group>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row className="align-items-center mb-4">
            <Col xs={12} md={6}>
              <Button onClick={handleadd} variant="success" type="button" className="me-2">Submit</Button>
              <Button variant="danger" type="button" onClick={clearData}>Cancel</Button>
              {bulkData.length > 0 && (
                <Button variant="warning" onClick={handleBulkSubmit} className="ms-2">Submit Bulk</Button>
              )}
            </Col>
            <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleBulkUpload}
                style={{ display: 'none' }}
              />
              <Button variant="primary" onClick={triggerFileInput}>Add JSON File</Button>
            </Col>
          </Row>
        </Form>

        {/* JSON Preview */}
        {bulkData.length > 0 && (
          <div className="mt-4">
            <h6>Preview JSON Data</h6>
            <pre style={{
              background: '#f8f9fa',
              border: '1px solid #ced4da',
              padding: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              borderRadius: '0.25rem'
            }}>
              {JSON.stringify(bulkData, null, 2)}
            </pre>
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="text-center mt-5 py-3 border-top text-muted" style={{ fontSize: '0.9rem' }}>
        Copyright © 2025 <a style={{ color: "green" }} href="mailto:tbi@jec">tbi@jec</a>,
        <span style={{ color: "green" }}> Jyothi Engineering College</span>. All rights reserved.
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Addithardware;
