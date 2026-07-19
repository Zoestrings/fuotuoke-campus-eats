// Auth verification and role guard middlewares

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Lightweight in-memory user cache (30s TTL) ──
// Avoids a DB round-trip on every single authenticated request.
const USER_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const userCache = new Map();

function getCachedUser(id) {
  const entry = userCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(id);
    return null;
  }
  return entry.user;
}

function setCachedUser(id, user) {
  userCache.set(id, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  // Evict stale entries periodically to prevent memory leaks
  if (userCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of userCache) {
      if (now > val.expiresAt) userCache.delete(key);
    }
  }
}

// Checks Authorization header for Bearer token and binds user to req.user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fast path: use JWT payload claims if available
    // (access token includes role, status, name, email — added in auth.js)
    if (decoded.role && decoded.status && decoded.userId) {
      if (decoded.status !== "active") {
        return res.status(403).json({ error: "Account suspended. Contact admin." });
      }
      // Build a complete user object from claims — zero DB calls needed
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        userId: decoded.userId,
        role: decoded.role,
        status: decoded.status,
        name: decoded.name || "",
        email: decoded.email || "",
        toJSON() { 
          const copy = { ...this };
          delete copy.toJSON;
          return copy;
        }
      };
      return next();
    }

    // Slow path: fetch from cache or DB (fallback for older tokens)
    let user = getCachedUser(decoded.id);
    if (!user) {
      user = await User.findById(decoded.id);
      if (user) setCachedUser(decoded.id, user);
    }

    if (!user) {
      return res.status(401).json({ error: "User not found. Token invalid." });
    }
    if (user.status !== "active") {
      return res.status(403).json({ error: "Account suspended. Contact admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

// Guard route by checking user role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
