import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Interviewers from './pages/Interviewers';
import Requests from './pages/Requests';
import Scheduled from './pages/Scheduled';
import Login from './pages/Login';
import Signup from './pages/Signup';
import useIsDesktop from './hooks/useIsDesktop';

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

function SideNav() {
  const { pathname } = useLocation();
  return (
    <aside style={styles.sideNav}>
      <div style={styles.sideLogo}>
        <span style={{ fontSize: 28 }}>🗓️</span>
        <div>
          <div style={styles.sideTitle}>Interview</div>
          <div style={styles.sideTitle}>Scheduler</div>
        </div>
      </div>
      <div style={styles.sideNavItems}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.sideNavLink,
              background: pathname === item.path ? '#eef2ff' : 'transparent',
              color: pathname === item.path ? '#6366f1' : '#475569',
              fontWeight: pathname === item.path ? 700 : 500,
            }}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
      <div style={styles.sideFooter}>
        <button
          style={styles.sideLogoutBtn}
          onClick={function() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('username');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function AppContent() {
  const token = localStorage.getItem('auth_token');
  const { pathname } = useLocation();
  const publicPaths = ['/login', '/signup'];
  const isDesktop = useIsDesktop();

  if (!token && !publicPaths.includes(pathname)) {
    window.location.href = '/login';
    return null;
  }

  if (token && publicPaths.includes(pathname)) {
    window.location.href = '/';
    return null;
  }

  if (publicPaths.includes(pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div style={{
      ...styles.appShell,
      flexDirection: isDesktop ? 'row' : 'column',
    }}>
      {isDesktop ? <SideNav /> : null}

      <div style={styles.appContent}>
        <header style={{
          ...styles.header,
          maxWidth: isDesktop ? '100%' : 520,
          padding: isDesktop ? '18px 32px' : '14px 20px',
        }}>
          <div style={styles.headerLeft}>
            {!isDesktop ? <span style={styles.logo}>🗓️</span> : null}
            <h1 style={styles.title}>
              {isDesktop ? 'Dashboard Overview' : 'Interview Scheduler'}
            </h1>
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

        <main style={{
          padding: isDesktop ? '28px 32px 40px' : '16px',
          paddingBottom: isDesktop ? 40 : 90,
          maxWidth: isDesktop ? 1200 : 520,
          margin: isDesktop ? '0 auto' : '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <Routes>
            <Route path="/"             element={<Dashboard isDesktop={isDesktop} />} />
            <Route path="/interviewers" element={<Interviewers isDesktop={isDesktop} />} />
            <Route path="/requests"     element={<Requests isDesktop={isDesktop} />} />
            <Route path="/scheduled"    element={<Scheduled isDesktop={isDesktop} />} />
          </Routes>
        </main>

        {!isDesktop ? <BottomNav /> : null}
      </div>
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
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  appContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
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
    gap: 10,
  },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 10,
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
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

  sideNav: {
    width: 240,
    minWidth: 240,
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 0',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sideLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 24px 20px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: 20,
  },
  sideTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: '#1e293b',
    lineHeight: 1.3,
  },
  sideNavItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 16px',
    flex: 1,
  },
  sideNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 14,
    transition: 'background 0.15s',
  },
  sideFooter: {
    padding: '20px 24px 0',
    borderTop: '1px solid #f1f5f9',
    marginTop: 16,
  },
  sideLogoutBtn: {
    width: '100%',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 10,
    padding: '11px',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
};