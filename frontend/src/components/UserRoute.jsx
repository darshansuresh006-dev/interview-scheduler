import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {
  const role = localStorage.getItem("role");

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  if (role !== "candidate") {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
}