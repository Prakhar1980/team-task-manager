// backend/routes/auth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const { signup, login, getMe, getAllUsers } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

const router = express.Router();

// Validation rules
const signupValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2-50 characters"),
  body("email")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),
  body("role")
    .optional()
    .isIn(["admin", "member"]).withMessage("Role must be admin or member"),
];

const loginValidation = [
  body("email")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.get("/users", protect, roleCheck("admin"), getAllUsers);

module.exports = router;
