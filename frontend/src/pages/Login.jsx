import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save JWT token
        localStorage.setItem("token", data.access);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // Redirect based on role
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        setError(data.detail || "Invalid username or password");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>AI Interview Scheduler</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===============================
   SIMPLE CLEAN STYLES
================================ */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  card: {
    background: "white",
    padding: 40,
    borderRadius: 12,
    width: 350,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    marginTop: 5,
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#6366f1",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
};