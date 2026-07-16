import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex" }}>

      <div style={{ width: 250, background: "#1e293b", color: "white", minHeight: "100vh", padding: 20 }}>
        <h2>Admin Portal</h2>

        <Link to="/admin/dashboard">Dashboard</Link><br />
        <Link to="/admin/interviewers">Interviewers</Link><br />
        <Link to="/admin/requests">Requests</Link><br />
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {children}
      </div>

    </div>
  );
}