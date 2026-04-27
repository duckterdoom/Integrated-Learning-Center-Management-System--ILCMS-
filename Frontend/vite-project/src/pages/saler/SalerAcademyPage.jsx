import { useState, useEffect } from 'react';
import './SalerAcademyPage.css';

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
    const refresh = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem('accessToken', data.accessToken);
      return fetch(`${BASE}${path}`, {
        ...options, credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.accessToken}` },
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
  return res;
}

function fmtDate(d) { return d ? String(d).slice(0, 10) : '—'; }

function calcDuration(s, e) {
  if (!s || !e) return null;
  const months = Math.round((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return null;
  return `${months} month${months !== 1 ? 's' : ''}`;
}

function fmtPrice(v) {
  if (!v && v !== 0) return 'Contact us';
  return Number(v).toLocaleString('vi-VN') + 'đ';
}

function getBullets(desc) {
  if (!desc) return [];
  return desc.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean).slice(0, 3);
}

const GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
  'linear-gradient(135deg, #0d2137 0%, #1b4332 55%, #2d6a4f 100%)',
  'linear-gradient(135deg, #1a0030 0%, #4a0a7a 55%, #7b1fa2 100%)',
  'linear-gradient(135deg, #4a0000 0%, #8b0000 55%, #c62828 100%)',
  'linear-gradient(135deg, #002171 0%, #1565c0 55%, #1e88e5 100%)',
  'linear-gradient(135deg, #1b2000 0%, #33691e 55%, #558b2f 100%)',
];

const BADGE_PALETTE = [
  { bg: '#e8f4ff', color: '#1565c0' },
  { bg: '#fff3e0', color: '#e65100' },
  { bg: '#f3e5f5', color: '#7b1fa2' },
  { bg: '#e8f5e9', color: '#2e7d32' },
  { bg: '#fce4ec', color: '#c62828' },
  { bg: '#e0f2f1', color: '#00695c' },
  { bg: '#fffde7', color: '#f57f17' },
  { bg: '#ede7f6', color: '#4527a0' },
];

function fmtSize(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(material) {
  const name = (material.file_name || '').toLowerCase();
  if (name.endsWith('.pdf'))                              return 'PDF Document';
  if (name.endsWith('.ppt') || name.endsWith('.pptx'))    return 'PowerPoint';
  if (name.endsWith('.doc') || name.endsWith('.docx'))    return 'Word Document';
  if (name.endsWith('.xls') || name.endsWith('.xlsx'))    return 'Excel Data';
  if (['.mp4','.mov','.avi','.webm'].some(e => name.endsWith(e))) return 'Video';
  if (material.link_url && !material.file_url)            return 'External Link';
  return 'Document';
}

function FileTypeIcon({ material }) {
  const name = (material.file_name || '').toLowerCase();
  if (name.endsWith('.pdf')) return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
  );
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
  if (['.mp4','.mov','.avi','.webm'].some(e => name.endsWith(e))) return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  );
  if (material.link_url && !material.file_url) return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getEnrolled(cls) {
  const seed = ((cls.class_id || 1) * 13 + 7) % 100;
  const cap  = cls.capacity || 30;
  if (cls.status === 'Finish') return cap;
  if (cls.status === 'Waiting for Activation') return Math.floor(cap * 0.1);
  return Math.floor(cap * (0.4 + (seed % 50) / 100));
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, lessonCount, gradient, onDetail }) {
  const duration = calcDuration(course.start_date, course.end_date);
  const bullets  = getBullets(course.description);

  return (
    <div className="sa-card">
      <div className="sa-card-banner" style={{ background: gradient }}>
        {course.status === 'Active'
          ? <span className="sa-badge sa-badge--best">BEST SELLER</span>
          : course.status
          ? <span className="sa-badge sa-badge--cat">{course.status.toUpperCase()}</span>
          : null
        }
        <span className="sa-card-banner-name">{course.course_name}</span>
      </div>

      <div className="sa-card-body">
        <h3 className="sa-card-title">{course.course_name}</h3>

        <div className="sa-card-meta">
          <span className="sa-card-meta-item">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration || '—'}
          </span>
          <span className="sa-card-meta-sep">|</span>
          <span className="sa-card-meta-item">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
          </span>
        </div>

        {bullets.length > 0 && (
          <ul className="sa-card-bullets">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}

        <div className="sa-card-footer">
          <div>
            <div className="sa-price-label">BASE PRICE</div>
            <div className="sa-price">{fmtPrice(course.tuition_fee)}</div>
          </div>
          <button className="sa-detail-btn" onClick={() => onDetail(course)}>
            View detail
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Class Card ────────────────────────────────────────────────────────────────
function ClassCard({ cls }) {
  const palette  = BADGE_PALETTE[(cls.course_id || 0) % BADGE_PALETTE.length];
  const gradient = GRADIENTS[(cls.course_id || 0) % GRADIENTS.length];
  const initials = getInitials(cls.teacher_name);
  const cap      = cls.capacity || 30;
  const enrolled = getEnrolled(cls);
  const pct      = Math.min(100, Math.round((enrolled / cap) * 100));

  let availLabel, availCls, barColor;
  if (cls.status === 'Finish') {
    availLabel = 'CLOSED';        availCls = 'sa-cls-avail--closed';  barColor = '#9e9e9e';
  } else if (cls.status === 'Waiting for Activation') {
    availLabel = 'WAITING';       availCls = 'sa-cls-avail--waiting'; barColor = '#f5c518';
  } else if (pct >= 80) {
    availLabel = 'LIMITED SLOTS'; availCls = 'sa-cls-avail--limited'; barColor = '#ff9800';
  } else {
    availLabel = 'OPEN';          availCls = 'sa-cls-avail--open';    barColor = '#4caf50';
  }

  return (
    <div className="sa-cls-card">
      {/* Header: course badge + folder icon */}
      <div className="sa-cls-card-header">
        <span className="sa-cls-course-badge" style={{ background: palette.bg, color: palette.color }}>
          {cls.course_name?.toUpperCase() || 'COURSE'}
        </span>
        <span className="sa-cls-folder-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
      </div>

      {/* Class name */}
      <h3 className="sa-cls-name">{cls.class_name}</h3>

      {/* Schedule */}
      <div className="sa-cls-schedule-row">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{cls.schedule_info || '—'}</span>
      </div>

      {/* Availability */}
      <div className="sa-cls-avail-section">
        <div className="sa-cls-avail-label">AVAILABILITY</div>
        <div className="sa-cls-avail-row">
          <span className="sa-cls-avail-count">{enrolled}/{cap} students</span>
          <span className={`sa-cls-avail-badge ${availCls}`}>{availLabel}</span>
        </div>
        <div className="sa-cls-progress-track">
          <div className="sa-cls-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      {/* Footer: teacher + enroll */}
      <div className="sa-cls-footer">
        <div className="sa-cls-teacher">
          <div className="sa-cls-avatar" style={{ background: gradient }}>
            {initials}
          </div>
          <div className="sa-cls-teacher-info">
            <span className="sa-cls-teacher-label">TEACHER</span>
            <span className="sa-cls-teacher-name">{cls.teacher_name}</span>
          </div>
        </div>
        <button className="sa-cls-enroll-btn">Enroll</button>
      </div>
    </div>
  );
}

// ── Material Card ─────────────────────────────────────────────────────────────
function MaterialCard({ material, idx }) {
  const palette     = BADGE_PALETTE[(material.course_id || idx) % BADGE_PALETTE.length];
  const typeLabel   = getFileTypeLabel(material);
  const sizeStr     = fmtSize(material.file_size);
  const metaStr     = [typeLabel, sizeStr].filter(Boolean).join(' • ');
  const viewUrl     = material.file_url ? `${BASE}${material.file_url}` : (material.link_url || null);
  const downloadUrl = material.file_url ? `${BASE}${material.file_url}` : null;

  return (
    <div className="sa-mat-card">
      {/* Badge + icon */}
      <div className="sa-mat-card-top">
        <span className="sa-mat-badge" style={{ background: palette.bg, color: palette.color }}>
          {(material.course_name || 'MATERIAL').toUpperCase()}
        </span>
        <div className="sa-mat-icon-wrap">
          <FileTypeIcon material={material} />
        </div>
      </div>

      {/* Title + meta */}
      <div className="sa-mat-body">
        <h3 className="sa-mat-title">{material.title}</h3>
        {metaStr && <p className="sa-mat-meta">{metaStr}</p>}
      </div>

      {/* Actions */}
      <div className="sa-mat-actions">
        {viewUrl ? (
          <a href={viewUrl} target="_blank" rel="noreferrer" className="sa-mat-view-btn">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            QUICK VIEW
          </a>
        ) : (
          <button className="sa-mat-view-btn sa-mat-view-btn--disabled" disabled>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            QUICK VIEW
          </button>
        )}
        {downloadUrl ? (
          <a href={downloadUrl} download className="sa-mat-dl-btn" title="Download">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        ) : (
          <span className="sa-mat-dl-btn sa-mat-dl-btn--disabled" title="No file">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Status badge helper ───────────────────────────────────────────────────────
function ClsStatus({ status }) {
  const key = status?.toLowerCase().replace(/\s+/g, '-') || '';
  return <span className={`sa-cls-status sa-cls-status--${key}`}>{status || '—'}</span>;
}

// ── Course Detail ─────────────────────────────────────────────────────────────
function CourseDetail({ course, allClasses, onBack }) {
  const [materials, setMaterials]   = useState([]);
  const [matLoading, setMatLoading] = useState(true);

  const courseClasses = allClasses.filter(c => c.course_id === course.course_id);
  const duration      = calcDuration(course.start_date, course.end_date);
  const gradient      = GRADIENTS[course.course_id % GRADIENTS.length];

  useEffect(() => {
    setMatLoading(true);
    apiFetch(`/api/materials?course_id=${course.course_id}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setMaterials(d.data || []))
      .finally(() => setMatLoading(false));
  }, [course.course_id]);

  return (
    <div className="sa-detail">
      {/* Back */}
      <button className="sa-back-btn" onClick={onBack}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Academy
      </button>

      {/* Banner */}
      <div className="sa-detail-banner" style={{ background: gradient }}>
        <h1 className="sa-detail-banner-title">{course.course_name}</h1>
      </div>

      {/* Info cards row */}
      <div className="sa-detail-info-row">
        <div className="sa-detail-info-item">
          <span className="sa-detail-info-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
          <div>
            <div className="sa-detail-info-label">Duration</div>
            <div className="sa-detail-info-val">{duration || '—'}</div>
          </div>
        </div>

        <div className="sa-detail-info-item">
          <span className="sa-detail-info-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </span>
          <div>
            <div className="sa-detail-info-label">Total Lessons</div>
            <div className="sa-detail-info-val">{courseClasses.length} {courseClasses.length === 1 ? 'Lesson' : 'Lessons'}</div>
          </div>
        </div>

        <div className="sa-detail-info-item">
          <span className="sa-detail-info-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </span>
          <div>
            <div className="sa-detail-info-label">Course Price</div>
            <div className="sa-detail-info-val">{fmtPrice(course.tuition_fee)}</div>
          </div>
        </div>

        <div className="sa-detail-info-item">
          <span className="sa-detail-info-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <div>
            <div className="sa-detail-info-label">Date Created</div>
            <div className="sa-detail-info-val">{fmtDate(course.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="sa-detail-section">
          <h2 className="sa-detail-section-title">Description</h2>
          <p className="sa-detail-description">{course.description}</p>
        </div>
      )}

      {/* Materials */}
      <div className="sa-detail-section">
        <h2 className="sa-detail-section-title">
          Materials
          <span className="sa-detail-count">{matLoading ? '…' : materials.length}</span>
        </h2>
        {matLoading ? (
          <div className="sa-loading-sm">Loading materials…</div>
        ) : materials.length === 0 ? (
          <div className="sa-empty-sm">No materials available for this course.</div>
        ) : (
          <div className="sa-material-list">
            {materials.map(m => (
              <div key={m.material_id} className="sa-material-item">
                <div className="sa-material-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="sa-material-info">
                  <span className="sa-material-title">{m.title}</span>
                  {m.file_name && <span className="sa-material-meta">{m.file_name}</span>}
                </div>
                {m.file_url && (
                  <a
                    href={`${BASE}${m.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="sa-material-dl-btn"
                  >
                    Download
                  </a>
                )}
                {!m.file_url && m.link_url && (
                  <a
                    href={m.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="sa-material-dl-btn"
                  >
                    Open Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classes */}
      <div className="sa-detail-section">
        <h2 className="sa-detail-section-title">
          Classes
          <span className="sa-detail-count">{courseClasses.length}</span>
        </h2>
        {courseClasses.length === 0 ? (
          <div className="sa-empty-sm">No classes have been created for this course yet.</div>
        ) : (
          <table className="sa-class-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Class Name</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courseClasses.map((cls, i) => (
                <tr key={cls.class_id}>
                  <td>{i + 1}</td>
                  <td style={{ textAlign: 'left' }}>{cls.class_name}</td>
                  <td>{cls.teacher_name}</td>
                  <td><span className="sa-schedule-badge">{cls.schedule_info || '—'}</span></td>
                  <td>{fmtDate(cls.start_date)}</td>
                  <td>{fmtDate(cls.end_date)}</td>
                  <td>{cls.capacity}</td>
                  <td><ClsStatus status={cls.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Main Academy Component ────────────────────────────────────────────────────
export default function SalerAcademyPage() {
  const [tab,           setTab]          = useState('courses');
  const [courses,       setCourses]      = useState([]);
  const [allClasses,    setAllClasses]   = useState([]);
  const [allMaterials,  setAllMaterials] = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [search,        setSearch]       = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterCourse,   setFilterCourse]   = useState('');

  const user        = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const displayName = user.username || 'Saler';

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [cRes, klRes, mRes] = await Promise.all([
        apiFetch('/api/courses'),
        apiFetch('/api/classes'),
        apiFetch('/api/materials'),
      ]);
      if (cRes.ok)  setCourses((await cRes.json()).data  || []);
      if (klRes.ok) setAllClasses((await klRes.json()).data || []);
      if (mRes.ok)  setAllMaterials((await mRes.json()).data  || []);
    } finally {
      setLoading(false);
    }
  }

  // Show detail view
  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        allClasses={allClasses}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const q = search.toLowerCase();

  const filteredCourses = courses.filter(c =>
    !q || c.course_name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  );
  const filteredClasses = allClasses.filter(c => {
    const matchSearch = !q || c.class_name?.toLowerCase().includes(q) || c.teacher_name?.toLowerCase().includes(q) || c.course_name?.toLowerCase().includes(q);
    const matchCourse = !filterCourse || String(c.course_id) === filterCourse;
    return matchSearch && matchCourse;
  });
  const filteredMaterials = allMaterials.filter(m =>
    !q || m.title?.toLowerCase().includes(q) || m.course_name?.toLowerCase().includes(q)
  );

  return (
    <div className="sa-wrap">

      {/* ── Welcome heading ── */}
      <div className="sa-knowledge-badge">Knowledge Base</div>
      <h1 className="sa-heading">Welcome {displayName},<br />Ready to Pitch?</h1>
      <p className="sa-subtext">
        Access the latest academic curriculum, case studies, and presentation decks curated for our premium partners.
      </p>

      {/* ── Search + Tabs on one row ── */}
      <div className="sa-search-tabs-row">
        <div className="sa-search-bar">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Searching..."
          />
        </div>
        {tab === 'classes' && (
          <select
            className="sa-course-filter"
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.course_id} value={String(c.course_id)}>
                {c.course_name}
              </option>
            ))}
          </select>
        )}
        <div className="sa-tabs">
          {[
            ['courses',   'ALL COURSES'],
            ['classes',   'ALL CLASS'],
            ['materials', 'ALL MATERIAL'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`sa-tab${tab === key ? ' sa-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="sa-loading">Loading…</div>
      ) : tab === 'courses' ? (
        filteredCourses.length === 0 ? (
          <div className="sa-empty">No courses found.</div>
        ) : (
          <div className="sa-grid">
            {filteredCourses.map((course, idx) => (
              <CourseCard
                key={course.course_id}
                course={course}
                lessonCount={allClasses.filter(c => c.course_id === course.course_id).length}
                gradient={GRADIENTS[idx % GRADIENTS.length]}
                onDetail={setSelectedCourse}
              />
            ))}
          </div>
        )
      ) : tab === 'classes' ? (
        filteredClasses.length === 0 ? (
          <div className="sa-empty">No classes found.</div>
        ) : (
          <div className="sa-cls-grid">
            {filteredClasses.map(cls => (
              <ClassCard key={cls.class_id} cls={cls} />
            ))}
          </div>
        )
      ) : (
        filteredMaterials.length === 0 ? (
          <div className="sa-empty">No materials found.</div>
        ) : (
          <div className="sa-mat-grid">
            {filteredMaterials.map((m, idx) => (
              <MaterialCard key={m.material_id} material={m} idx={idx} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
