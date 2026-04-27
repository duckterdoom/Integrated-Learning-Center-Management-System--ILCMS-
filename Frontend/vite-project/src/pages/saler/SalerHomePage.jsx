import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SalerHomePage.css';
import SalerAcademyPage from './SalerAcademyPage';

const HERO_ARTICLE = {
  category: 'FEATURED COURSE',
  catColor: '#c62828',
  catBg: '#fce4ec',
  title: 'IELTS Preparation 2026: Intensive Training to Achieve Band 6.5+ Across All Four Skills',
  desc: 'Join our most successful preparation program with a proven track record — 87% of students achieve their target band on the first attempt. Full coverage of Listening, Reading, Writing & Speaking with expert coaches.',
  img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=420&h=270&fit=crop&auto=format',
  date: 'May 2026',
  price: '6,000,000đ',
};

const HOME_ARTICLES = [
  {
    id: 1,
    category: 'LANGUAGE COURSE',
    catColor: '#1565c0',
    catBg: '#e3f2fd',
    title: 'English for Beginners: Build Your Foundation from Zero to Confident Speaker',
    desc: 'Step-by-step program covering essential grammar, vocabulary, and everyday conversation. Over 2,500 students have completed this course and landed international-facing roles.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=220&h=148&fit=crop&auto=format',
    meta: 'Jan 2026  ·  3,500,000đ',
  },
  {
    id: 2,
    category: 'MATHEMATICS',
    catColor: '#e65100',
    catBg: '#fff3e0',
    title: 'Advanced Mathematics for University Entrance: Calculus, Algebra & Statistics',
    desc: 'University-level maths with expert instructors, weekly problem sets, and live Q&A. 95% of our students scored 8+ in their entrance exams after completing this program.',
    img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=220&h=148&fit=crop&auto=format',
    meta: 'Feb 2026  ·  4,200,000đ',
  },
  {
    id: 3,
    category: 'PROGRAMMING',
    catColor: '#2e7d32',
    catBg: '#e8f5e9',
    title: 'Programming Fundamentals with Python: From Variables to Real-World Projects',
    desc: 'Learn Python from scratch through guided coding exercises and portfolio projects. Gain job-ready skills in 6 months with our industry-aligned, mentor-supported curriculum.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=220&h=148&fit=crop&auto=format',
    meta: 'Mar 2026  ·  5,000,000đ',
  },
  {
    id: 4,
    category: 'BUSINESS ENGLISH',
    catColor: '#6a1b9a',
    catBg: '#f3e5f5',
    title: 'EOB – English for Business: Professional Communication & Presentation Mastery',
    desc: 'Master business writing, emails, negotiations, and high-stakes presentations. Designed for managers, sales teams, and professionals targeting global career advancement.',
    img: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d4?w=220&h=148&fit=crop&auto=format',
    meta: 'Mar 2026  ·  4,800,000đ',
  },
  {
    id: 5,
    category: 'DATA SCIENCE & AI',
    catColor: '#00695c',
    catBg: '#e0f2f1',
    title: 'Data Science & AI: Master Machine Learning with Python and Real-World Datasets',
    desc: 'Comprehensive data analysis and machine learning course using Python, Pandas, and scikit-learn. Build AI-powered applications and gain sought-after skills in the tech industry.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=220&h=148&fit=crop&auto=format',
    meta: 'Apr 2026  ·  7,500,000đ',
  },
  {
    id: 6,
    category: 'WEB DEVELOPMENT',
    catColor: '#0277bd',
    catBg: '#e1f5fe',
    title: 'Web Development Bootcamp: Full-Stack with HTML, CSS, React & Node.js',
    desc: 'Go from zero to full-stack developer in 6 months. Build 5 real portfolio projects, master Git, and receive dedicated career support to land your first developer role.',
    img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=220&h=148&fit=crop&auto=format',
    meta: 'Jun 2026  ·  8,000,000đ',
  },
];

