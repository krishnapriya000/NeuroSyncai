import { useState, useEffect, useRef } from "react";
import { 
  FiMenu, 
  FiRefreshCw, 
  FiSearch, 
  FiSun, 
  FiMoon, 
  FiX, 
  FiBell,
  FiChevronDown,
  FiUser,
  FiLogOut
} from "react-icons/fi";

const ADMIN_NAVIGATION_ITEMS = [
  { id: "dashboard", title: "Dashboard Overview", category: "Analytics", tab: "dashboard", keywords: ["dashboard", "home", "overview", "stats", "metrics"], icon: "📊" },
  { id: "users-students", title: "Manage Students", category: "User Management", tab: "users-students", keywords: ["students", "student", "users", "learners"], icon: "🎓" },
  { id: "users-parents", title: "Manage Parents", category: "User Management", tab: "users-parents", keywords: ["parents", "guardians", "family"], icon: "👪" },
  { id: "users-professionals", title: "Manage Working Professionals", category: "User Management", tab: "users-professionals", keywords: ["professionals", "working", "corporate"], icon: "💼" },
  { id: "users-seniors", title: "Manage Senior Citizens", category: "User Management", tab: "users-seniors", keywords: ["seniors", "elderly", "citizens"], icon: "👴" },
  { id: "wellness-analytics", title: "Wellness Analytics", category: "Reports", tab: "wellness-analytics", keywords: ["wellness", "analytics", "health", "insights", "mood"], icon: "📈" },
  { id: "feedback", title: "Feedback & Inquiries", category: "Support", tab: "feedback", keywords: ["feedback", "inquiries", "complaints", "reviews"], icon: "💬" },
  { id: "notifications", title: "System Notifications", category: "Alerts", tab: "notifications", keywords: ["notifications", "alerts", "messages", "broadcast"], icon: "🔔" },
  { id: "settings", title: "Admin Settings", category: "System", tab: "settings", keywords: ["settings", "admin", "config", "preferences"], icon: "⚙️" },
];

