import { Link } from "react-router-dom";

export default function UserLayout({ children }) {

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex" }}>

      <div style={{ width: 250, background: "#2563eb", color: "white", minHeight: "100vh", padding: 20 }}>
        <h2>User Portal</h2>

        <Link to="/user/dashboard">Dashboard</Link><br />
        <Link to="/user/my-interviews">My Interviews</Link><br />
        <Link to="/user/create-request">Request Interview</Link><br />
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {children}
      </div>

    </div>
  );
}