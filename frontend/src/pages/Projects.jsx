// frontend/src/pages/Projects.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Modal for creating / editing a project
function ProjectModal({ isOpen, onClose, onSave, editProject, allUsers }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    members: [],
    deadline: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editProject) {
      setForm({
        name: editProject.name || "",
        description: editProject.description || "",
        members: editProject.members?.map((m) => m._id) || [],
        deadline: editProject.deadline ? editProject.deadline.slice(0, 10) : "",
        status: editProject.status || "active",
      });
    } else {
      setForm({ name: "", description: "", members: [], deadline: "", status: "active" });
    }
  }, [editProject, isOpen]);

  if (!isOpen) return null;

  const handleMemberToggle = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editProject ? "Edit Project" : "New Project"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Website Redesign"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this project about?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input
              className="form-input"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            />
          </div>

          {editProject && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* Member selection */}
          <div className="form-group">
            <label className="form-label">Team Members</label>
            {allUsers.length === 0 ? (
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "8px 0" }}>
                No members found. Invite people to join.
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {allUsers.map((u) => (
                  <label
                    key={u._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      background: form.members.includes(u._id)
                        ? "var(--accent-dim2)"
                        : "var(--bg-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.members.includes(u._id)}
                      onChange={() => handleMemberToggle(u._id)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{u.name}</span>
                    <span className={`badge badge-${u.role}`} style={{ marginLeft: "auto" }}>{u.role}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : editProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status dot
const StatusDot = ({ status }) => {
  const colors = { active: "var(--success)", completed: "var(--accent)", archived: "var(--text-muted)" };
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[status] || "var(--text-muted)",
        marginRight: 6,
      }}
    />
  );
};

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      api.get("/auth/users").then((res) => {
        // Exclude admins from member list
        setAllUsers(res.data.users.filter((u) => u.role === "member"));
      });
    }
  }, [isAdmin]);

  const handleSave = async (form) => {
    try {
      if (editProject) {
        await api.put(`/projects/${editProject._id}`, form);
        toast.success("Project updated.");
      } else {
        await api.post("/projects", form);
        toast.success("Project created.");
      }
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save project.");
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted.");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const openCreate = () => { setEditProject(null); setModalOpen(true); };
  const openEdit = (proj) => { setEditProject(proj); setModalOpen(true); };

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: "50vh" }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>＋ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">◫</div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? "Create your first project to get started." : "You haven't been added to any projects."}</p>
          {isAdmin && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {projects.map((proj) => (
            <div key={proj._id} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <StatusDot status={proj.status} />
                    {proj.status}
                  </div>
                  {proj.deadline && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Due {format(new Date(proj.deadline), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-display)",
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {proj.name}
                </h3>
                {proj.description && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {proj.description}
                  </p>
                )}
              </div>

              {/* Members */}
              {proj.members?.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex" }}>
                    {proj.members.slice(0, 4).map((m, i) => (
                      <div
                        key={m._id}
                        className="avatar avatar-sm"
                        title={m.name}
                        style={{ marginLeft: i > 0 ? -8 : 0, border: "2px solid var(--bg-card)", zIndex: 4 - i }}
                      >
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {proj.members.length} member{proj.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <Link to={`/projects/${proj._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                  View Tasks
                </Link>
                {isAdmin && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(proj)}>✎</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj._id)}>✕</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editProject={editProject}
        allUsers={allUsers}
      />
    </div>
  );
}
