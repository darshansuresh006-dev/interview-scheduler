import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    return <Navigate to="/user/dashboard" />;
  }

  return children;
}