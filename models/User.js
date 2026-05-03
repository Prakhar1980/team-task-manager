// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    console.error("Bcrypt hashing error in pre-save hook:", error.message);
    next(new Error(`Password hashing failed: ${error.message}`));
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Bcrypt comparison error:", error.message);
    throw new Error("Password comparison failed");
  }
};

// Handle duplicate email error
userSchema.post("save", function (error, doc, next) {
  if (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.warn(`Duplicate key error on field: ${field}`);
      return next(new Error(`${field} already exists`));
    }
    console.error("Post-save error:", error.message);
    return next(error);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
