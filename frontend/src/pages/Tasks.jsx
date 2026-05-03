// frontend/src/pages/Tasks.jsx
import { useState, useEffect } from "react";
import { format, isPast } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [view, setView] = useState("grid"); // grid | table

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.tasks);
    } catch {
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted.");
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  // Overdue indicator
  const overdueCount = tasks.filter(
    (t) => t.status !== "completed" && isPast(new Date(t.dueDate))
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {overdueCount > 0 && (
              <span style={{ color: "var(--danger)", marginLeft: 12 }}>
                ⚠ {overdueCount} overdue
              </span>
            )}
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-sm"
            onClick={() => setView("grid")}
            style={{
              background: view === "grid" ? "var(--accent)" : "var(--bg-card)",
              color: view === "grid" ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            ⊞ Grid
          </button>
          <button
            className="btn btn-sm"
            onClick={() => setView("table")}
            style={{
              background: view === "table" ? "var(--accent)" : "var(--bg-card)",
              color: view === "table" ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            ☰ Table
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {(filters.status || filters.priority) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setFilters({ status: "", priority: "" })}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: "40vh" }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks found</h3>
          <p>{isAdmin ? "Create tasks in a project." : "No tasks have been assigned to you yet."}</p>
        </div>
      ) : view === "grid" ? (
        // Grid view
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {tasks.map((task) => (
            <div key={task._id}>
              <TaskCard task={task} onStatusChange={handleStatusChange} isAdmin={isAdmin} />
              {isAdmin && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Table view
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const overdue = task.status !== "completed" && isPast(new Date(task.dueDate));
                return (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 220 }}>{task.title}</div>
                      {task.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 220,
                          }}
                        >
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {task.project?.name || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar avatar-sm">
                          {task.assignedTo?.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.85rem" }}>{task.assignedTo?.name}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="filter-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: overdue ? "var(--danger)" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {overdue && "⚠ "}
                      {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "—"}
                    </td>
                    <td>
                      {isAdmin && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
