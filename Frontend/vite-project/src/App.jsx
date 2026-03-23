import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import StaffHomePage from './pages/staff/StaffHomePage';
import SalerHomePage from './pages/saler/SalerHomePage';
import ManageAccountPage from './pages/admin/ManageAccountPage';

// ── Helpers ────────────────────────────────────────────────────────────────

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────
// Redirects to / if no token or role does not match allowedRoles.
function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('accessToken');
  const user  = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    // Redirect to the user's own home rather than showing a blank page
    const roleRoutes = { Admin: '/admin', Staff: '/staff', Sale: '/saler' };
    return <Navigate to={roleRoutes[user.roleName] || '/'} replace />;
  }

  return children;
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-account"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saler"
          element={
            <ProtectedRoute allowedRoles={['Sale']}>
              <SalerHomePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
