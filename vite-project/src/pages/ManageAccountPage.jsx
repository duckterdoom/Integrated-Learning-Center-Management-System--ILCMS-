import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../assets/ismart-logo.png';
import './HomePage.css';
import './ManageAccountPage.css';

/* ── Initial account data ── */
const INITIAL_ACCOUNTS = [
  { id: 1, username: 'admin',                        password: 'admin123', role: 'Admin', createdDate: '15/3/2026' },
  { id: 2, username: 'saler',                        password: 'saler123', role: 'Sale',  createdDate: '15/3/2026' },
  { id: 3, username: 'staff',                        password: 'staff123', role: 'Staff', createdDate: '15/3/2026' },
  { id: 4, username: 'lvu35558@ismart.edu.vn',       password: '123456',   role: 'Admin', createdDate: '15/3/2026' },
  { id: 5, username: 'huong.vu@ismart.edu.vn',       password: '123456',   role: 'Staff', createdDate: '15/3/2026' },
  { id: 6, username: 'vuthientrang231@ismart.edu.vn',password: '123456',   role: 'Sale',  createdDate: '15/3/2026' },
];

const ROLES = ['Admin', 'Staff', 'Sale'];

/* ── Role badge ── */
function RoleBadge({ role }) {
  const cls = role === 'Admin' ? 'admin' : role === 'Sale' ? 'sale' : 'staff';
  return <span className={`role-badge ${cls}`}>{role}</span>;
}

/* ── Add / Edit Modal ── */
function AccountModal({ mode, account, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [username, setUsername] = useState(account?.username ?? '');
  const [password, setPassword] = useState(isEdit ? account.password : '');
  const [role, setRole]         = useState(account?.role ?? '');
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Username is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (!role)            { setError('Please select a role.'); return; }
    setError('');
    onSubmit({ username: username.trim(), password: password.trim(), role });
  };

  return (
    <div className="ma-modal-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ma-modal-title">{isEdit ? 'Edit user' : 'Add a new user'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="ma-field">
            <label className="ma-label">Username</label>
            <input
              className="ma-input"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="ma-field">
            <label className="ma-label">Password</label>
            <input
              className="ma-input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          {/* Role */}
          <div className="ma-field">
            <label className="ma-label">Role</label>
            <div className="ma-select-wrapper">
              <select
                className="ma-select"
                value={role}
                onChange={(e) => { setRole(e.target.value); setError(''); }}
              >
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="ma-error">{error}</p>}

          <div className="ma-modal-actions">
            <button type="submit" className="ma-btn-submit">
              {isEdit ? 'Save' : 'Add'}
            </button>
            <button type="button" className="ma-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ManageAccountPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null); // null | { mode:'add' } | { mode:'edit', account }

  const filtered = accounts.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = ({ username, password, role }) => {
    const today = new Date();
    const date  = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const newId = accounts.length ? Math.max(...accounts.map((a) => a.id)) + 1 : 1;
    setAccounts([...accounts, { id: newId, username, password, role, createdDate: date }]);
    setModal(null);
  };

  const handleEdit = ({ username, password, role }) => {
    setAccounts(accounts.map((a) =>
      a.id === modal.account.id ? { ...a, username, password, role } : a
    ));
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this account?')) {
      setAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      {/* Navbar — Admin */}
      <nav className="navbar">
        <img src={ismartLogo} alt="iSmart" className="navbar-logo" />

        <button className="nav-item" onClick={() => navigate('/admin')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>

        <button className="nav-item" onClick={() => navigate('/admin/manage-account')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="M15 8h6M18 5v6"/></svg>
          Manage Account
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

        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Report
        </button>

        <div className="navbar-spacer" />

        <div className="navbar-search">
          <input type="text" placeholder="Customer" />
          <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>

        <div className="navbar-user" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Vu Lan Huong (Admin)
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
          <button className="btn-add" onClick={() => setModal({ mode: 'add' })}>+ Add</button>
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
              {filtered.map((acc) => (
                <tr key={acc.id}>
                  <td>{acc.id}</td>
                  <td className="td-username">{acc.username}</td>
                  <td><RoleBadge role={acc.role} /></td>
                  <td>{acc.createdDate}</td>
                  <td>
                    <div className="action-icons">
                      {/* Edit */}
                      <button
                        className="action-btn"
                        title="Edit"
                        onClick={() => setModal({ mode: 'edit', account: acc })}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {/* Key */}
                      <button className="action-btn" title="Reset password">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                      </button>
                      {/* Delete */}
                      <button
                        className="action-btn danger"
                        title="Delete"
                        onClick={() => handleDelete(acc.id)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="account-pagination">
            <div className="page-btn">1</div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {modal?.mode === 'add' && (
        <AccountModal
          mode="add"
          onClose={() => setModal(null)}
          onSubmit={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {modal?.mode === 'edit' && (
        <AccountModal
          mode="edit"
          account={modal.account}
          onClose={() => setModal(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}
