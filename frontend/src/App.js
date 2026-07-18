import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Interviewers from './pages/Interviewers';
import Requests from './pages/Requests';
import Scheduled from './pages/Scheduled';
import Login from './pages/Login';
import Signup from './pages/Signup';
import useIsDesktop from './hooks/useIsDesktop';

const adminNav = [
  { path: '/',             label: 'Dashboard',    icon: '🏠' },
  { path: '/interviewers', label: 'Interviewers', icon: '👥' },
  { path: '/requests',     label: 'Requests',     icon: '📋' },
  { path: '/scheduled',    label: 'Scheduled',    icon: '✅' },
];

const userNav = [
  { path: '/user',          label: 'New Request',   icon: '📋' },
  { path: '/user/scheduled', label: 'My Interviews', icon: '✅' },
];

function BottomNav({ items }) {
  const { pathname } = useLocation();
  return (
    <nav style={s.bottomNav}>
      {items.map(function(item) {
        var active = pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{ ...s.navItem, color: active ? '#6366f1' : '#94a3b8' }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SideNav({ items, portalLabel }) {
  const { pathname } = useLocation();
  return (
    <aside style={s.sideNav}>
      <div style={s.sideLogoRow}>
        <span style={{ fontSize: 26 }}>🗓️</span>
        <span style={s.sideLogoText}>{portalLabel}</span>
      </div>
      <div style={s.sideLinks}>
        {items.map(function(item) {
          var active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...s.sideLink,
                background: active ? '#eef2ff' : 'transparent',
                color: active ? '#6366f1' : '#475569',
                fontWeight: active ? 700 : 500,
              }}
            >
              <span style={{ fontSize: 17, width: 22 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <button
        style={s.sideLogout}
        onClick={function() {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('username');
          localStorage.removeItem('is_admin');
          window.location.href = '/login';
        }}
      >
        Logout
      </button>
    </aside>
  );
}

function Shell({ items, portalLabel, children, isDesktop }) {
  return (
    <div style={{ ...s.shell, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop ? <SideNav items={items} portalLabel={portalLabel} /> : null}
      <div style={s.contentCol}>
        <header style={s.header}>
          {!isDesktop ? <span style={{ fontSize: 20 }}>🗓️</span> : null}
          <h1 style={s.headerTitle}>{portalLabel}</h1>
          <div style={{ flex: 1 }} />
          <span style={s.badge}>{portalLabel === 'Admin Portal' ? 'Admin' : 'User'}</span>
          <button
            style={s.logoutBtn}
            onClick={function() {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('username');
              localStorage.removeItem('is_admin');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </header>
        <main style={{
          ...s.main,
          maxWidth: isDesktop ? 1200 : 560,
          paddingBottom: isDesktop ? 40 : 90,
        }}>
          {children}
        </main>
        {!isDesktop ? <BottomNav items={items} /> : null}
      </div>
    </div>
  );
}

function AdminPortal({ isDesktop }) {
  return (
    <Shell items={adminNav} portalLabel="Admin Portal" isDesktop={isDesktop}>
      <Routes>
        <Route path="/"             element={<Dashboard isDesktop={isDesktop} />} />
        <Route path="/interviewers" element={<Interviewers isDesktop={isDesktop} />} />
        <Route path="/requests"     element={<Requests isDesktop={isDesktop} />} />
        <Route path="/scheduled"    element={<Scheduled isDesktop={isDesktop} />} />
      </Routes>
    </Shell>
  );
}

function UserPortal({ isDesktop }) {
  return (
    <Shell items={userNav} portalLabel="User Portal" isDesktop={isDesktop}>
      <Routes>
        <Route path="/user"           element={<Requests isDesktop={isDesktop} />} />
        <Route path="/user/scheduled" element={<Scheduled isDesktop={isDesktop} />} />
      </Routes>
    </Shell>
  );
}

function AppRouter() {
  const token = localStorage.getItem('auth_token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const { pathname } = useLocation();
  const publicPaths = ['/login', '/signup'];
  const isDesktop = useIsDesktop();

  // Not logged in -> only allow login/signup
  if (!token && !publicPaths.includes(pathname)) {
    window.location.href = '/login';
    return null;
  }

  // Logged in but sitting on login/signup -> send to correct portal
  if (token && publicPaths.includes(pathname)) {
    window.location.href = isAdmin ? '/' : '/user';
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

  // Regular user trying to access admin-only routes -> bounce to /user
  var adminOnlyPrefixes = ['/interviewers', '/requests', '/scheduled'];
  var isAdminPath = pathname === '/' || adminOnlyPrefixes.indexOf(pathname) !== -1;

  if (!isAdmin && isAdminPath) {
    window.location.href = '/user';
    return null;
  }

  // Admin trying to access user-only routes -> bounce to /
  if (isAdmin && pathname.indexOf('/user') === 0) {
    window.location.href = '/';
    return null;
  }

  return isAdmin
    ? <AdminPortal isDesktop={isDesktop} />
    : <UserPortal isDesktop={isDesktop} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f4f5f9' },
  contentCol: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  header: {
    background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 50,
  },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  badge: {
    background: '#eef2ff', color: '#6366f1', fontSize: 11, fontWeight: 700,
    padding: '4px 10px', borderRadius: 20,
  },
  logoutBtn: {
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  main: { width: '100%', margin: '0 auto', padding: 20, boxSizing: 'border-box' },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
    borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around',
    padding: '8px 0 14px', zIndex: 50,
  },
  navItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textDecoration: 'none', padding: '4px 14px',
  },
  sideNav: {
    width: 230, minWidth: 230, background: '#fff', borderRight: '1px solid #e5e7eb',
    padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24,
    position: 'sticky', top: 0, height: '100vh',
  },
  sideLogoRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' },
  sideLogoText: { fontSize: 14, fontWeight: 800, color: '#1e293b' },
  sideLinks: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  sideLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 10, textDecoration: 'none', fontSize: 14,
  },
  sideLogout: {
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10,
    padding: 11, fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
};