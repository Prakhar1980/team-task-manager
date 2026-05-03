// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`CRITICAL: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Server cannot start without these variables. Please check your .env file.");
  process.exit(1);
}

const app = express();

// Connect to MongoDB
connectDB();

// ===== CRITICAL: CORS SETUP - MUST BE FIRST =====
// Add CORS headers to ALL responses
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://team-task-manager-kappa-five.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  
  const origin = req.headers.origin;
  
  // Set CORS headers
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "*");
  res.header("Access-Control-Allow-Credentials", "false");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, X-Requested-With, Accept");
  res.header("Access-Control-Max-Age", "3600");
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log(`[PREFLIGHT] ${req.method} ${req.path} from ${origin}`);
    return res.sendStatus(200);
  }
  
  next();
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health check
app.get("/", (req, res) => res.json({ message: "Team Task Manager API running" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error", error: err.message });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate entry error", error: err.message });
  }

  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Frontend URL: ${process.env.CLIENT_URL || "not configured"}`);
  console.log(`✅ All systems ready!`);
});
