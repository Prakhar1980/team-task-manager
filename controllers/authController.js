// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  // Validate express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("Validation errors on signup:", errors.array());
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error. Please contact support." });
    }

    const { name, email, password, role } = req.body;

    // Validate inputs exist
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({ message: "Email already registered." });
    }

    // Create user (password hashed via pre-save hook in model)
    console.log(`Creating new user: ${name} (${email})`);
    const user = await User.create({ name, email, password, role });
    console.log(`User created successfully: ${user._id}`);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });
    
    // Handle duplicate email specifically
    if (error.code === 11000) {
      console.warn("Duplicate email error during signup");
      return res.status(400).json({ message: "Email already registered." });
    }
    
    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)[0]?.message || "Validation failed";
      console.warn(`Validation error during signup: ${msg}`);
      return res.status(400).json({ message: msg });
    }

    // Handle bcryptjs errors
    if (error.message && error.message.includes("bcrypt")) {
      console.error("Bcrypt hashing error:", error.message);
      return res.status(500).json({ message: "Error processing password. Please try again." });
    }

    // Generic 500 error
    console.error("Unhandled signup error - returning 500");
    res.status(500).json({ message: "Server error during signup. Please try again." });
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("Validation errors on login:", errors.array());
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error. Please contact support." });
    }

    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user and include password field for comparison
    console.log(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn(`Login failed: user not found with email ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`Login failed: invalid password for ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    console.log(`Login successful for user: ${user._id}`);
    const token = generateToken(user._id);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error during login. Please try again." });
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

// @route   GET /api/auth/users
// @access  Private (Admin only) — for assigning tasks
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("name email role createdAt");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { signup, login, getMe, getAllUsers };
