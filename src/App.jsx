import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventary from './pages/Inventary';
import Sidebar from './components/Sidebar';
import Addithardware from './pages/Addithardware';
import Ithardwarecomplaintreport from './pages/Ithardwarecomplaintreport';
import AddSpoc from './pages/AddSpoc';
import Login from './pages/Login';
import Ccassignedreports from './pages/Ccassignedreports';

function App() {
  const location = useLocation();

  return (
    <>
      {/* Only render Header and Sidebar if the route is not '/Login' */}
      {location.pathname !== '/Login' && <Header />}

      {/* Apply the main layout only for non-login pages */}
      {location.pathname !== '/Login' ? (
        <div className="main-layout">
          {/* Only render Sidebar if the route is not '/Login' */}
          <Sidebar />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventary" element={<Inventary />} />
              <Route path="/addhardware" element={<Addithardware />} />
              <Route path="/ithardwarecomplaintreport" element={<Ithardwarecomplaintreport />} />
              <Route path="/Addspoc" element={<AddSpoc />} />
              <Route path="/Assignedreport" element={<Ccassignedreports/>} />

            </Routes>
          </div>
        </div>
      ) : (
        // For the Login page, just render the login form without the layout
        <Routes>
          <Route path="/Login" element={<Login />} />
        </Routes>
      )}
    </>
  );
}

export default App;
