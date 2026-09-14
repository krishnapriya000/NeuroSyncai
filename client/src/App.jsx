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
import StudentStudyPlanner from "./pages/StudentStudyPlanner";
import StudentGoals from "./pages/StudentGoals";
import StudentAICompanion from "./pages/StudentAICompanion";
import StudentFocusTimer from "./pages/StudentFocusTimer";
import StudentProgress from "./pages/StudentProgress";
import StudentNotifications from "./pages/StudentNotifications";
import StudentSettings from "./pages/StudentSettings";
import ParentDashboard from "./pages/ParentDashboard";
import ParentChildren from "./pages/ParentChildren";
import ParentCheckInPage from "./pages/ParentCheckInPage";
import ParentMoodTracker from "./pages/ParentMoodTracker";
import ParentAICompanion from "./pages/ParentAICompanion";
import ParentInsights from "./pages/ParentInsights";
import ParentNotifications from "./pages/ParentNotifications";
import ParentJournal from "./pages/ParentJournal";
import ParentGuidance from "./pages/ParentGuidance";
import ParentProfile from "./pages/ParentProfile";
import ParentSettings from "./pages/ParentSettings";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ProfessionalCheckIn from "./pages/ProfessionalCheckIn";
import ProfessionalMoodStress from "./pages/ProfessionalMoodStress";
import ProfessionalWorkLifeBalance from "./pages/ProfessionalWorkLifeBalance";
import ProfessionalFocusSessions from "./pages/ProfessionalFocusSessions";
import ProfessionalAnalytics from "./pages/ProfessionalAnalytics";
import ProfessionalAICompanion from "./pages/ProfessionalAICompanion";
import SeniorDashboard from "./pages/SeniorDashboard";
import SeniorDailyCheckIn from "./pages/SeniorDailyCheckIn";
import SeniorMoodTracker from "./pages/SeniorMoodTracker";
import SeniorHealthActivity from "./pages/SeniorHealthActivity";
import SeniorAICompanion from "./pages/SeniorAICompanion";
import SeniorMedications from "./pages/SeniorMedications";
import SeniorFamilyEmergency from "./pages/SeniorFamilyEmergency";
import SeniorProgress from "./pages/SeniorProgress";
import StudentCognitiveGames from "./pages/StudentCognitiveGames";
import StudentMemoryExercises from "./pages/StudentMemoryExercises";
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
        <Route 
          path="/student/study-planner" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentStudyPlanner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/goals" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentGoals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/ai-companion" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentAICompanion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/focus-timer" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentFocusTimer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/progress" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentProgress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/notifications" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentNotifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/cognitive-games" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentCognitiveGames />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/memory-exercises" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentMemoryExercises />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/settings" 
          element={
            <ProtectedRoute allowedRoles={["Student", "User"]}>
              <StudentSettings />
            </ProtectedRoute>
          } 
        />

        {/* Parent Routes */}
        <Route 
          path="/parent/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/children" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentChildren />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/check-in" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentCheckInPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/check-in/:childId" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentCheckInPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/mood-tracker" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentMoodTracker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/ai-companion" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentAICompanion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/insights" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentInsights />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/notifications" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentNotifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/journal" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentJournal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/guidance" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentGuidance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/profile" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/settings" 
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentSettings />
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

        {/* Working Professional Profile Route */}
        <Route 
          path="/professional/profile" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalProfile />
            </ProtectedRoute>
          } 
        />

        {/* Working Professional Daily Check-in Route */}
        <Route 
          path="/professional/checkin" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalCheckIn />
            </ProtectedRoute>
          } 
        />

        {/* Working Professional Mood & Stress Route */}
        <Route 
          path="/professional/mood-stress" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalMoodStress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/work-life-balance" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalWorkLifeBalance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/focus" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalFocusSessions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/analytics" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional/ai-companion" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalAICompanion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/ai-companion" 
          element={
            <ProtectedRoute allowedRoles={["Working Professional"]}>
              <ProfessionalAICompanion />
            </ProtectedRoute>
          } 
        />

        {/* Senior Citizen Routes */}
        <Route 
          path="/senior/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/daily-checkin" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorDailyCheckIn />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/mood" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorMoodTracker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/mood-tracker" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorMoodTracker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/health-activity" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorHealthActivity />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/ai-companion" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorAICompanion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/medications" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorMedications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/journal" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <StudentJournal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/family-emergency" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorFamilyEmergency />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/progress" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <SeniorProgress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/notifications" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <StudentNotifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/profile" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/settings" 
          element={
            <ProtectedRoute allowedRoles={["Senior Citizen"]}>
              <StudentSettings />
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