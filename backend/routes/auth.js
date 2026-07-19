// ================================================================
// FUOTUOKE Campus Eats — Auth Routes
// POST /api/auth/signup, /login, /refresh, /logout, GET /me
// ================================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const AuditLog = require("../models/AuditLog");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Strict rate limiter for login attempts (max 5 requests per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helpers ──
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      userId: user.userId, 
      role: user.role, 
      status: user.status,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

const generateRefreshToken = (user) => {
  const tokenInstanceId = require("crypto").randomBytes(16).toString("hex");
  return jwt.sign(
    { id: user._id, jti: tokenInstanceId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

// Parses a duration string like "7d", "24h", "30m" into milliseconds
const parseDurationMs = (str = "7d") => {
  const match = String(str).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * multipliers[unit];
};

const getRefreshTokenExpiresAt = () => {
  const ms = parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
  return new Date(Date.now() + ms);
};

// Strict rate limiter for signup — prevents bot account creation
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many accounts created from this IP. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware for login
const validateLoginInput = (req, res, next) => {
  const { id, password, role } = req.body;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "Invalid credentials format." });
  }

  const cleanId = id.trim();
  if (cleanId.length < 3 || cleanId.length > 100 || !/^[a-zA-Z0-9/\-_]+$/.test(cleanId)) {
    return res.status(400).json({ error: "Invalid credentials format." });
  }

  if (typeof password !== "string" || password.length < 6 || password.length > 72) {
    return res.status(400).json({ error: "Invalid credentials format." });
  }

  if (role && (typeof role !== "string" || !["student", "staff", "kitchen", "rider", "admin"].includes(role))) {
    return res.status(400).json({ error: "Invalid credentials format." });
  }

  next();
};

// ── POST /api/auth/signup ──
router.post("/signup", signupLimiter, async (req, res, next) => {
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

    // Save refresh token to DB for rotation
    await RefreshToken.create({
      userId: user.userId,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiresAt()
    });

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
router.post("/login", loginLimiter, validateLoginInput, async (req, res, next) => {
  try {
    const { id, password, role } = req.body;

    const query = { userId: id.trim().toUpperCase() };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ error: "Invalid ID, password, or role." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "This account has been suspended by Admin." });
    }

    // Compare password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid ID, password, or role." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await RefreshToken.create({
      userId: user.userId,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiresAt()
    });

    // Log the action (no sensitive info logged)
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
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({ error: "Refresh token required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    const existingToken = await RefreshToken.findOne({ token: refreshToken });

    if (!existingToken) {
      // Token reuse detected! (token is cryptographically valid but not in DB)
      // Revoke all tokens for this user family
      const user = await User.findById(decoded.id);
      if (user) {
        await RefreshToken.deleteMany({ userId: user.userId });
        await AuditLog.create({
          user: user.userId,
          action: "Security Alert: Refresh token reuse detected. Revoking all tokens.",
          ip: req.ip
        });
      }
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    // Check expiration in database
    if (new Date(existingToken.expiresAt) < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    // Rotate: delete the old one
    await RefreshToken.deleteOne({ token: refreshToken });

    // Generate new pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token
    await RefreshToken.create({
      userId: user.userId,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiresAt()
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/logout ──
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && typeof refreshToken === "string") {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/me ──
router.get("/me", authenticate, (req, res) => {
  res.json({ success: true, user: req.user.toJSON() });
});

module.exports = router;
