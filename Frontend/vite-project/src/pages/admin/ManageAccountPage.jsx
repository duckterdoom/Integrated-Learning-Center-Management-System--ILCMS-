import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './AdminHomePage.css';
import './ManageAccountPage.css';

const ROLES = ['Staff', 'Sale'];
const ROLE_ID = { Admin: 1, Staff: 2, Sale: 3 };

function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Role badge ── */
function RoleBadge({ role }) {
  const cls = role === 'Admin' ? 'admin' : role === 'Sale' ? 'sale' : 'staff';
  return <span className={`role-badge ${cls}`}>{role}</span>;
}

/* ── Add Modal ── */
function AddModal({ onClose, onSubmit, apiError }) {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', role: '' });
  const [formError, setFormError] = useState('');

  const set = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setFormError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim()) { setFormError('Username is required.'); return; }
    if (!form.password.trim()) { setFormError('Password is required.'); return; }
    if (!form.role)            { setFormError('Please select a role.'); return; }
    onSubmit({
      username:  form.username.trim(),
      full_name: form.full_name.trim() || form.username.trim(),
      email:     form.email.trim()     || `${form.username.trim()}@ilcms.local`,
      password:  form.password.trim(),
      role_id:   ROLE_ID[form.role],
    });
  };

  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ma-modal-title">Add a new user</h2>
        <form onSubmit={handleSubmit}>
          <div className="ma-field">
            <label className="ma-label">Username</label>
            <input className="ma-input" type="text" value={form.username} onChange={set('username')} autoFocus />
          </div>
          <div className="ma-field">
            <label className="ma-label">Full Name <span style={{ color: '#888', fontSize: '0.85em' }}>(optional)</span></label>
            <input className="ma-input" type="text" value={form.full_name} onChange={set('full_name')} />
          </div>
          <div className="ma-field">
            <label className="ma-label">Email <span style={{ color: '#888', fontSize: '0.85em' }}>(optional)</span></label>
            <input className="ma-input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="ma-field">
            <label className="ma-label">Password</label>
            <input className="ma-input" type="password" value={form.password} onChange={set('password')} />
          </div>
          <div className="ma-field">
            <label className="ma-label">Role</label>
            <div className="ma-select-wrapper">
              <select className="ma-select" value={form.role} onChange={set('role')}>
                <option value="">Select role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {(formError || apiError) && <p className="ma-error">{formError || apiError}</p>}
          <div className="ma-modal-actions">
            <button type="submit" className="ma-btn-submit">Add</button>
            <button type="button" className="ma-btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Info Modal ── */
