import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
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
import DeleteHardwareList from './pages/DeleteHardwareList';

function App() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('loggedUser'));
  const isLoginPage = location.pathname === '/Login';

  return (
    <>
      {!isLoginPage && user && <Header />}

      {!isLoginPage && user ? (
        <div className="main-layout">
          <Sidebar />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventary" element={<Inventary />} />
              <Route path="/addhardware" element={<Addithardware />} />
              <Route path="/ithardwarecomplaintreport" element={<Ithardwarecomplaintreport />} />
              <Route path="/Addspoc" element={<AddSpoc />} />
              <Route path="/Assignedreport" element={<Ccassignedreports />} />
                            <Route path="/Delete" element={<DeleteHardwareList/>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/Login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      )}
    </>
  );
}

export default App;
