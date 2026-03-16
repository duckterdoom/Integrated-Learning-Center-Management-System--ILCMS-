import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import ismartLogo from '../assets/ismart-logo.png';

/* ── Hardcoded credentials ── */
const USERS = {
  admin:  { password: 'admin123', route: '/admin' },
  staff:  { password: 'staff123', route: '/staff' },
  saler:  { password: 'saler123', route: '/saler' },
};

/* ── Reset Account Modal ── */
function ResetModal({ onClose }) {
  const [resetEmail, setResetEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setSent(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Red header */}
        <div className="modal-header">
          <p>
            Enter your e-mail address below and we will send you instructions
            how to recover a password.
          </p>
        </div>

        {/* Body */}
        <div className="modal-body">
          {sent ? (
            <div className="modal-success">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p>Instructions sent! Please check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSend}>
              {/* Email input */}
              <div className="input-group modal-input-group">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="login-input"
                  required
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={onClose}>
                  Back
                </button>
                <button type="submit" className="btn-send">
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Login Page ── */
function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = USERS[username.toLowerCase()];
    if (user && user.password === password) {
      navigate(user.route);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header with logo */}
        <div className="login-header">
          <div className="logo-area">
            <img src={ismartLogo} alt="iSmart — Transforming Education" className="login-logo-img" />
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Username Input */}
          <div className="input-group">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="login-input"
              required
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="login-input"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && <p className="login-error">{error}</p>}

          {/* Reset link */}
          <div className="reset-link-row">
            <button
              type="button"
              className="reset-link"
              onClick={() => setShowReset(true)}
            >
              Reset account?
            </button>
          </div>

          {/* Login button */}
          <button type="submit" className="btn-login">
            Login
          </button>
        </form>
      </div>

      {/* Reset Account Modal */}
      {showReset && <ResetModal onClose={() => setShowReset(false)} />}
    </div>
  );
}

export default LoginPage;