function InfoModal({ account, onClose, onUpdate, onRemove }) {
  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-info-header">
          <h2 className="ma-modal-title" style={{ margin: 0 }}>Information : {account.username}</h2>
          <RoleBadge role={account.role_name} />
        </div>
        <div className="ma-info-field">
          <p className="ma-info-label">Username:</p>
          <p className="ma-info-value">{account.username}</p>
        </div>
        <div className="ma-info-field">
          <p className="ma-info-label">Password:</p>
          <p className="ma-info-value">••••••••</p>
        </div>
        <div className="ma-info-field">
          <p className="ma-info-label">Email:</p>
          <p className="ma-info-value">{account.email || '—'}</p>
        </div>
        <div className="ma-modal-actions" style={{ marginTop: '2rem' }}>
          <button className="ma-btn-submit" onClick={onUpdate}>Update</button>
          <button className="ma-btn-remove" onClick={onRemove}>Remove</button>
          <button className="ma-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm Delete Modal ── */
function ConfirmDeleteModal({ onConfirm, onClose, apiError }) {
  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal ma-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ma-confirm-title">You are definitely delete this account?</h2>
        {apiError && <p className="ma-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{apiError}</p>}
        <div className="ma-modal-actions" style={{ justifyContent: 'center' }}>
          <button className="ma-btn-submit ma-btn-wide" onClick={onConfirm}>Yes</button>
          <button className="ma-btn-cancel ma-btn-wide" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Change Password Modal ── */
function ChangePasswordModal({ account, onClose, onSubmit, apiError }) {
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim() || password.trim().length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    onSubmit(password.trim());
  };

  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ma-modal-title">Change Password</h2>
        <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '15px' }}>
          Account: <strong>{account.username}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="ma-field">
            <label className="ma-label">New Password</label>
            <input
              className="ma-input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
              autoFocus
            />
          </div>
          {(formError || apiError) && <p className="ma-error">{formError || apiError}</p>}
          <div className="ma-modal-actions">
            <button type="submit" className="ma-btn-submit">Save</button>
            <button type="button" className="ma-btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ManageAccountPage() {
  const navigate = useNavigate();
  const [users,      setUsers]      = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null);
  const [modalError, setModalError] = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Handle 401 — redirect to login
  const handleApiResponse = (res) => {
    if (res.status === 401) {
      handleLogout();
      return false;
    }
    return true;
  };

  const closeModal = () => { setModal(null); setModalError(''); };

  async function fetchUsers(searchTerm, currentPage) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10, search: searchTerm });
      const res  = await fetch(`/api/users?${params}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
      });
      const json = await res.json();
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) return;
      setUsers(json.data);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch {
      // network error — silently fail on list load
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers('', 1); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(search, 1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleAdd = async (data) => {
    setModalError('');
    try {
      const res  = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!handleApiResponse(res)) return;
      if (!res.ok) { setModalError(json.message || 'Failed to create user.'); return; }
      closeModal();
      fetchUsers(search, page);
    } catch {
      setModalError('Network error. Is the backend running?');
    }
  };

  const handleDelete = async (userId) => {
    setModalError('');
    try {
      const res  = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      });
      const json = await res.json();
      if (!handleApiResponse(res)) return;
      if (!res.ok) { setModalError(json.message || 'Failed to delete user.'); return; }
      closeModal();
      fetchUsers(search, page);
    } catch {
      setModalError('Network error. Is the backend running?');
    }
  };

  const handleSetPassword = async (userId, newPassword) => {
    setModalError('');
    try {
      const res  = await fetch(`/api/users/${userId}/set-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!handleApiResponse(res)) return;
      if (!res.ok) { setModalError(json.message || 'Failed to update password.'); return; }
      closeModal();
    } catch {
      setModalError('Network error. Is the backend running?');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <img src={ismartLogo} alt="iSmart" className="navbar-logo" />

        <button className="nav-item" onClick={() => navigate('/admin')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Report
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Manage Class
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Manage Course
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Manage Student
        </button>
        <button className="nav-item" onClick={() => navigate('/admin/manage-account')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Manage Account
        </button>

        <div className="navbar-spacer" />

        <div className="navbar-search">
          <input type="text" placeholder="Customer" />
          <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: '#1a73e8' }} onClick={() => navigate('/admin')}>Home</span>
        {' > '}Manage Account
      </div>

      {/* Page content */}
      <div className="manage-page">
        <div className="manage-page-title-row">
          <h1 className="manage-page-title">Manage Account</h1>
          <button className="btn-add" onClick={() => { setModalError(''); setModal({ mode: 'add' }); }}>+ Add</button>
        </div>

        <div className="account-list-box">
          <div className="account-list-header">
            <p className="account-list-title">Account list</p>
            <div className="account-search">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className="account-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No accounts found.</td></tr>
              ) : users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td className="td-username">{u.username}</td>
                  <td><RoleBadge role={u.role_name} /></td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {u.role_name !== 'Admin' && (
                        <button
                          className="action-btn action-info-btn"
                          title="View info"
                          onClick={() => { setModalError(''); setModal({ mode: 'info', account: u }); }}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="account-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <div
                key={p}
                className={`page-btn${page === p ? ' active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => { setPage(p); fetchUsers(search, p); }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {modal?.mode === 'add' && (
        <AddModal
          apiError={modalError}
          onClose={closeModal}
          onSubmit={handleAdd}
        />
      )}

      {/* Info Modal */}
      {modal?.mode === 'info' && (
        <InfoModal
          account={modal.account}
          onClose={closeModal}
          onUpdate={() => { setModalError(''); setModal({ mode: 'changePassword', account: modal.account }); }}
          onRemove={() => { setModalError(''); setModal({ mode: 'confirmDelete', account: modal.account }); }}
        />
      )}

      {/* Confirm Delete Modal */}
      {modal?.mode === 'confirmDelete' && (
        <ConfirmDeleteModal
          apiError={modalError}
          onClose={closeModal}
          onConfirm={() => handleDelete(modal.account.user_id)}
        />
      )}

      {/* Change Password Modal */}
      {modal?.mode === 'changePassword' && (
        <ChangePasswordModal
          account={modal.account}
          apiError={modalError}
          onClose={closeModal}
          onSubmit={(newPassword) => handleSetPassword(modal.account.user_id, newPassword)}
        />
      )}
    </div>
  );
}
