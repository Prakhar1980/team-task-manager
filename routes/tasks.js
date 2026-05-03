// backend/routes/tasks.js
const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

const router = express.Router();

const taskValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required").isLength({ max: 150 }),
  body("project").notEmpty().withMessage("Project ID is required").isMongoId(),
  body("assignedTo").notEmpty().withMessage("Assigned user is required").isMongoId(),
  body("dueDate").notEmpty().withMessage("Due date is required").isISO8601().withMessage("Invalid date format"),
  body("priority").optional().isIn(["low", "medium", "high"]),
];

router.get("/", protect, getTasks);
router.post("/", protect, roleCheck("admin"), taskValidation, createTask);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);            // Both roles can update (different fields)
router.delete("/:id", protect, roleCheck("admin"), deleteTask);

module.exports = router;
