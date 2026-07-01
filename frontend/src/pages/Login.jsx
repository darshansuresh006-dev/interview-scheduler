import React, { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError('');

    fetch('https://interview-scheduler-ocex.onrender.com/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('username', username);
          window.location.href = '/';
        } else {
          setError('Invalid username or password');
        }
      })
      .catch(function() {
        setError('Cannot connect to server');
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <span style={styles.logoEmoji}>🗓️</span>
          <h1 style={styles.appName}>Interview Scheduler</h1>
          <p style={styles.tagline}>AI-Powered Interview Management</p>
        </div>

        {error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : null}

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={function(e) { setUsername(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleLogin(); }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleLogin(); }}
          />
        </div>

        <button
          style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={styles.hint}>
          <p style={styles.hintText}>
            First time? Create a superuser account:
          </p>
          <code style={styles.code}>
            python manage.py createsuperuser
          </code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: 20,
    margin: '-16px',
    marginBottom: '-90px',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoBox: {
    textAlign: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1e293b',
    margin: '8px 0 4px',
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: 600,
  },
  field: { marginBottom: 14 },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    border: '2px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  loginBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '0.02em',
  },
  hint: {
    marginTop: 20,
    padding: '12px 14px',
    background: '#f8fafc',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    margin: '0 0 6px',
  },
  code: {
    fontSize: 11,
    background: '#1e293b',
    color: '#a5f3fc',
    padding: '4px 8px',
    borderRadius: 6,
    display: 'block',
  },
};