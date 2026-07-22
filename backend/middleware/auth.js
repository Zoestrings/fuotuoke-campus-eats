// ================================================================
// FUOTUOKE Campus Eats — Auth Middleware
// Verifies JWT access tokens and enforces role-based access control.
// ================================================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── JWT claim constants (must match routes/auth.js) ──────────────
const JWT_ISSUER   = process.env.JWT_ISSUER   || "fuotuoke-campus-eats";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "fuo-app";

// ================================================================
// User Cache
//
// Current implementation: lightweight in-memory Map with TTL eviction.
//
// Redis migration path:
//   Replace getCachedUser / setCachedUser / invalidateUserCache with
//   Redis GET/SET/DEL calls (same interface). The authenticate middleware
//   and all call sites need zero changes because they only use these
//   three functions.
//
//   Example Redis swap:
//     const redis = require('ioredis').createClient();
//     const KEY = (id) => `user_cache:${id}`;
//
//     async function getCachedUser(id) {
//       const raw = await redis.get(KEY(id));
//       return raw ? JSON.parse(raw) : null;
//     }
//     async function setCachedUser(id, user) {
//       await redis.set(KEY(id), JSON.stringify(user), 'PX', USER_CACHE_TTL_MS);
//     }
//     async function invalidateUserCache(id) {
//       await redis.del(KEY(id));
//     }
// ================================================================

const USER_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const userCache         = new Map();

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
  // Evict stale entries periodically to prevent unbounded memory growth
  if (userCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of userCache) {
      if (now > val.expiresAt) userCache.delete(key);
    }
  }
}

/**
 * Explicitly remove a user from the cache.
 *
 * Call this whenever a user's profile, role, or status changes so that
 * the next request re-fetches fresh data from the database.
 *
 * @param {number|string} id - The user's numeric database id (user._id / user.id)
 */
function invalidateUserCache(id) {
  userCache.delete(String(id));
  userCache.delete(Number(id));
}

// ── authenticate middleware ───────────────────────────────────────
//
// Checks the Authorization: Bearer <token> header, verifies the JWT
// (including issuer + audience), and binds the user to req.user.

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Verify signature, expiry, issuer, and audience in one call.
    // Tokens without the correct iss/aud claims are rejected immediately,
    // preventing cross-service replay attacks.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer:   JWT_ISSUER,
      audience: JWT_AUDIENCE
    });

    // ── Fast path: trust embedded JWT claims ──────────────────
    // Access tokens include role, status, name, email in the payload,
    // so we can skip the DB round-trip entirely for the common case.
    if (decoded.role && decoded.status && decoded.userId) {
      if (decoded.status !== "active") {
        return res.status(403).json({ error: "Account suspended. Contact admin." });
      }
      req.user = {
        _id:    decoded.id,
        id:     decoded.id,
        userId: decoded.userId,
        role:   decoded.role,
        status: decoded.status,
        name:   decoded.name  || "",
        email:  decoded.email || "",
        toJSON() {
          const copy = { ...this };
          delete copy.toJSON;
          return copy;
        }
      };
      return next();
    }

    // ── Slow path: cache or DB lookup (legacy tokens) ─────────
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
    // Covers JsonWebTokenError, NotBeforeError, and invalid iss/aud
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ── requireRole guard ─────────────────────────────────────────────

/**
 * Guard a route by requiring one of the specified roles.
 * Must be used after authenticate().
 *
 * @param {...string} roles - Allowed role names
 */
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

module.exports = { authenticate, requireRole, invalidateUserCache };
