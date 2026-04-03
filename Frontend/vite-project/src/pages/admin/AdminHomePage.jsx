import { useState, useEffect } from 'react';
import './AdminHomePage.css';
import AdminNavbar from './AdminNavbar';

export default function AdminHomePage() {
  const [showToast, setShowToast] = useState(true);
  const [hiding,    setHiding]    = useState(false);

  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.fullName || user.username || 'Admin';

  const dismiss = () => {
    setHiding(true);
    setTimeout(() => setShowToast(false), 350);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <AdminNavbar />

      {/* Login success toast */}
      {showToast && (
        <div style={{
          position:     'fixed',
          bottom:       '28px',
          right:        '28px',
          zIndex:       9999,
          background:   '#28a745',
          color:        '#fff',
          borderRadius: '10px',
          boxShadow:    '0 6px 24px rgba(0,0,0,0.18)',
          padding:      '14px 18px',
          minWidth:     '280px',
          maxWidth:     '340px',
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '12px',
          animation:    hiding ? 'toast-out 0.35s ease forwards' : 'toast-in 0.35s ease forwards',
        }}>
          {/* check icon */}
          <div style={{ flexShrink: 0, marginTop: '1px' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" stroke="none"/>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          {/* text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>Login successful</div>
            <div style={{ fontSize: '13px', opacity: 0.92 }}>Welcome, <strong>{displayName}</strong>.</div>
          </div>
          {/* close */}
          <button onClick={dismiss} style={{
            background: 'none', border: 'none', color: '#fff',
            fontSize: '18px', cursor: 'pointer', lineHeight: 1,
            padding: 0, opacity: 0.8, flexShrink: 0,
          }}>×</button>
        </div>
      )}

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
