// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";

// Task creation modal
function TaskModal({ isOpen, onClose, onSave, projectId, allUsers, editTask }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        assignedTo: editTask.assignedTo?._id || "",
        priority: editTask.priority || "medium",
        dueDate: editTask.dueDate ? editTask.dueDate.slice(0, 10) : "",
        status: editTask.status || "pending",
      });
    } else {
      setForm({ title: "", description: "", assignedTo: "", priority: "medium", dueDate: "", status: "pending" });
    }
  }, [editTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.assignedTo || !form.dueDate) {
      toast.error("Title, assignee and due date are required.");
      return;
    }
    setLoading(true);
    try {
      await onSave({ ...form, project: projectId });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editTask ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Design landing page mockup"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Task details and requirements..."
              style={{ minHeight: 80 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Assign To *</label>
              <select
                className="form-select"
                value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                required
              >
                <option value="">Select member</option>
                {allUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                className="form-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                required
              />
            </div>

            {editTask && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : editTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch {
      toast.error("Failed to load project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    if (isAdmin) {
      api.get("/auth/users").then((res) => setAllUsers(res.data.users));
    }
  }, [id, isAdmin]);

  const handleSaveTask = async (form) => {
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, form);
        toast.success("Task updated.");
      } else {
        await api.post("/tasks", form);
        toast.success("Task created.");
      }
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save task.");
      throw err;
    }
  };

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

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: "50vh" }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state">
        <h3>Project not found</h3>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Projects</Link>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link to="/projects" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Projects</Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{project.name}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {project.deadline && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                📅 Due {format(new Date(project.deadline), "MMM dd, yyyy")}
              </span>
            )}
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>
              {completionPct}% complete
            </span>
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setModalOpen(true); }}>
            ＋ Add Task
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div className="progress-bar-track" style={{ height: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {["all", "pending", "in-progress", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              background: filter === s ? "var(--accent)" : "var(--bg-card)",
              color: filter === s ? "white" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: filter === s ? "var(--accent)" : "var(--border)",
            }}
          >
            {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            {" "}
            <span style={{ opacity: 0.7 }}>({s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length})</span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks {filter !== "all" ? `with status "${filter}"` : "yet"}</h3>
          <p>{isAdmin ? "Create the first task for this project." : "Check back later."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredTasks.map((task) => (
            <div key={task._id} style={{ position: "relative" }}>
              <TaskCard
                task={task}
                onStatusChange={handleStatusChange}
                isAdmin={isAdmin}
              />
              {isAdmin && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setEditTask(task); setModalOpen(true); }}
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        projectId={id}
        allUsers={allUsers}
        editTask={editTask}
      />
    </div>
  );
}
