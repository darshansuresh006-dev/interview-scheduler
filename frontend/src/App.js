import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Interviewers from './pages/Interviewers';
import Requests from './pages/Requests';
import Scheduled from './pages/Scheduled';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { path: '/',             label: 'Dashboard',    Icon: Icons.Dashboard },
  { path: '/interviewers', label: 'Interviewers', Icon: Icons.Users     },
  { path: '/requests',     label: 'Requests',     Icon: Icons.Clipboard },
  { path: '/scheduled',    label: 'Scheduled',    Icon: Icons.Calendar  },
];

// ── Sidebar + Topbar layout, only shown when logged in ──
function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app">
      {sidebarOpen && <div className="overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <div className="logo-icon"><Icons.Calendar /></div>
          <div className="logo-text">
            <span className="logo-title">Interview</span>
            <span className="logo-sub">Scheduler</span>
          </div>
          <button className="icon-btn sidebar__close" onClick={closeSidebar}>
            <Icons.Close />
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="nav-section-label">Main Menu</p>
          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="nav-item__icon"><Icon /></span>
              <span className="nav-item__label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-info">
            <div className="user-avatar">
              {(localStorage.getItem('username') || 'A')[0].toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">
                {localStorage.getItem('username') || 'Admin'}
              </span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} type="button">
            <Icons.Logout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="icon-btn topbar__menu" onClick={() => setSidebarOpen(true)}>
            <Icons.Menu />
          </button>
          <div className="topbar__brand">
            <span className="topbar__brand-name">Interview Scheduler</span>
          </div>
          <div className="topbar__right">
            <div className="ai-badge">
              <Icons.Star />
              <span>AI Powered</span>
            </div>
            <button className="topbar__logout-btn" onClick={handleLogout} type="button">
              <Icons.Logout />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — wrapped in AppShell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell><Dashboard /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewers"
          element={
            <ProtectedRoute>
              <AppShell><Interviewers /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <AppShell><Requests /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scheduled"
          element={
            <ProtectedRoute>
              <AppShell><Scheduled /></AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}