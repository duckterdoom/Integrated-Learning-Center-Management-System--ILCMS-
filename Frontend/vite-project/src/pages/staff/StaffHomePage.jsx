import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './StaffHomePage.css';

export default function StaffHomePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const displayName = user?.username || 'Staff';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="staff-layout">

      {/* ── Sidebar ── */}
      <aside className="staff-sidebar">
        <div className="sidebar-logo-wrap">
          <img src={ismartLogo} alt="iSmart" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>

          <button className="sidebar-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Report
          </button>

          <button className="sidebar-item" onClick={() => navigate('/staff/manage-course')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="14" rx="2"/><path d="M1 18h22"/><path d="M9 16h6"/><path d="M12 5.5l5 3-5 3-5-3z"/><path d="M9 9.5v2.5q3 2 6 0v-2.5"/><line x1="17" y1="8.5" x2="17" y2="12"/><circle cx="17" cy="12.4" r="0.55" fill="currentColor" stroke="none"/></svg>
            Manage Course
          </button>

          <button className="sidebar-item" onClick={() => navigate('/staff/manage-class')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="22" height="16" rx="2"/><rect x="3" y="4" width="18" height="11" rx="1"/><line x1="10" y1="18" x2="14" y2="18"/><circle cx="12" cy="8" r="1.6"/><path d="M8 13.5q4-4 8 0"/><circle cx="6.5" cy="9" r="1.1"/><path d="M4 13.5q2.5-2.8 4.5-1.5"/><circle cx="17.5" cy="9" r="1.1"/><path d="M20 13.5q-2.5-2.8-4.5-1.5"/></svg>
            Manage Class
          </button>

          <button className="sidebar-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Manage Student
          </button>
        </nav>

        <div className="sidebar-spacer" />

        {/* User + Logout */}
        <div className="sidebar-user-wrap">
          <div className="sidebar-user">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{displayName}</span>
          </div>
          <button className="sidebar-logout-btn" title="Logout" onClick={() => setShowLogout(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>

          {showLogout && (
            <div className="sidebar-logout-popup">
              <p>Do you want to leave?</p>
              <div className="sidebar-logout-actions">
                <button className="slp-yes" onClick={handleLogout}>Yes</button>
                <button className="slp-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="staff-main">

        {/* Top bar */}
        <div className="staff-topbar">
          <h2 className="staff-welcome">Welcome {displayName} to dashboard!</h2>
          <div className="staff-search">
            <input type="text" placeholder="Customer" />
            <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="staff-breadcrumb">Home</div>

        {/* Content */}
        <div className="staff-content">

          {/* My Class */}
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

          </div>
        </div>
      </div>
    </div>
  );
}
