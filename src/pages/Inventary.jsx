import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal, ToastContainer } from 'react-bootstrap';
import { addcomplaint, getproject, updatedataapi } from '../services/allapi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import DetailModal from '../components/DetailModal';
import axios from 'axios';
function Inventary() {
 // Authentication state
 const [userName, setUserName] = useState("");
const [userRole, setUserRole] = useState("");
const [authChecked, setAuthChecked] = useState(false);
 useEffect(() => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  if (loggedUser) {
    setUserName(loggedUser.name);
    setUserRole(loggedUser.role);
  }
  setAuthChecked(true);
}, []);




  const brandOptions = ['ACER POWER SERIES', 'ACER VERSION', 'INTEL NUC KIT', 'DELL/HCL UPGRADED PC S','ASSEMBLED','LENOVO THINK CENTRE EDGE 72','DELL OPTIPLEX 755','HCL PRO BL','HP COMPAQ DX2480','HP ELITE 7100 MT','HCL','HP ALL IN ONE','DELL T30','DELL OPTIPLEX 5060 MINI TOWER','DELL OPTIPLEX 3060 MONI TOWER','DELL OPTIPLEX 390','HP LAP 15-AC 122TU','TOSIBA SATELLITE','MSI NOTEBOOK','HP LAP 15-AC 184TU','HP LAP 15-BS576TX','ACER LAP N16C1 (AspireES1-572)','DELL LATITUDE 74002'];
const departmentOptions = ['Computer Centre', 'Research And Development', 'Office', 'TBI'];
const amcVendorOptions = ['HALCYON', 'ACCEL', 'ACER/PC CLINIC ','ARTECH','FRONTIER','HP','PC CLINIC','TELECOM','VERTEX','ZETA'];
const osOptions = ['Windows 10', 'Windows 7', 'Windows XP','Windows 8','Ubuntu 16','Ubuntu 18','JOSS','TCS ion'];
const [spocOptions, setSpocOptions] = useState([]);


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

// ticket
const generateTicketNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20250508
  const randomPart = Math.floor(1000 + Math.random() * 9000); // e.g. 4-digit random number
  return `TKT-${datePart}-${randomPart}`; // e.g. "TKT-20250508-4381"
};




const [showComplaintModal, setShowComplaintModal] = useState(false);
const [ritem, setRitem] = useState(null);

const handleEscalate = (item) => {
 setRitem(item);
  setShowComplaintModal(true);
};
console.log(ritem);

//data esclate
const [complaint, setComplaint] = useState({ status: '', remarks: '' });


// const handleRegisterComplaint = () => {
//   if (!ritem) return;

//   const complaintData = {
//     jeccid: ritem.jeccid,
//     cpusino: ritem.cpusino,
//     monitorsino: ritem.monitorsino,
//     keyboardsino: ritem.keyboardsino,
//     mousesino: ritem.mousesino,
//     printersino: ritem.printersino || null,
//     complaintstatus: complaint.status,
//     complaintremark: complaint.remarks,
//     complaintDate: new Date().toISOString()
//   };

//   console.log("Final Complaint Data:", complaintData);

//   // TODO: Send complaintData to your API or backend here

