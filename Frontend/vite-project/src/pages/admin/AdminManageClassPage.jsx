import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminHomePage.css';
import './AdminManageClassPage.css';

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

function StatusText({ status }) {
  if (status === 'Active') return <span className="amc-status amc-status--active">Actived</span>;
  if (status === 'Finish') return <span className="amc-status amc-status--finish">Finish</span>;
  return <span className="amc-status amc-status--waiting">Wait for actived</span>;
}

const SCHEDULE_OPTIONS = ['MON-WED-FRI', 'TUE-THUR-SAT'];

// ── Add / Edit form ────────────────────────────────────────────────────────
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
      <div className="amc-modal-body">
        {error && <div className="amc-error">{error}</div>}

        <div className="amc-form-row">
          <div className="amc-form-group">
            <label>Course <span>*</span></label>
            <select value={form.course_id} onChange={e => set('course_id', e.target.value)}>
              <option value="">-- Select course --</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
              ))}
            </select>
          </div>
          <div className="amc-form-group">
            <label>Class Name <span>*</span></label>
            <input
              value={form.class_name}
              onChange={e => set('class_name', e.target.value)}
              placeholder="e.g. English 8A1"
            />
          </div>
        </div>

        <div className="amc-form-row">
          <div className="amc-form-group">
            <label>Teacher Name <span>*</span></label>
            <input
              value={form.teacher_name}
              onChange={e => set('teacher_name', e.target.value)}
              placeholder="e.g. Nguyen Van A"
            />
          </div>
          <div className="amc-form-group">
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

        <div className="amc-form-row">
          <div className="amc-form-group">
            <label>Start Date <span>*</span></label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
            />
          </div>
          <div className="amc-form-group">
            <label>End Date</label>
            <input
              type="date"
              value={form.end_date || ''}
              onChange={e => set('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="amc-form-row">
          <div className="amc-form-group">
            <label>Schedule Info</label>
            <select value={form.schedule_info} onChange={e => set('schedule_info', e.target.value)}>
              <option value="">-- Select schedule --</option>
              {SCHEDULE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="amc-form-group">
            <label>Status <span>*</span></label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Waiting for Activation">Waiting for Activation</option>
              <option value="Active">Active</option>
              <option value="Finish">Finish</option>
            </select>
          </div>
        </div>
      </div>

      <div className="amc-modal-footer">
        <button className="amc-btn amc-btn--cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="amc-btn amc-btn--save" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Class'}
        </button>
      </div>
    </>
  );
}

// ── Info modal ─────────────────────────────────────────────────────────────
function InfoModal({ cls, onClose, onEdit, onDelete }) {
  return (
    <div className="amc-modal-overlay" onClick={onClose}>
      <div className="amc-modal" onClick={e => e.stopPropagation()}>
        <div className="amc-modal-header">
          <h3>Class Information</h3>
          <button className="amc-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="amc-modal-body">
          <div className="amc-info-grid">
            <div className="amc-info-item">
              <span className="amc-info-label">Class ID</span>
              <span className="amc-info-value">{cls.class_id}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Course</span>
              <span className="amc-info-value">{cls.course_name}</span>
            </div>
            <div className="amc-info-item amc-info-item--full">
              <span className="amc-info-label">Class Name</span>
              <span className="amc-info-value">{cls.class_name}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Teacher</span>
              <span className="amc-info-value">{cls.teacher_name}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Capacity</span>
              <span className="amc-info-value">{cls.capacity}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Start Date</span>
              <span className="amc-info-value">{fmt(cls.start_date)}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">End Date</span>
              <span className="amc-info-value">{fmt(cls.end_date)}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Schedule Info</span>
              <span className="amc-info-value">{cls.schedule_info || '—'}</span>
            </div>
            <div className="amc-info-item">
              <span className="amc-info-label">Status</span>
              <span className="amc-info-value"><StatusText status={cls.status} /></span>
            </div>
          </div>
        </div>
        <div className="amc-modal-footer">
          <button className="amc-btn amc-btn--cancel" onClick={onClose}>Close</button>
          <button className="amc-btn amc-btn--danger" onClick={onDelete}>Delete</button>
          <button className="amc-btn amc-btn--primary" onClick={onEdit}>Edit</button>
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
    <div className="amc-modal-overlay" onClick={onCancel}>
      <div className="amc-modal amc-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="amc-modal-header">
          <h3>Delete Class</h3>
          <button className="amc-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="amc-modal-body">
          {error && <div className="amc-error">{error}</div>}
          <p className="amc-delete-msg">
            Are you sure you want to delete class<br />
            <strong>"{cls.class_name}"</strong>?<br />
            This action cannot be undone.
          </p>
        </div>
        <div className="amc-modal-footer">
          <button className="amc-btn amc-btn--cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="amc-btn amc-btn--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const PER_PAGE = 10;

export default function AdminManageClassPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // 'add' | 'info' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [cRes, klRes] = await Promise.all([
        apiFetch('/api/courses'),
        apiFetch('/api/classes'),
      ]);
      if (!klRes || !cRes) { setLoadError(true); return; }
      if (cRes.ok) {
        const d = await cRes.json();
        setCourses(d.data || []);
      }
      if (klRes.ok) {
        const d = await klRes.json();
        setClasses(d.data || []);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const closeModal = () => { setModal(null); setSelected(null); };
  const onSaved = () => { closeModal(); loadData(); };

  const openInfo = cls => { setSelected(cls); setModal('info'); };

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

  // Search + course filter (AC4, AC5)
  const q = search.toLowerCase();
  const filtered = classes.filter(c => {
    const matchSearch = !q ||
      c.class_name.toLowerCase().includes(q) ||
      (c.course_name || '').toLowerCase().includes(q) ||
      (c.teacher_name || '').toLowerCase().includes(q);
    const matchCourse = !filterCourse || String(c.course_id) === filterCourse;
    return matchSearch && matchCourse;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = v => { setSearch(v); setPage(1); };
  const handleFilter = v => { setFilterCourse(v); setPage(1); };

  // Determine empty state message (AC6, AC7)
  const isFiltering = search || filterCourse;

  return (
    <div>
      <AdminNavbar />

      <div className="breadcrumb">Home &rsaquo; Manage Class</div>

      <div className="amc-content">
        {/* Page header row */}
        <div className="amc-page-header">
          <div>
            <h1 className="amc-title">Manage Class</h1>
            <p className="amc-subtitle">Class list</p>
          </div>
          <button className="amc-add-btn" onClick={() => setModal('add')}>+ Add</button>
        </div>

        {/* Card */}
        <div className="amc-card">
          {/* Red search + filter bar */}
          <div className="amc-search-bar">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="amc-search-input"
              placeholder="Search by class name / teacher name"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {/* Course filter dropdown (AC5) */}
            <select
              className="amc-filter-select"
              value={filterCourse}
              onChange={e => handleFilter(e.target.value)}
            >
              <option value="">All courses</option>
              {courses.map(c => (
                <option key={c.course_id} value={String(c.course_id)}>{c.course_name}</option>
              ))}
            </select>
          </div>

          {/* Table / states */}
          {loading ? (
            <div className="amc-loading">Loading...</div>
          ) : loadError ? (
            // AC9 – System error
            <div className="amc-error-state">Unable to load class data</div>
          ) : classes.length === 0 ? (
            // AC6 – No classes in DB
            <div className="amc-empty">No classes available</div>
          ) : filtered.length === 0 ? (
            // AC7 – Search/filter returned nothing
            <div className="amc-empty">No classes found</div>
          ) : (
            <table className="amc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Class Name</th>
                  <th>Course Name</th>
                  <th>Teacher Name</th>
                  <th>Schedule</th>
                  <th>Start Date</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(cls => (
                  <tr key={cls.class_id}>
                    <td>{cls.class_id}</td>
                    <td style={{ textAlign: 'left' }}>{cls.class_name}</td>
                    <td>{cls.course_name}</td>
                    <td>{cls.teacher_name}</td>
                    <td><span className="amc-schedule-badge">{cls.schedule_info || '—'}</span></td>
                    <td>{fmt(cls.start_date)}</td>
                    <td>{cls.capacity}</td>
                    <td><StatusText status={cls.status} /></td>
                    <td>
                      <button
                        className="amc-action-btn"
                        title="View info"
                        onClick={() => openInfo(cls)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loadError && !loading && filtered.length > PER_PAGE && (
            <div className="amc-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`amc-page-btn${p === safePage ? ' amc-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Modal ── */}
      {modal === 'add' && (
        <div className="amc-modal-overlay" onClick={closeModal}>
          <div className="amc-modal" onClick={e => e.stopPropagation()}>
            <div className="amc-modal-header">
              <h3>Add New Class</h3>
              <button className="amc-modal-close" onClick={closeModal}>×</button>
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
          onEdit={() => setModal('edit')}
          onDelete={() => setModal('delete')}
        />
      )}

      {/* ── Edit Modal ── */}
      {modal === 'edit' && selected && (
        <div className="amc-modal-overlay" onClick={closeModal}>
          <div className="amc-modal" onClick={e => e.stopPropagation()}>
            <div className="amc-modal-header">
              <h3>Edit Class</h3>
              <button className="amc-modal-close" onClick={closeModal}>×</button>
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
