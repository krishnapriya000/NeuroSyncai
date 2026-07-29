/**
 * Utility functions for role-based routing and navigation in NeuroSync.
 */

export const ROLE_DASHBOARDS = {
  "Admin": "/admin/dashboard",
  "Student": "/student/dashboard",
  "Parent": "/parent/dashboard",
  "Working Professional": "/professional/dashboard",
  "Senior Citizen": "/senior/dashboard",
};

/**
 * Returns today's date in YYYY-MM-DD string format (local time).
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns the designated dashboard path based on the user's role from backend.
 * Fallbacks to "/student/dashboard" if role is missing or unmapped (e.g. default "User").
 * 
 * @param {string} role - User role string from backend
 * @returns {string} Dashboard URL route path
 */
export const getDashboardPathForRole = (role) => {
  if (!role || typeof role !== "string") {
    return "/student/dashboard";
  }

  const cleanRole = role.trim();

  // Direct exact match lookup
  if (ROLE_DASHBOARDS[cleanRole]) {
    return ROLE_DASHBOARDS[cleanRole];
  }

  // Case-insensitive lookup fallback
  const matchedKey = Object.keys(ROLE_DASHBOARDS).find(
    (key) => key.toLowerCase() === cleanRole.toLowerCase()
  );

  if (matchedKey) {
    return ROLE_DASHBOARDS[matchedKey];
  }

  // Fallback for default "User" or unknown roles
  return "/student/dashboard";
};

/**
 * Calculates the post-login redirect path for a user.
 * For Students: Checks if today's daily check-in survey is completed.
 * - If NOT completed today -> "/student/checkin"
 * - If completed today -> "/student/dashboard"
 * For other roles (Admin, Parent, Professional, Senior): Directly to their respective dashboards.
 * 
 * @param {object} user - User object from backend login response or localStorage
 * @returns {string} Target navigation URL path
 */
export const getLoginRedirectPathForUser = (user) => {
  if (!user) return "/student/dashboard";

  const role = user.role || "Student";
  const isStudent = (role === "Student" || role === "User");

  if (isStudent) {
    const todayStr = getTodayDateString();
    if (user.lastCheckInDate !== todayStr) {
      return "/student/checkin";
    }
    return "/student/dashboard";
  }

  return getDashboardPathForRole(role);
};

/**
 * Returns a human-friendly display name and icon for a user role.
 * 
 * @param {string} role 
 * @returns {{ label: string, icon: string }}
 */
export const getRoleDisplayInfo = (role) => {
  switch (role) {
    case "Admin":
      return { label: "Admin Portal", icon: "⚡" };
    case "Parent":
      return { label: "Parent Dashboard", icon: "👨‍👩‍👧" };
    case "Working Professional":
      return { label: "Professional Dashboard", icon: "💼" };
    case "Senior Citizen":
      return { label: "Senior Dashboard", icon: "👴" };
    case "Student":
    case "User":
    default:
      return { label: "Student Dashboard", icon: "🎓" };
  }
};
