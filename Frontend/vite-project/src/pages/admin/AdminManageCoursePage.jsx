import { useState, useEffect, useCallback, useRef } from 'react';
import AdminNavbar from './AdminNavbar';
import './AdminHomePage.css';
import './AdminManageCoursePage.css';

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

// For multipart/form-data (file uploads)
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
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function fmtFee(val) {
  if (!val && val !== 0) return '—';
  return Number(val).toLocaleString('vi-VN');
}

function calcDuration(start, end) {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months <= 0) return '—';
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
  const years = Math.round((months / 12) * 10) / 10;
  return `${years} year${years !== 1 ? 's' : ''}`;
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusText({ status }) {
  if (status === 'Active')  return <span className="amcp-status amcp-status--active">Actived</span>;
  if (status === 'Finish')  return <span className="amcp-status amcp-status--finish">Finish</span>;
  return <span className="amcp-status amcp-status--waiting">Wait for actived</span>;
}

// ══════════════════════════════════════════════════════════════════════════
// Course modals
// ══════════════════════════════════════════════════════════════════════════

const EMPTY_FORM = {
  course_name: '', tuition_fee: '', start_date: '',
  end_date: '', status: 'Wait for active', description: '',
};

function CourseForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm]   = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.course_name.trim()) { setError('Course name is required.'); return; }

    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url    = isEdit ? `/api/courses/${initial.course_id}` : '/api/courses';
      const body   = {
        course_name: form.course_name.trim(),
        tuition_fee: form.tuition_fee !== '' ? Number(form.tuition_fee) : null,
        start_date:  form.start_date || null,
        end_date:    form.end_date   || null,
        status:      form.status,
        description: form.description || null,
      };
      const res  = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'An error occurred.'); setSaving(false); return; }
      onSave();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="amcp-modal-overlay" onClick={onCancel}>
      <div className="amcp-modal" onClick={e => e.stopPropagation()}>
        <div className="amcp-modal-header">
          <h3>{isEdit ? 'Edit Course' : 'Add Course'}</h3>
          <button className="amcp-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="amcp-modal-body">
          {error && <div className="amcp-error">{error}</div>}

          <div className="amcp-form-row amcp-form-row--full">
            <div className="amcp-form-group">
              <label>Course name <span style={{ color: '#dc3545' }}>*</span></label>
              <input
                placeholder="Enter course name"
                value={form.course_name}
                onChange={e => set('course_name', e.target.value)}
              />
            </div>
          </div>

          <div className="amcp-form-row">
            <div className="amcp-form-group">
              <label>Course tuition fee</label>
              <input
                type="number"
                min="0"
                placeholder="Enter course fee"
                value={form.tuition_fee}
                onChange={e => set('tuition_fee', e.target.value)}
              />
            </div>
            <div className="amcp-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Wait for active">Wait for active</option>
                <option value="Active">Active</option>
                <option value="Finish">Finish</option>
              </select>
            </div>
          </div>

          <div className="amcp-form-row">
            <div className="amcp-form-group">
              <label>Start date</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className="amcp-form-group">
              <label>End date</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>

          <div className="amcp-form-row amcp-form-row--full">
            <div className="amcp-form-group">
              <label>Description of the course</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="amcp-modal-footer">
          <button className="amcp-btn amcp-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save' : 'Add'}
          </button>
          <button className="amcp-btn amcp-btn--cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CourseInfoModal({ course, onClose, onEdit, onDelete }) {
  return (
    <div className="amcp-modal-overlay" onClick={onClose}>
      <div className="amcp-modal" onClick={e => e.stopPropagation()}>
        <div className="amcp-modal-header">
          <h3>Information</h3>
          <button className="amcp-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="amcp-modal-body">
          <div className="amcp-info-grid">
            <div className="amcp-info-item amcp-info-item--full">
              <span className="amcp-info-label">Course</span>
              <span className="amcp-info-value">{course.course_name}</span>
            </div>
            <div className="amcp-info-item">
              <span className="amcp-info-label">Course tuition fee</span>
              <span className="amcp-info-value">{fmtFee(course.tuition_fee)}</span>
            </div>
            <div className="amcp-info-item">
              <span className="amcp-info-label">Status</span>
              <span className="amcp-info-value"><StatusText status={course.status} /></span>
            </div>
            <div className="amcp-info-item">
              <span className="amcp-info-label">Start date</span>
              <span className="amcp-info-value">{fmtDate(course.start_date)}</span>
            </div>
            <div className="amcp-info-item">
              <span className="amcp-info-label">Duration</span>
              <span className="amcp-info-value">{calcDuration(course.start_date, course.end_date)}</span>
            </div>
            <div className="amcp-info-item amcp-info-item--full">
              <span className="amcp-info-label">Description of the course</span>
              <span className="amcp-info-value" style={{ whiteSpace: 'pre-wrap', minHeight: 56 }}>
                {course.description || '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="amcp-modal-footer">
          <button className="amcp-btn amcp-btn--primary" onClick={onEdit}>Update</button>
          <button className="amcp-btn amcp-btn--danger"  onClick={onDelete}>Remove</button>
          <button className="amcp-btn amcp-btn--cancel"  onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DeleteCourseModal({ course, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true); setError('');
    try {
      const res = await apiFetch(`/api/courses/${course.course_id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Failed to delete.'); setDeleting(false); return;
      }
      onConfirm();
    } catch {
      setError('Network error. Please try again.'); setDeleting(false);
    }
  };

  return (
    <div className="amcp-modal-overlay" onClick={onCancel}>
      <div className="amcp-modal amcp-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="amcp-modal-header">
          <h3>Confirm Delete</h3>
          <button className="amcp-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="amcp-modal-body">
          {error && <div className="amcp-error">{error}</div>}
          <p className="amcp-delete-msg">Are you sure want to delete this course?</p>
        </div>
        <div className="amcp-modal-footer">
          <button className="amcp-btn amcp-btn--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Confirm'}
          </button>
          <button className="amcp-btn amcp-btn--cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Admin Material modals (red theme)
// ══════════════════════════════════════════════════════════════════════════

function AdminMaterialForm({ courseId, courseName, initial, onSave, onCancel, isEdit }) {
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
      setError('Please upload a file or provide a link URL.'); return;
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
      setError('Network error. Please try again.'); setSaving(false);
    }
  };

  return (
    <div className="amat-overlay amat-overlay--sub" onClick={onCancel}>
      <div className="amat-modal amat-modal--form" onClick={e => e.stopPropagation()}>
        <div className="amat-modal-header">
          <h3>{isEdit ? 'Update Material' : 'Add Material'}</h3>
          <button className="amat-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="amat-modal-body--padded">
          {error && <div className="amat-error">{error}</div>}

          <div className="amat-form-group">
            <label>Title</label>
            <input
              placeholder="Enter material title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="amat-form-group">
            <label>Course</label>
            <input value={courseName} readOnly />
          </div>

          <div className="amat-form-group">
            <label>File {isEdit && fileName ? `(current: ${fileName})` : ''}</label>
            <div className="amat-upload-area" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {file ? (
                <span className="amat-upload-filename">{file.name}</span>
              ) : (
                <span className="amat-upload-placeholder">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <span>{isEdit ? 'Click to replace file' : 'Click to upload file'}</span>
                  <span className="amat-upload-hint">PDF, DOC, DOCX, PPT, PPTX (max 20 MB)</span>
                </span>
              )}
            </div>
          </div>

          <div className="amat-form-group">
            <label>File URL (link)</label>
            <input
              placeholder="https://..."
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
          </div>
        </div>
        <div className="amat-modal-footer">
          <button className="amat-btn amat-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add'}
          </button>
          <button className="amat-btn amat-btn--cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AdminMaterialInfoModal({ material, onClose, onEdit, onDelete }) {
  return (
    <div className="amat-overlay amat-overlay--sub" onClick={onClose}>
      <div className="amat-modal amat-modal--info" onClick={e => e.stopPropagation()}>
        <div className="amat-modal-header">
          <h3>Information</h3>
          <button className="amat-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="amat-modal-body--padded">
          <div className="amat-info-item">
            <span className="amat-info-label">Title</span>
            <span className="amat-info-value">{material.title}</span>
          </div>
          <div className="amat-info-item">
            <span className="amat-info-label">File url</span>
            <span className="amat-info-value">
              {material.link_url
                ? <a href={material.link_url} target="_blank" rel="noopener noreferrer">{material.link_url}</a>
                : (material.file_url
                    ? <a href={`${BASE}${material.file_url}`} target="_blank" rel="noopener noreferrer">{material.file_name || material.file_url}</a>
                    : '—')
              }
            </span>
          </div>
          <div className="amat-info-item">
            <span className="amat-info-label">File size</span>
            <span className="amat-info-value">{formatFileSize(material.file_size)}</span>
          </div>
          <div className="amat-info-item">
            <span className="amat-info-label">Created by</span>
            <span className="amat-info-value">{material.created_by_name || '—'}</span>
          </div>
          <div className="amat-info-item">
            <span className="amat-info-label">Created date</span>
            <span className="amat-info-value">
              {material.created_at ? fmtDate(material.created_at) : '—'}
            </span>
          </div>
        </div>
        <div className="amat-modal-footer">
          <button className="amat-btn amat-btn--primary" onClick={onEdit}>Update</button>
          <button className="amat-btn amat-btn--primary" onClick={onDelete}>Remove</button>
          <button className="amat-btn amat-btn--cancel"  onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AdminDeleteMaterialModal({ material, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true); setError('');
    try {
      const res = await apiFetch(`/api/materials/${material.material_id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Failed to delete.'); setDeleting(false); return;
      }
      onConfirm();
    } catch {
      setError('Network error. Please try again.'); setDeleting(false);
    }
  };

  return (
    <div className="amat-overlay amat-overlay--sub" onClick={onCancel}>
      <div className="amat-modal amat-modal--confirm" onClick={e => e.stopPropagation()}>
        <div className="amat-modal-header">
          <h3>Confirm Delete</h3>
          <button className="amat-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="amat-modal-body--padded">
          {error && <div className="amat-error">{error}</div>}
          <p className="amat-confirm-msg">Are you sure want to delete this material?</p>
        </div>
        <div className="amat-modal-footer">
          <button className="amat-btn amat-btn--primary" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Confirm'}
          </button>
          <button className="amat-btn amat-btn--cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AdminMaterialListModal({ course, onClose }) {
  const [materials, setMaterials]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(false);
  const [matSearch, setMatSearch]     = useState('');
  const [matModal, setMatModal]       = useState(null); // null | 'add' | 'info' | 'edit' | 'delete'
  const [selectedMat, setSelectedMat] = useState(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true); setLoadError(false);
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

  const q = matSearch.toLowerCase();
  const filtered = materials.filter(m => m.title.toLowerCase().includes(q));

  return (
    <>
      {/* ── Material list overlay ── */}
      <div className="amat-overlay" onClick={onClose}>
        <div className="amat-modal amat-modal--list" onClick={e => e.stopPropagation()}>

          <div className="amat-modal-header">
            <h3>Material list — {course.course_name}</h3>
            <button className="amat-modal-close" onClick={onClose}>×</button>
          </div>

          {/* Red search bar */}
          <div className="amat-search-bar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="amat-search-input"
              placeholder="Search material"
              value={matSearch}
              onChange={e => setMatSearch(e.target.value)}
            />
          </div>

          <div className="amat-modal-body">
            {loading ? (
              <div className="amat-state">Loading...</div>
            ) : loadError ? (
              <div className="amat-state amat-state--error">Unable to load material data</div>
            ) : materials.length === 0 ? (
              <div className="amat-state">No materials available</div>
            ) : filtered.length === 0 ? (
              <div className="amat-state">No materials found</div>
            ) : (
              <table className="amat-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Material Name</th>
                    <th style={{ width: 80 }}>File Size</th>
                    <th style={{ width: 64 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={m.material_id}>
                      <td>{i + 1}</td>
                      <td className="amat-td-name">{m.title}</td>
                      <td>{formatFileSize(m.file_size)}</td>
                      <td>
                        <button
                          className="amat-action-btn"
                          title="View info"
                          onClick={() => { setSelectedMat(m); setMatModal('info'); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </div>

          <div className="amat-modal-footer">
            <button className="amat-btn amat-btn--primary" onClick={() => setMatModal('add')}>+ Add</button>
          </div>
        </div>
      </div>

      {/* ── Sub-modals (z-index 1100) ── */}
      {matModal === 'add' && (
        <AdminMaterialForm
          courseId={course.course_id}
          courseName={course.course_name}
          onSave={afterSave}
          onCancel={closeMatModal}
          isEdit={false}
        />
      )}

      {matModal === 'info' && selectedMat && (
        <AdminMaterialInfoModal
          material={selectedMat}
          onClose={closeMatModal}
          onEdit={() => setMatModal('edit')}
          onDelete={() => setMatModal('delete')}
        />
      )}

      {matModal === 'edit' && selectedMat && (
        <AdminMaterialForm
          courseId={course.course_id}
          courseName={course.course_name}
          initial={selectedMat}
          onSave={afterSave}
          onCancel={closeMatModal}
          isEdit={true}
        />
      )}

      {matModal === 'delete' && selectedMat && (
        <AdminDeleteMaterialModal
          material={selectedMat}
          onConfirm={afterSave}
          onCancel={closeMatModal}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════
const PER_PAGE = 10;

export default function AdminManageCoursePage() {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);

  // Course modals: null | 'add' | 'info' | 'edit' | 'delete'
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);

  // Material list modal
  const [materialCourse, setMaterialCourse] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError(false);
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
  const filtered = courses
    .filter(c => c.course_name.toLowerCase().includes(q))
    .sort((a, b) => a.course_id - b.course_id);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <AdminNavbar />

      {/* Breadcrumb */}
      <div className="breadcrumb">Home &rsaquo; Manage Course</div>

      <div className="amcp-content">
        {/* Page header */}
        <div className="amcp-page-header">
          <div>
            <h1 className="amcp-title">Manage Course</h1>
            <p className="amcp-subtitle">Course list</p>
          </div>
          <div className="amcp-btn-group">
            <button className="amcp-add-btn" onClick={() => setModal('add')}>+ Add</button>
          </div>
        </div>

        {/* Card with search + table */}
        <div className="amcp-card">
          {/* Red search bar */}
          <div className="amcp-search-bar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="amcp-search-input"
              placeholder="Search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="amcp-loading">Loading...</div>
          ) : loadError ? (
            <div className="amcp-error-state">Unable to load course data</div>
          ) : (
            <table className="amcp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course name</th>
                  <th>Course fee</th>
                  <th>Create date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="amcp-empty">No courses available</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="amcp-empty">No courses found</div>
                    </td>
                  </tr>
                ) : (
                  paged.map(c => (
                    <tr
                      key={c.course_id}
                      onClick={() => setMaterialCourse(c)}
                      title="Click to view materials"
                    >
                      <td>{c.course_id}</td>
                      <td className="amcp-td-name">{c.course_name}</td>
                      <td>{fmtFee(c.tuition_fee)}</td>
                      <td>{fmtDate(c.created_at)}</td>
                      <td>{calcDuration(c.start_date, c.end_date)}</td>
                      <td><StatusText status={c.status} /></td>
                      <td>
                        <button
                          className="amcp-action-btn"
                          title="View info"
                          onClick={e => { e.stopPropagation(); setSelected(c); setModal('info'); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loadError && !loading && filtered.length > PER_PAGE && (
            <div className="amcp-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`amcp-page-btn${p === safePage ? ' amcp-page-btn--active' : ''}`}
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
        <CourseInfoModal
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
        <DeleteCourseModal
          course={selected}
          onConfirm={onSaved}
          onCancel={closeModal}
        />
      )}

      {/* ── Material list modal ── */}
      {materialCourse && (
        <AdminMaterialListModal
          course={materialCourse}
          onClose={() => setMaterialCourse(null)}
        />
      )}
    </div>
  );
}
