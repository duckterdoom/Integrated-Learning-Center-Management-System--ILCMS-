import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './StaffHomePage.css';
import './ManageClassPage.css';

const BASE = 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    const refresh = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem('accessToken', data.accessToken);
      const retry = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.accessToken}`,
          ...(options.headers || {}),
        },
      });
      return retry;
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
  return res;
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return dateStr.slice(0, 10);
}

function StatusBadge({ status }) {
  const cls =
    status === 'Active'
      ? 'mc-status mc-status--active'
      : status === 'Finish'
      ? 'mc-status mc-status--finish'
      : 'mc-status mc-status--waiting';
  return <span className={cls}>{status}</span>;
}

// ── Add / Edit form ────────────────────────────────────────────────────────
const SCHEDULE_OPTIONS = ['MON-WED-FRI', 'TUE-THUR-SAT'];

const EMPTY_FORM = {
  course_id: '',
  class_name: '',
  teacher_name: '',
  start_date: '',
  end_date: '',
  capacity: '',
  schedule_info: '',
  status: 'Waiting for Activation',
};

function ClassForm({ initial, courses, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');

    if (!form.capacity || Number(form.capacity) < 1) {
      setError('Capacity must be greater than 0.');
      return;
    }

    // Start date must be today or a future date (create and update)
    if (form.start_date) {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (form.start_date < today) {
        setError('Start date must be today or a future date.');
        return;
      }
    }

    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/classes/${initial.class_id}` : '/api/classes';
      const body = {
        course_id: Number(form.course_id),
        class_name: form.class_name,
        teacher_name: form.teacher_name,
        start_date: form.start_date,
        end_date: form.end_date || null,
        capacity: Number(form.capacity),
        schedule_info: form.schedule_info || null,
        status: form.status,
      };
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'An error occurred.');
        setSaving(false);
        return;
      }
      onSave();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mc-modal-body">
        {error && <div className="mc-error">{error}</div>}

        <div className="mc-form-row">
          <div className="mc-form-group">
            <label>Course <span>*</span></label>
            <select value={form.course_id} onChange={e => set('course_id', e.target.value)}>
              <option value="">-- Select course --</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
              ))}
            </select>
          </div>
          <div className="mc-form-group">
            <label>Class Name <span>*</span></label>
            <input
              value={form.class_name}
              onChange={e => set('class_name', e.target.value)}
              placeholder="e.g. English 8A1"
            />
          </div>
        </div>

        <div className="mc-form-row">
          <div className="mc-form-group">
            <label>Teacher Name <span>*</span></label>
            <input
              value={form.teacher_name}
              onChange={e => set('teacher_name', e.target.value)}
              placeholder="e.g. Nguyen Van A"
            />
          </div>
          <div className="mc-form-group">
            <label>Capacity <span>*</span></label>
            <input
              type="number"
              min="1"
              max="200"
              value={form.capacity}
              onChange={e => set('capacity', e.target.value)}
              placeholder="e.g. 30"
            />
          </div>
        </div>

        <div className="mc-form-row">
          <div className="mc-form-group">
            <label>Start Date <span>*</span></label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
            />
          </div>
          <div className="mc-form-group">
            <label>End Date</label>
            <input
              type="date"
              value={form.end_date || ''}
              onChange={e => set('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="mc-form-row">
          <div className="mc-form-group">
            <label>Schedule Info</label>
            <select value={form.schedule_info} onChange={e => set('schedule_info', e.target.value)}>
              <option value="">-- Select schedule --</option>
              {SCHEDULE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="mc-form-group">
            <label>Status <span>*</span></label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Waiting for Activation">Waiting for Activation</option>
              <option value="Active">Active</option>
              <option value="Finish">Finish</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mc-modal-footer">
        <button className="mc-btn mc-btn--cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="mc-btn mc-btn--save" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Class'}
        </button>
      </div>
    </>
  );
}

// ── Info modal (read-only) ─────────────────────────────────────────────────
function InfoModal({ cls, onClose, onEdit }) {
  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={e => e.stopPropagation()}>
        <div className="mc-modal-header">
          <h3>Class Information</h3>
          <button className="mc-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mc-modal-body">
          <div className="mc-info-grid">
            <div className="mc-info-item">
              <span className="mc-info-label">Class ID</span>
              <span className="mc-info-value">{cls.class_id}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Course</span>
              <span className="mc-info-value">{cls.course_name}</span>
            </div>
            <div className="mc-info-item mc-info-item--full">
              <span className="mc-info-label">Class Name</span>
              <span className="mc-info-value">{cls.class_name}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Teacher</span>
              <span className="mc-info-value">{cls.teacher_name}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Capacity</span>
              <span className="mc-info-value">{cls.capacity}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Start Date</span>
              <span className="mc-info-value">{fmt(cls.start_date)}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">End Date</span>
              <span className="mc-info-value">{fmt(cls.end_date)}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Schedule Info</span>
              <span className="mc-info-value">{cls.schedule_info || '—'}</span>
            </div>
            <div className="mc-info-item">
              <span className="mc-info-label">Status</span>
              <span className="mc-info-value"><StatusBadge status={cls.status} /></span>
            </div>
          </div>
        </div>
        <div className="mc-modal-footer">
          <button className="mc-btn mc-btn--cancel" onClick={onClose}>Close</button>
          <button className="mc-btn mc-btn--primary" onClick={onEdit}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ cls, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/api/classes/${cls.class_id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Failed to delete.');
        setDeleting(false);
        return;
      }
      onConfirm();
    } catch {
      setError('Network error. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="mc-modal-overlay" onClick={onCancel}>
      <div className="mc-modal mc-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="mc-modal-header">
          <h3>Delete Class</h3>
          <button className="mc-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="mc-modal-body">
          {error && <div className="mc-error">{error}</div>}
          <p className="mc-delete-msg">
            Are you sure you want to delete class<br />
            <strong>"{cls.class_name}"</strong>?<br />
            This action cannot be undone.
          </p>
        </div>
        <div className="mc-modal-footer">
          <button className="mc-btn mc-btn--cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="mc-btn mc-btn--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ManageClassPage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout]   = useState(false);
  const [classes,    setClasses]      = useState([]);
  const [courses,    setCourses]      = useState([]);
  const [loading,    setLoading]      = useState(true);

  // search + filter
  const [search,       setSearch]     = useState('');
  const [showFilter,   setShowFilter] = useState(false);
  const [sortField,    setSortField]  = useState('class_id');
  const [sortDir,      setSortDir]    = useState('asc');
  const filterRef = useRef(null);

  // modal state
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, klRes] = await Promise.all([
        apiFetch('/api/courses'),
        apiFetch('/api/classes'),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setCourses(d.data || []);
      }
      if (klRes.ok) {
        const d = await klRes.json();
        setClasses(d.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered + sorted list
  const displayedClasses = [...classes]
    .filter(c => {
      const q = search.toLowerCase();
      return (
        c.class_name?.toLowerCase().includes(q) ||
        c.teacher_name?.toLowerCase().includes(q) ||
        c.course_name?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  const SORT_OPTIONS = [
    { label: 'ID',         field: 'class_id' },
    { label: 'Class Name', field: 'class_name' },
    { label: 'Teacher',    field: 'teacher_name' },
    { label: 'Status',     field: 'status' },
    { label: 'Start Date', field: 'start_date' },
  ];

  const closeModal = () => { setModal(null); setSelected(null); };

  const onSaved = () => { closeModal(); loadData(); };

  const openInfo = cls => { setSelected(cls); setModal('info'); };
  const openEdit = cls => { setSelected(cls); setModal('edit'); };
  const openDelete = cls => { setSelected(cls); setModal('delete'); };

  // Build initial form values for edit
  const editInitial = selected
    ? {
        class_id: selected.class_id,
        course_id: String(selected.course_id),
        class_name: selected.class_name,
        teacher_name: selected.teacher_name,
        start_date: fmt(selected.start_date),
        end_date: selected.end_date ? fmt(selected.end_date) : '',
        capacity: String(selected.capacity),
        schedule_info: selected.schedule_info || '',
        status: selected.status,
      }
    : null;

  return (
    <div className="staff-layout">

      {/* ── Sidebar ── */}
      <aside className="staff-sidebar">
        <div className="sidebar-logo-wrap">
          <img src={ismartLogo} alt="iSmart" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-item" onClick={() => navigate('/staff')}>
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

          <button className="sidebar-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="22" height="16" rx="2"/><rect x="3" y="4" width="18" height="11" rx="1"/><line x1="10" y1="18" x2="14" y2="18"/><circle cx="12" cy="8" r="1.6"/><path d="M8 13.5q4-4 8 0"/><circle cx="6.5" cy="9" r="1.1"/><path d="M4 13.5q2.5-2.8 4.5-1.5"/><circle cx="17.5" cy="9" r="1.1"/><path d="M20 13.5q-2.5-2.8-4.5-1.5"/></svg>
            Manage Class
          </button>

          <button className="sidebar-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Manage Student
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user-wrap">
          <div className="sidebar-user">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{user?.fullName || 'Staff'}</span>
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

        <div className="mc-topbar">
          <h2 className="mc-topbar-title">Manage Class</h2>
        </div>

        <div className="mc-breadcrumb">Home &rsaquo; Manage Class</div>

        <div className="mc-content">
          <div className="mc-card">
            <div className="mc-card-header">
              {/* Search bar */}
              <div className="mc-search-bar">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Filter / Sort */}
              <div className="mc-filter-wrap" ref={filterRef}>
                <button
                  className={`mc-filter-btn${showFilter ? ' mc-filter-btn--active' : ''}`}
                  title="Filter & Sort"
                  onClick={() => setShowFilter(v => !v)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                </button>

                {showFilter && (
                  <div className="mc-filter-dropdown">
                    <div className="mc-filter-title">Sort by</div>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.field}
                        className={`mc-filter-option${sortField === opt.field ? ' mc-filter-option--active' : ''}`}
                        onClick={() => {
                          if (sortField === opt.field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                          else { setSortField(opt.field); setSortDir('asc'); }
                          setShowFilter(false);
                        }}
                      >
                        {opt.label}
                        {sortField === opt.field && (
                          <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="mc-add-btn" onClick={() => setModal('add')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add
              </button>
            </div>

            {loading ? (
              <div className="mc-loading">Loading...</div>
            ) : classes.length === 0 ? (
              <div className="mc-empty">No classes found. Click "Add" to create one.</div>
            ) : (
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Class Name</th>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th>Schedule</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedClasses.length === 0
                    ? <tr><td colSpan={10} className="mc-empty">No results found.</td></tr>
                    : displayedClasses.map((cls, idx) => (
                    <tr key={cls.class_id} >
                      <td>{idx + 1}</td>
                      <td style={{ textAlign: 'left' }}>{cls.class_name}</td>
                      <td>{cls.course_name}</td>
                      <td>{cls.teacher_name}</td>
                      <td><span className="mc-schedule-badge">{cls.schedule_info || '—'}</span></td>
                      <td>{fmt(cls.start_date)}</td>
                      <td>{fmt(cls.end_date)}</td>
                      <td>{cls.capacity}</td>
                      <td><StatusBadge status={cls.status} /></td>
                      <td>
                        <div className="mc-actions">
                          {/* Info */}
                          <button
                            className="mc-action-btn mc-action-btn--info"
                            title="View info"
                            onClick={() => openInfo(cls)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          </button>
                          {/* Edit */}
                          <button
                            className="mc-action-btn mc-action-btn--edit"
                            title="Edit"
                            onClick={() => openEdit(cls)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          {/* Delete */}
                          <button
                            className="mc-action-btn mc-action-btn--delete"
                            title="Delete"
                            onClick={() => openDelete(cls)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Modal ── */}
      {modal === 'add' && (
        <div className="mc-modal-overlay" onClick={closeModal}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-header">
              <h3>Add New Class</h3>
              <button className="mc-modal-close" onClick={closeModal}>×</button>
            </div>
            <ClassForm
              courses={courses}
              onSave={onSaved}
              onCancel={closeModal}
              isEdit={false}
            />
          </div>
        </div>
      )}

      {/* ── Info Modal ── */}
      {modal === 'info' && selected && (
        <InfoModal
          cls={selected}
          onClose={closeModal}
          onEdit={() => { setModal('edit'); }}
        />
      )}

      {/* ── Edit Modal ── */}
      {modal === 'edit' && selected && (
        <div className="mc-modal-overlay" onClick={closeModal}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-header">
              <h3>Edit Class</h3>
              <button className="mc-modal-close" onClick={closeModal}>×</button>
            </div>
            <ClassForm
              initial={editInitial}
              courses={courses}
              onSave={onSaved}
              onCancel={closeModal}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal === 'delete' && selected && (
        <DeleteModal
          cls={selected}
          onConfirm={onSaved}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
