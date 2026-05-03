// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter (A-Z).");
      return;
    }

    setLoading(true);
    try {
      const newUser = await signup(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to TaskForge, ${newUser.name}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div className="auth-logo-text">TaskForge</div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your team's workspace</p>

        {error && (
          <div
            style={{
              background: "var(--danger-dim)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              color: "var(--danger)",
              fontSize: "0.875rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters with uppercase letter (e.g., Password1)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="member">Member — View & update assigned tasks</option>
              <option value="admin">Admin — Create projects & assign tasks</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            {loading ? (
              <>
                <div className="spinner" /> Creating account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