export default function SalerHomePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [activeNav, setActiveNav]   = useState('home');

  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || 'Alex Mercer';
  const initials    = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="sl-layout">

      {/* ════════ SIDEBAR ════════ */}
      <aside className="sl-sidebar">

        <div className="sl-sidebar-logo">
          <img src="/image.png" alt="iSmart – Transforming Education" />
        </div>

        <nav className="sl-nav">
          <button className={`sl-nav-item${activeNav === 'home'    ? ' active' : ''}`} onClick={() => setActiveNav('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>

          <button className={`sl-nav-item${activeNav === 'academy' ? ' active' : ''}`} onClick={() => setActiveNav('academy')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Academy
          </button>

          <button className={`sl-nav-item${activeNav === 'report'  ? ' active' : ''}`} onClick={() => setActiveNav('report')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Report
          </button>
        </nav>

        <div className="sl-sidebar-spacer" />

        <div className="sl-sidebar-user">
          <div className="sl-avatar">{initials}</div>
          <div className="sl-avatar-info">
            <span className="sl-avatar-name">{displayName}</span>
            <span className="sl-avatar-role">Senior Sales Lead</span>
          </div>
          <button
            className="sl-door-btn"
            title="Logout"
            onClick={() => setShowLogout(v => !v)}
          >
            {/* Door / logout icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>

          {showLogout && (
            <div className="sl-logout-popup" onClick={e => e.stopPropagation()}>
              <p>Do you want to leave?</p>
              <div className="sl-logout-actions">
                <button className="sl-logout-yes"    onClick={handleLogout}>Yes</button>
                <button className="sl-logout-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ════════ MAIN ════════ */}
      <div className="sl-main">

        {/* Top-right icon buttons */}
        <div className="sl-topbar">
          <button className="sl-topbar-btn" title="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="sl-topbar-btn" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        <div className="sl-content">

          {activeNav === 'academy' ? (
            <SalerAcademyPage />
          ) : activeNav === 'report' ? (
            <div style={{ color: '#888', fontSize: 14, paddingTop: 40, textAlign: 'center' }}>
              Report — coming soon.
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className="sl-knowledge-badge">Knowledge Base</div>
              <h1 className="sl-heading">Welcome {displayName},<br />Ready to Pitch?</h1>
              <p className="sl-subtext">
                Access the latest academic curriculum, case studies, and presentation decks curated for our premium partners.
              </p>

              {/* ── News Feed ── */}
              <div className="sl-news-feed">

                {/* Section label */}
                <div className="sl-news-header">
                  <span className="sl-news-label">LATEST COURSES &amp; NEWS</span>
                  <button className="sl-news-see-all" onClick={() => setActiveNav('academy')}>
                    See all courses →
                  </button>
                </div>

                {/* Hero / Featured article */}
                <div className="sl-hero-article">
                  <div className="sl-hero-text">
                    <span
                      className="sl-news-cat"
                      style={{ color: HERO_ARTICLE.catColor, background: HERO_ARTICLE.catBg }}
                    >
                      {HERO_ARTICLE.category}
                    </span>
                    <h2 className="sl-hero-title">{HERO_ARTICLE.title}</h2>
                    <p className="sl-hero-desc">{HERO_ARTICLE.desc}</p>
                    <div className="sl-hero-meta">
                      <span className="sl-hero-date">{HERO_ARTICLE.date}</span>
                      <span className="sl-meta-sep">·</span>
                      <span className="sl-hero-price">{HERO_ARTICLE.price}</span>
                      <button className="sl-enroll-btn" onClick={() => setActiveNav('academy')}>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                  <div className="sl-hero-img-wrap">
                    <img src={HERO_ARTICLE.img} alt="Featured course" className="sl-hero-img" />
                  </div>
                </div>

                {/* Article list */}
                {HOME_ARTICLES.map(a => (
                  <div key={a.id} className="sl-news-item">
                    <div className="sl-news-text">
                      <span
                        className="sl-news-cat"
                        style={{ color: a.catColor, background: a.catBg }}
                      >
                        {a.category}
                      </span>
                      <h3 className="sl-news-title">{a.title}</h3>
                      <p className="sl-news-desc">{a.desc}</p>
                      <span className="sl-news-meta">{a.meta}</span>
                    </div>
                    <div className="sl-news-img-wrap">
                      <img src={a.img} alt={a.category} className="sl-news-img" />
                    </div>
                  </div>
                ))}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
