// backend/controllers/dashboardController.js
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};
    let projectFilter = {};

    if (req.user.role === "admin") {
      taskFilter.createdBy = req.user._id;
      projectFilter.createdBy = req.user._id;
    } else {
      taskFilter.assignedTo = req.user._id;
      projectFilter.members = req.user._id;
    }

    // Parallel queries for performance
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      totalProjects,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "completed" }),
      Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      Task.countDocuments({ ...taskFilter, status: "pending" }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: "completed" },
        dueDate: { $lt: now },
      }),
      Project.countDocuments(projectFilter),
      Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("assignedTo", "name email")
        .populate("project", "name"),
    ]);

    // Admin-only: get team member count
    let teamStats = null;
    if (req.user.role === "admin") {
      teamStats = await User.countDocuments({ role: "member" });
    }

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        totalProjects,
        teamMembers: teamStats,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentTasks,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard. Please try again." });
  }
};

module.exports = { getDashboard };
