import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  ToastContainer,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

function Ccassignedreports() {
  
    const [userRole, setUserRole] = useState("");

  const [reports, setReports] = useState([]);
  const [spocOptions, setSpocOptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [errorInventory, setErrorInventory] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    assignedStaff: "",
    dateFrom: "",
    dateTo: "",
    ticketNo: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [userName, setUserName] = useState("");

  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkStatus, setRemarkStatus] = useState("");
  const [remarkText, setRemarkText] = useState("");

  useEffect(() => {
    axios
      .get("https://ccms-server.onrender.com/get-spoc-users")
      .then((res) => {
        setSpocOptions(res.data.map((u) => u.name));
      })
      .catch((err) => console.error("Error fetching SPOCs:", err));
  }, []);

  useEffect(() => {
    axios
      .get("https://ccms-server.onrender.com/get-cccomplaint")
      .then((res) => {
        setReports(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching reports:", err));
  }, []);

  useEffect(() => {
    setLoadingInventory(true);
    axios
      .get("https://ccms-server.onrender.com/get-data")
      .then((res) => {
        setInventory(Array.isArray(res.data) ? res.data : []);
        setErrorInventory(null);
      })
      .catch(() => setErrorInventory("Failed to fetch inventory data"))
      .finally(() => setLoadingInventory(false));
  }, []);
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.username);
      setUserRole(user.role); // assuming 'role' exists
    }
  }, []);
  

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const getName = (val) => (val && typeof val === "object" ? val.name : val);

//   const visibleReports = Array.isArray(reports)
//     ? reports.filter((item) => {
//         const assignedSpocName =
//           item.assignedSpoc && typeof item.assignedSpoc === "object"
//             ? item.assignedSpoc.name
//             : item.assignedSpoc;

//         if (
//           filters.status &&
//           item.status?.toLowerCase().trim() !== filters.status.toLowerCase().trim()
//         )
//           return false;

//         if (
//           filters.assignedStaff &&
//           assignedSpocName !== filters.assignedStaff
//         )
//           return false;

//         const assignedDate = item.assignedDate ? new Date(item.assignedDate) : null;
//         const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
//         const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

//         if (dateFrom && (!assignedDate || assignedDate < dateFrom)) return false;
//         if (dateTo && (!assignedDate || assignedDate > dateTo)) return false;

//         if (
//           filters.ticketNo &&
//           (!item.ticketNo ||
//             !item.ticketNo.toLowerCase().includes(filters.ticketNo.toLowerCase()))
//         )
//           return false;

//         if (userName && assignedSpocName !== userName) return false;

//         return true;
//       })
//     : [];

