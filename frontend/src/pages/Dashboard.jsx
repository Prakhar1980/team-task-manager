// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/TaskCard";

const StatCard = ({ label, value, color, icon, subtitle }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value" style={{ color: `var(--${color === "accent" ? "accent-light" : color})` }}>
      {value}
    </div>
    <div className="stat-label">{label}</div>
    {subtitle && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{subtitle}</div>}
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: "50vh" }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const { stats, recentTasks } = data || {};
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening with your {isAdmin ? "team" : "tasks"} today.
          </p>
        </div>
        {isAdmin && (
          <Link to="/projects" className="btn btn-primary">
            ＋ New Project
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Tasks"
          value={stats?.totalTasks ?? 0}
          color="accent"
          icon="◷"
          subtitle="All assigned tasks"
        />
        <StatCard
          label="Completed"
          value={stats?.completedTasks ?? 0}
          color="success"
          icon="✓"
          subtitle={`${stats?.completionRate ?? 0}% completion rate`}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgressTasks ?? 0}
          color="info"
          icon="⟳"
          subtitle="Currently active"
        />
        <StatCard
          label="Pending"
          value={stats?.pendingTasks ?? 0}
          color="warning"
          icon="◔"
          subtitle="Not started yet"
        />
        <StatCard
          label="Overdue"
          value={stats?.overdueTasks ?? 0}
          color="danger"
          icon="⚠"
          subtitle="Need immediate attention"
        />
        <StatCard
          label="Projects"
          value={stats?.totalProjects ?? 0}
          color="accent"
          icon="◫"
          subtitle={isAdmin ? "Projects created" : "Joined projects"}
        />
        {isAdmin && stats?.teamMembers !== null && (
          <StatCard
            label="Team Members"
            value={stats?.teamMembers ?? 0}
            color="success"
            icon="◉"
            subtitle="Active members"
          />
        )}
      </div>

      {/* Progress + Recent */}
      <div className="content-grid">
        {/* Completion Progress */}
        <div className="card">
          <h3 style={{ fontSize: "1rem", marginBottom: 20 }}>Task Completion Overview</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Completed", value: stats?.completedTasks, total: stats?.totalTasks, color: "var(--success)" },
              { label: "In Progress", value: stats?.inProgressTasks, total: stats?.totalTasks, color: "var(--info)" },
              { label: "Pending", value: stats?.pendingTasks, total: stats?.totalTasks, color: "var(--warning)" },
              { label: "Overdue", value: stats?.overdueTasks, total: stats?.totalTasks, color: "var(--danger)" },
            ].map(({ label, value, total, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>
                      {value} <span style={{ color: "var(--text-muted)" }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: "1rem" }}>Recent Tasks</h3>
            <Link to="/tasks" className="btn btn-secondary btn-sm">
              View all
            </Link>
          </div>

          {recentTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-state-icon">📋</div>
              <p>No tasks yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentTasks?.map((task) => {
                const overdue = task.status !== "completed" && isPast(new Date(task.dueDate));
                return (
                  <div
                    key={task._id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: overdue ? "var(--danger)" : "var(--text-muted)" }}>
                        {task.project?.name} ·{" "}
                        {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : "—"}
                        {overdue && " · Overdue"}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
