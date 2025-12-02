import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://ccms-server.onrender.com";

function DeleteHardwareBySpoc() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSpoc, setSelectedSpoc] = useState("");
  const [singleJeccId, setSingleJeccId] = useState("");

  // ---------------------------------------------
  // Fetch hardware list
  // ---------------------------------------------
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-data`);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load hardware list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------
  // Unique SPOC List
  // ---------------------------------------------
  const spocList = [...new Set(data.map((item) => item.spoc))];

  // ---------------------------------------------
  // Filtered Data
  // ---------------------------------------------
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        item.jeccid?.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.locationid?.toLowerCase().includes(q) ||
        item.spoc?.toLowerCase().includes(q);

      const matchSpoc = selectedSpoc ? item.spoc === selectedSpoc : true;

      return matchSearch && matchSpoc;
    });
  }, [data, search, selectedSpoc]);

  // ---------------------------------------------
  // Delete All by SPOC
  // ---------------------------------------------
  const deleteAllBySpoc = async () => {
    if (!selectedSpoc) return toast.warning("Select a SPOC");

    if (!window.confirm(`Delete ALL hardware under ${selectedSpoc}?`)) return;

    try {
      await axios.delete(`${API_URL}/hardware/delete-by-spoc/${selectedSpoc}`);
      toast.success("All hardware deleted for this SPOC");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ---------------------------------------------
  // Delete One Record
  // ---------------------------------------------
  const deleteOne = async () => {
    if (!selectedSpoc || !singleJeccId) {
      return toast.warning("Select SPOC & enter JECC ID");
    }

    try {
      await axios.delete(`${API_URL}/hardware/delete-one`, {
        params: { spoc: selectedSpoc, jeccid: singleJeccId },
      });
      toast.success("One hardware deleted successfully");
      setSingleJeccId("");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ---------------------------------------------
  // Bulk Delete by SPOC
  // ---------------------------------------------
  const bulkDelete = async () => {
    if (!selectedSpoc) return toast.warning("Select a SPOC first");

    if (!window.confirm(`Delete ALL items under ${selectedSpoc}?`)) return;

    try {
      await axios.post(`${API_URL}/hardware/delete-spoc-bulk`, {
        spoc: selectedSpoc,
      });
      toast.success("Bulk delete completed");
      fetchData();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={1500} />

      <h3 className="fw-bold text-primary mb-4">
        Hardware Delete – Based on SPOC
      </h3>

      {/* SPOC Select + Delete Buttons */}
      <Row className="mb-4 filter-row">
        <Col xs={12} md={3} className="stack-mobile">
          <Form.Select
            value={selectedSpoc}
            onChange={(e) => setSelectedSpoc(e.target.value)}
          >
            <option value="">Select SPOC</option>
            {spocList.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} md={3} className="stack-mobile">
          <Button
            variant="danger"
            className="w-100"
            disabled={!selectedSpoc}
            onClick={deleteAllBySpoc}
          >
            Delete ALL of this SPOC
          </Button>
        </Col>

        <Col xs={12} md={3}>
          <Button
            variant="warning"
            className="w-100"
            disabled={!selectedSpoc}
            onClick={bulkDelete}
          >
            Bulk Delete SPOC
          </Button>
        </Col>
      </Row>

      {/* Delete ONE */}
      <Row className="mb-3">
        <Col xs={12} md={3} className="stack-mobile">
          <Form.Control
            type="text"
            placeholder="Enter JECC ID"
            value={singleJeccId}
            onChange={(e) => setSingleJeccId(e.target.value)}
          />
        </Col>

        <Col xs={12} md={3}>
          <Button
            className="w-100"
            variant="outline-danger"
            disabled={!selectedSpoc || !singleJeccId}
            onClick={deleteOne}
          >
            Delete One Record
          </Button>
        </Col>
      </Row>

      {/* Search */}
      <Row className="mb-3 filter-row">
        <Col xs={12} md={4}>
          <Form.Control
            type="text"
            placeholder="Search JECC / Dept / Brand / SPOC / Location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p>Loading hardware...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <Table bordered hover>
            <thead className="table-dark">
              <tr>
                <th>JECC ID</th>
                <th>CPU</th>
                <th>Monitor</th>
                <th>Keyboard</th>
                <th>Mouse</th>
                <th>Brand</th>
                <th>Dept</th>
                <th>Room</th>
                <th>SPOC</th>
                <th>Status</th>
                <th>AMC</th>
                <th>Vendor</th>
                <th>Location</th>
                <th>Purchased</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="14" className="text-center">
                    No matching results
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id}>
                    <td>{item.jeccid}</td>
                    <td>{item.cpusino}</td>
                    <td>{item.monitorsino}</td>
                    <td>{item.keyboardsino}</td>
                    <td>{item.mousesino}</td>
                    <td>{item.brand}</td>
                    <td>{item.department}</td>
                    <td>{item.room}</td>
                    <td>{item.spoc}</td>
                    <td>{item.status}</td>
                    <td>{item.amcexpdata}</td>
                    <td>{item.amcvendor}</td>
                    <td>{item.locationid}</td>
                    <td>{item.purchasedon}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default DeleteHardwareBySpoc;
