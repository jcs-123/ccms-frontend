import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FaRegBuilding } from 'react-icons/fa';
import { BiChevronRight, BiChevronDown } from 'react-icons/bi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // toggler state

  const user = JSON.parse(localStorage.getItem('loggedUser'));
  const role = user?.role;

  return (
    <>
      {/* Top toggler bar for mobile */}
      <div className="bg-light p-2 d-md-none d-flex justify-content-between align-items-center shadow-sm">
        <h5 className="m-0">Menu</h5>
        <GiHamburgerMenu
          size={24}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Sidebar overlay for small screens */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 bg-white shadow-lg h-100 p-3"
          style={{ zIndex: 1040, width: '220px' }} // ↓ Reduced from 260px to 220px
        >
          {/* Close Button */}
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSidebarOpen(false)}>X</button>
          </div>
          <SidebarContent
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            role={role}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar for desktop */}
      <div
        className="d-none d-md-block bg-white p-3 shadow-lg"
        style={{ minHeight: '100vh', width: '260px', position: 'fixed' }}
      >
        <SidebarContent
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          role={role}
        />
      </div>
    </>
  );
}

function SidebarContent({ dropdownOpen, setDropdownOpen, role, closeSidebar }) {
  return (
    <Nav className="flex-column gap-2">
      {/* Dashboard Link */}
      <Nav.Link
        as={Link}
        to="/"
        className="d-flex align-items-center gap-3 px-3 py-2 rounded sidebar-item"
        onClick={closeSidebar}
      >
        <AiOutlineDashboard size={18} />
        <span className="fw-bold">Dashboard</span>
      </Nav.Link>

      {(role === 'admin' || role === 'spoc') && (
        <>
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2 rounded sidebar-item"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-3">
              <FaRegBuilding size={18} />
              <span className="fw-bold">Computer Center Management</span>
            </div>
            {dropdownOpen ? <BiChevronDown size={22} /> : <BiChevronRight size={22} />}
          </div>

          {dropdownOpen && (
            <div className="d-flex flex-column ms-4 mt-2">
              <Nav.Link as={Link} to="/inventary" className="px-3 py-2 rounded dropdown-item" onClick={closeSidebar}>
                ➤ Inventory Report
              </Nav.Link>

              {role === 'admin' && (
                <>
                  <Nav.Link as={Link} to="/addhardware" className="px-3 py-2 rounded dropdown-item" onClick={closeSidebar}>
                    ➤ Add IT Hardware
                  </Nav.Link>
                  <Nav.Link as={Link} to="/ithardwarecomplaintreport" className="px-3 py-2 rounded dropdown-item" onClick={closeSidebar}>
                    ➤ IT Complaint Report
                  </Nav.Link>
                  <Nav.Link as={Link} to="/Addspoc" className="px-3 py-2 rounded dropdown-item" onClick={closeSidebar}>
                    ➤ Add Spoc
                  </Nav.Link>
                </>
              )}

              <Nav.Link as={Link} to="/Assignedreport" className="px-3 py-2 rounded dropdown-item" onClick={closeSidebar}>
                ➤ CC Assigned Reports
              </Nav.Link>
            </div>
          )}
        </>
      )}
    </Nav>
  );
}

export default Sidebar;
