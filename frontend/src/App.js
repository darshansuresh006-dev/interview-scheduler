import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Interviewers from './pages/Interviewers';
import Requests from './pages/Requests';
import Scheduled from './pages/Scheduled';
import Login from './pages/Login';
import Signup from './pages/Signup';

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: '🏠' },
  { path: '/interviewers', label: 'Interviewers', icon: '👥' },
  { path: '/requests',     label: 'Requests',     icon: '📋' },
  { path: '/scheduled',    label: 'Scheduled',    icon: '✅' },
];

function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav style={styles.bottomNav}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            ...styles.navItem,
            color: pathname === item.path ? '#6366f1' : '#64748b',
            borderTop: pathname === item.path
              ? '2px solid #6366f1'
              : '2px solid transparent',
          }}
        >
          <span style={styles.navIcon}>{item.icon}</span>
          <span style={styles.navLabel}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AppContent() {
  const token = localStorage.getItem('auth_token');
  const { pathname } = useLocation();
  const publicPaths = ['/login', '/signup'];

  // Not logged in and trying to access a protected page -> send to login
  if (!token && !publicPaths.includes(pathname)) {
    window.location.href = '/login';
    return null;
  }

  // Already logged in but sitting on login/signup -> send to dashboard
  if (token && publicPaths.includes(pathname)) {
    window.location.href = '/';
    return null;
  }

  // Public pages (login/signup) render without the app shell
  if (publicPaths.includes(pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>🗓️</span>
          <h1 style={styles.title}>Interview Scheduler</h1>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.badge}>AI Powered</span>
          <button
            style={styles.logoutBtn}
            onClick={function() {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('username');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/interviewers" element={<Interviewers />} />
          <Route path="/requests"     element={<Requests />} />
          <Route path="/scheduled"    element={<Scheduled />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const styles = {
  app: {
    maxWidth: 520,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logo: { fontSize: 22 },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 10,
    padding: '3px 8px',
    borderRadius: 20,
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
  },
  main: {
    padding: '16px',
    paddingBottom: 90,
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 520,
    background: '#fff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '6px 0 12px',
    zIndex: 100,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '6px 16px',
    gap: 2,
  },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: 600 },
};