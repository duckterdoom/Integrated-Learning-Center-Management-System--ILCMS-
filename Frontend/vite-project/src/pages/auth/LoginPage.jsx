import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import ismartLogo from '../../assets/ismart-logo.png';

const ROLE_ROUTES = {
  Admin: '/admin',
  Staff: '/staff',
  Sale:  '/saler',
};

// ── Forgot Password Modal ──────────────────────────────────────────────────
// User Story 2: submit username → Admin is notified
function ForgotPasswordModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [message, setMessage]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStatus('loading');
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p>Enter your username below and the Admin will be notified to provide you with a new password.</p>
        </div>

        <div className="modal-body">
          {status === 'success' ? (
            <div className="modal-success">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p>{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group modal-input-group">
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
                  onChange={(e) => { setUsername(e.target.value); setMessage(''); setStatus('idle'); }}
                  className="login-input"
                  required
                  autoFocus
                  minLength={3}
                  maxLength={30}
                />
              </div>

              {status === 'error' && <p className="login-error">{message}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={onClose}>
                  Back to Login
                </button>
                <button type="submit" className="btn-send" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive HTTP-only cookie
        body:        JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      // Store access token and user info
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Role-based redirect
      const route = ROLE_ROUTES[data.user.roleName];
      if (route) {
        navigate(route);
      } else {
        setError('Unknown role. Please contact Admin.');
      }
    } catch {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-area">
            <img src={ismartLogo} alt="iSmart — Transforming Education" className="login-logo-img" />
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {/* Username */}
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
              minLength={3}
              maxLength={30}
              autoComplete="username"
            />
          </div>

          {/* Password */}
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
              minLength={6}
              maxLength={50}
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

          {error && <p className="login-error">{error}</p>}

          <div className="reset-link-row">
            <button type="button" className="reset-link" onClick={() => setShowForgot(true)}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

export default LoginPage;
