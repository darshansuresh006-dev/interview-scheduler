import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ==============================
   IMPORT PAGES
================================= */

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInterviewers from "./pages/admin/Interviewers";
import AdminRequests from "./pages/admin/Requests";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import MyInterviews from "./pages/user/MyInterviews";
import CreateRequest from "./pages/user/CreateRequest";

/* ==============================
   LAYOUT COMPONENTS
================================= */

function AdminLayout({ children }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: 250,
          background: "#1e293b",
          color: "white",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <h2>Admin Portal</h2>
        <hr />
        <p><a href="/admin/dashboard" style={{ color: "white" }}>Dashboard</a></p>
        <p><a href="/admin/interviewers" style={{ color: "white" }}>Interviewers</a></p>
        <p><a href="/admin/requests" style={{ color: "white" }}>Requests</a></p>
        <hr />
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {children}
      </div>
    </div>
  );
}

function UserLayout({ children }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: 250,
          background: "#2563eb",
          color: "white",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <h2>User Portal</h2>
        <hr />
        <p><a href="/user/dashboard" style={{ color: "white" }}>Dashboard</a></p>
        <p><a href="/user/my-interviews" style={{ color: "white" }}>My Interviews</a></p>
        <p><a href="/user/create-request" style={{ color: "white" }}>Request Interview</a></p>
        <hr />
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {children}
      </div>
    </div>
  );
}

/* ==============================
   ROLE PROTECTION
================================= */

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/user/dashboard" />;

  return children;
}

function UserRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role !== "candidate") return <Navigate to="/admin/dashboard" />;

  return children;
}

/* ==============================
   MAIN APP
================================= */

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/interviewers"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminInterviewers />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminRequests />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* ================= USER ================= */}
        <Route
          path="/user/dashboard"
          element={
            <UserRoute>
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </UserRoute>
          }
        />

        <Route
          path="/user/my-interviews"
          element={
            <UserRoute>
              <UserLayout>
                <MyInterviews />
              </UserLayout>
            </UserRoute>
          }
        />

        <Route
          path="/user/create-request"
          element={
            <UserRoute>
              <UserLayout>
                <CreateRequest />
              </UserLayout>
            </UserRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}