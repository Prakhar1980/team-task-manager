// backend/routes/projects.js
const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

const router = express.Router();

const projectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required").isLength({ max: 100 }),
  body("description").optional().isLength({ max: 500 }),
];

router.get("/", protect, getProjects);
router.post("/", protect, roleCheck("admin"), projectValidation, createProject);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, roleCheck("admin"), updateProject);
router.delete("/:id", protect, roleCheck("admin"), deleteProject);

module.exports = router;
