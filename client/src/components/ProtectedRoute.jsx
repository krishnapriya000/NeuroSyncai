import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("neurosync_token");
  const userStr = localStorage.getItem("neurosync_current_user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (adminOnly && user.role !== "Admin") {
      // User is logged in but not an Admin
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error("ProtectedRoute Error:", error);
    localStorage.removeItem("neurosync_token");
    localStorage.removeItem("neurosync_current_user");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
