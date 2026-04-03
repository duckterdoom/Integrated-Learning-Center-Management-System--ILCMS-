import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHomePage.css';
import './ManageAccountPage.css';
import AdminNavbar from './AdminNavbar';

const ROLES = ['Staff', 'Sale'];
const ROLE_ID = { Admin: 1, Staff: 2, Sale: 3 };

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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Fetch wrapper: auto-refreshes access token on 401, logs out if refresh also fails
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

  const closeModal = () => { setModal(null); setModalError(''); };

  async function fetchUsers(searchTerm, currentPage) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10, search: searchTerm });
      const res  = await apiFetch(`/api/users?${params}`);
      const json = await res.json();
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
      const res  = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 401) return;
      const json = await res.json();
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
      const res  = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.status === 401) return;
      const json = await res.json();
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
      const res  = await apiFetch(`/api/users/${userId}/set-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.status === 401) return;
      const json = await res.json();
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
      <AdminNavbar />

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
