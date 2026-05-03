// frontend/src/components/TaskCard.jsx
import { format, isPast } from "date-fns";

// Status badge helper
export const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.replace(" ", "-")}`}>
    {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge badge-${priority}`}>
    {priority.charAt(0).toUpperCase() + priority.slice(1)}
  </span>
);

// Avatar initials helper
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function TaskCard({ task, onClick, onStatusChange, isAdmin }) {
  const isOverdue =
    task.status !== "completed" && isPast(new Date(task.dueDate));

  const handleStatusChange = (e) => {
    e.stopPropagation();
    onStatusChange && onStatusChange(task._id, e.target.value);
  };

  return (
    <div className="task-card" onClick={() => onClick && onClick(task)}>
      <div className="task-card-header">
        <div>
          <div className="task-card-title">{task.title}</div>
          {task.project?.name && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
              📁 {task.project.name}
            </div>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            marginBottom: 12,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </div>
      )}

      <div className="task-card-meta">
        <span>
          <div className="avatar avatar-sm">{getInitials(task.assignedTo?.name)}</div>
          {task.assignedTo?.name}
        </span>
        <span style={{ color: isOverdue ? "var(--danger)" : "var(--text-muted)" }}>
          {isOverdue ? "⚠" : "📅"}{" "}
          {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "No date"}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Status selector for quick update */}
      {onStatusChange && (
        <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
          <select
            className="filter-select"
            value={task.status}
            onChange={handleStatusChange}
            style={{ width: "100%", fontSize: "0.8rem" }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );
}
