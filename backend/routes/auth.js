// ================================================================
// FUOTUOKE Campus Eats — Auth Routes
// POST /api/auth/signup, /login, /refresh, GET /me
// ================================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ── Helper: Generate Tokens ──
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, userId: user.userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

// ── POST /api/auth/signup ──
router.post("/signup", async (req, res, next) => {
  try {
    const { id, password, role, name, email, canteen } = req.body;

    if (!id || !password || !name || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const cleanId = id.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ userId: cleanId, role });
    if (existing) {
      return res.status(409).json({ error: "An account with this ID and role already exists." });
    }

    // Create new user
    const user = await User.create({
      userId: cleanId,
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || "student",
      status: "active",
      canteen: role === "kitchen" ? canteen : null
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log the action
    await AuditLog.create({
      user: user.userId,
      action: `New ${user.role} account created`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/login ──
router.post("/login", async (req, res, next) => {
  try {
    const { id, password, role } = req.body;

    console.log(`[LOGIN DEBUG] Request ID: "${id}", Role: "${role}", Password: "${password}"`);

    if (!id || !password) {
      return res.status(400).json({ error: "ID and password are required." });
    }

    // Build query — if role is provided, match it
    const query = { userId: id.trim().toUpperCase() };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user) {
      console.log(`[LOGIN DEBUG] User not found for query:`, query);
      return res.status(401).json({ error: "Invalid credentials or role." });
    }

    console.log(`[LOGIN DEBUG] User found: ${user.name} (Role: ${user.role}, Stored Hash: ${user.password})`);

    if (user.status !== "active") {
      return res.status(403).json({ error: "This account has been suspended by Admin." });
    }

    // Compare password with bcrypt
    const isMatch = await user.comparePassword(password);
    console.log(`[LOGIN DEBUG] Bcrypt compare match result: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log the action
    await AuditLog.create({
      user: user.userId,
      action: `${user.role} logged in`,
      ip: req.ip
    });

    res.json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/refresh ──
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

// ── GET /api/auth/me ──
router.get("/me", authenticate, (req, res) => {
  res.json({ success: true, user: req.user.toJSON() });
});

module.exports = router;
