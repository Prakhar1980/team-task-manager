// backend/controllers/taskController.js
const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");

// @route   POST /api/tasks
// @access  Private (Admin)
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required." });
    }

    // Verify project exists and admin owns it
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (proj.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to add tasks to this project." });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      project,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");
    await task.populate("project", "name");

    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    console.error("Task creation error:", error);
    
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)[0]?.message || "Validation failed";
      return res.status(400).json({ message: msg });
    }

    res.status(500).json({ message: "Failed to create task. Please try again." });
  }
};

// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, project } = req.query;
    let filter = {};

    if (req.user.role === "admin") {
      filter.createdBy = req.user._id;
    } else {
      filter.assignedTo = req.user._id;
    }

    if (status && ["pending", "in-progress", "completed"].includes(status)) {
      filter.status = status;
    }
    if (priority && ["low", "medium", "high"].includes(priority)) {
      filter.priority = priority;
    }
    if (project) {
      filter.project = project;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks. Please try again." });
  }
};

// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name description");

    if (!task) return res.status(404).json({ message: "Task not found." });

    // Only assigned user or admin can view
    const isAssigned = task.assignedTo._id.toString() === req.user._id.toString();
    const isCreator = task.createdBy._id.toString() === req.user._id.toString();

    if (!isAssigned && !isCreator) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAssigned && !isCreator) {
      return res.status(403).json({ message: "Not authorized to update this task." });
    }

    // Members can only update status; admins can update everything
    let updateData = {};
    if (req.user.role === "member") {
      updateData.status = req.body.status; // Members can only change status
    } else {
      updateData = req.body; // Admins can change all fields
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    res.json({ message: "Task updated.", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task." });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
