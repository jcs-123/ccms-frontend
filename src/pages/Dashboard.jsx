import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { Spinner, Alert, Button, Container, Row, Col, Card } from 'react-bootstrap';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  const COLORS = ['#50bfff', '#ff809f', '#ffdd75'];

  useEffect(() => {
    const mockData = {
      totalComputers: 100,
      workingComputers: 75,
      nonWorkingComputers: 25,
      purchasedBefore2014: 30,
      purchasedAfter2014: 50,
      withoutPurchaseDate: 20,
      amcExpiryData: [
        { name: '2023-12', count: 10 },
        { name: '2024-01', count: 5 },
        { name: '2024-06', count: 20 },
        { name: '2025-01', count: 15 },
        { name: '2025-05', count: 30 }
      ]
    };

    setTimeout(() => {
      setDashboardData(mockData);
      setLoading(false);
    }, 100);
  }, []);

  const totalComputersData = dashboardData ? [
    { name: 'Working', value: dashboardData.workingComputers },
    { name: 'Not Working', value: dashboardData.nonWorkingComputers },
  ] : [];

  const purchaseDateData = dashboardData ? [
    { name: 'Before 1st Jan 2014', value: dashboardData.purchasedBefore2014 },
    { name: 'On or After 1st Jan 2014', value: dashboardData.purchasedAfter2014 },
    { name: 'Without Purchase Date', value: dashboardData.withoutPurchaseDate },
  ] : [];

  const amcExpiryData = dashboardData ? dashboardData.amcExpiryData : [];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <h4 className="mb-4 text-dark fw-bold">Welcome to the Dashboard</h4>
      <Row className="gy-4">
        {/* Pie Charts Column */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">Total Computers: {dashboardData.totalComputers}</Card.Title>
              <PieChart width={250} height={250}>
                <Pie
                  data={totalComputersData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {totalComputersData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} computers`]} />
              </PieChart>
              <div className="small mt-2">
                <span className="me-3" style={{ color: '#ff809f' }}>■ Not Working</span>
                <span style={{ color: '#50bfff' }}>■ Working</span>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">Count Based on Purchase Date</Card.Title>
              <PieChart width={250} height={250}>
                <Pie
                  data={purchaseDateData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {purchaseDateData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} computers`]} />
              </PieChart>
              <div className="small mt-2">
                <span className="me-3" style={{ color: '#ff809f' }}>■ Before 2014</span>
                <span className="me-3" style={{ color: '#50bfff' }}>■ After 2014</span>
                <span style={{ color: '#ffdd75' }}>■ No Date</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Line Chart Column */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">AMC Expiry Trend</Card.Title>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={amcExpiryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} computers`]} labelFormatter={(label) => `AMC Expiry: ${label}`} />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Computer Count" stroke="#ff809f" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
