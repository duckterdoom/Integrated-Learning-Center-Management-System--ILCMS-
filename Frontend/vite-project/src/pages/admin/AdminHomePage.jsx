import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './AdminHomePage.css';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <img src={ismartLogo} alt="iSmart" className="navbar-logo" />

        <button className="nav-item">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>

        <button className="nav-item">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Report
        </button>

        <button className="nav-item">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Manage Class
        </button>

        <button className="nav-item">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Manage Course
        </button>

        <button className="nav-item">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Manage Student
        </button>

        <button className="nav-item" onClick={() => navigate('/admin/manage-account')}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Manage Account
        </button>

        <div className="navbar-spacer" />

        <div className="navbar-search">
          <input type="text" placeholder="Customer" />
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>

        <div className="navbar-user-wrap">
          <div className="navbar-user">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Vu Lan Huong (Admin)
          </div>
          <button className="navbar-logout-btn" title="Logout" onClick={() => setShowLogout(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
          {showLogout && (
            <div className="logout-popup">
              <p>Do you want to leave?</p>
              <div className="logout-popup-actions">
                <button className="logout-save-btn" onClick={handleLogout}>Yes</button>
                <button className="logout-cancel-btn" onClick={() => setShowLogout(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="breadcrumb">Home</div>

      {/* Main Content */}
      <div className="home-content">
        {/* My Class Table */}
        <div className="my-class-section">
          <div className="my-class-header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My class
          </div>
          <table className="my-class-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Class</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Student</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="class-link">Live OD 8E1</td>
                <td>On-going</td>
                <td>0</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td className="class-link">Live OD 8E2</td>
                <td>On-going</td>
                <td>0</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Spacer pushes bottom section down */}
        <div className="home-content-spacer" />

        {/* Bottom section */}
        <div className="bottom-section">

        {/* Bottom Tabs */}
        <div className="bottom-tabs">
          <div className="bottom-tabs-header">
            <div className="bottom-tab">Pending receipts (0)</div>
            <div className="bottom-tab">Repayment (0)</div>
            <div className="bottom-tab">Reservation/Class exchange queue (0)</div>
            <div className="bottom-tab">Student feedback (0)</div>
            <div className="bottom-tab">Idle customer (223)</div>
          </div>
          <div className="bottom-tab-content"></div>
        </div>

        {/* Bottom Cards */}
        <div className="bottom-cards">
          <div className="bottom-card">
            <div className="bottom-card-header">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Staff schedule
            </div>
            <div className="bottom-card-body">
              <button className="btn-green">View schedule</button>
            </div>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-header">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Task
            </div>
            <div className="bottom-card-body">
              <button className="btn-green">Task</button>
            </div>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-header">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Class
            </div>
            <div className="bottom-card-body"></div>
          </div>
        </div>

        </div>{/* end bottom-section */}
      </div>
    </div>
  );
}
