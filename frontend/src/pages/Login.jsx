import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api/v1', '')
  : 'http://127.0.0.1:8000';

export default function Login() {
  const [role, setRole] = useState('user'); // 'admin' | 'user'
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

    fetch(API_BASE + '/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then(function(r) {
        return r.json().then(function(data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function(result) {
        if (result.ok && result.data.token) {
          const isAdminAccount = !!result.data.is_admin;

          // Guard: block mismatched portal selection
          if (role === 'admin' && !isAdminAccount) {
            setError('This account does not have admin access.');
            setLoading(false);
            return;
          }
          if (role === 'user' && isAdminAccount) {
            setError('This is an admin account. Please switch to "Admin" above to log in.');
            setLoading(false);
            return;
          }

          localStorage.setItem('auth_token', result.data.token);
          localStorage.setItem('username', result.data.username);
          localStorage.setItem('is_admin', isAdminAccount ? 'true' : 'false');
          window.location.href = isAdminAccount ? '/' : '/user';
        } else {
          setError((result.data && result.data.error) || 'Invalid username or password');
          setLoading(false);
        }
      })
      .catch(function() {
        setError('Cannot connect to server. It may be waking up — try again in 30 seconds.');
        setLoading(false);
      });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <span style={styles.logoEmoji}>🗓️</span>
          <h1 style={styles.appName}>Interview Scheduler</h1>
          <p style={styles.tagline}>AI-Powered Interview Management</p>
        </div>

        <div style={styles.roleToggle}>
          <button
            type="button"
            style={{
              ...styles.roleBtn,
              ...(role === 'user' ? styles.roleBtnActive : {}),
            }}
            onClick={function() { setRole('user'); setError(''); }}
          >
            User
          </button>
          <button
            type="button"
            style={{
              ...styles.roleBtn,
              ...(role === 'admin' ? styles.roleBtnActive : {}),
            }}
            onClick={function() { setRole('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

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
          {loading ? 'Logging in...' : `Login as ${role === 'admin' ? 'Admin' : 'User'}`}
        </button>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <a href="/signup" style={styles.link}>Sign up</a>
        </p>
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
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoBox: { textAlign: 'center', marginBottom: 20 },
  logoEmoji: { fontSize: 48 },
  appName: { fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '8px 0 4px' },
  tagline: { fontSize: 13, color: '#64748b', margin: 0 },
  roleToggle: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  roleBtn: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '10px 0',
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 14,
    color: '#64748b',
    cursor: 'pointer',
  },
  roleBtnActive: {
    background: '#fff',
    color: '#6366f1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  errorBox: {
    background: '#fee2e2', color: '#dc2626', padding: '10px 14px',
    borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 600,
  },
  field: { marginBottom: 14 },
  label: {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input: {
    width: '100%', border: '2px solid #e2e8f0', borderRadius: 10,
    padding: '12px 14px', fontSize: 15, boxSizing: 'border-box', outline: 'none',
  },
  loginBtn: {
    width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
    fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8,
  },
  switchText: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16 },
  link: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
};
