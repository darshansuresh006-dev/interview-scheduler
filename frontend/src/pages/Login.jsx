import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data, status: res.status };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.token) {
          localStorage.setItem("auth_token", result.data.token);
          localStorage.setItem("username", username);
          // ✅ FIXED: redirect to "/" not "/dashboard"
          navigate("/");
        } else {
          setError(result.data.detail || "Invalid username or password");
        }
      })
      .catch(function () {
        setError("Cannot connect to server. Try again in 30 seconds.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoEmoji}>📅</span>
          <h1 style={styles.appName}>Interview Scheduler</h1>
        </div>
        <p style={styles.tagline}>AI Powered Interview Management</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={function (e) { setUsername(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={function (e) { setPassword(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }}
          />
        </div>

        <button
          style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <a href="/signup" style={styles.link}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 40,
    width: 400,
    maxWidth: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  logoRow: { display: "flex", justifyContent: "center", alignItems: 'center', gap: 10 },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: '8px 0' },
  tagline: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 30 },
  errorBox: {
    background: "#fee2e2", color: "#dc2626", padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 600,
  },
  field: { marginBottom: 18 },
  label: {
    display: 'block', fontSize: 13, fontWeight: 700, color: "#374151",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4,
  },
  input: {
    width: '100%', border: '2px solid #e2e8f0', borderRadius: 10,
    padding: '12px 14px', fontSize: 15, boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
  },
  loginBtn: {
    width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
    fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8,
    letterSpacing: '0.02em',
  },
  switchText: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16 },
  link: { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
};