//   // Reset state after submission
//   setComplaint({ status: '', remarks: '' });
//   setRitem(null);
//   setShowComplaintModal(false);
// };
const handleRegisterComplaint = async () => {
  if (!ritem) return;

  if (!complaint.status || !complaint.remarks.trim()) {
    toast.info('Please fill in all required fields.');
    return;
  }
  const ticketNo = generateTicketNo();
  const date = new Date();
  const formattedComplaintDate = `${String(date.getDate()).padStart(2, '0')}/${
    String(date.getMonth() + 1).padStart(2, '0')}/${
    date.getFullYear()
  }`;
  console.log(formattedComplaintDate); // e.g. "09/05/2025"
  
  
  const complaintData = {
    jeccid: ritem.jeccid,
    cpusino: ritem.cpusino,
    monitorsino: ritem.monitorsino,
    keyboardsino: ritem.keyboardsino,
    mousesino: ritem.mousesino,
    department:ritem.department,
    room:ritem.room,
    printersino: ritem.printersino || null,
    complaintstatus: complaint.status,
    complaintremark: complaint.remarks,
    complaintDate: formattedComplaintDate,
    spoc:ritem.spoc,
    ticketNo,
    status: 'Pending'
    
  };
  

  try {
    const response = await addcomplaint(complaintData);
    if (response.status >= 200 && response.status < 300) {
      toast.success('Complaint registered successfully!');
      setComplaint({ status: '', remarks: '' });
      setRitem(null);
      setShowComplaintModal(false);
    } else {
      toast.warning('Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error('Complaint submission error:', error);
    toast.error('Server error. Could not register complaint.');
  }
};

console.log(complaint);

// details page
const [showDetailModal, setShowDetailModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
const [editItem, setEditItem] = useState({});
  const [filters, setFilters] = useState({
    department: '',
    spoc: '',
    brand: '',
    vendor: '',
    status: '',
    qr: '',
    os: ''

  });

  const getdatainventary = async () => {
    try {
      const result = await getproject();
      if (result?.data) {
        if (userRole === 'admin') {
          setData(result.data); // Admin: all data
        } else {
          const filteredData = result.data.filter(item => item.spoc === userName); // Normal user: only own SPOC data
          setData(filteredData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    }
  };
  
  

  useEffect(() => {
    if (authChecked) {
      getdatainventary();
    }
  }, [authChecked, userName, userRole]);
  

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };


  const filteredData = data.filter(item => {
    
    const match = (field, value) => {
      if (!value) return true;
      const text = String(item[field] ?? '').toLowerCase();
      return text.includes(value.toLowerCase());
    };
  
    return (
      match('department',       filters.department)  &&
      match('spoc',             filters.spoc)        &&
      match('brand',            filters.brand)       &&
      match('amcvendor',        filters.vendor)      &&
      match('status',           filters.status)      &&
      match('jeccid',           filters.qr)          &&
      match('operatingsystems', filters.os)
      // remove or initialize `filters.approved` if needed
    );
  });
  




  
// excel 
const exportToExcel = () => {
  const exportData = filteredData.map((item, index) => ({
    'Sl No': index + 1,
    'Brand': item.brand,
    'JEC Device Id': item.jeccid,
    'Room No': item.room,
    'Location': item.locationid,
    'Department': item.department,
    'SPOC': item.spoc,
    'Vendor': item.amcvendor,
    'AMC Expiry': item.amcexpdata,
    'Status': item.status,
    'Operating System': item.operatingsystems,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, 'IT_Hardware_Inventory.xlsx');
};

// edit
const handleUpdate = async () => {
  try {
    if (!editItem || !editItem._id) {
      console.error('Invalid item data');
      return;
    }

    const response = await updatedataapi(editItem._id, editItem);

    if (response.status === 200) {
      // Refresh the inventory list
      await getdatainventary();

      // Close the modal
      setShowEditModal(false);
    } else {
      console.error('Failed to update item:', response);
    }
  } catch (error) {
    console.error('Error updating item:', error);
  }
};


  return (
    <div>
      <Container fluid>
        <h5 className="mb-4">IT Hardware Inventory Report</h5>
        <Form>
          <Row className="mb-3">
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="">--- select ---</option>
                  <option>TBI</option>
                  <option>Office</option>
                  <option>Research And Development</option>
                  <option>Computer Centre</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
            <Form.Group>
  <Form.Label>SPOC</Form.Label>
  <Form.Select
    value={filters.spoc}
    onChange={(e) => handleFilterChange('spoc', e.target.value)}
  >
    <option value="">----Select----</option>
    {spocOptions.map((spoc, index) => (
      <option key={index} value={spoc.name}>
        {spoc.name}
      </option>
    ))}
  </Form.Select>
</Form.Group>

            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">--- select ---</option>
                  <option >ACER POWER SERIES</option>
                  <option >ACER VERSION</option>
                  <option >DELL/HCL UPGRADED PC'S</option>
                  <option >ASSEMBLED</option>
                  <option >LENOVO THINK CENTRE EDGE 72</option>
                  <option >DELL OPTIPLEX 755</option>
                  <option >HCL PRO BL</option>
                  <option >ASUS</option>
                  <option>ACER VERITON</option>
                  <option >HP COMPAQ DX2480</option>
                  <option >HP ELITE 7100 MT</option>
                  <option >INTEL NUC KIT</option>
                  <option >HCL</option>
                  <option >HP ALL IN ONE</option>
                  <option >DELL T30</option>
                  <option >DELL OPTIPLEX 5060 MINI TOWER</option>
                  <option >DELL OPTIPLEX 3060 MONI TOWER</option>
                  <option >DELL OPTIPLEX 390</option>
                  <option >HP LAP 15-AC 122TU</option>
                  <option >TOSIBA SATELLITE</option>
                  <option >MSI NOTEBOOK</option>
                  <option >HP LAP 15-AC 184TU</option>
                  <option >HP LAP 15-BS576TX</option>
                  <option >ACER LAP N16C1 (AspireES1-572)</option>
                  <option >DELL LATITUDE 74002</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>Vendor</Form.Label>
                <Form.Select
                  value={filters.vendor}
                  onChange={(e) => handleFilterChange('vendor', e.target.value)}
                >
                  <option value="">--- select ---</option>
                  <option >ACCEL</option>
                  <option >ACER/PC CLINIC</option>
                  <option >ARTECH</option>
                  <option >FRONTIER</option>
                  <option >HALCYON</option>
                  <option >HP</option>
                  <option >PC CLINIC</option>
                  <option >TELECOM</option>
                  <option >VERTEX</option>
                  <option >ZETA</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">--- select ---</option>
                  <option >Working</option>
                  <option >Not Working</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>QR Code</Form.Label>
                <Form.Control
                  type="text"
                  value={filters.qr}
                  placeholder="Enter QR code"
                  onChange={(e) => handleFilterChange('qr', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label>Operating System</Form.Label>
                <Form.Select
                  value={filters.os}
                  onChange={(e) => handleFilterChange('os', e.target.value)}
                >
                  <option value="">--- select ---</option>
                  <option >Windows XP</option>
                  <option >Windows 7</option>
                  <option >Windows 8</option>
                  <option >Windows 10</option>
                  <option >Ubuntu 16</option>
                  <option >Ubuntu 18</option>
                  <option >JOSS</option>
                  <option >TCS ion</option>
                </Form.Select>
              </Form.Group>
            </Col>
           
          </Row>
          <Row className="mb-3">
  <Col>
    <Button className='mt-2' variant="primary" onClick={getdatainventary}>Search</Button>{' '}
    <Button
    className='mt-2'
      variant="danger"
      onClick={() => {
        setFilters({
          department: '',
          spoc: '',
          brand: '',
          vendor: '',
          status: '',
          qr: '',
          os: '',
          approved: ''
        });
      }}
    >
      Clear
    </Button>{' '}
    <Button className='mt-2' variant="success" onClick={exportToExcel}>
      ⬇️ Export to Excel
    </Button>
  </Col>
</Row>

        </Form>
      </Container>

      <div className="p-3">
        <Row className="align-items-center mb-3">
          <Col xs={12} md={6}>
            <span>Show</span>
            <Form.Select size="sm" className="d-inline-block w-auto ms-2">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </Form.Select>
            <span className="ms-2">entries</span>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
          
          </Col>
        </Row>

        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Brand</th>
              <th>Details</th>
              <th>Department</th>
              <th>SPOC</th>
              <th>Vendor</th>
              <th>AMC Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item?.brand}</td>
                <td>
                  {item?.jeccid} <br />
                  Room No: {item?.room} <br />
                  Location: {item?.locationid}
                </td>
                <td>{item?.department}</td>
                <td>{item?.spoc}</td>
                <td>{item?.amcvendor}</td>
                <td>{item?.amcexpdata}</td>
                <td>{item?.status}</td>
                <td className="d-flex flex-column gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowModal(true);
                    }}
                  >
                    🔍 View
                  </Button>
                  <Button
  variant="outline-success"
  size="sm"
  onClick={() => {
    setEditItem(item);
    setShowEditModal(true);
  }}
>
  ✏️ Edit
</Button>

                  <Button  onClick={() => handleEscalate(item)} variant="outline-danger" size="sm">⚠️ Escalate</Button>
                  <Button variant="info" size="sm" onClick={() => {
  setSelectedItem(item);
  setShowDetailModal(true);
}}>
  Details
</Button>
                </td>
              </tr>
            ))}
          </tbody>
   
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>IT Hardware Inventory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Table bordered>
              <tbody>
                <tr>
                  <td><strong>JEC Device Id:</strong> {selectedItem.jeccid}</td>
                  <td><strong>CPU SI No:</strong> {selectedItem.cpusino}</td>
                </tr>
                <tr>
                  <td><strong>Monitor SI No:</strong> {selectedItem.monitorsino}</td>
                  <td><strong>Keyboard SI No:</strong> {selectedItem.keyboardsino}</td>
                </tr>
                <tr>
                  <td><strong>Mouse SI No:</strong> {selectedItem.mousesino}</td>
                  <td><strong>Printer SI No:</strong> {selectedItem.printersino || '-'}</td>
                </tr>
                <tr>
                  <td><strong>Brand:</strong> {selectedItem.brand}</td>
                  <td><strong>Room:</strong> {selectedItem.room}</td>
                </tr>
                <tr>
                  <td><strong>Location:</strong> {selectedItem.locationid}</td>
                  <td><strong>Department:</strong> {selectedItem.department}</td>
                </tr>
                <tr>
                  <td><strong>SPOC:</strong> {selectedItem.spoc}</td>
                  <td><strong>Status:</strong> {selectedItem.status}</td>
                </tr>
                <tr>
                  <td><strong>Purchased On:</strong> {selectedItem.purchasedon}</td>
                  <td><strong>AMC Expiry:</strong> {selectedItem.amcexpdata}</td>
                </tr>
                <tr>
                  <td><strong>AMC Vendor:</strong> {selectedItem.amcvendor}</td>
                </tr>
                <tr>
                  <td colSpan={2}><strong>Operating Systems:</strong> {selectedItem.operatingsystems || ''}</td>
                </tr>
                <tr>
                  <td colSpan={2}><strong>Remarks:</strong> {selectedItem.remarks || ''}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div>
{/* edit */}

<Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Edit Inventory Item</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {editItem && (
      <Form>
        <Row>
          <Col md={6}>
          <Form.Group>
  <Form.Label>Brand</Form.Label>
  <Form.Select
    value={editItem.brand || ''}
    onChange={(e) => setEditItem({ ...editItem, brand: e.target.value })}
  >
    <option value="">Select Brand</option>
    {brandOptions.map((brand, idx) => (
      <option key={idx} value={brand}>{brand}</option>
    ))}
  </Form.Select>
</Form.Group>

          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={editItem.status || ''}
                onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
              >
                <option>Working</option>
                <option>Not Working</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
          <Form.Group>
  <Form.Label>Department</Form.Label>
  <Form.Select
    value={editItem.department || ''}
    onChange={(e) => setEditItem({ ...editItem, department: e.target.value })}
  >
    <option value="">Select Department</option>
    {departmentOptions.map((dept, idx) => (
      <option key={idx} value={dept}>{dept}</option>
    ))}
  </Form.Select>
</Form.Group>

          </Col>
          <Col md={6}>
          <Form.Group>
  <Form.Label>SPOC</Form.Label>
  <Form.Select
    value={editItem.spoc || ''}
    onChange={(e) => setEditItem({ ...editItem, spoc: e.target.value })}
  >
  <option value="">----Select----</option>
  {spocOptions.map((spoc, index) => (
    <option key={index} value={spoc.name}>
      {spoc.name}
    </option>
    ))}
  </Form.Select>
</Form.Group>

          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Room</Form.Label>
              <Form.Control
                type="text"
                value={editItem.room || ''}
                onChange={(e) => setEditItem({ ...editItem, room: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={editItem.locationid || ''}
                onChange={(e) => setEditItem({ ...editItem, locationid: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>JEC Device ID</Form.Label>
              <Form.Control
                type="text"
                value={editItem.jeccid || ''}
                onChange={(e) => setEditItem({ ...editItem, jeccid: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
          <Form.Group>
  <Form.Label>Operating Systems</Form.Label>
  <Form.Select
    value={editItem.operatingsystems || ''}
    onChange={(e) => setEditItem({ ...editItem, operatingsystems: e.target.value })}
  >
    <option value="">--- select ---</option>
    {osOptions.map((os, idx) => (
      <option key={idx} value={os}>{os}</option>
    ))}
  </Form.Select>
</Form.Group>

          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>CPU SI No</Form.Label>
              <Form.Control
                type="text"
                value={editItem.cpusino || ''}
                onChange={(e) => setEditItem({ ...editItem, cpusino: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Monitor SI No</Form.Label>
              <Form.Control
                type="text"
                value={editItem.monitorsino || ''}
                onChange={(e) => setEditItem({ ...editItem, monitorsino: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Keyboard SI No</Form.Label>
              <Form.Control
                type="text"
                value={editItem.keyboardsino || ''}
                onChange={(e) => setEditItem({ ...editItem, keyboardsino: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Mouse SI No</Form.Label>
              <Form.Control
                type="text"
                value={editItem.mousesino || ''}
                onChange={(e) => setEditItem({ ...editItem, mousesino: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Printer SI No</Form.Label>
              <Form.Control
                type="text"
                value={editItem.printersino || ''}
                onChange={(e) => setEditItem({ ...editItem, printersino: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
          <Form.Group>
  <Form.Label>AMC Vendor</Form.Label>
  <Form.Select
    value={editItem.amcvendor || ''}
    onChange={(e) => setEditItem({ ...editItem, amcvendor: e.target.value })}
  >
    <option value="">Select Vendor</option>
    {amcVendorOptions.map((vendor, idx) => (
      <option key={idx} value={vendor}>{vendor}</option>
    ))}
  </Form.Select>
</Form.Group>

          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Purchase Date</Form.Label>
              <Form.Control
                type="date"
                value={editItem.purchasedon || ''}
                onChange={(e) => setEditItem({ ...editItem, purchasedon: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>AMC Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={editItem.amcexpdata || ''}
                onChange={(e) => setEditItem({ ...editItem, amcexpdata: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Remarks</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={editItem.remarks || ''}
            onChange={(e) => setEditItem({ ...editItem, remarks: e.target.value })}
          />
        </Form.Group>
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="success" onClick={handleUpdate}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


      </div>
      <div>
        {/* esclate modal */}
        <Modal show={showComplaintModal} onHide={() => setShowComplaintModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Complaint Registration</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {ritem && (
      <>
        <Row>
          <Col><strong>JEC Device Id:</strong> {ritem.jeccid}</Col>
          <Col><strong>CPU SI No:</strong> {ritem.cpusino}</Col>
        </Row>
        <Row>
          <Col><strong>Monitor SI No:</strong> {ritem.monitorsino}</Col>
          <Col><strong>Keyboard SI No:</strong> {ritem.keyboardsino}</Col>
        </Row>
        <Row>
          <Col><strong>Mouse SI No:</strong> {ritem.mousesino}</Col>
          <Col><strong>Printer SI No:</strong> {ritem.printersino || '-'}</Col>
        </Row>
        <Row>
          <Col><strong>Spoc :</strong> {ritem.spoc}</Col>
          <Col><strong>Room :</strong> {ritem.room}</Col>

        </Row>
<Row>
<Col><strong>Department :</strong> {ritem.department}</Col>

</Row>
        <Form.Group className="mt-3">
          <Form.Label>Inventory Status during Complaint Registration:</Form.Label>
          <Form.Select
            value={complaint.status}
            onChange={(e) => setComplaint({ ...complaint, status: e.target.value })}
          >
            <option value="">Select status</option>
            <option value="Working">Working</option>
            <option value="Not Working">Not Working</option>
            <option value="Damaged">Damaged</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-2">
          <Form.Label>Remarks on Complaint:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={complaint.remarks}
            onChange={(e) => setComplaint({ ...complaint, remarks: e.target.value })}
          />
        </Form.Group>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowComplaintModal(false)}>Close</Button>
    <Button variant="primary"  onClick={handleRegisterComplaint}>Register Complaint</Button>
  </Modal.Footer>
</Modal>

<ToastContainer
        position="top-right"
        autoClose={2000}
     
        theme="colored"
      />
      </div>
      <div>
{selectedItem && (
  <DetailModal
    show={showDetailModal}
    handleClose={() => setShowDetailModal(false)}
    item={selectedItem}
  />
)}
      </div>
    </div>
  );
}

export default Inventary;