const visibleReports = reports.filter((item) => {
    const assignedSpocName = getName(item.assignedSpoc);
  
    if (
      filters.status &&
      item.status?.toLowerCase().trim() !== filters.status.toLowerCase().trim()
    )
      return false;
  
    if (filters.assignedStaff && assignedSpocName !== filters.assignedStaff)
      return false;
  
    const assignedDate = item.assignedDate ? new Date(item.assignedDate) : null;
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
  
    if (dateFrom && (!assignedDate || assignedDate < dateFrom)) return false;
    if (dateTo && (!assignedDate || assignedDate > dateTo)) return false;
  
    if (
      filters.ticketNo &&
      (!item.ticketNo ||
        !item.ticketNo.toLowerCase().includes(filters.ticketNo.toLowerCase()))
    )
      return false;
  
    // ✅ Only restrict by userName if not admin
    if (userRole !== "admin" && userName && assignedSpocName !== userName) return false;
  
    return true;
  });
  

  const exportToExcel = () => {
    const dataToExport = visibleReports.map((item, idx) => ({
      "Sl No": idx + 1,
      "Ticket No": item.ticketNo,
      "JEC Device ID": item.jeccid,
      Department: item.department,
      "Room No": item.room,
      SPOC: getName(item.spoc),
      "Ticket Status": item.status,
      "Complaint Reg Date": item.complaintDate,
      "Assigned Date": item.assignedDate,
      "Assigned SPOC": getName(item.assignedSpoc),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assigned Reports");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Assigned_Reports.xlsx");
  };
const handleSaveRemarks = async () => {
  if (!selectedReport || !remarkText.trim()) {
    toast.info("Please enter remarks before saving.");
    return;
  }

  try {
    const res = await axios.post(
      `https://ccms-server.onrender.com/update-status-remark/${selectedReport.ticketNo}`,
      {
        status: remarkStatus,
        complaintremark: remarkText,
      }
    );
    
    toast.success("Remark and status updated successfully.");
    setShowRemarkModal(false);
    setRemarkText("");
    setRemarkStatus("Assigned");
    
    // Refresh reports
    const refreshed = await axios.get("https://ccms-server.onrender.com/get-cccomplaint");
    setReports(Array.isArray(refreshed.data) ? refreshed.data : []);
  } catch (err) {
    toast.error("Failed to update remark/status");
    console.error(err);
  }
};

  return (
    <Container fluid className="py-4">
      <Form>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="filterStatus">
              <Form.Label>Ticket Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">--- select ---</option>
                <option value="Assigned">Assigned</option>
                <option value="Resolved">Resolved</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="filterStaff">
              <Form.Label>Assigned Staff</Form.Label>
              <Form.Select
                value={filters.assignedStaff}
                onChange={(e) => handleFilterChange("assignedStaff", e.target.value)}
              >
                <option value="">---- Select ----</option>
                {spocOptions.map((name, idx) => (
                  <option key={idx} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="filterDateFrom">
              <Form.Label>Assigned Date From</Form.Label>
              <Form.Control
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="filterDateTo">
              <Form.Label>Assigned Date To</Form.Label>
              <Form.Control
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="filterTicketNo">
              <Form.Label>Ticket No</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ticket No"
                value={filters.ticketNo}
                onChange={(e) => handleFilterChange("ticketNo", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Button variant="primary" className="mt-2 me-2">
              Search
            </Button>
            <Button
              variant="danger"
              className="mt-2 me-2"
              onClick={() =>
                setFilters({ status: "", assignedStaff: "", dateFrom: "", dateTo: "", ticketNo: "" })
              }
            >
              Clear
            </Button>
            <Button className='mt-2' variant="success" onClick={exportToExcel}>
              📥 Export to Excel
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Sl No</th>
            <th>Ticket No</th>
            <th>Inventory Details</th>
            <th>SPOC</th>
            <th>Ticket Status</th>
            <th>Complaint Reg Date</th>
            <th>Assigned Date</th>
            <th>Assigned Spoc</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleReports.map((item, idx) => (
            <tr key={item._id || idx}>
              <td>{idx + 1}</td>
              <td>{item.ticketNo}</td>
              <td>
                <div>JecDeviceId: {item.jeccid}</div>
                <div>Dept: {item.department}</div>
                <div>Room No: {item.room}</div>
              </td>
              <td>{getName(item.spoc)}</td>
              <td>{item.status}</td>
              <td>{item.complaintDate}</td>
              <td>{item.assignedDate}</td>
              <td>{getName(item.assignedSpoc)}</td>
              <td className="d-flex flex-column gap-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setSelectedReport(item);
                    setShowModal(true);
                  }}
                >
                  👁 View
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => {
                    setSelectedReport(item);
                    setRemarkStatus(item.status || "Assigned");
                    setRemarkText("");
                    setShowRemarkModal(true);
                  }}
                >
                  📝 Remarks
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Inventory Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inventory and Complaint Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Inventory Details</h5>
          {selectedReport ? (
            (() => {
              const matched = inventory.find((inv) => inv.jeccid === selectedReport.jeccid);
              return matched ? (
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Inventory ID:</strong> {matched._id}</td>
                      <td><strong>Device ID:</strong> {matched.jeccid}</td>
                    </tr>
                    <tr>
                      <td><strong>Brand:</strong> {matched.brand}</td>
                    </tr>
                    <tr>
                      <td><strong>AMC Expiry:</strong> {matched.amcexpdata}</td>
                      <td><strong>AMC Vendor:</strong> {matched.amcvendor}</td>
                    </tr>
                    <tr>
                      <td><strong>Department:</strong> {matched.department}</td>
                      <td><strong>Room:</strong> {matched.room}</td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong> {matched.locationid}</td>
                      <td><strong>OS:</strong> {matched.operatingsystems}</td>
                    </tr>
                    <tr>
                      <td><strong>Purchased On:</strong> {matched.purchasedon}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}><strong>Remarks:</strong> {matched.remarks || "None"}</td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No matching inventory found for this JEC Device ID.</p>
              );
            })()
          ) : (
            <p className="text-muted">No report selected.</p>
          )}

          {selectedReport && (
            <>
              <h5 className="mb-3">Complaint Details</h5>
              <Table bordered className="mb-3" size="sm">
                <tbody>
                  <tr>
                    <td><strong>Ticket No:</strong> {selectedReport.ticketNo}</td>
                    <td><strong>Status:</strong> {selectedReport.status}</td>
                  </tr>
                  <tr>
                    <td><strong>Complaint Reg Date:</strong> {selectedReport.complaintDate}</td>
                    <td><strong>Assigned Date:</strong> {selectedReport.assignedDate}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}><strong>Assigned SPOC:</strong> {getName(selectedReport.spoc)}</td>
                  </tr>
                  <tr>
                    <td><strong>Complaint Remark:</strong> {selectedReport.complaintremark}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remarks Modal */}
      <Modal show={showRemarkModal} onHide={() => setShowRemarkModal(false)} size="md">
  <Modal.Header closeButton>
    <Modal.Title>CC Assigned Complaint Remarks</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedReport && (
      <>
        <p><strong>Ticket Number:</strong> {selectedReport.ticketNo}</p>
        <Form.Group className="mb-3">
          <Form.Label>Complaint Status</Form.Label>
          <Form.Select
            value={remarkStatus}
            onChange={(e) => setRemarkStatus(e.target.value)}
          >
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>CC Remarks</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Enter your remarks here"
          />
        </Form.Group>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowRemarkModal(false)}>
      Close
    </Button>
    <Button
  variant="primary"
  onClick={handleSaveRemarks}
>
  Save Remarks
</Button>

  </Modal.Footer>

</Modal>
<ToastContainer position="top-right" autoClose={3000} />

    </Container>
  );
}

export default Ccassignedreports;