function AdminHeader({ 
  currentUser, 
  onLogout,
  toggleSidebar, 
  onRefreshData, 
  activeTabTitle, 
  onSelectTab, 
  theme = "light", 
  toggleTheme,
  users = [] 
}) {
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter Admin Navigation Items
  const filteredNavItems = searchQuery.trim() === ""
    ? ADMIN_NAVIGATION_ITEMS
    : ADMIN_NAVIGATION_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q))
        );
      });

  // Filter Matching User Accounts if search query exists
  const filteredUsers = searchQuery.trim() === ""
    ? []
    : users.filter((u) => {
        const q = searchQuery.toLowerCase().trim();
        const name = (u.fullName || u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const role = (u.role || "").toLowerCase();
        return name.includes(q) || email.includes(q) || role.includes(q);
      }).slice(0, 5);

  const getRoleTab = (role) => {
    switch (role?.toLowerCase()) {
      case "student":
        return "users-students";
      case "parent":
        return "users-parents";
      case "professional":
      case "working professional":
        return "users-professionals";
      case "senior":
      case "senior citizen":
        return "users-seniors";
      default:
        return "users-students";
    }
  };

  const isLight = theme === "light";
  const displayName = currentUser?.fullName || "System Admin";
  const displayEmail = currentUser?.email || "admin@neurosync.ai";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "A";

  return (
    <header 
      className="admin-header px-4 border-bottom transition-all"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: "260px",
        height: "76px",
        display: "flex",
        alignItems: "center",
        background: isLight ? "rgba(255, 255, 255, 0.95)" : "#15132B",
        borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 1030,
        boxShadow: isLight ? "0 2px 10px rgba(0,0,0,0.03)" : "0 4px 20px rgba(0,0,0,0.25)"
      }}
    >
      <div className="w-100 d-flex align-items-center justify-content-between">
        
        {/* Left: Section Title & Subtitle */}
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="btn btn-sm p-2 rounded-3 border-0 d-lg-none"
            style={{
              background: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)",
              color: isLight ? "#111827" : "#FFFFFF",
            }}
            title="Toggle Sidebar"
          >
            <FiMenu size={20} />
          </button>

          <div>
            <h5 className="fw-bold mb-0 leading-tight fs-5 d-flex align-items-center gap-2" style={{ color: isLight ? "#111827" : "#FFFFFF" }}>
              {activeTabTitle || "Dashboard Overview"}
            </h5>
            <span className="extra-small d-none d-sm-inline" style={{ color: isLight ? "#64748B" : "#94A3B8", fontSize: "0.78rem" }}>
              Overview of your NeuroSync platform
            </span>
          </div>
        </div>

        {/* Center: Admin Command Search Bar */}
        <div className="d-flex align-items-center gap-3">
          <div className="ns-search-box position-relative d-none d-md-block" style={{ width: "320px" }}>
            <FiSearch 
              className="position-absolute start-0 top-50 translate-middle-y ms-3"
              style={{ color: isLight ? "#64748B" : "#94A3B8", fontSize: "0.95rem" }} 
            />
            <input 
              ref={searchInputRef}
              type="text" 
              className="form-control rounded-pill px-4 ps-5 pe-5 border-0 shadow-sm"
              style={{
                fontSize: "0.85rem",
                height: "40px",
                background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.06)",
                color: isLight ? "#111827" : "#FFFFFF",
                border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
              }}
              placeholder="Search admin tools, users, stats... (⌘K)" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {searchQuery ? (
              <button
                type="button"
                className="btn btn-sm p-0 border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
                style={{ fontSize: "0.8rem", cursor: "pointer" }}
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                title="Clear Search"
              >
                <FiX size={15} />
              </button>
            ) : (
              <span 
                className="position-absolute end-0 top-50 translate-middle-y me-3 px-1.5 py-0.5 rounded extra-small fw-semibold"
                style={{
                  fontSize: "0.68rem",
                  background: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.12)",
                  color: isLight ? "#64748B" : "#94A3B8"
                }}
              >
                ⌘K
              </span>
            )}

            {/* Admin Search Dropdown */}
            {isSearchOpen && (
              <>
                <div 
                  className="position-fixed"
                  style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
                  onClick={() => setIsSearchOpen(false)}
                />

                <div 
                  className="position-absolute start-0 mt-2 p-2 rounded-4 shadow-lg overflow-hidden"
                  style={{
                    width: "360px",
                    maxHeight: "420px",
                    background: isLight ? "#FFFFFF" : "#1A173B",
                    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(20px)",
                    color: isLight ? "#111827" : "#FFFFFF",
                    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.3)",
                    zIndex: 1050,
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                    <span className="extra-small fw-bold text-uppercase tracking-wider" style={{ color: isLight ? "#64748B" : "#94A3B8", fontSize: "0.72rem" }}>
                      {searchQuery.trim() ? "Search Results" : "Admin Modules & Shortcuts"}
                    </span>
                    <span className="badge bg-primary bg-opacity-15 text-primary extra-small px-2 py-0.5 rounded-pill" style={{ fontSize: "0.7rem" }}>⌘K Command</span>
                  </div>

                  <div className="p-1 overflow-y-auto" style={{ maxHeight: "350px" }}>
                    {/* User Accounts Results */}
                    {filteredUsers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 extra-small fw-bold text-uppercase text-primary" style={{ fontSize: "0.68rem" }}>
                          Matching Accounts ({filteredUsers.length})
                        </div>
                        {filteredUsers.map((u) => (
                          <button
                            key={u._id || u.id}
                            type="button"
                            className="w-100 btn text-start p-2 rounded-3 d-flex align-items-center justify-content-between border-0 transition-all mb-1"
                            style={{
                              background: "transparent",
                              color: isLight ? "#111827" : "#F8FAFC",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              if (onSelectTab) onSelectTab(getRoleTab(u.role));
                            }}
                          >
                            <div className="d-flex align-items-center gap-2 overflow-hidden">
                              <div className="rounded-circle bg-primary bg-opacity-25 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}>
                                {(u.fullName || u.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="fw-semibold text-truncate" style={{ fontSize: "0.84rem", color: isLight ? "#111827" : "#FFFFFF" }}>
                                  {u.fullName || u.name || "User"}
                                </div>
                                <div className="extra-small text-truncate" style={{ fontSize: "0.72rem", color: isLight ? "#64748B" : "#94A3B8" }}>
                                  {u.email}
                                </div>
                              </div>
                            </div>
                            <span className="badge bg-primary bg-opacity-15 text-primary rounded-pill extra-small px-2 py-0.5 ms-2 flex-shrink-0" style={{ fontSize: "0.65rem" }}>
                              {u.role || "User"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Modules Navigation Items */}
                    <div className="px-2 py-1 extra-small fw-bold text-uppercase text-secondary" style={{ fontSize: "0.68rem" }}>
                      Modules ({filteredNavItems.length})
                    </div>
                    {filteredNavItems.length > 0 ? (
                      filteredNavItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-100 btn text-start p-2.5 rounded-3 d-flex align-items-center justify-content-between border-0 transition-all mb-1"
                          style={{
                            background: "transparent",
                            color: isLight ? "#111827" : "#F8FAFC",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            if (onSelectTab) onSelectTab(item.tab);
                          }}
                        >
                          <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                            <span className="fs-5 flex-shrink-0">{item.icon}</span>
                            <div className="overflow-hidden">
                              <div className="fw-semibold text-truncate" style={{ fontSize: "0.86rem", color: isLight ? "#111827" : "#FFFFFF" }}>
                                {item.title}
                              </div>
                              <div className="extra-small text-truncate" style={{ fontSize: "0.72rem", color: isLight ? "#64748B" : "#94A3B8" }}>
                                Category: {item.category}
                              </div>
                            </div>
                          </div>
                          <span className="badge rounded-pill extra-small px-2 py-1 ms-2 flex-shrink-0" style={{ background: "rgba(124, 92, 252, 0.15)", color: "#9D82FF", fontSize: "0.68rem" }}>
                            {item.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      filteredUsers.length === 0 && (
                        <div className="p-4 text-center text-muted" style={{ fontSize: "0.85rem" }}>
                          No matching admin modules or users for "<strong>{searchQuery}</strong>".
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Icon Button */}
          <button
            type="button"
            className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 shadow-sm transition-all position-relative"
            style={{
              width: "40px",
              height: "40px",
              background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.06)",
              color: isLight ? "#111827" : "#FFFFFF",
              border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)"
            }}
            onClick={() => onSelectTab("notifications")}
            title="System Notifications"
          >
            <FiBell size={18} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: "8px", height: "8px" }} />
          </button>

          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              type="button"
              className="btn rounded-circle p-2 d-flex align-items-center justify-content-center border-0 shadow-sm transition-all"
              style={{
                width: "40px",
                height: "40px",
                background: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.06)",
                color: isLight ? "#111827" : "#FFFFFF",
                border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)"
              }}
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`}
            >
              {theme === "dark" ? <FiSun size={18} className="text-warning" /> : <FiMoon size={18} style={{ color: "#7C5CFC" }} />}
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={onRefreshData}
            className="btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1.5 extra-small fw-semibold border-0 shadow-sm"
            style={{ 
              background: isLight ? "rgba(124, 92, 252, 0.1)" : "rgba(124, 92, 252, 0.2)", 
              color: isLight ? "#7C5CFC" : "#C4B5FD",
              height: "40px"
            }}
            title="Refresh Metrics Data"
          >
            <FiRefreshCw size={14} /> <span className="d-none d-lg-inline">Refresh</span>
          </button>

          {/* Admin Avatar & Dropdown Menu */}
          <div className="position-relative ps-2 border-start" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.1)" }}>
            <button
              type="button"
              className="btn p-1 d-flex align-items-center gap-2 border-0 bg-transparent text-start"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div 
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #7C5CFC 0%, #4F8CFF 100%)",
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 12px rgba(124, 92, 252, 0.3)"
                }}
              >
                {userInitial}
              </div>
              <div className="d-none d-xl-block">
                <span className="fw-semibold d-block lh-1" style={{ fontSize: "0.86rem", color: isLight ? "#111827" : "#FFFFFF" }}>
                  {displayName}
                </span>
                <span className="extra-small d-block" style={{ fontSize: "0.72rem", color: isLight ? "#64748B" : "#94A3B8" }}>
                  Administrator
                </span>
              </div>
              <FiChevronDown style={{ color: isLight ? "#64748B" : "#94A3B8" }} className="d-none d-xl-block" />
            </button>

            {/* Profile Dropdown Popover */}
            {showProfileMenu && (
              <>
                <div 
                  className="position-fixed"
                  style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
                  onClick={() => setShowProfileMenu(false)}
                />

                <div 
                  className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg"
                  style={{
                    width: "230px",
                    background: isLight ? "#FFFFFF" : "#1A173B",
                    border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(20px)",
                    color: isLight ? "#111827" : "#FFFFFF",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    zIndex: 1050
                  }}
                >
                  <div className="p-2 border-bottom" style={{ borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)" }}>
                    <div className="fw-bold text-truncate" style={{ color: isLight ? "#111827" : "#FFFFFF", fontSize: "0.9rem" }}>{displayName}</div>
                    <div className="extra-small text-truncate" style={{ color: isLight ? "#64748B" : "#94A3B8", fontSize: "0.75rem" }}>{displayEmail}</div>
                    <span 
                      className="badge mt-1 text-uppercase fw-bold" 
                      style={{ background: "rgba(124, 92, 252, 0.2)", color: "#C4B5FD", fontSize: "0.62rem" }}
                    >
                      System Admin
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-1 mt-2">
                    <button 
                      className="btn text-start p-2 rounded-3 border-0 d-flex align-items-center gap-2 fw-medium transition-all" 
                      style={{ fontSize: "0.85rem", color: isLight ? "#334155" : "#CBD5E1" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSelectTab("settings");
                      }}
                    >
                      <FiUser size={16} /> Admin Profile & Settings
                    </button>
                    <button 
                      className="btn text-start p-2 rounded-3 border-0 d-flex align-items-center gap-2 fw-medium transition-all" 
                      style={{ fontSize: "0.85rem", color: isLight ? "#334155" : "#CBD5E1" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onRefreshData();
                      }}
                    >
                      <FiRefreshCw size={16} /> Sync Dashboard Data
                    </button>
                    {onLogout && (
                      <button 
                        className="btn text-danger text-start p-2 rounded-3 border-0 d-flex align-items-center gap-2 mt-1 fw-semibold transition-all" 
                        style={{ fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.08)" }} 
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                      >
                        <FiLogOut size={16} /> Log Out
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

export default AdminHeader;
