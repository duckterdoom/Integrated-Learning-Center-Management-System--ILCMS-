import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminHomePage from './pages/AdminHomePage';
import StaffHomePage from './pages/StaffHomePage';
import SalerHomePage from './pages/SalerHomePage';
import ManageAccountPage from './pages/ManageAccountPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/manage-account" element={<ManageAccountPage />} />
        <Route path="/staff" element={<StaffHomePage />} />
        <Route path="/saler" element={<SalerHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
