import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './AdminHomePage.css';
import './ManageAccountPage.css';

/* ── Confirm Reset Password Modal ── */
function ConfirmResetModal({ request, onConfirm, onClose, apiError }) {
  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal ma-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ma-confirm-title">
          Confirm reset for <strong>{request.username}</strong>?
        </h2>
        <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '14px', textAlign: 'center' }}>
          A temporary password will be generated. The user will be logged out immediately.
        </p>
        {apiError && <p className="ma-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{apiError}</p>}
        <div className="ma-modal-actions" style={{ justifyContent: 'center' }}>
          <button className="ma-btn-submit ma-btn-wide" onClick={onConfirm}>Confirm</button>
          <button className="ma-btn-cancel ma-btn-wide" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Temp Password Result Modal ── */
function TempPasswordModal({ request, tempPassword, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="ma-modal-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          Password Reset Successful
        </h2>
        <p style={{ color: '#555', marginBottom: '1.25rem', fontSize: '15px', textAlign: 'center' }}>
          Temporary password for <strong>{request.username}</strong>:
        </p>
        <div className="temp-password-box">
          <span className="temp-password-text">{tempPassword}</span>
          <button className="temp-copy-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '1rem' }}>
          Share this password with the user manually.
        </p>
        <div className="ma-modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="ma-btn-cancel" style={{ width: '100%' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Admin Navbar ── */
export default function AdminNavbar() {
  const navigate = useNavigate();
  const [showLogout,      setShowLogout]      = useState(false);
  const [resetRequests,   setResetRequests]   = useState([]);
  const [showResetNotif,  setShowResetNotif]  = useState(false);
  const [resetModal,      setResetModal]      = useState(null);
  const [resetModalError, setResetModalError] = useState('');
  const notifRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const apiFetch = async (url, options = {}) => {
    const withAuth = (token) => fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });

    let res = await withAuth(localStorage.getItem('accessToken') || '');
    if (res.status === 401) {
      try {
        const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (!rr.ok) { handleLogout(); return res; }
        const { accessToken } = await rr.json();
        localStorage.setItem('accessToken', accessToken);
        res = await withAuth(accessToken);
        if (res.status === 401) { handleLogout(); }
      } catch {
        handleLogout();
      }
    }
    return res;
  };

  async function fetchResetRequests() {
    try {
      const res = await apiFetch('/api/users/reset-requests');
      if (!res || res.status === 401) return;
      const json = await res.json();
      if (res.ok) setResetRequests(json.data || []);
    } catch {
      // silently fail
    }
  }

  // Initial fetch + poll every 15 seconds
  useEffect(() => {
    fetchResetRequests();
    const id = setInterval(fetchResetRequests, 15000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowResetNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetPassword = async (request) => {
    setResetModalError('');
    try {
      const res  = await apiFetch(`/api/users/${request.user_id}/reset-password`, { method: 'POST' });
      if (res.status === 401) return;
      const json = await res.json();
      if (!res.ok) { setResetModalError(json.message || 'Failed to reset password.'); return; }
      setResetModal({ mode: 'result', request, tempPassword: json.tempPassword });
      fetchResetRequests();
    } catch {
      setResetModalError('Network error. Is the backend running?');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <nav className="navbar">
        <img src={ismartLogo} alt="iSmart" className="navbar-logo" />

        <button className="nav-item" onClick={() => navigate('/admin')}>
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

        {/* ── Notification Bell ── */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            className={`notif-bell${resetRequests.length > 0 ? ' notif-bell--active' : ''}`}
            onClick={() => setShowResetNotif((v) => !v)}
            title="Password reset requests"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {resetRequests.length > 0 && (
              <span className="notif-badge">{resetRequests.length}</span>
            )}
          </button>

          {showResetNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span className="notif-dropdown-title">Password Reset Requests</span>
                <span className="notif-dropdown-count">{resetRequests.length} pending</span>
              </div>
              {resetRequests.length === 0 ? (
                <p className="notif-empty">No pending requests</p>
              ) : (
                <ul className="notif-list">
                  {resetRequests.map((req) => (
                    <li key={req.request_id} className="notif-item">
                      <div className="notif-item-info">
                        <span className="notif-username">{req.username}</span>
                        <span className="notif-time">{formatDateTime(req.requested_at)}</span>
                      </div>
                      <button
                        className="notif-reset-btn"
                        onClick={() => {
                          setShowResetNotif(false);
                          setResetModalError('');
                          setResetModal({ mode: 'confirm', request: req });
                        }}
                      >
                        Reset
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ── User + Logout ── */}
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

      {/* Confirm Reset Modal */}
      {resetModal?.mode === 'confirm' && (
        <ConfirmResetModal
          request={resetModal.request}
          apiError={resetModalError}
          onClose={() => { setResetModal(null); setResetModalError(''); }}
          onConfirm={() => handleResetPassword(resetModal.request)}
        />
      )}

      {/* Temp Password Result Modal */}
      {resetModal?.mode === 'result' && (
        <TempPasswordModal
          request={resetModal.request}
          tempPassword={resetModal.tempPassword}
          onClose={() => { setResetModal(null); setResetModalError(''); }}
        />
      )}
    </>
  );
}
