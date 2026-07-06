// ================================================================
// FUOTUOKE Campus Eats — User Model (Mongoose + bcrypt)
// ================================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8
  },
  role: {
    type: String,
    enum: ["student", "staff", "kitchen", "rider", "admin"],
    required: true,
    default: "student"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  canteen: {
    type: String,
    default: null  // Only used for kitchen role
  }
}, {
  timestamps: true
});

// ── Hash password before saving ──
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password method ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Remove password from JSON output ──
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ── Compound unique index for role-specific logins ──
userSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
