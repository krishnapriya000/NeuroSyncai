import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentCheckIn from "./pages/StudentCheckIn";
import StudentMoodTracker from "./pages/StudentMoodTracker";
import StudentJournal from "./pages/StudentJournal";
import ParentDashboard from "./pages/ParentDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import SeniorDashboard from "./pages/SeniorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { getLoginRedirectPathForUser } from "./utils/roleUtils";

/**
 * Smart redirector for generic "/dashboard" route.
 * Redirects logged in users to their specific role dashboard path (or daily checkin for students),
 * or redirects to "/login" if not authenticated.
 */
const RoleRedirector = () => {
  const token = localStorage.getItem("neurosync_token");
  const userStr = localStorage.getItem("neurosync_current_user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const targetPath = getLoginRedirectPathForUser(user);
    return <Navigate to={targetPath} replace />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Smart Role Dashboard Redirector */}
        <Route path="/dashboard" element={<RoleRedirector />} />

        {/* Admin Dashboard Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/mood-tracker" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentMoodTracker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/profile" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/checkin" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentCheckIn />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/journal" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentJournal />
            </ProtectedRoute>
          } 
        />

        {/* Parent Dashboard Route */}
        <Route 
          path="/parent/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Working Professional Dashboard Route */}
        <Route 
          path="/professional/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Senior Citizen Dashboard Route */}
        <Route 
          path="/senior/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;