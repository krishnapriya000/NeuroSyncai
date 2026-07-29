import { Navigate } from "react-router-dom";
import { getDashboardPathForRole } from "../utils/roleUtils";

const ProtectedRoute = ({ children, allowedRoles = [], adminOnly = false }) => {
  const token = localStorage.getItem("neurosync_token");
  const userStr = localStorage.getItem("neurosync_current_user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const effectiveRoles = allowedRoles.length > 0 ? allowedRoles : (adminOnly ? ["Admin"] : []);

    if (effectiveRoles.length > 0 && !effectiveRoles.includes(user.role)) {
      // User is logged in but does not have permission for this specific dashboard/route
      // Safely redirect them to their own authorized dashboard path
      const userDashboard = getDashboardPathForRole(user.role);
      return <Navigate to={userDashboard} replace />;
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

