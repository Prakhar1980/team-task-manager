// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
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

// CORS must be registered before routes so preflight requests never hit auth/controllers.
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(","),
  "https://team-task-manager-kappa-five.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/$/, ""));

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || uniqueAllowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "Content-Type", "Authorization", "X-Requested-With", "Accept"],
  maxAge: 3600,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health checks
app.get("/", (req, res) => res.json({ message: "Team Task Manager API running" }));
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "team-task-manager-api",
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

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
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Allowed CORS origins: ${uniqueAllowedOrigins.join(", ")}`);
  console.log("All systems ready.");
});
