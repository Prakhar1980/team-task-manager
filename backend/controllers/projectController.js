// backend/controllers/projectController.js
const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");

// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, description, members, deadline } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || "",
      members: members || [],
      deadline,
      createdBy: req.user._id,
    });

    await project.populate("createdBy", "name email");
    await project.populate("members", "name email role");

    res.status(201).json({ 
      message: "Project created successfully.", 
      project 
    });
  } catch (error) {
    console.error("Project creation error:", error);
    
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)[0]?.message || "Validation failed";
      return res.status(400).json({ message: msg });
    }

    res.status(500).json({ message: "Failed to create project. Please try again." });
  }
};

// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      // Admin sees all projects they created
      projects = await Project.find({ createdBy: req.user._id })
        .populate("createdBy", "name email")
        .populate("members", "name email role")
        .sort({ createdAt: -1 });
    } else {
      // Members see projects they are part of
      projects = await Project.find({ members: req.user._id })
        .populate("createdBy", "name email")
        .populate("members", "name email role")
        .sort({ createdAt: -1 });
    }

    res.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Failed to fetch projects. Please try again." });
  }
};

// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Check access
    const isAdmin = req.user.role === "admin";
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();

    if (!isAdmin && !isMember && !isCreator) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project." });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email role");

    res.json({ message: "Project updated.", project: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project." });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: "Project and all its tasks deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
