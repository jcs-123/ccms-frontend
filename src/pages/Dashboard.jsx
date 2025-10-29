import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Spinner, Alert, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { getproject } from '../services/allapi'; // Assuming this is your API service

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  const COLORS = ['#50bfff', '#ff809f', '#ffdd75', '#a0d911', '#722ed1', '#fa8c16'];

  useEffect(() => {
    // Get user info from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    if (loggedUser) {
      setUserRole(loggedUser.role);
      setUserName(loggedUser.name);
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await getproject();
      
      if (!result?.data) {
        throw new Error('No data received from API');
      }

      const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
      let filteredData = result.data;

      // Filter data based on user role
      if (loggedUser && loggedUser.role !== 'admin') {
        filteredData = result.data.filter(item => 
          item.spoc && item.spoc.toLowerCase() === loggedUser.name.toLowerCase()
        );
      }

      processDashboardData(filteredData, result.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (filteredData, allData = null) => {
    // Calculate statistics
    const totalComputers = filteredData.length;
    const workingComputers = filteredData.filter(item => item.status === 'Working').length;
    const nonWorkingComputers = filteredData.filter(item => item.status === 'Not Working').length;

    // Purchase date analysis
    const purchasedBefore2014 = filteredData.filter(item => {
      if (!item.purchasedon) return false;
      const purchaseDate = new Date(item.purchasedon);
      return purchaseDate < new Date('2014-01-01');
    }).length;

    const purchasedAfter2014 = filteredData.filter(item => {
      if (!item.purchasedon) return false;
      const purchaseDate = new Date(item.purchasedon);
      return purchaseDate >= new Date('2014-01-01');
    }).length;

    const withoutPurchaseDate = filteredData.filter(item => !item.purchasedon).length;

    // AMC expiry analysis (group by month-year)
    const amcExpiryMap = {};
    filteredData.forEach(item => {
      if (item.amcexpdata) {
        try {
          const expiryDate = new Date(item.amcexpdata);
          const monthYear = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}`;
          amcExpiryMap[monthYear] = (amcExpiryMap[monthYear] || 0) + 1;
        } catch (e) {
          console.error('Invalid AMC date:', item.amcexpdata);
        }
      }
    });

    const amcExpiryData = Object.entries(amcExpiryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Department distribution
    const departmentDistribution = {};
    filteredData.forEach(item => {
      const dept = item.department || 'Unknown';
      departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
    });

    const departmentData = Object.entries(departmentDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 departments

    // Brand distribution
    const brandDistribution = {};
    filteredData.forEach(item => {
      const brand = item.brand || 'Unknown';
      brandDistribution[brand] = (brandDistribution[brand] || 0) + 1;
    });

    const brandData = Object.entries(brandDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 brands

    // System status data for pie chart
    const systemStatusData = [
      { name: 'Working', value: workingComputers },
      { name: 'Not Working', value: nonWorkingComputers },
      { name: 'Unknown', value: totalComputers - workingComputers - nonWorkingComputers }
    ].filter(item => item.value > 0);

    const dashboardResult = {
      totalComputers,
      workingComputers,
      nonWorkingComputers,
      purchasedBefore2014,
      purchasedAfter2014,
      withoutPurchaseDate,
      amcExpiryData,
      departmentData,
      brandData,
      systemStatusData,
      userView: userRole === 'admin' ? 'All Data' : `${userName}'s Data`,
      dataSource: filteredData
    };

    // Add admin-only statistics if user is admin
    if (userRole === 'admin' && allData) {
      const totalAllComputers = allData.length;
      const spocDistribution = {};
      allData.forEach(item => {
        const spoc = item.spoc || 'Unknown';
        spocDistribution[spoc] = (spocDistribution[spoc] || 0) + 1;
      });

      dashboardResult.adminStats = {
        totalAllComputers,
        spocDistribution: Object.entries(spocDistribution)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      };
    }

    setDashboardData(dashboardResult);
  };

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
          <Button variant="primary" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant="warning">No data available</Alert>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h4 className="text-dark fw-bold">IT Hardware Dashboard</h4>
          <p className="text-muted">
            {userRole === 'admin' ? 'Administrator View - All Data' : `SPOC View - ${userName}'s Inventory`}
          </p>
          <p className="text-muted small">
            Showing: {dashboardData.userView} | Total Computers: {dashboardData.totalComputers}
          </p>
        </Col>
      </Row>

      <Row className="gy-4">
        {/* Summary Cards */}
        <Col lg={3} md={6}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title className="text-primary fs-1">{dashboardData.totalComputers}</Card.Title>
              <Card.Text>Total Computers</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title className="text-success fs-1">{dashboardData.workingComputers}</Card.Title>
              <Card.Text>Working Systems</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title className="text-danger fs-1">{dashboardData.nonWorkingComputers}</Card.Title>
              <Card.Text>Not Working</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title className="text-warning fs-1">{dashboardData.withoutPurchaseDate}</Card.Title>
              <Card.Text>No Purchase Date</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* System Status Pie Chart */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">System Status Distribution</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.systemStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.systemStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} computers`]} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Department Distribution */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">Department Distribution</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} computers`]} />
                  <Bar dataKey="value" fill="#50bfff" name="Computers" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* AMC Expiry Trend */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">AMC Expiry Trend</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.amcExpiryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} computers`]} />
                  <Line type="monotone" dataKey="count" stroke="#ff809f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Brand Distribution */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">Top Brands</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.brandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} computers`]} />
                  <Bar dataKey="value" fill="#ffdd75" name="Computers" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Admin-only SPOC Distribution */}
        {userRole === 'admin' && dashboardData.adminStats && (
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title className="text-primary">SPOC Distribution (Admin View)</Card.Title>
                <p className="text-muted">Total Systems: {dashboardData.adminStats.totalAllComputers}</p>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dashboardData.adminStats.spocDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} computers`]} />
                    <Bar dataKey="value" fill="#722ed1" name="Computers" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Refresh Button */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="primary" onClick={fetchDashboardData}>
            Refresh Data
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;