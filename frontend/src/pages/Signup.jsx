import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api/v1', '')
  : 'http://127.0.0.1:8000';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSignup() {
    if (!username || !password) {
      setError('Please fill in username and password');
      return;
    }
    setLoading(true);
    setError('');

    fetch(API_BASE + '/api/auth/signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
      .then(function(r) { return r.json().then(function(data) { return { ok: r.ok, data: data }; }); })
      .then(function(result) {
        if (result.ok) {
          localStorage.setItem('auth_token', result.data.token);
          localStorage.setItem('username', result.data.username);
          window.location.href = '/';
        } else {
          setError(result.data.error || 'Signup failed');
        }
      })
      .catch(function() {
        setError('Cannot connect to server. It may be waking up, try again in 30s.');
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <span style={styles.logoEmoji}>🗓️</span>
          <h1 style={styles.appName}>Create Your Account</h1>
          <p style={styles.tagline}>Join Interview Scheduler</p>
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={function(e) { setUsername(e.target.value); }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={function(e) { setEmail(e.target.value); }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleSignup(); }}
          />
        </div>

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>Log in</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: 20, margin: '-16px', marginBottom: '-90px',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: 28,
    width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoBox: { textAlign: 'center', marginBottom: 24 },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '8px 0 4px' },
  tagline: { fontSize: 13, color: '#64748b', margin: 0 },
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
  btn: {
    width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
    fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8,
  },
  switchText: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16 },
  link: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
};