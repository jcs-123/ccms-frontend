import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Container, Row, Col, Form, Button, Table, Modal, Spinner } from 'react-bootstrap';
import { getcomplaint, updateRemarkAPI, assignComplaintAPI } from '../services/allapi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Ithardwarecomplaintreport() {

    const [complaints, setComplaints] = useState([]);
  const [spoc, setSpoc] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [ticketNo, setTicketNo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [allComplaints, setAllComplaints] = useState([]);
  const [results, setResults] = useState([]);
  const [spocOptions, setSpocOptions] = useState([]);
  const debounceRef = useRef();

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [loading, setLoading] = useState(false);

  const ticketStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'assigned', label: 'Assigned' }
  ];

  
  const setSpocFromUsername = (username) => {
    const match = spocOptions.find(option => option.value === username);
    if (match) setSpoc(match);
  };


// get complaint

useEffect(() => {
    axios
      .get("https://ccms-server.onrender.com/get-cccomplaint")
      .then((res) => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching complaints:", err);
        setError("Failed to fetch complaints.");
        setLoading(false);
      });
  }, []);


  const fetchSpocs = async () => {
    try {
      const response = await axios.get('https://ccms-server.onrender.com/get-spoc-users');
      const options = response.data.map(spoc => ({
        value: spoc.name,
        label: spoc.name
      }));
      setSpocOptions(options);
      setSpocFromUsername('john.doe'); // Optional default SPOC
    } catch (error) {
      console.error("Error fetching SPOCs:", error);
    }
  };

  const loadComplaints = async () => {
    try {
      const res = await getcomplaint();
      const data = res?.data || [];
      setAllComplaints(data);
      setResults(data);
    } catch (err) {
      console.error(err);
      setAllComplaints([]);
      setResults([]);
    }
  };

  useEffect(() => {
    fetchSpocs();
    loadComplaints();
  }, []);

  const applyFilters = () => {
    const filtered = allComplaints.filter(item => {
      const matchSpoc = spoc ? item.spoc === spoc.value : true;
      const matchStatus = ticketStatus ? item.status?.toLowerCase() === ticketStatus.value.toLowerCase() : true;
      const matchTicketNo = ticketNo ? item.ticketNo?.toLowerCase().includes(ticketNo.toLowerCase()) : true;
      const itemDate = new Date(item.complaintDate);
      const matchDateFrom = dateFrom ? itemDate >= new Date(`${dateFrom}T00:00:00`) : true;
      const matchDateTo = dateTo ? itemDate <= new Date(`${dateTo}T23:59:59`) : true;

      return matchSpoc && matchStatus && matchTicketNo && matchDateFrom && matchDateTo;
    });

    setResults(filtered);
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [spoc, ticketStatus, ticketNo, dateFrom, dateTo]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "complaints_report.xlsx");
  };

  const handleClearFilters = () => {
    setSpoc(null);
    setTicketStatus(null);
    setTicketNo('');
    setDateFrom('');
    setDateTo('');
    setResults(allComplaints);
    setSortField(null);
    setSortOrder('asc');
  };

  const onHeaderClick = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedResults = () => {
    if (!sortField) return results;
    return [...results].sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortOrder === 'asc' ? va - vb : vb - va;
    });
  };

  const handleAssign = (item) => {
    setSelectedComplaint(item);
    setShowAssignModal(true);
  };

  const handleRemark = (item) => {
    setSelectedComplaint(item);
    setRemarkText('');
    setShowRemarkModal(true);
  };

  const submitAssign = async () => {
    try {
      if (!selectedComplaint?.assignedSpoc) {
        toast.error('Please select a SPOC');
        return;
      }

      const payload = {
        assignedSpoc: selectedComplaint.assignedSpoc,
        assignedDate: new Date().toISOString()
      };

      await assignComplaintAPI(selectedComplaint.ticketNo, payload);
      toast.success(`Ticket ${selectedComplaint.ticketNo} assigned to ${selectedComplaint.assignedSpoc}`);
      setShowAssignModal(false);
      loadComplaints();
    } catch (error) {
      console.error("Error assigning complaint:", error);
      toast.error('Failed to assign complaint');
    }
  };

  const submitRemark = async () => {
    if (!remarkText.trim()) {
      toast.error("Please enter a valid remark");
      return;
    }
    setLoading(true);
    try {
      await updateRemarkAPI(selectedComplaint?.ticketNo, {
        complaintremark: remarkText,
      });
      toast.success(`Remark submitted for Ticket No: ${selectedComplaint?.ticketNo}`);
      setShowRemarkModal(false);
      loadComplaints();
    } catch (error) {
      console.error("Error submitting remark:", error);
      toast.error('Failed to submit remark');
    } finally {
      setLoading(false);
    }
  };

  const dataToRender = sortedResults();

  return (
    <Container className="mt-4">
      <h5>Complaints Report</h5>

      {/* Filters */}
      <Row className="mb-2">
        <Col md={3}>
          <Form.Label>SPOC</Form.Label>
          <Select options={spocOptions} value={spoc} onChange={setSpoc} isClearable />
        </Col>
        <Col md={3}>
          <Form.Label>Ticket Status</Form.Label>
          <Select options={ticketStatusOptions} value={ticketStatus} onChange={setTicketStatus} isClearable />
        </Col>
        <Col md={3}>
          <Form.Label>Ticket No</Form.Label>
          <Form.Control type="text" value={ticketNo} onChange={e => setTicketNo(e.target.value)} placeholder="Type to search..." />
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="success" onClick={handleExportExcel} className="w-100">
            Export to Excel
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Date From</Form.Label>
          <Form.Control type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label>Date To</Form.Label>
          <Form.Control type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button onClick={applyFilters} className="me-2 w-100">Search</Button>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="danger" onClick={handleClearFilters} className="w-100">Clear</Button>
        </Col>
      </Row>

      {/* Table */}
      {dataToRender.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => onHeaderClick('spoc')}>SPOC</th>
              <th onClick={() => onHeaderClick('status')}>Status</th>
              <th onClick={() => onHeaderClick('ticketNo')}>Ticket No</th>
              <th onClick={() => onHeaderClick('complaintstatus')}>Remark</th>
              <th onClick={() => onHeaderClick('complaintDate')}>Date</th>
              <th onClick={() => onHeaderClick('assignedDate')}>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.spoc}</td>
                <td>{item.status}</td>
                <td>{item.ticketNo}</td>
                <td>{item.complaintstatus}</td>
                <td>{item.complaintDate}</td>
                <td>{item.assignedDate ? new Date(item.assignedDate).toLocaleString() : '—'}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2 mt-2" onClick={() => handleAssign(item)}>Assign</Button>
                  <Button variant="warning"  className="me-2 mt-2" size="sm" onClick={() => handleRemark(item)}>Remark</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No complaints found.</p>
      )}

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Assigning ticket: <strong>{selectedComplaint?.ticketNo}</strong></p>
          <Form.Group>
            <Form.Label>Select SPOC</Form.Label>
            <Form.Select
              value={selectedComplaint?.assignedSpoc || ''}
              onChange={(e) => {
                const updatedComplaint = { ...selectedComplaint, assignedSpoc: e.target.value };
                setSelectedComplaint(updatedComplaint);
              }}
            >
              <option value="">--- Select SPOC ---</option>
              {spocOptions.map((spoc, index) => (
                <option key={index} value={spoc.value}>{spoc.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Close</Button>
          <Button variant="primary" onClick={submitAssign}>Assign</Button>
        </Modal.Footer>
      </Modal>

      {/* Remark Modal */}
      <Modal show={showRemarkModal} onHide={() => setShowRemarkModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Add Remark</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form.Group className="mb-3">
      <Form.Label>SPOC Remark</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        value={
          selectedComplaint
            ? ` ${selectedComplaint.complaintremark || 'No remark yet'}`
            : ''
        }
        readOnly
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>Enter Remark</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        value={remarkText}
        onChange={(e) => setRemarkText(e.target.value)}
        placeholder="Type the remark..."
      />
    </Form.Group>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowRemarkModal(false)}>Close</Button>
    <Button variant="primary" onClick={submitRemark} disabled={loading}>
      {loading ? <Spinner animation="border" size="sm" /> : 'Submit Remark'}
    </Button>
  </Modal.Footer>
</Modal>


      <ToastContainer />
    </Container>
  );
}

export default Ithardwarecomplaintreport;
