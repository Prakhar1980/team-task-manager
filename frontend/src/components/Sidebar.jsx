// frontend/src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 16px",
      borderRadius: "var(--radius-sm)",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      transition: "all var(--transition)",
      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
      background: isActive ? "var(--accent-dim2)" : "transparent",
      borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
    })}
  >
    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Get initials for avatar
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "var(--accent)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1rem",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            TaskForge
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Team Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", padding: "8px 16px 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Main
        </div>
        <NavItem to="/dashboard" icon="▦" label="Dashboard" />
        <NavItem to="/projects" icon="◫" label="Projects" />
        <NavItem to="/tasks" icon="◷" label="Tasks" />

        {isAdmin && (
          <>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", padding: "16px 16px 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Admin
            </div>
            <div
              style={{
                background: "var(--accent-dim2)",
                border: "1px solid var(--accent-dim)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                fontSize: "0.78rem",
                color: "var(--accent-light)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>★</span>
              <span>Admin Privileges Active</span>
            </div>
          </>
        )}
      </nav>

      {/* User info + Logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            marginBottom: "8px",
          }}
        >
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: "100%", justifyContent: "center", gap: "8px" }}
        >
          <span>⎋</span> Logout
        </button>
      </div>
    </aside>
  );
}
