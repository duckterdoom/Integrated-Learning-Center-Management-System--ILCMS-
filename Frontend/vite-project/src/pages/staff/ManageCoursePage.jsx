import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ismartLogo from '../../assets/ismart-logo.png';
import './StaffHomePage.css';
import './ManageCoursePage.css';

const BASE = 'http://localhost:5000';

// ── API helpers ────────────────────────────────────────────────────────────
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
    const refresh = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem('accessToken', data.accessToken);
      return fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.accessToken}`,
          ...(options.headers || {}),
        },
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
  return res;
}

// For multipart/form-data uploads — no Content-Type header (browser sets boundary)
async function apiFetchFile(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    const refresh = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem('accessToken', data.accessToken);
      return fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
          ...(options.headers || {}),
        },
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
  return res;
}

// ── Utility helpers ────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return 'xx/xx/xxx';
  const d = dateStr.slice(0, 10).split('-');
  return `${d[1]}/${d[2]}/${d[0]}`;
}

function fmtFee(val) {
  if (!val && val !== 0) return '—';
  return Number(val).toLocaleString('vi-VN');
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Card gradient colors cycling by index
const CARD_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
}

function StatusBadge({ status }) {
  if (status === 'Active') return <span className="mcp-status mcp-status--active">{status}</span>;
  if (status === 'Finish') return <span className="mcp-status mcp-status--finish">{status}</span>;
  return <span className="mcp-status mcp-status--waiting">{status || 'Wait for active'}</span>;
}

// ══════════════════════════════════════════════════════════════════════════
// Course modals
// ══════════════════════════════════════════════════════════════════════════

const EMPTY_FORM = {
  course_name: '',
  tuition_fee: '',
  start_date: '',
  end_date: '',
  status: 'Wait for active',
  description: '',
};

function CourseForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.course_name.trim()) { setError('Course name is required.'); return; }

    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/courses/${initial.course_id}` : '/api/courses';
      const body = {
        course_name: form.course_name.trim(),
        tuition_fee: form.tuition_fee !== '' ? Number(form.tuition_fee) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
        description: form.description || null,
      };
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'An error occurred.'); setSaving(false); return; }
      onSave();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="mcp-modal-overlay" onClick={onCancel}>
      <div className="mcp-modal mcp-modal--form" onClick={e => e.stopPropagation()}>
        <h2 className="mcp-modal-title">{isEdit ? 'Edit Course' : 'Add Course'}</h2>

        {error && <div className="mcp-form-error">{error}</div>}

        <div className="mcp-form-group">
          <label>Course</label>
          <input
            className="mcp-form-input"
            placeholder="Enter course name"
            value={form.course_name}
            onChange={e => set('course_name', e.target.value)}
          />
        </div>

        <div className="mcp-form-group">
          <label>Course tuition fee</label>
          <input
            className="mcp-form-input"
            type="number"
            min="0"
            placeholder="Number"
            value={form.tuition_fee}
            onChange={e => set('tuition_fee', e.target.value)}
          />
        </div>

        <div className="mcp-form-group">
          <label>Start date</label>
          <input
            className="mcp-form-input"
            type="date"
            value={form.start_date}
            onChange={e => set('start_date', e.target.value)}
          />
        </div>

        <div className="mcp-form-group">
          <label>End date</label>
          <input
            className="mcp-form-input"
            type="date"
            value={form.end_date}
            onChange={e => set('end_date', e.target.value)}
          />
        </div>

        <div className="mcp-form-group">
          <label>Status</label>
          <select
            className="mcp-form-input"
            value={form.status}
            onChange={e => set('status', e.target.value)}
          >
            <option value="Wait for active">Wait for active</option>
            <option value="Active">Active</option>
            <option value="Finish">Finish</option>
          </select>
        </div>

        <div className="mcp-form-group">
          <label>Description of the course</label>
          <textarea
            className="mcp-form-textarea"
            rows={4}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        <div className="mcp-form-actions">
          <button className="mcp-btn mcp-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save' : 'Add'}
          </button>
          <button className="mcp-btn mcp-btn--outline" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function InfoModal({ course, onClose, onEdit, onDelete }) {
  return (
    <div className="mcp-modal-overlay" onClick={onClose}>
      <div className="mcp-modal mcp-modal--info" onClick={e => e.stopPropagation()}>
        <div className="mcp-info-close-row">
          <button className="mcp-info-close" onClick={onClose}>×</button>
        </div>
        <h2 className="mcp-modal-title">Information</h2>

        <div className="mcp-info-row">
          <span className="mcp-info-label">Course:</span>
          <span className="mcp-info-value">{course.course_name}</span>
        </div>
        <div className="mcp-info-row">
          <span className="mcp-info-label">Course tuition fee</span>
          <span className="mcp-info-value">{fmtFee(course.tuition_fee)}</span>
        </div>
        <div className="mcp-info-row">
          <span className="mcp-info-label">Start date:</span>
          <span className="mcp-info-value">{fmt(course.start_date)}</span>
        </div>
        <div className="mcp-info-row">
          <span className="mcp-info-label">End date:</span>
          <span className="mcp-info-value">{fmt(course.end_date)}</span>
        </div>
        <div className="mcp-info-row">
          <span className="mcp-info-label">Status:</span>
          <span className="mcp-info-value"><StatusBadge status={course.status} /></span>
        </div>
        <div className="mcp-info-row mcp-info-row--desc">
          <span className="mcp-info-label">Description of the course:</span>
          <span className="mcp-info-value mcp-info-desc">{course.description || '—'}</span>
        </div>

        <div className="mcp-info-actions">
          <button className="mcp-btn mcp-btn--primary" onClick={onEdit}>Update</button>
          <button className="mcp-btn mcp-btn--primary" onClick={onDelete}>Remove</button>
          <button className="mcp-btn mcp-btn--outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ course, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/api/courses/${course.course_id}`, { method: 'DELETE' });
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
    <div className="mcp-modal-overlay" onClick={onCancel}>
      <div className="mcp-modal mcp-modal--confirm" onClick={e => e.stopPropagation()}>
        {error && <div className="mcp-form-error" style={{ marginBottom: 16 }}>{error}</div>}
        <p className="mcp-confirm-msg">Are you sure want to remove this course?</p>
        <div className="mcp-confirm-actions">
          <button className="mcp-btn mcp-btn--primary" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing...' : 'Yes'}
          </button>
          <button className="mcp-btn mcp-btn--outline" onClick={onCancel} disabled={deleting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Material modals
// ══════════════════════════════════════════════════════════════════════════

function MaterialForm({ courseId, courseName, initial, onSave, onCancel, isEdit }) {
  const [title, setTitle]       = useState(initial?.title    || '');
  const [linkUrl, setLinkUrl]   = useState(initial?.link_url || '');
  const [file, setFile]         = useState(null);
  const [fileName, setFileName] = useState(initial?.file_name || '');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const fileInputRef            = useRef(null);

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) { setFile(f); setFileName(f.name); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Material title is required.'); return; }
    if (!isEdit && !file && !linkUrl.trim()) {
      setError('Please upload a file or provide a link URL.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('course_id', courseId);
      if (file) formData.append('file', file);
      formData.append('link_url', linkUrl.trim());

      const url    = isEdit ? `/api/materials/${initial.material_id}` : '/api/materials';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await apiFetchFile(url, { method, body: formData });
      const data   = await res.json();
      if (!res.ok) { setError(data.message || 'An error occurred.'); setSaving(false); return; }
      onSave();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="mat-overlay mat-overlay--sub" onClick={onCancel}>
      <div className="mat-modal mat-modal--form" onClick={e => e.stopPropagation()}>
        <h2 className="mat-modal-title">{isEdit ? 'Update Material' : 'Add Material'}</h2>

        {error && <div className="mat-form-error">{error}</div>}

        <div className="mat-form-group">
          <label>Title</label>
          <input
            className="mat-form-input"
            placeholder="Enter material title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="mat-form-group">
          <label>Course</label>
          <input className="mat-form-input" value={courseName} readOnly />
        </div>

        <div className="mat-form-group">
          <label>File {isEdit && fileName ? `(current: ${fileName})` : ''}</label>
          <div className="mat-upload-area" onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <span className="mat-upload-filename">{file.name}</span>
            ) : (
              <span className="mat-upload-placeholder">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <span>{isEdit ? 'Click to replace file' : 'Click to upload file'}</span>
                <span className="mat-upload-hint">PDF, DOC, DOCX, PPT, PPTX (max 20 MB)</span>
              </span>
            )}
          </div>
        </div>

        <div className="mat-form-group">
          <label>File URL (link)</label>
          <input
            className="mat-form-input"
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
          />
        </div>

        <div className="mat-form-actions">
          <button className="mat-btn mat-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add'}
          </button>
          <button className="mat-btn mat-btn--outline" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MaterialInfoModal({ material, onClose, onEdit, onDelete }) {
  return (
    <div className="mat-overlay mat-overlay--sub" onClick={onClose}>
      <div className="mat-modal mat-modal--info" onClick={e => e.stopPropagation()}>
        <div className="mat-info-close-row">
          <button className="mat-info-close" onClick={onClose}>×</button>
        </div>
        <h2 className="mat-modal-title">Information</h2>

        <div className="mat-info-row">
          <span className="mat-info-label">Title</span>
          <span className="mat-info-value">{material.title}</span>
        </div>
        <div className="mat-info-row">
          <span className="mat-info-label">File Name</span>
          <span className="mat-info-value">{material.file_name || '—'}</span>
        </div>
        <div className="mat-info-row">
          <span className="mat-info-label">File Size</span>
          <span className="mat-info-value">{formatFileSize(material.file_size)}</span>
        </div>
        <div className="mat-info-row">
          <span className="mat-info-label">Link URL</span>
          <span className="mat-info-value">
            {material.link_url
              ? <a href={material.link_url} target="_blank" rel="noopener noreferrer">{material.link_url}</a>
              : '—'}
          </span>
        </div>
        <div className="mat-info-row">
          <span className="mat-info-label">Created At</span>
          <span className="mat-info-value">
            {material.created_at ? new Date(material.created_at).toLocaleDateString('vi-VN') : '—'}
          </span>
        </div>

        <div className="mat-info-actions">
          <button className="mat-btn mat-btn--primary" onClick={onEdit}>Update</button>
          <button className="mat-btn mat-btn--primary" onClick={onDelete}>Remove</button>
          <button className="mat-btn mat-btn--outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DeleteMaterialModal({ material, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/api/materials/${material.material_id}`, { method: 'DELETE' });
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
    <div className="mat-overlay mat-overlay--sub" onClick={onCancel}>
      <div className="mat-modal mat-modal--confirm" onClick={e => e.stopPropagation()}>
        {error && <div className="mat-form-error" style={{ marginBottom: 16 }}>{error}</div>}
        <p className="mat-confirm-msg">Are you sure want to delete this material?</p>
        <div className="mat-confirm-actions">
          <button className="mat-btn mat-btn--primary" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes'}
          </button>
          <button className="mat-btn mat-btn--outline" onClick={onCancel} disabled={deleting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MaterialListModal({ course, onClose }) {
  const [materials, setMaterials]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);
  const [matModal, setMatModal]     = useState(null); // null | 'add' | 'info' | 'edit' | 'delete'
  const [selectedMat, setSelectedMat] = useState(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiFetch(`/api/materials?course_id=${course.course_id}`);
      if (!res || !res.ok) { setLoadError(true); return; }
      const data = await res.json();
      setMaterials(data.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [course.course_id]);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  const closeMatModal = () => { setMatModal(null); setSelectedMat(null); };
  const afterSave     = () => { closeMatModal(); loadMaterials(); };

  return (
    <>
      {/* ── Material list overlay ── */}
      <div className="mat-overlay" onClick={onClose}>
        <div className="mat-modal mat-modal--list" onClick={e => e.stopPropagation()}>

          <div className="mat-header">
            <div>
              <h2 className="mat-title">Material</h2>
              <p className="mat-course-name">{course.course_name}</p>
            </div>
            <button className="mat-close" onClick={onClose}>×</button>
          </div>

          <div className="mat-body">
            {loading ? (
              <div className="mat-state">Loading...</div>
            ) : loadError ? (
              <div className="mat-state mat-state--error">Unable to load material data</div>
            ) : materials.length === 0 ? (
              <div className="mat-state">No materials available</div>
            ) : (
              <table className="mat-table">
                <thead>
                  <tr>
                    <th className="mat-th-num">#</th>
                    <th>Material Name</th>
                    <th className="mat-th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={m.material_id}>
                      <td className="mat-td-num">{i + 1}</td>
                      <td>{m.title}</td>
                      <td className="mat-td-action">
                        <button
                          className="mat-icon-btn"
                          title="View info"
                          onClick={() => { setSelectedMat(m); setMatModal('info'); }}
                        >
                          ⓘ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mat-footer">
            <button className="mat-add-btn" onClick={() => setMatModal('add')}>+ Add</button>
          </div>
        </div>
      </div>

      {/* ── Sub-modals (z-index 1100) ── */}
      {matModal === 'add' && (
        <MaterialForm
          courseId={course.course_id}
          courseName={course.course_name}
          onSave={afterSave}
          onCancel={closeMatModal}
          isEdit={false}
        />
      )}

      {matModal === 'info' && selectedMat && (
        <MaterialInfoModal
          material={selectedMat}
          onClose={closeMatModal}
          onEdit={() => setMatModal('edit')}
          onDelete={() => setMatModal('delete')}
        />
      )}

      {matModal === 'edit' && selectedMat && (
        <MaterialForm
          courseId={course.course_id}
          courseName={course.course_name}
          initial={selectedMat}
          onSave={afterSave}
          onCancel={closeMatModal}
          isEdit={true}
        />
      )}

      {matModal === 'delete' && selectedMat && (
        <DeleteMaterialModal
          material={selectedMat}
          onConfirm={afterSave}
          onCancel={closeMatModal}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Course card
// ══════════════════════════════════════════════════════════════════════════
function CourseCard({ course, index, onDots, onCardClick }) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <div
      className="mcp-card mcp-card--clickable"
      onClick={() => onCardClick(course)}
    >
      <div className="mcp-card-thumb" style={{ background: color }}>
        <span className="mcp-card-initials">{getInitials(course.course_name)}</span>
        <button
          className="mcp-card-dots"
          onClick={e => { e.stopPropagation(); onDots(course); }}
          title="View info"
        >
          <span>•••</span>
        </button>
      </div>
      <div className="mcp-card-body">
        <p className="mcp-card-name">{course.course_name}</p>
        <StatusBadge status={course.status} />
        <p className="mcp-card-dates">
          Start date: {fmt(course.start_date)} — End date: {fmt(course.end_date)}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════
const PER_PAGE = 10;

export default function ManageCoursePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  // Course modals: null | 'add' | 'info' | 'edit' | 'delete'
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);

  // Material list modal
  const [materialCourse, setMaterialCourse] = useState(null);

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
    setLoadError(false);
    try {
      const res = await apiFetch('/api/courses');
      if (!res || !res.ok) { setLoadError(true); return; }
      const data = await res.json();
      setCourses(data.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const closeModal = () => { setModal(null); setSelected(null); };
  const onSaved    = () => { closeModal(); loadData(); };

  const openDots      = course => { setSelected(course); setModal('info'); };
  const openMaterials = course => setMaterialCourse(course);

  const editInitial = selected ? {
    course_id:   selected.course_id,
    course_name: selected.course_name,
    tuition_fee: selected.tuition_fee != null ? String(selected.tuition_fee) : '',
    start_date:  selected.start_date ? selected.start_date.slice(0, 10) : '',
    end_date:    selected.end_date   ? selected.end_date.slice(0, 10)   : '',
    status:      selected.status || 'Wait for active',
    description: selected.description || '',
  } : null;

  const q        = search.toLowerCase();
  const filtered = courses.filter(c => c.course_name.toLowerCase().includes(q));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = v => { setSearch(v); setPage(1); };

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

          <button className="sidebar-item active">
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
          <h2 className="mc-topbar-title">Manage Course</h2>
        </div>

        <div className="mc-breadcrumb">Home &rsaquo; Manage Course</div>

        <div className="mc-content">
          {/* Page header */}
          <div className="mcp-page-header">
            <div>
              <h1 className="mcp-title">Manage Course</h1>
              <p className="mcp-subtitle">Class list</p>
            </div>
            <button className="mcp-add-btn" onClick={() => setModal('add')}>+ Add</button>
          </div>

          {/* Search bar */}
          <div className="mcp-search-wrap">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="mcp-search-input"
              placeholder="Search"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Content states */}
          {loading ? (
            <div className="mcp-state">Loading...</div>
          ) : loadError ? (
            <div className="mcp-state mcp-state--error">Unable to load course data</div>
          ) : courses.length === 0 ? (
            <div className="mcp-state">No courses available</div>
          ) : filtered.length === 0 ? (
            <div className="mcp-state">No courses found</div>
          ) : (
            <div className="mcp-card-grid">
              {paged.map((course, idx) => (
                <CourseCard
                  key={course.course_id}
                  course={course}
                  index={idx}
                  onDots={openDots}
                  onCardClick={openMaterials}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadError && !loading && filtered.length > PER_PAGE && (
            <div className="mcp-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`mcp-page-btn${p === safePage ? ' mcp-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Course modals ── */}
      {modal === 'add' && (
        <CourseForm onSave={onSaved} onCancel={closeModal} isEdit={false} />
      )}

      {modal === 'info' && selected && (
        <InfoModal
          course={selected}
          onClose={closeModal}
          onEdit={() => setModal('edit')}
          onDelete={() => setModal('delete')}
        />
      )}

      {modal === 'edit' && selected && (
        <CourseForm
          initial={editInitial}
          onSave={onSaved}
          onCancel={closeModal}
          isEdit={true}
        />
      )}

      {modal === 'delete' && selected && (
        <DeleteModal
          course={selected}
          onConfirm={onSaved}
          onCancel={closeModal}
        />
      )}

      {/* ── Material list modal ── */}
      {materialCourse && (
        <MaterialListModal
          course={materialCourse}
          onClose={() => setMaterialCourse(null)}
        />
      )}
    </div>
  );
}
